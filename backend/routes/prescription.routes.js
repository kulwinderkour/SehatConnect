const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const prescriptionDecoderController = require('../controllers/prescriptionDecoderController');
const { setDemoUser } = require('../middleware/demoUser');

// Use demo user middleware (replaces auth)
router.use(setDemoUser);

/**
 * Prescription Routes
 * Authentication removed - open access
 */

// Decode prescription from image (must be before other routes)
router.post(
  '/decode',
  prescriptionDecoderController.upload,
  prescriptionDecoderController.decodePrescription
);

// Save decoded prescription (must be before /:id route)
router.post(
  '/save-decoded',
  prescriptionDecoderController.saveDecodedPrescription
);

// Get all decoded prescriptions (must be before /:id route)
router.get(
  '/decoded',
  prescriptionDecoderController.getDecodedPrescriptions
);

// Get single decoded prescription by ID (must be before /:id route)
router.get(
  '/decoded/:id',
  prescriptionDecoderController.getDecodedPrescriptionById
);

router.post(
  '/',
  prescriptionController.createPrescription
);

// This route must come AFTER the specific /decoded routes
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
