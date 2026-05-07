import express from 'express';
import * as productController from '../controllers/productController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.use(authController.restrictToAdmin);

router.post('/category/:categoryId', productController.createProduct);
router.patch('/:productId', productController.updateProduct);
router.delete('/:productId', productController.deleteProduct);

export default router;
