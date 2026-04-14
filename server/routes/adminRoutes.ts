import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

// All routes here are protected by admin check
router.use(authenticate, authorizeAdmin);

// Analytics
router.get('/analytics', AdminController.getAnalytics);
router.post('/seed-demo', AdminController.seedDemoData);

// User Management
router.get('/users', AdminController.getAllUsers);
router.put('/users/:id/block', AdminController.toggleBlockUser);
router.delete('/users/:id', AdminController.deleteUser);

// Order Management
router.get('/orders', AdminController.getAllOrders);
router.put('/orders/:id/status', AdminController.updateOrderStatus);
router.delete('/orders/:id', AdminController.deleteOrder);

export default router;
