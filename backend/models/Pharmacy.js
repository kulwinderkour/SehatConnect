const mongoose = require('mongoose');

/**
 * Pharmacy Schema
 * Stores pharmacy information for nearby pharmacy feature
 */

const pharmacySchema = new mongoose.Schema({
  // Basic information
  name: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    trim: true,
  },

  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
  },

  // Location details
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },

  // Operating hours
  isOpen24x7: {
    type: Boolean,
    default: false,
  },

  openingHours: {
    monday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    tuesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    wednesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    thursday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    friday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    saturday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    sunday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: false },
    },
  },

  // Ratings and reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },

  totalReviews: {
    type: Number,
    default: 0,
  },

  // Services offered
  services: [{
    type: String,
    enum: ['home_delivery', '24x7', 'online_payment', 'prescription_required', 'parking_available'],
  }],

  // License information
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  // Timestamps
}, {
  timestamps: true,
});

// Geospatial index for location-based queries (nearby pharmacies)
pharmacySchema.index({ 'address.coordinates': '2dsphere' });

// Other indexes
pharmacySchema.index({ 'address.city': 1, 'address.state': 1 });
pharmacySchema.index({ isActive: 1 });
pharmacySchema.index({ rating: -1 });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

module.exports = Pharmacy;
