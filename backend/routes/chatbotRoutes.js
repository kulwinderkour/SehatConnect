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
const { protect } = require('../middleware/authMiddleware');

router.post('/conversations', protect, startConversation);
router.get('/conversations', protect, getConversations);
router.get('/conversations/:sessionId', protect, getConversation);
router.post('/conversations/:sessionId/messages', protect, sendMessage);
router.put('/conversations/:sessionId/end', protect, endConversation);

module.exports = router;
