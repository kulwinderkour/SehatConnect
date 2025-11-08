/**
 * Government Schemes Controller
 */

const { GovernmentScheme } = require('../models');

/**
 * @desc    Get all government schemes
 * @route   GET /api/schemes
 * @access  Public
 */
const getSchemes = async (req, res, next) => {
  try {
    const { category, state, search, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (state) {
      query.$or = [
        { state: state },
        { state: { $size: 0 } }, // All India schemes
      ];
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const schemes = await GovernmentScheme.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ views: -1 });

    const total = await GovernmentScheme.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        schemes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get scheme by ID
 * @route   GET /api/schemes/:id
 * @access  Public
 */
const getSchemeById = async (req, res, next) => {
  try {
    const scheme = await GovernmentScheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found',
      });
    }

    // Increment view count
    await scheme.incrementViews();

    res.status(200).json({
      success: true,
      data: { scheme },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bookmark/Unbookmark scheme
 * @route   PUT /api/schemes/:id/bookmark
 * @access  Private
 */
const toggleBookmark = async (req, res, next) => {
  try {
    const scheme = await GovernmentScheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found',
      });
    }

    await scheme.toggleBookmark(req.user._id);

    const isBookmarked = scheme.bookmarkedBy.includes(req.user._id);

    res.status(200).json({
      success: true,
      message: isBookmarked ? 'Scheme bookmarked' : 'Scheme unbookmarked',
      data: { isBookmarked },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bookmarked schemes
 * @route   GET /api/schemes/bookmarked
 * @access  Private
 */
const getBookmarkedSchemes = async (req, res, next) => {
  try {
    const schemes = await GovernmentScheme.find({
      bookmarkedBy: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { schemes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get schemes by category
 * @route   GET /api/schemes/category/:category
 * @access  Public
 */
const getSchemesByCategory = async (req, res, next) => {
  try {
    const schemes = await GovernmentScheme.findByCategory(req.params.category);

    res.status(200).json({
      success: true,
      data: { schemes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Increment application count
 * @route   PUT /api/schemes/:id/apply
 * @access  Private
 */
const incrementApplications = async (req, res, next) => {
  try {
    const scheme = await GovernmentScheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found',
      });
    }

    await scheme.incrementApplications();

    res.status(200).json({
      success: true,
      message: 'Application tracked successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchemes,
  getSchemeById,
  toggleBookmark,
  getBookmarkedSchemes,
  getSchemesByCategory,
  incrementApplications,
};
