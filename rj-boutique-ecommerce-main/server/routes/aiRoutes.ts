import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/chat', authenticate, async (req: any, res: Response) => {
  const { message } = req.body;
  const userContext = {
    userId: req.user.id,
    email: req.user.email
  };

  try {
    const response = await AIService.supportChat(message, userContext);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
