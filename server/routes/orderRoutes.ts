import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, OrderController.placeOrder);
router.get('/', authenticate, OrderController.getOrderHistory);
router.get('/history', authenticate, OrderController.getOrderHistory);
router.get('/track/:trackingNumber', OrderController.trackOrder);
router.get('/:orderId', authenticate, OrderController.getOrderById);

// Admin only
router.put('/:orderId/status', authenticate, authorizeAdmin, OrderController.updateStatus);

export default router;
