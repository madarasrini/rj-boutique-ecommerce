import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/smart-search', ProductController.smartSearch);
router.get('/recommendations', ProductController.getRecommendations);
router.get('/similar/:id', ProductController.getSimilarProducts);
router.get('/:id', ProductController.getById);

// Admin only
router.post('/generate-embeddings', authenticate, authorizeAdmin, ProductController.generateEmbeddings);
router.post('/', authenticate, authorizeAdmin, ProductController.create);
router.put('/:id', authenticate, authorizeAdmin, ProductController.update);
router.delete('/:id', authenticate, authorizeAdmin, ProductController.delete);

export default router;
