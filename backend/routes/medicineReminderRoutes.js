const express = require('express');
const router = express.Router();
const {
  getUserReminders,
  getTodayReminders,
  createReminder,
  createRemindersFromPrescription,
  updateReminder,
  markDoseTaken,
  markDoseMissed,
  snoozeDose,
  deleteReminder,
  toggleReminder,
  getReminderStats,
} = require('../controllers/medicineReminderController');
const { setDemoUser } = require('../middleware/demoUser');

// Use demo user middleware (replaces auth)
router.use(setDemoUser);

// Authentication removed - open access

// Reminder CRUD
router.get('/', getUserReminders);
router.get('/today', getTodayReminders);
router.get('/stats', getReminderStats);
router.post('/', createReminder);
router.post('/from-prescription/:prescriptionId', createRemindersFromPrescription);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.patch('/:id/toggle', toggleReminder);

// Dose tracking
router.post('/:id/doses/:doseId/taken', markDoseTaken);
router.post('/:id/doses/:doseId/missed', markDoseMissed);
router.post('/:id/doses/:doseId/snooze', snoozeDose);

module.exports = router;
