import { Request, Response } from 'express';
import db from '../../db';
import { AuthRequest } from '../middleware/auth';

export class CartController {
  static async getCart(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    try {
      const items = db.prepare(`
        SELECT c.*, p.name, p.price, p.image_url 
        FROM cart_items c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = ?
      `).all(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async addToCart(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { productId, quantity = 1 } = req.body;
    try {
      db.prepare(`
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + EXCLUDED.quantity
      `).run(userId, productId, quantity);
      res.json({ message: 'Added to cart' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async updateQuantity(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;
    try {
      db.prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?')
        .run(quantity, userId, productId);
      res.json({ message: 'Quantity updated' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async removeFromCart(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { productId } = req.params;
    try {
      db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?')
        .run(userId, productId);
      res.json({ message: 'Removed from cart' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}
