import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';
import aiRoutes from './aiRoutes';
import adminRoutes from './adminRoutes';
import paymentRoutes from './paymentRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);

export default router;
