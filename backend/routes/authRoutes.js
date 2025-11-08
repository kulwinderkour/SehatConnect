/**
 * Authentication Routes
 * /api/auth
 */

const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTPHandler,
  resendOTP,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/verify-otp', verifyOTPHandler);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
