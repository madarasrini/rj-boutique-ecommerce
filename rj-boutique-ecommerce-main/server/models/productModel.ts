import db from '../../db';

export class ProductModel {
  static getAll(filters: any = {}) {
    const { category, minPrice, maxPrice, keyword, limit = 10, offset = 0 } = filters;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }
    if (keyword) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(query).all(...params);
  }

  static findById(id: number) {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
  }

  static create(productData: any) {
    const { name, description, price, discount_price, image_url, category, stock } = productData;
    const result = db.prepare(`
      INSERT INTO products (name, description, price, discount_price, image_url, category, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, description, price, discount_price || null, image_url, category, stock || 100);
    return result.lastInsertRowid;
  }

  static update(id: number, productData: any) {
    const { name, description, price, discount_price, image_url, category, stock, embeddings } = productData;
    return db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, discount_price = ?, image_url = ?, category = ?, stock = ?, embeddings = ?
      WHERE id = ?
    `).run(name, description, price, discount_price || null, image_url, category, stock, embeddings ? JSON.stringify(embeddings) : null, id);
  }

  static updateEmbedding(id: number, embedding: number[]) {
    return db.prepare('UPDATE products SET embeddings = ? WHERE id = ?').run(JSON.stringify(embedding), id);
  }

  static delete(id: number) {
    return db.prepare('DELETE FROM products WHERE id = ?').run(id);
  }
}
