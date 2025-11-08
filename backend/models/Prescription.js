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

  // Medications with Smart Reminder Support
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
      enum: ['once_daily', 'twice_daily', 'thrice_daily', 'every_6_hours', 'every_8_hours', 'every_12_hours', 'as_needed', 'custom'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
    },
    instructions: {
      type: String,
    },
    timing: {
      type: String,
      enum: ['before_meal', 'after_meal', 'anytime'],
      default: 'after_meal',
    },
    // Time slots for flexible scheduling
    timeSlots: [{
      label: {
        type: String,
        required: true,
        // e.g., "Morning", "Afternoon", "Evening", "Night"
      },
      start: {
        type: String,
        required: true,
        // e.g., "07:00" (24-hour format)
      },
      end: {
        type: String,
        required: true,
        // e.g., "09:00" (24-hour format)
      }
    }],
    // Chosen times by patient (within time slots)
    chosenTimes: [{
      label: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
        // e.g., "08:15" (24-hour format)
      },
      intakeId: {
        type: String,
        // Reference to scheduled intake logs
      }
    }],
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
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

  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
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
