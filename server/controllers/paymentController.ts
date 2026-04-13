import { Response } from 'express';
import db from '../../db';
import { AuthRequest } from '../middleware/auth';

export const addPaymentMethod = (req: AuthRequest, res: Response) => {
  const { type, provider, last4, upi_id, is_default } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // If is_default is true, unset other defaults
    if (is_default) {
      db.prepare('UPDATE payment_methods SET is_default = 0 WHERE user_id = ?').run(userId);
    }

    const result = db.prepare(`
      INSERT INTO payment_methods (user_id, type, provider, last4, upi_id, is_default)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, type, provider, last4, upi_id, is_default ? 1 : 0);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Payment method added successfully' });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
};

export const getPaymentMethods = (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const methods = db.prepare('SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(userId);
    res.json(methods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
};

export const deletePaymentMethod = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    db.prepare('DELETE FROM payment_methods WHERE id = ? AND user_id = ?').run(id, userId);
    res.json({ message: 'Payment method deleted' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
};
