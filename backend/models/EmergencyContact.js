const mongoose = require('mongoose');

/**
 * Emergency Contact Schema
 * Stores emergency services contact information
 */

const emergencyContactSchema = new mongoose.Schema({
  // Service details
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },

  type: {
    type: String,
    enum: ['ambulance', 'hospital', 'police', 'fire', 'blood_bank', 'helpline'],
    required: [true, 'Service type is required'],
  },

  // Contact information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },

  alternatePhone: String,

  email: String,

  // Location details
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    pincode: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
  },

  // Availability
  isAvailable24x7: {
    type: Boolean,
    default: true,
  },

  // Additional information
  description: String,

  // Status
  isActive: {
    type: Boolean,
    default: true,
  },

  // Timestamps
}, {
  timestamps: true,
});

// Indexes for better query performance
emergencyContactSchema.index({ type: 1 });
emergencyContactSchema.index({ 'address.city': 1, 'address.state': 1 });
emergencyContactSchema.index({ 'address.coordinates': '2dsphere' });
emergencyContactSchema.index({ isActive: 1 });

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

module.exports = EmergencyContact;
