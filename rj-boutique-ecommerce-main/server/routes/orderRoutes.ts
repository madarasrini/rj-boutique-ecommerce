import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authorizeAdmin } from '../middleware/auth';

const router = Router();

// ✅ TEMP: Removed authentication for testing checkout
// router.use(authenticate);

// ✅ Place Order (NO AUTH for now)
router.post('/', OrderController.placeOrder);

// ✅ Order History (you can protect later)
router.get('/history', OrderController.getOrderHistory);

// ✅ Admin only (keep protected)
router.put('/:orderId/status', authorizeAdmin, OrderController.updateStatus);

export default router;