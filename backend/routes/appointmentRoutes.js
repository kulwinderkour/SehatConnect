/**
 * Appointment Routes
 * /api/appointments
 */

const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  completeAppointment,
  rescheduleAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, bookAppointment);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/complete', protect, authorize('doctor'), completeAppointment);
router.put('/:id/reschedule', protect, rescheduleAppointment);

module.exports = router;
