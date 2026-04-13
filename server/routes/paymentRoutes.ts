import { Router } from 'express';
import { addPaymentMethod, getPaymentMethods, deletePaymentMethod } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', addPaymentMethod);
router.get('/', getPaymentMethods);
router.delete('/:id', deletePaymentMethod);

export default router;
