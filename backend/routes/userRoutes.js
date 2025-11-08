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
const { uploadImage } = require('../middleware/upload');
const { setDemoUser } = require('../middleware/demoUser');

// Use demo user middleware (replaces auth)
router.use(setDemoUser);

// Profile routes (Authentication removed - open access)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile-photo', uploadImage.single('photo'), uploadProfilePhoto);

// Family members routes (Authentication removed - open access)
router.get('/family-members', getFamilyMembers);
router.post('/family-members', addFamilyMember);
router.put('/family-members/:id', updateFamilyMember);
router.delete('/family-members/:id', deleteFamilyMember);

// Doctor routes
router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);

module.exports = router;
