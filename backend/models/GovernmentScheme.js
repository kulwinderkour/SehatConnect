const mongoose = require('mongoose');

/**
 * Government Schemes Schema
 * Stores information about government health schemes
 */
const governmentSchemeSchema = new mongoose.Schema(
  {
    // Scheme Info
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
    },
    shortName: String,
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    keyBenefits: String,

    // Category
    category: {
      type: String,
      enum: ['insurance', 'maternal', 'child', 'immunization', 'general', 'elderly', 'disability'],
      required: [true, 'Category is required'],
      index: true,
    },

    // Government Details
    agency: String,
    launchDate: Date,

    // Eligibility
    eligibilityCriteria: [String],
    ageGroup: {
      min: Number,
      max: Number,
    },
    incomeLimit: Number,
    state: [String], // Applicable states (empty for all India)

    // Benefits
    benefitAmount: Number,
    benefitType: {
      type: String,
      enum: ['cash', 'coverage', 'free_service', 'subsidy'],
    },
    coverageAmount: Number,

    // Application
    howToApply: String,
    requiredDocuments: [String],
    applicationUrl: String,
    helplineNumber: String,

    // Additional Info
    website: String,
    brochureUrl: String,
    videoUrl: String,

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // User Bookmarks
    bookmarkedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Statistics
    views: {
      type: Number,
      default: 0,
    },
    applications: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
governmentSchemeSchema.index({ category: 1, isActive: 1 });
governmentSchemeSchema.index({ state: 1 });
governmentSchemeSchema.index({ bookmarkedBy: 1 });

// Method to increment views
governmentSchemeSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to increment applications
governmentSchemeSchema.methods.incrementApplications = function () {
  this.applications += 1;
  return this.save();
};

// Method to toggle bookmark
governmentSchemeSchema.methods.toggleBookmark = function (userId) {
  const index = this.bookmarkedBy.indexOf(userId);
  if (index > -1) {
    this.bookmarkedBy.splice(index, 1);
  } else {
    this.bookmarkedBy.push(userId);
  }
  return this.save();
};

// Static method to find by category
governmentSchemeSchema.statics.findByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({ views: -1 });
};

// Static method to find by state
governmentSchemeSchema.statics.findByState = function (state) {
  return this.find({
    $or: [{ state: state }, { state: { $size: 0 } }],
    isActive: true,
  }).sort({ views: -1 });
};

module.exports = mongoose.model('GovernmentScheme', governmentSchemeSchema);
