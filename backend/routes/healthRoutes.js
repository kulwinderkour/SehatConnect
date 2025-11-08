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
const { protect } = require('../middleware/authMiddleware');

// Health metrics routes
router.post('/metrics', protect, addHealthMetric);
router.get('/metrics', protect, getHealthMetrics);
router.get('/metrics/latest', protect, getLatestMetrics);

// Medicine reminders routes
router.post('/reminders', protect, createReminder);
router.get('/reminders', protect, getReminders);
router.put('/reminders/:id', protect, updateReminder);
router.delete('/reminders/:id', protect, deleteReminder);
router.put('/reminders/:id/doses/:doseId/taken', protect, markDoseTaken);

module.exports = router;
