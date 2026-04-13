import { Request, Response } from 'express';
import { ProductModel } from '../models/productModel';
import { AIService } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';

export class ProductController {
  static async getAll(req: Request, res: Response) {
    const { category, minPrice, maxPrice, keyword, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    try {
      const products = ProductModel.getAll({ category, minPrice, maxPrice, keyword, limit, offset });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const product = ProductModel.findById(Number(id));
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const productId = ProductModel.create(req.body);
      const product = ProductModel.findById(Number(productId));
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    try {
      ProductModel.update(Number(id), req.body);
      res.json({ message: 'Product updated' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      ProductModel.delete(Number(id));
      res.json({ message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async smartSearch(req: AuthRequest, res: Response) {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    try {
      AIService.logSearch(String(query), req.user?.id || null);
      const allProducts = ProductModel.getAll({ limit: 100 });
      const matchedIds = await AIService.smartSearch(String(query), allProducts);
      
      const results = allProducts.filter(p => matchedIds.includes(p.id));
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getRecommendations(req: Request, res: Response) {
    const { userId } = req.query; 
    try {
      const allProducts = ProductModel.getAll({ limit: 100 });
      
      // 1. Get user's last viewed or purchased product category/name
      // For now, mock a "last viewed" product
      const lastViewedProduct = allProducts[0]; 
      
      if (lastViewedProduct && lastViewedProduct.embeddings) {
        const targetEmbedding = JSON.parse(lastViewedProduct.embeddings);
        
        const recommendations = allProducts
          .filter(p => p.id !== lastViewedProduct.id && p.embeddings)
          .map(p => ({
            ...p,
            similarity: AIService.cosineSimilarity(targetEmbedding, JSON.parse(p.embeddings))
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 4);
          
        return res.json(recommendations);
      }

      // Fallback to LLM-based recommendations if no embeddings
      const history = [{ category: 'Electronics' }]; 
      const recommendedIds = await AIService.getRecommendations(history, allProducts);
      const results = allProducts.filter(p => recommendedIds.includes(p.id));
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async generateEmbeddings(req: Request, res: Response) {
    try {
      const allProducts = ProductModel.getAll({ limit: 1000 });
      let count = 0;
      
      for (const product of allProducts) {
        const textToEmbed = `${product.name} ${product.category} ${product.description}`;
        const embedding = await AIService.generateEmbedding(textToEmbed);
        if (embedding) {
          ProductModel.updateEmbedding(product.id, embedding);
          count++;
        }
      }
      
      res.json({ message: `Generated embeddings for ${count} products` });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getSimilarProducts(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const product = ProductModel.findById(Number(id));
      if (!product || !product.embeddings) {
        return res.status(404).json({ message: 'Product or embeddings not found' });
      }

      const targetEmbedding = JSON.parse(product.embeddings);
      const allProducts = ProductModel.getAll({ limit: 100 });
      
      const similar = allProducts
        .filter(p => p.id !== Number(id) && p.embeddings)
        .map(p => ({
          ...p,
          similarity: AIService.cosineSimilarity(targetEmbedding, JSON.parse(p.embeddings))
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      res.json(similar);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}
