import db from '../../db';
import bcrypt from 'bcryptjs';

export class UserModel {
  static findByEmail(email: string) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  }

  static findById(id: number) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  }

  static async create(userData: any) {
    const { email, password, name, address, is_admin } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = db.prepare(`
      INSERT INTO users (email, password, name, address, is_admin)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, hashedPassword, name, address || null, is_admin || 0);
    
    return result.lastInsertRowid;
  }

  static getAll() {
    return db.prepare('SELECT id, name, email, address, is_admin, created_at FROM users').all();
  }
}
