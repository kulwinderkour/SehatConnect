/**
 * Simplified Authentication Middleware
 * Protects routes and verifies JWT tokens
 */

const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/jwt');

/**
 * Verify JWT token and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Get user from token (exclude password)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user is active
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated',
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Not authorized, token failed',
    });
  }
};

/**
 * Restrict access to specific roles
 * @param  {...string} roles - Allowed roles (e.g., 'doctor', 'patient')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
