/**
 * User Routes
 * /api/users
 */

const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getDoctors,
  getDoctorById,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/upload');

// Profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile-photo', protect, uploadImage.single('photo'), uploadProfilePhoto);

// Family members routes
router.get('/family-members', protect, getFamilyMembers);
router.post('/family-members', protect, addFamilyMember);
router.put('/family-members/:id', protect, updateFamilyMember);
router.delete('/family-members/:id', protect, deleteFamilyMember);

// Doctor routes
router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);

module.exports = router;
