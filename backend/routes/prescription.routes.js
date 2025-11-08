const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { setDemoUser } = require('../middleware/demoUser');

// Use demo user middleware (replaces auth)
router.use(setDemoUser);

/**
 * Prescription Routes
 * Authentication removed - open access
 */
router.post(
  '/',
  prescriptionController.createPrescription
);

router.get(
  '/:id',
  prescriptionController.getPrescriptionById
);

router.get(
  '/patient/:patientId',
  prescriptionController.getPatientPrescriptions
);

router.get(
  '/patient/:patientId/active-medications',
  prescriptionController.getActiveMedications
);

router.patch(
  '/:prescriptionId/medications/:medicineIndex/set-times',
  prescriptionController.setMedicationTimes
);

router.patch(
  '/:id/status',
  prescriptionController.updatePrescriptionStatus
);

module.exports = router;
