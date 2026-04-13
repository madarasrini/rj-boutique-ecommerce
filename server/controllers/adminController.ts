import { Request, Response } from 'express';
import db from '../../db';
import { ProductModel } from '../models/productModel';
import { AIService } from '../services/aiService';

export class AdminController {
  // --- Analytics ---
  static async getAnalytics(req: Request, res: Response) {
    try {
      const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
      const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
      const totalRevenue = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status != "Cancelled"').get() as any;
      
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

      res.json({
        users: totalUsers.count,
        orders: totalOrders.count,
        revenue: totalRevenue.total || 0,
        topSelling,
        mostSearched
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching analytics' });
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

  // --- AI Insights ---
  static async getAIInsights(req: Request, res: Response) {
    try {
      const allProducts = ProductModel.getAll({ limit: 100 });
      const topSelling = db.prepare(`
        SELECT product_id, SUM(quantity) as total_sold
        FROM order_items
        GROUP BY product_id
        ORDER BY total_sold DESC
        LIMIT 5
      `).all();

      const insights = await AIService.generateAdminInsights(topSelling, allProducts);
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ message: 'Error generating AI insights' });
    }
  }
}
