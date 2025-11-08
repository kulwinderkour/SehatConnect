const mongoose = require('mongoose');

/**
 * Appointment Schema
 * Manages appointments between patients and doctors
 */

const appointmentSchema = new mongoose.Schema({
  // References
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

  // Appointment timing
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
  },

  slot: {
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
  },

  // Appointment details
  type: {
    type: String,
    enum: ['video', 'in-person', 'emergency'],
    default: 'video',
  },

  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'in-progress'],
    default: 'scheduled',
  },

  symptoms: [{
    type: String,
  }],

  notes: {
    type: String,
  },

  // Video call information
  meetingLink: {
    type: String,
  },

  meetingId: {
    type: String,
  },

  // Payment information
  payment: {
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded', 'failed'],
      default: 'pending',
    },
    transactionId: String,
    paidAt: Date,
  },

  // Follow-up
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
  },

  followUpDate: {
    type: Date,
  },

  // Cancellation details
  cancellationReason: {
    type: String,
  },

  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  cancelledAt: {
    type: Date,
  },

  // Timestamps
}, {
  timestamps: true,
});

// Indexes for better query performance
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1 });

// Prevent booking same slot for same doctor
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, 'slot.startTime': 1 },
  { 
    unique: true,
    partialFilterExpression: { status: { $in: ['scheduled', 'in-progress'] } }
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
