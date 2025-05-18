/**
 * Authentication Routes
 * 
 * API routes for authentication-related endpoints
 */

const express = require('express');
const authController = require('../controllers/auth-controller');
const { authenticate, requireAuth, requireRole } = require('../middlewares/auth-middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/user', requireAuth, authController.getCurrentUser);

// Admin-only routes
router.post('/register', requireAuth, requireRole('admin'), authController.registerUser);

module.exports = router;
