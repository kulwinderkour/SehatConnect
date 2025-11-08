const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Simplified User Schema for Demo
 * Only two users: Demo Patient and Dr. Rajesh Sharma
 */

const userSchema = new mongoose.Schema({
  // Role identifier
  role: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true,
  },

  // Authentication fields
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  phone: {
    type: String,
    required: true,
  },

  // Personal Information
  profile: {
    fullName: {
      type: String,
      required: true,
    },
    shortName: {
      type: String,
    },
    profileImage: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
  },

  // Doctor-specific Information
  doctorInfo: {
    specialty: {
      type: String,
    },
    qualifications: [{
      type: String,
    }],
    registrationNumber: {
      type: String,
    },
    hospital: {
      type: String,
    },
    experience: {
      type: Number,
      default: 0,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },

  // Patient-specific Information
  patientInfo: {
    patientId: {
      type: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    allergies: [{
      type: String,
    }],
    chronicDiseases: [{
      type: String,
    }],
  },

  lastLogin: {
    type: Date,
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },

  isVerified: {
    type: Boolean,
    default: true, // Auto-verified for demo users
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
