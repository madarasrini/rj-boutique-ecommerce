import { Request, Response } from 'express';
import db from '../../db';
import { ProductModel } from '../models/productModel';
import { AIService } from '../services/aiService';

export class AdminController {
  // --- Analytics ---
  static async getAnalytics(req: Request, res: Response) {
    try {
      const users = db.prepare('SELECT COUNT(*) as total FROM users').get() as any;
      const orders = db.prepare('SELECT COUNT(*) as total FROM orders').get() as any;
      const revenue = db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE status != 'Cancelled'").get() as any;
      
      const topSelling = db.prepare(`
        SELECT 
          p.id, 
          p.name, 
          SUM(oi.quantity) as total_sold,
          SUM(oi.quantity * oi.price) as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 5
      `).all();

      const mostSearched = db.prepare(`
        SELECT query, COUNT(*) as count
        FROM search_logs
        GROUP BY query
        ORDER BY count DESC
        LIMIT 10
      `).all();

      const stats = {
        users: users?.total || 0,
        orders: orders?.total || 0,
        revenue: revenue?.total || 0,
        topSelling,
        mostSearched
      };

      res.json(stats);
    } catch (error) {
      console.error('Analytics Error:', error);
      res.status(500).json({ message: 'Error fetching analytics' });
    }
  }

  static async seedDemoData(req: Request, res: Response) {
    try {
      const products = db.prepare('SELECT id, price FROM products LIMIT 5').all() as any[];
      const users = db.prepare('SELECT id FROM users LIMIT 5').all() as any[];

      if (products.length === 0 || users.length === 0) {
        return res.status(400).json({ message: 'Need products and users to seed orders' });
      }

      const insertOrder = db.prepare(`
        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, tracking_number, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const insertOrderItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `);

      const statuses = ['Delivered', 'Processing', 'Shipped', 'Pending'];

      for (let i = 0; i < 10; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const totalAmount = product.price * quantity;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const tracking = 'DEMO' + Math.random().toString(36).substring(2, 10).toUpperCase();

        const result = insertOrder.run(user.id, totalAmount, '123 Demo St, City', 'Credit Card', tracking, status);
        insertOrderItem.run(result.lastInsertRowid, product.id, quantity, product.price);
      }

      res.json({ message: 'Demo orders seeded successfully' });
    } catch (error) {
      console.error('Seed Error:', error);
      res.status(500).json({ message: 'Error seeding demo data' });
    }
  }

  // --- User Management ---
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = db.prepare('SELECT id, email, name, is_admin, blocked, created_at FROM users').all();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  }

  static async toggleBlockUser(req: Request, res: Response) {
    const { id } = req.params;
    const { blocked } = req.body;
    try {
      db.prepare('UPDATE users SET blocked = ? WHERE id = ?').run(blocked ? 1 : 0, id);
      res.json({ message: `User ${blocked ? 'blocked' : 'unblocked'} successfully` });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user status' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user' });
    }
  }

  // --- Order Management ---
  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = db.prepare(`
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `).all();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders' });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    try {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating order status' });
    }
  }

  static async deleteOrder(req: Request, res: Response) {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM orders WHERE id = ?').run(id);
      db.prepare('DELETE FROM order_items WHERE order_id = ?').run(id);
      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting order' });
    }
  }
}
