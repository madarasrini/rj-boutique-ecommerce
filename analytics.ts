
import db from './db';

async function runAnalytics() {
  try {
    // 1. Sales Analysis
    const orders = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        SUM(total_amount) as revenue,
        COUNT(id) as order_count
      FROM orders
      GROUP BY month
      ORDER BY month ASC
    `).all();

    // 2. Product Performance
    const topProducts = db.prepare(`
      SELECT 
        p.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 10
    `).all();

    const leastProducts = db.prepare(`
      SELECT 
        p.name,
        SUM(oi.quantity) as total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY total_sold ASC
      LIMIT 10
    `).all();

    // 3. Customer Insights
    const customerStats = db.prepare(`
      SELECT 
        COUNT(DISTINCT user_id) as total_customers,
        (SELECT COUNT(*) FROM users) as total_users
      FROM orders
    `).get();

    const activeUsers = db.prepare(`
      SELECT 
        u.name,
        u.email,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_spent
      FROM users u
      JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 5
    `).all();

    // 4. Search Trends
    const topSearches = db.prepare(`
      SELECT query, COUNT(*) as count
      FROM search_logs
      GROUP BY query
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // 5. Category Trends
    const categorySales = db.prepare(`
      SELECT 
        p.category,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.category
      ORDER BY revenue DESC
    `).all();

    const results = {
      orders,
      topProducts,
      leastProducts,
      customerStats,
      activeUsers,
      topSearches,
      categorySales
    };

    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Analytics failed:', error);
  }
}

runAnalytics();
