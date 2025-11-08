/**
 * Authentication Middleware
 * Protects routes and verifies JWT tokens
 */

const { User } = require('../models');
const { verifyAccessToken } = require('../utils/jwtUtils');

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
  const decoded = verifyAccessToken(token);

    // Get user from token (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

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
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'doctor', 'patient')
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

/**
 * Optional authentication - doesn't fail if no token
 * Useful for public routes that have different behavior for logged-in users
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
  const decoded = verifyAccessToken(token);
  req.user = await User.findById(decoded.id).select('-password');
    }

    next();
  } catch (error) {
    // Continue without user
    next();
  }
};

module.exports = { protect, authorize, optionalAuth };
