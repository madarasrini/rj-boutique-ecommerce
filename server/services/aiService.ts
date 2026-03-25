import { GoogleGenAI } from "@google/genai";
import db from '../../db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class AIService {
  static async smartSearch(query: string, products: any[]) {
    const model = "gemini-3-flash-preview";
    const prompt = `
      You are an e-commerce search assistant.
      Given a user query: "${query}"
      And a list of products: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, description: p.description })))}
      Return a JSON array of product IDs that best match the user's intent.
      Rank them by relevance.
      Only return the JSON array, nothing else.
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Smart Search Error:", error);
      return [];
    }
  }

  static async supportChat(message: string, userContext: any) {
    const model = "gemini-3-flash-preview";
    
    // Fetch context
    const products = db.prepare('SELECT name, price, category FROM products LIMIT 10').all();
    const orders = db.prepare('SELECT id, total_amount, status FROM orders WHERE user_id = ? LIMIT 3').all(userContext.userId);

    const systemInstruction = `
      You are a helpful, professional customer support assistant for RJ Boutique.
      
      User Info: ${JSON.stringify(userContext)}
      User's Recent Orders: ${JSON.stringify(orders)}
      Product Catalog (Sample): ${JSON.stringify(products)}
      
      Guidelines:
      - Be concise and friendly.
      - If the user asks about their orders, refer to the provided order history.
      - If they ask about products, suggest items from the catalog.
      - If you can't help, politely suggest they contact human support at support@rjai.com.
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: message,
        config: {
          systemInstruction
        }
      });
      return response.text;
    } catch (error) {
      console.error("Chat Error:", error);
      return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
    }
  }

  static async getRecommendations(userHistory: any[], products: any[]) {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Based on the user's purchase/view history: ${JSON.stringify(userHistory)}
      And our current catalog: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category })))}
      Recommend 4 products the user might like.
      Return a JSON array of product IDs.
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Recommendation Error:", error);
      return [];
    }
  }

  static async generateEmbedding(text: string) {
    try {
      const result = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: [text],
      });
      return result.embeddings[0].values;
    } catch (error) {
      console.error("Embedding Error:", error);
      return null;
    }
  }

  static async generateAdminInsights(topSelling: any[], products: any[]) {
    const model = "gemini-3-flash-preview";
    const prompt = `
      You are a senior business analyst for an e-commerce platform.
      Top Selling Products: ${JSON.stringify(topSelling)}
      Product Catalog: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price })))}
      
      Provide 3 actionable business insights based on this data.
      Focus on trends, inventory suggestions, and cross-selling opportunities.
      Return a plain text response.
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Insights Error:", error);
      return "Unable to generate insights at this time.";
    }
  }

  static logSearch(query: string, userId: number | null) {
    try {
      db.prepare('INSERT INTO search_logs (query, user_id) VALUES (?, ?)').run(query, userId);
    } catch (error) {
      console.error("Search Log Error:", error);
    }
  }

  static cosineSimilarity(vecA: number[], vecB: number[]) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
  }
}
