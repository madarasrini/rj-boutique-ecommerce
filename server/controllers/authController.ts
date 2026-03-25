import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, name, address } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const existingUser = UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const userId = await UserModel.create({ email, password, name, address });
      res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    try {
      const user = UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, is_admin: user.is_admin === 1 },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          is_admin: user.is_admin === 1
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}
