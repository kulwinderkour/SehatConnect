const mongoose = require('mongoose');

/**
 * Simplified Appointment Schema
 * All appointments automatically go to Dr. Rajesh Sharma
 */

const appointmentSchema = new mongoose.Schema({
  // References
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Appointment timing
  appointmentDate: {
    type: Date,
    required: true,
  },

  appointmentTime: {
    type: String,
    required: true,
  },

  // Appointment details
  type: {
    type: String,
    enum: ['video', 'in-person', 'emergency'],
    default: 'video',
  },

  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'in-progress'],
    default: 'scheduled',
  },

  reason: {
    type: String,
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

  // Payment information (optional for demo)
  payment: {
    amount: {
      type: Number,
      default: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending',
    },
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

  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
