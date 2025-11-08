const mongoose = require('mongoose');

/**
 * Chat Message Schema
 * Stores chat messages between patients and doctors
 */

const chatMessageSchema = new mongoose.Schema({
  // References
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required'],
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver ID is required'],
  },

  // Message content
  message: {
    type: String,
    required: [true, 'Message content is required'],
  },

  type: {
    type: String,
    enum: ['text', 'image', 'file', 'prescription', 'appointment'],
    default: 'text',
  },

  // File details (for image/file messages)
  fileUrl: String,
  fileName: String,
  fileSize: Number,

  // Read status
  isRead: {
    type: Boolean,
    default: false,
  },

  readAt: Date,

  // Timestamps
}, {
  timestamps: true,
});

// Indexes for better query performance
chatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
chatMessageSchema.index({ appointmentId: 1, createdAt: 1 });
chatMessageSchema.index({ isRead: 1 });

// Compound index for efficient message retrieval between two users
chatMessageSchema.index({ 
  senderId: 1, 
  receiverId: 1, 
  createdAt: -1 
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
