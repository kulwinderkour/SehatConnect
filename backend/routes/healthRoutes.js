/**
 * Health Routes
 * /api/health
 */

const express = require('express');
const router = express.Router();
const {
  addHealthMetric,
  getHealthMetrics,
  getLatestMetrics,
  createReminder,
  getReminders,
  markDoseTaken,
  updateReminder,
  deleteReminder,
} = require('../controllers/healthController');
const { setDemoUser } = require('../middleware/demoUser');

// Use demo user middleware (replaces auth)
router.use(setDemoUser);

// Health metrics routes (Authentication removed - open access)
router.post('/metrics', addHealthMetric);
router.get('/metrics', getHealthMetrics);
router.get('/metrics/latest', getLatestMetrics);

// Medicine reminders routes (Authentication removed - open access)
router.post('/reminders', createReminder);
router.get('/reminders', getReminders);
router.put('/reminders/:id', updateReminder);
router.delete('/reminders/:id', deleteReminder);
router.put('/reminders/:id/doses/:doseId/taken', markDoseTaken);

module.exports = router;
