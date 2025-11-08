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
const { setDemoUser } = require('../middleware/demoUser');

// Use demo user middleware (replaces auth)
router.use(setDemoUser);

// Authentication removed - open access
router.get('/', getSchemes);
router.get('/bookmarked', getBookmarkedSchemes);
router.get('/category/:category', getSchemesByCategory);
router.get('/:id', getSchemeById);
router.put('/:id/bookmark', toggleBookmark);
router.put('/:id/apply', incrementApplications);

module.exports = router;
