import { Request, Response } from 'express';
import db from '../../db';
import { AuthRequest } from '../middleware/auth';

export class OrderController {
  static async placeOrder(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { items, shippingAddress, paymentMethod } = req.body;

    try {
      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const totalAmount = items.reduce((sum: number, item: any) => sum + ((item.discount_price || item.price) * item.quantity), 0);

      const trackingNumber = 'TRK' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const result = db.prepare(`
        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, tracking_number)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, totalAmount, shippingAddress, paymentMethod, trackingNumber);

      const orderId = result.lastInsertRowid;

      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `);

      for (const item of items) {
        insertItem.run(orderId, item.id, item.quantity, item.discount_price || item.price);
      }

      // Clear backend cart just in case
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

      res.status(201).json({ message: 'Order placed successfully', orderId, trackingNumber });
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

  static async getOrderById(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { orderId } = req.params;
    try {
      const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, userId) as any;
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const items = db.prepare(`
        SELECT oi.*, p.name, p.image_url 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(orderId);

      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async trackOrder(req: Request, res: Response) {
    const { trackingNumber } = req.params;
    try {
      const order = db.prepare('SELECT * FROM orders WHERE tracking_number = ?').get(trackingNumber) as any;
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const items = db.prepare(`
        SELECT oi.*, p.name, p.image_url 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(order.id);

      res.json({ ...order, items });
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
