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
// Public routes
router.post('/login', login);

// Authentication removed - open access
router.get('/me', getCurrentUser);
router.post('/logout', logout);

module.exports = router;
