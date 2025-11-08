/**
 * User Controller
 * Handles user profile, family members, settings
 */

const { User, FamilyMember } = require('../models');
const { uploadToCloudinary } = require('../utils/fileUpload');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { profile, doctorInfo, patientInfo, settings } = req.body;

    const user = await User.findById(req.user._id);

    // Update profile
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    // Update doctor info (if doctor)
    if (doctorInfo && user.role === 'doctor') {
      user.doctorInfo = { ...user.doctorInfo, ...doctorInfo };
    }

    // Update patient info (if patient)
    if (patientInfo && user.role === 'patient') {
      user.patientInfo = { ...user.patientInfo, ...patientInfo };
    }

    // Update settings
    if (settings) {
      user.settings = { ...user.settings, ...settings };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile photo
 * @route   POST /api/users/profile-photo
 * @access  Private
 */
const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file',
      });
    }

    // Upload to cloudinary
    const result = await uploadToCloudinary(req.file.path, 'sehatconnect/profiles');

    // Update user
    const user = await User.findById(req.user._id);
    user.profile.photoUrl = result.url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: { photoUrl: result.url },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all family members
 * @route   GET /api/users/family-members
 * @access  Private
 */
const getFamilyMembers = async (req, res, next) => {
  try {
    const familyMembers = await FamilyMember.find({
      userId: req.user._id,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: { familyMembers },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add family member
 * @route   POST /api/users/family-members
 * @access  Private
 */
const addFamilyMember = async (req, res, next) => {
  try {
    const familyMember = await FamilyMember.create({
      userId: req.user._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: 'Family member added successfully',
      data: { familyMember },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update family member
 * @route   PUT /api/users/family-members/:id
 * @access  Private
 */
const updateFamilyMember = async (req, res, next) => {
  try {
    let familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found',
      });
    }

    familyMember = await FamilyMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Family member updated successfully',
      data: { familyMember },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete family member
 * @route   DELETE /api/users/family-members/:id
 * @access  Private
 */
const deleteFamilyMember = async (req, res, next) => {
  try {
    const familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found',
      });
    }

    familyMember.isActive = false;
    await familyMember.save();

    res.status(200).json({
      success: true,
      message: 'Family member deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all doctors
 * @route   GET /api/users/doctors
 * @access  Public
 */
const getDoctors = async (req, res, next) => {
  try {
    const { specialty, city, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { role: 'doctor', isVerified: true, isActive: true };

    if (specialty) {
      query['doctorInfo.specialty'] = specialty;
    }

    if (city) {
      query['profile.address.city'] = new RegExp(city, 'i');
    }

    if (search) {
      query.$or = [
        { 'profile.fullName': new RegExp(search, 'i') },
        { 'doctorInfo.hospital': new RegExp(search, 'i') },
      ];
    }

    const doctors = await User.find(query)
      .select('profile doctorInfo')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ 'doctorInfo.rating': -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        doctors,
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
 * @desc    Get doctor by ID
 * @route   GET /api/users/doctors/:id
 * @access  Public
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      isActive: true,
    }).select('profile doctorInfo');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { doctor },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getDoctors,
  getDoctorById,
};
