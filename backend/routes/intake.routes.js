const express = require('express');
const router = express.Router();
const intakeController = require('../controllers/intakeController');
const { setDemoUser } = require('../middleware/demoUser');

// Use demo user middleware (replaces auth)
router.use(setDemoUser);

/**
 * Intake Log Routes
 * Authentication removed - open access
 */
router.post(
  '/schedule',
  intakeController.scheduleIntakeReminders
);

router.patch(
  '/:intakeId/notification',
  intakeController.updateNotificationId
);

router.patch(
  '/:intakeId/mark-taken',
  intakeController.markAsTaken
);

router.patch(
  '/:intakeId/snooze',
  intakeController.snoozeIntake
);

router.patch(
  '/:intakeId/skip',
  intakeController.skipIntake
);

router.get(
  '/patient/:patientId/upcoming',
  intakeController.getUpcomingIntakes
);

router.get(
  '/patient/:patientId/today',
  intakeController.getTodaySchedule
);

router.get(
  '/patient/:patientId/history',
  intakeController.getIntakeHistory
);

// Check for missed intakes (can be called by cron job)
router.post(
  '/check-missed',
  intakeController.checkMissedIntakes
);

module.exports = router;
