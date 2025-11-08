/**
 * Government Schemes Routes
 * /api/schemes
 */

const express = require('express');
const router = express.Router();
const {
  getSchemes,
  getSchemeById,
  toggleBookmark,
  getBookmarkedSchemes,
  getSchemesByCategory,
  incrementApplications,
} = require('../controllers/governmentSchemeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSchemes);
router.get('/bookmarked', protect, getBookmarkedSchemes);
router.get('/category/:category', getSchemesByCategory);
router.get('/:id', getSchemeById);
router.put('/:id/bookmark', protect, toggleBookmark);
router.put('/:id/apply', protect, incrementApplications);

module.exports = router;
