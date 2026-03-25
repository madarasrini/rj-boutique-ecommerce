import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', CartController.getCart);
router.post('/', CartController.addToCart);
router.put('/', CartController.updateQuantity);
router.delete('/:productId', CartController.removeFromCart);

export default router;
