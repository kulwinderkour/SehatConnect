/**
 * Chatbot & Emergency Controller
 */

const { ChatbotConversation, EmergencyContact } = require('../models');
const axios = require('axios');

// ============ CHATBOT ============

/**
 * @desc    Start new chatbot conversation
 * @route   POST /api/chatbot/conversations
 * @access  Private
 */
const startConversation = async (req, res, next) => {
  try {
    const sessionId = `session_${Date.now()}_${req.user._id}`;

    const conversation = await ChatbotConversation.create({
      userId: req.user._id,
      sessionId,
      messages: [],
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Conversation started',
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send message to chatbot
 * @route   POST /api/chatbot/conversations/:sessionId/messages
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const { sessionId } = req.params;

    const conversation = await ChatbotConversation.findOne({
      sessionId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    // Add user message
    await conversation.addMessage('user', message);

    // Call Python chatbot backend
    try {
      const chatbotResponse = await axios.post(
        process.env.CHATBOT_API_URL || 'http://localhost:5000/chat',
        {
          message,
          session_id: sessionId,
        }
      );

      const botResponse = chatbotResponse.data;

      // Add bot response
      await conversation.addMessage('bot', botResponse.response, {
        symptoms: botResponse.symptoms,
        possibleDiseases: botResponse.possible_diseases,
        recommendations: botResponse.recommendations,
      });

      // Update emergency level if detected
      if (botResponse.emergency_level) {
        conversation.context.emergencyLevel = botResponse.emergency_level;
        await conversation.save();
      }

      res.status(200).json({
        success: true,
        data: {
          message: botResponse.response,
          symptoms: botResponse.symptoms,
          possibleDiseases: botResponse.possible_diseases,
          recommendations: botResponse.recommendations,
          emergencyLevel: botResponse.emergency_level,
        },
      });
    } catch (chatbotError) {
      console.error('Chatbot API error:', chatbotError);
      
      // Fallback response
      await conversation.addMessage('bot', 'I apologize, but I am having trouble processing your request right now. Please try again or consult with a doctor.');

      res.status(200).json({
        success: true,
        data: {
          message: 'I apologize, but I am having trouble processing your request right now. Please try again or consult with a doctor.',
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get conversation history
 * @route   GET /api/chatbot/conversations/:sessionId
 * @access  Private
 */
const getConversation = async (req, res, next) => {
  try {
    const conversation = await ChatbotConversation.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all conversations
 * @route   GET /api/chatbot/conversations
 * @access  Private
 */
const getConversations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const conversations = await ChatbotConversation.find({
      userId: req.user._id,
    })
      .select('sessionId startedAt lastMessageAt isActive context')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ lastMessageAt: -1 });

    const total = await ChatbotConversation.countDocuments({
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    End conversation
 * @route   PUT /api/chatbot/conversations/:sessionId/end
 * @access  Private
 */
const endConversation = async (req, res, next) => {
  try {
    const conversation = await ChatbotConversation.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    await conversation.endConversation();

    res.status(200).json({
      success: true,
      message: 'Conversation ended',
    });
  } catch (error) {
    next(error);
  }
};

// ============ EMERGENCY SERVICES ============

/**
 * @desc    Get nearby emergency services
 * @route   GET /api/emergency/nearby
 * @access  Public
 */
const getNearbyEmergencyServices = async (req, res, next) => {
  try {
    const { latitude, longitude, type, maxDistance = 10000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
      });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      isActive: true,
    };

    if (type) {
      query.type = type;
    }

    const services = await EmergencyContact.find(query);

    res.status(200).json({
      success: true,
      data: { services },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all emergency services
 * @route   GET /api/emergency
 * @access  Public
 */
const getEmergencyServices = async (req, res, next) => {
  try {
    const { type, city, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (type) {
      query.type = type;
    }

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    const services = await EmergencyContact.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ rating: -1 });

    const total = await EmergencyContact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Chatbot
  startConversation,
  sendMessage,
  getConversation,
  getConversations,
  endConversation,
  // Emergency
  getNearbyEmergencyServices,
  getEmergencyServices,
};
