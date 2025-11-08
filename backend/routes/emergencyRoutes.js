/**
 * Emergency Routes
 * /api/emergency
 */

const express = require('express');
const router = express.Router();
const {
  getNearbyEmergencyServices,
  getEmergencyServices,
} = require('../controllers/chatbotController');

router.get('/nearby', getNearbyEmergencyServices);
router.get('/', getEmergencyServices);

module.exports = router;
