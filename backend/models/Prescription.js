const mongoose = require('mongoose');

/**
 * Prescription Schema
 * Stores prescriptions issued by doctors to patients
 */

const prescriptionSchema = new mongoose.Schema({
  // References
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment ID is required'],
  },

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required'],
  },

  // Medical details
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
  },

  symptoms: [{
    type: String,
  }],

  // Medications
  medications: [{
    name: {
      type: String,
      required: [true, 'Medication name is required'],
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    instructions: {
      type: String,
    },
    timing: {
      type: String,
      enum: ['before_meal', 'after_meal', 'anytime'],
      default: 'after_meal',
    },
  }],

  // Lab tests
  labTests: [{
    testName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    result: String,
    labName: String,
    testDate: Date,
    reportUrl: String,
  }],

  // Additional information
  notes: {
    type: String,
  },

  nextVisit: {
    type: Date,
  },

  // Prescription status
  isActive: {
    type: Boolean,
    default: true,
  },

  // Timestamps
}, {
  timestamps: true,
});

// Indexes for better query performance
prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
prescriptionSchema.index({ appointmentId: 1 });
prescriptionSchema.index({ isActive: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
