import { Request, Response } from 'express';
import db from '../../db';
import { AuthRequest } from '../middleware/auth';

export class OrderController {
  static async placeOrder(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { shippingAddress, paymentMethod } = req.body;

    try {
      const cartItems = db.prepare(`
        SELECT c.*, p.price 
        FROM cart_items c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = ?
      `).all(userId) as any[];

      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const result = db.prepare(`
        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method)
        VALUES (?, ?, ?, ?)
      `).run(userId, totalAmount, shippingAddress, paymentMethod);

      const orderId = result.lastInsertRowid;

      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `);

      for (const item of cartItems) {
        insertItem.run(orderId, item.product_id, item.quantity, item.price);
      }

      // Clear cart
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

      res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getOrderHistory(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    try {
      const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);
      res.json({ message: 'Order status updated' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}
