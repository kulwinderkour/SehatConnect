/**
 * Demo User Middleware
 * Sets req.user to demo patient (since authentication is removed)
 */

const { User } = require('../models');

/**
 * Set demo user on request
 * This replaces the auth middleware - always sets req.user to demo patient
 */
const setDemoUser = async (req, res, next) => {
  try {
    // Try to get user from userId or email if provided
    const userId = req.body?.userId || req.params?.userId || req.query?.userId;
    const email = req.body?.email || req.params?.email || req.query?.email;

    let user = null;

    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    // Default to demo patient if no user found
    if (!user) {
      user = await User.findOne({ email: 'patient@sehat.com' });
    }

    // Fallback: any patient
    if (!user) {
      user = await User.findOne({ role: 'patient' });
    }

    // Last resort: any user
    if (!user) {
      user = await User.findOne();
    }

    if (user) {
      req.user = user;
    } else {
      // If no user exists at all, create a mock user object
      req.user = {
        _id: 'demo-user-id',
        role: 'patient',
        email: 'patient@sehat.com',
      };
    }

    next();
  } catch (error) {
    console.error('Error setting demo user:', error);
    // Set a default user object on error
    req.user = {
      _id: 'demo-user-id',
      role: 'patient',
      email: 'patient@sehat.com',
    };
    next();
  }
};

module.exports = { setDemoUser };

