const mongoose = require('mongoose');

/**
 * Chatbot Conversations Schema
 * Stores AI chatbot conversation history
 */
const chatbotConversationSchema = new mongoose.Schema(
  {
    // References
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      unique: true,
      index: true,
    },

    // Conversation
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'bot', 'system'],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },

        // For symptom analysis
        symptoms: [String],
        possibleDiseases: [
          {
            disease: String,
            probability: Number,
            severity: {
              type: String,
              enum: ['low', 'medium', 'high', 'critical'],
            },
          },
        ],

        // Recommendations
        recommendations: [String],
        suggestedActions: [String],

        // Attachments
        attachments: [
          {
            type: {
              type: String,
              enum: ['image', 'document'],
            },
            url: String,
            description: String,
          },
        ],
      },
    ],

    // Context
    context: {
      currentTopic: String,
      lastIntent: String,
      userSymptoms: [String],
      medicalHistory: [String],
      emergencyLevel: {
        type: String,
        enum: ['none', 'low', 'medium', 'high', 'critical'],
        default: 'none',
      },
    },

    // Session Info
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Feedback
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    wasHelpful: Boolean,

    // AI Model Info
    modelVersion: String,
    modelName: {
      type: String,
      default: 'SehatConnect-AI-v1',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
chatbotConversationSchema.index({ userId: 1, createdAt: -1 });
chatbotConversationSchema.index({ isActive: 1, userId: 1 });

// Pre-save middleware to update lastMessageAt
chatbotConversationSchema.pre('save', function (next) {
  if (this.isModified('messages') && this.messages.length > 0) {
    this.lastMessageAt = new Date();
  }
  next();
});

// Method to add a message
chatbotConversationSchema.methods.addMessage = function (role, message, additionalData = {}) {
  this.messages.push({
    role,
    message,
    timestamp: new Date(),
    ...additionalData,
  });
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to end conversation
chatbotConversationSchema.methods.endConversation = function () {
  this.isActive = false;
  this.endedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('ChatbotConversation', chatbotConversationSchema);
