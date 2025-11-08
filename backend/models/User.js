const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema - Unified for both Patients and Doctors
 * Handles authentication, profile data, and role-specific information
 */

const userSchema = new mongoose.Schema({
  // Role identifier
  role: {
    type: String,
    enum: ['patient', 'doctor'],
    required: [true, 'User role is required'],
  },

  // Authentication fields
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },

  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[+]?[\d\s-()]+$/, 'Please provide a valid phone number'],
  },

  // Personal Information
  profile: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: 'https://via.placeholder.com/150x150/5a9e31/ffffff?text=User',
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
  },

  // Doctor-specific Information
  doctorInfo: {
    specialty: {
      type: String,
      required: function() {
        return this.role === 'doctor';
      },
    },
    qualifications: [{
      type: String,
    }],
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true, // Only unique if not null
      required: function() {
        return this.role === 'doctor';
      },
    },
    hospital: {
      type: String,
    },
    experience: {
      type: Number,
      min: 0,
    },
    consultationFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    availableSlots: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      startTime: String,
      endTime: String,
    }],
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
  },

  // Patient-specific Information
  patientInfo: {
    patientId: {
      type: String,
      unique: true,
      sparse: true, // Only unique if not null
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
    currentMedications: [{
      type: String,
    }],
  },

  // Authentication tokens
  refreshToken: {
    type: String,
    select: false,
  },

  resetPasswordToken: {
    type: String,
    select: false,
  },

  resetPasswordExpires: {
    type: Date,
    select: false,
  },

  otp: {
    code: {
      type: String,
      select: false,
    },
    expiresAt: {
      type: Date,
      select: false,
    },
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
    default: false,
  },

  // Timestamps
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'patientInfo.patientId': 1 });
userSchema.index({ 'doctorInfo.registrationNumber': 1 });
userSchema.index({ 'doctorInfo.specialty': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Auto-generate patientId for new patients
userSchema.pre('save', function(next) {
  if (this.role === 'patient' && !this.patientInfo.patientId && this.isNew) {
    if (!this.patientInfo) {
      this.patientInfo = {};
    }
    // Generate unique patient ID: SH + 6 digits
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.patientInfo.patientId = `SH${randomNum}`;
  }
  next();
});

// Auto-generate shortName if not provided
userSchema.pre('save', function(next) {
  if (!this.profile) {
    this.profile = {};
  }

  if (!this.profile.shortName && this.profile.fullName) {
    this.profile.shortName = this.profile.fullName.split(' ')[0];
  }
  next();
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
  delete user.refreshToken;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
