/**
 * Simplified Authentication Routes
 * /api/auth
 */

const express = require('express');
const router = express.Router();
const {
  login,
  getCurrentUser,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);

module.exports = router;
