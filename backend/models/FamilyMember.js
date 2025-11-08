const mongoose = require('mongoose');

/**
 * Family Members Schema
 * Allows users to manage family member profiles
 */
const familyMemberSchema = new mongoose.Schema(
  {
    // References
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    linkedPatientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Basic Info
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    relation: {
      type: String,
      required: [true, 'Relation is required'],
      enum: ['father', 'mother', 'spouse', 'son', 'daughter', 'brother', 'sister', 'grandfather', 'grandmother', 'other'],
    },
    dateOfBirth: Date,
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },

    // Contact
    phone: String,
    email: String,

    // Address
    sameAsUser: {
      type: Boolean,
      default: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    // Medical Info
    allergies: [String],
    chronicDiseases: [String],
    currentMedications: [String],

    // Emergency Contact
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },

    // Insurance
    hasSeparateInsurance: {
      type: Boolean,
      default: false,
    },
    insurance: {
      provider: String,
      policyNumber: String,
      validUntil: Date,
    },

    // Photo
    photoUrl: String,

    // ABDM
    abhaId: String,

    // Access Control
    canBookAppointments: {
      type: Boolean,
      default: true,
    },
    canViewRecords: {
      type: Boolean,
      default: true,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
familyMemberSchema.index({ userId: 1, isActive: 1 });
familyMemberSchema.index({ linkedPatientId: 1 });

// Virtual for calculating age from dateOfBirth
familyMemberSchema.virtual('calculatedAge').get(function () {
  if (!this.dateOfBirth) return this.age || null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
