import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Admin routes
router.post('/', authenticate, isAdmin, categoryController.createCategory);
router.put('/:id', authenticate, isAdmin, categoryController.updateCategory);
router.delete('/:id', authenticate, isAdmin, categoryController.deleteCategory);

export default router;
