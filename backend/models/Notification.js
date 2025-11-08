const mongoose = require('mongoose');

/**
 * Notification Schema
 * Stores app notifications for users
 */

const notificationSchema = new mongoose.Schema({
  // Recipient
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },

  // Notification content
  title: {
    type: String,
    required: [true, 'Notification title is required'],
  },

  message: {
    type: String,
    required: [true, 'Notification message is required'],
  },

  type: {
    type: String,
    enum: [
      'appointment_booked',
      'appointment_reminder',
      'appointment_cancelled',
      'prescription_added',
      'payment_success',
      'payment_failed',
      'chat_message',
      'health_alert',
      'general',
    ],
    default: 'general',
  },

  // Related data
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
  },

  relatedModel: {
    type: String,
    enum: ['Appointment', 'Prescription', 'ChatMessage', 'Payment'],
  },

  // Read status
  isRead: {
    type: Boolean,
    default: false,
  },

  readAt: Date,

  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },

  // Timestamps
}, {
  timestamps: true,
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
