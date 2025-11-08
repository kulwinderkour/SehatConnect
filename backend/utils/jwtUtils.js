/**
 * JWT Utility Functions
 * Handles token generation and verification
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-access-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh`;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

/**
 * Generate Access Token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
const generateAccessToken = (userId, extraClaims = {}) =>
  jwt.sign({ id: userId, ...extraClaims }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

/**
 * Generate Refresh Token
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId, extraClaims = {}) =>
  jwt.sign({ id: userId, type: 'refresh', ...extraClaims }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });

/**
 * Verify Token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Generate OTP
 * @param {number} length - OTP length (default: 6)
 * @returns {string} Generated OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Generate OTP with expiry
 * @param {number} expiryMinutes - OTP expiry in minutes (default: 10)
 * @returns {object} OTP and expiry time
 */
const generateOTPWithExpiry = (expiryMinutes = 10) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return {
    otp,
    expiresAt,
  };
};

/**
 * Verify OTP
 * @param {string} inputOTP - User input OTP
 * @param {string} storedOTP - Stored OTP
 * @param {Date} expiresAt - OTP expiry time
 * @returns {boolean} True if OTP is valid
 */
const verifyOTP = (inputOTP, storedOTP, expiresAt) => {
  if (new Date() > new Date(expiresAt)) {
    throw new Error('OTP has expired');
  }
  
  if (inputOTP !== storedOTP) {
    throw new Error('Invalid OTP');
  }
  
  return true;
};

const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateOTP,
  generateOTPWithExpiry,
  verifyOTP,
  hashToken,
};
