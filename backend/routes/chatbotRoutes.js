/**
 * Chatbot Routes
 * /api/chatbot
 */

const express = require('express');
const router = express.Router();
const {
  startConversation,
  sendMessage,
  getConversation,
  getConversations,
  endConversation,
} = require('../controllers/chatbotController');
const { setDemoUser } = require('../middleware/demoUser');

// Use demo user middleware (replaces auth)
router.use(setDemoUser);

// Authentication removed - open access
router.post('/conversations', startConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:sessionId', getConversation);
router.post('/conversations/:sessionId/messages', sendMessage);
router.put('/conversations/:sessionId/end', endConversation);

module.exports = router;
