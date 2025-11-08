const mongoose = require('mongoose');

/**
 * Decoded Prescription Schema
 * Stores prescriptions decoded from images using AI
 */

const decodedPrescriptionSchema = new mongoose.Schema({
  // Patient reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Image data
  imageUrl: {
    type: String,
  },

  // Decoded data
  medications: [{
    name: {
      type: String,
      required: true,
    },
    strength: {
      type: String,
    },
    form: {
      type: String, // tablet, syrup, capsule, etc.
    },
    dosage: {
      type: String,
    },
    frequency: {
      type: String,
    },
    duration: {
      type: String,
    },
    route: {
      type: String, // oral, IV, topical
    },
    notes: {
      type: String,
    },
    normalizedFrequency: {
      type: String,
    },
    times: [{
      type: String, // ["08:00", "20:00"]
    }],
  }],

  tests: [{
    name: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'asap'],
    },
    notes: {
      type: String,
    },
  }],

  // AI analysis
  summary: {
    type: String,
  },

  safetyAlerts: [{
    type: String,
  }],

  confidence: {
    type: Number,
    default: 0,
  },

  rawOcr: {
    type: String,
  },

  doctorNotes: {
    type: String,
  },

  diagnosisHints: [{
    type: String,
  }],

  pharmacyReadyList: [{
    type: String,
  }],

  needsReview: {
    type: Boolean,
    default: false,
  },

  reviewFlags: [{
    type: String,
  }],

  // Reminder tracking
  remindersScheduled: {
    type: Boolean,
    default: false,
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
  },

}, {
  timestamps: true,
});

// Indexes
decodedPrescriptionSchema.index({ userId: 1, createdAt: -1 });
decodedPrescriptionSchema.index({ isActive: 1 });

const DecodedPrescription = mongoose.model('DecodedPrescription', decodedPrescriptionSchema);

module.exports = DecodedPrescription;
