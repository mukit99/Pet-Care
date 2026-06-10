import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Pets management
router.get('/pets', adminController.getAllPets);
router.delete('/pets/:id', adminController.deletePet);

// Articles management
router.get('/articles', adminController.getAllArticles);
router.delete('/articles/:id', adminController.deleteArticle);

// Adoption requests management
router.get('/adoption-requests', adminController.getAdoptionRequests);

// Settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

export default router;
