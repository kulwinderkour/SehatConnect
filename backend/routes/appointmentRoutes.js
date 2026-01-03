/**
 * Simplified Appointment Routes
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
  updateAppointment,
  deleteAllAppointments,
} = require('../controllers/appointmentController');
const { setDemoUser } = require('../middleware/demoUser');

// Use demo user middleware (replaces auth)
router.use(setDemoUser);

// Authentication removed - open access
router.delete('/clear-all', deleteAllAppointments); // Must be before /:id routes
router.post('/', bookAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/complete', completeAppointment);

module.exports = router;
