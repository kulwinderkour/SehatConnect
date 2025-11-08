/**
 * Authentication Controller
 * Handles user registration, login, OTP verification, password reset
 */

const crypto = require('crypto');
const { User } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  generateOTPWithExpiry,
  verifyOTP,
  verifyRefreshToken,
  hashToken,
} = require('../utils/jwtUtils');
const { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { sendOTPSMS } = require('../utils/smsService');

const buildErrorResponse = (res, statusCode, message) =>
  res.status(statusCode).json({ success: false, error: message });

const normaliseEmail = (email = '') => email.trim().toLowerCase();
const normalisePhone = (phone = '') => phone.replace(/\s+/g, '').trim();

const issueTokens = (user) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = hashToken(refreshToken);
  return { accessToken, refreshToken };
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { email, password, phone, role, profile = {}, doctorInfo, patientInfo } = req.body;

    if (!email || !password || !phone || !profile.fullName) {
      return buildErrorResponse(res, 400, 'Email, password, phone, and full name are required');
    }

    const sanitizedEmail = normaliseEmail(email);
    const sanitizedPhone = normalisePhone(phone);
    const userRole = role || 'patient';

    if (!['patient', 'doctor'].includes(userRole)) {
      return buildErrorResponse(res, 400, 'Invalid role provided');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: sanitizedEmail }, { phone: sanitizedPhone }] });
    if (existingUser) {
      return buildErrorResponse(res, 400, 'User already exists with this email or phone');
    }

    // Generate OTP for email verification
    const { otp, expiresAt } = generateOTPWithExpiry();
    const safeProfile = {
      fullName: profile.fullName.trim(),
      shortName: profile.shortName?.trim(),
      profileImage: profile.profileImage,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      bloodGroup: profile.bloodGroup,
      address: profile.address,
    };

    // Create user (password will be hashed by pre-save middleware)
    const user = await User.create({
      email: sanitizedEmail,
      password,
      phone: sanitizedPhone,
      role: userRole,
      profile: safeProfile,
      doctorInfo,
      patientInfo,
      otp: {
        code: otp,
        expiresAt,
      },
      isVerified: false,
    });

    // Send OTP via email
    await sendOTPEmail(sanitizedEmail, otp, safeProfile.fullName || 'User');

    // Send OTP via SMS
    if (sanitizedPhone) {
      await sendOTPSMS(sanitizedPhone, otp, safeProfile.fullName || 'User');
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify OTP sent to your email and phone.',
      data: {
        userId: user._id,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTPHandler = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return buildErrorResponse(res, 400, 'User ID and OTP are required');
    }

    // Find user
    const user = await User.findById(userId).select('+otp.code +otp.expiresAt +refreshToken');
    if (!user) {
      return buildErrorResponse(res, 404, 'User not found');
    }

    // Check if already verified
    if (user.isVerified) {
      return buildErrorResponse(res, 400, 'User already verified');
    }

    if (!user.otp || !user.otp.code) {
      return buildErrorResponse(res, 400, 'OTP not generated or already used');
    }

    // Verify OTP
    try {
      verifyOTP(otp, user.otp.code, user.otp.expiresAt);
    } catch (error) {
      return buildErrorResponse(res, 400, error.message);
    }

    // Update user as verified
    user.isVerified = true;
    user.otp = undefined;
    const tokens = issueTokens(user);
    await user.save({ validateBeforeSave: false });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.profile.fullName || 'User');

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: user.getPublicProfile(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return buildErrorResponse(res, 400, 'User ID is required');
    }

    // Find user
    const user = await User.findById(userId).select('+otp.code +otp.expiresAt');
    if (!user) {
      return buildErrorResponse(res, 404, 'User not found');
    }

    // Check if already verified
    if (user.isVerified) {
      return buildErrorResponse(res, 400, 'User already verified');
    }

    // Generate new OTP
    const { otp, expiresAt } = generateOTPWithExpiry();
    user.otp = {
      code: otp,
      expiresAt,
    };
    await user.save({ validateBeforeSave: false });

    // Send OTP via email
    await sendOTPEmail(user.email, otp, user.profile.fullName || 'User');

    // Send OTP via SMS
    if (user.phone) {
      await sendOTPSMS(user.phone, otp, user.profile.fullName || 'User');
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return buildErrorResponse(res, 400, 'Email and password are required');
    }

    const sanitizedEmail = normaliseEmail(email);

    // Find user (include password for comparison)
    const user = await User.findOne({ email: sanitizedEmail }).select('+password +refreshToken');
    if (!user) {
      return buildErrorResponse(res, 401, 'Invalid credentials');
    }

    // Check if verified
    if (!user.isVerified) {
      return buildErrorResponse(res, 401, 'Please verify your account first');
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return buildErrorResponse(res, 401, 'Invalid credentials');
    }

    // Update last login and rotate refresh token
    user.lastLogin = new Date();
    const tokens = issueTokens(user);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return buildErrorResponse(res, 400, 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return buildErrorResponse(res, 401, 'Invalid refresh token');
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      return buildErrorResponse(res, 401, 'User not found for refresh token');
    }

    if (!user.refreshToken || user.refreshToken !== hashToken(refreshToken)) {
      return buildErrorResponse(res, 401, 'Refresh token no longer valid');
    }

    const tokens = issueTokens(user);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - send reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return buildErrorResponse(res, 400, 'Email is required');
    }

    const sanitizedEmail = normaliseEmail(email);

    // Find user
    const user = await User.findOne({ email: sanitizedEmail }).select('+resetPasswordToken +resetPasswordExpires');
    if (!user) {
      return buildErrorResponse(res, 404, 'User not found with this email');
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Send reset email
    await sendPasswordResetEmail(sanitizedEmail, resetToken, user.profile.fullName || 'User');

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return buildErrorResponse(res, 400, 'Reset token and new password are required');
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password +refreshToken');
    if (!user) {
      return buildErrorResponse(res, 400, 'Invalid or expired reset token');
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const tokens = issueTokens(user);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password (for logged-in users)
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return buildErrorResponse(res, 400, 'Current and new passwords are required');
    }

    // Find user with password
    const user = await User.findById(req.user._id).select('+password +refreshToken');

    if (!user) {
      return buildErrorResponse(res, 404, 'User not found');
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return buildErrorResponse(res, 401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    const tokens = issueTokens(user);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return buildErrorResponse(res, 404, 'User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+refreshToken');

    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
