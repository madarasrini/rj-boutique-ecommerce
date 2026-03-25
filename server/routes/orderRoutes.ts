import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', OrderController.placeOrder);
router.get('/history', OrderController.getOrderHistory);

// Admin only
router.put('/:orderId/status', authorizeAdmin, OrderController.updateStatus);

export default router;
