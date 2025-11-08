const mongoose = require('mongoose');

/**
 * IntakeLog Schema
 * Tracks medication intake events and reminders
 */

const intakeLogSchema = new mongoose.Schema({
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: [true, 'Prescription ID is required'],
  },

  medicineIndex: {
    type: Number,
    required: [true, 'Medicine index is required'],
    comment: 'Index of medicine in prescription.medications array',
  },

  medicineName: {
    type: String,
    required: [true, 'Medicine name is required'],
  },

  slotLabel: {
    type: String,
    required: [true, 'Slot label is required'],
    comment: 'e.g., Morning, Afternoon, Night',
  },

  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required'],
    comment: 'Time in HH:MM format (24-hour)',
  },

  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
  },

  takenAt: {
    type: Date,
    default: null,
  },

  status: {
    type: String,
    enum: ['pending', 'taken', 'missed', 'snoozed', 'skipped'],
    default: 'pending',
  },

  notificationId: {
    type: String,
    default: null,
    comment: 'Expo notification ID for cancellation',
  },

  snoozeCount: {
    type: Number,
    default: 0,
  },

  notes: {
    type: String,
  },

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
  },

}, {
  timestamps: true,
});

// Indexes for better query performance
intakeLogSchema.index({ prescriptionId: 1, scheduledDate: 1 });
intakeLogSchema.index({ status: 1, scheduledDate: 1 });
intakeLogSchema.index({ patientId: 1, scheduledDate: -1 });
intakeLogSchema.index({ notificationId: 1 });

// Method to check if intake is overdue
intakeLogSchema.methods.isOverdue = function() {
  if (this.status !== 'pending') return false;
  const now = new Date();
  const scheduled = new Date(this.scheduledDate);
  const [hours, minutes] = this.scheduledTime.split(':');
  scheduled.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return now > scheduled;
};

const IntakeLog = mongoose.model('IntakeLog', intakeLogSchema);

module.exports = IntakeLog;
