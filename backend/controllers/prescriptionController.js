const Prescription = require('../models/Prescription');
const IntakeLog = require('../models/IntakeLog');
const User = require('../models/User');

/**
 * Create a new prescription with smart reminders
 * @route POST /api/prescriptions
 */
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, diagnosis, symptoms, medications, labTests, notes, nextVisit } = req.body;

    // Validate doctor and patient
    const doctor = await User.findById(doctorId);
    const patient = await User.findById(patientId);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID'
      });
    }

    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }

    // Process medications and set time slots based on frequency
    const processedMedications = medications.map(med => {
      const medication = {
        ...med,
        timeSlots: med.timeSlots || generateDefaultTimeSlots(med.frequency),
        chosenTimes: [],
        startDate: new Date(),
      };

      // Calculate end date
      if (med.durationDays) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + med.durationDays);
        medication.endDate = endDate;
      }

      return medication;
    });

    // Create prescription
    const prescription = new Prescription({
      appointmentId,
      patientId,
      doctorId,
      diagnosis,
      symptoms,
      medications: processedMedications,
      labTests,
      notes,
      nextVisit,
      isActive: true,
      status: 'active'
    });

    await prescription.save();

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });

  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: error.message
    });
  }
};

/**
 * Get prescriptions for a patient
 * @route GET /api/prescriptions/patient/:patientId
 */
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;

    const query = { patientId };
    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions
    });

  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
};

/**
 * Get active medications for a patient
 * @route GET /api/prescriptions/patient/:patientId/active-medications
 */
exports.getActiveMedications = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({
      patientId,
      status: 'active',
      isActive: true
    }).populate('doctorId', 'name specialization');

    // Extract all active medications
    const activeMedications = [];
    
    prescriptions.forEach(prescription => {
      prescription.medications.forEach((med, index) => {
        const endDate = med.endDate || new Date(med.startDate.getTime() + med.durationDays * 24 * 60 * 60 * 1000);
        
        // Check if medication is still active
        if (new Date() <= endDate) {
          const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
          
          activeMedications.push({
            prescriptionId: prescription._id,
            medicineIndex: index,
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            timing: med.timing,
            instructions: med.instructions,
            timeSlots: med.timeSlots,
            chosenTimes: med.chosenTimes,
            durationDays: med.durationDays,
            daysLeft,
            startDate: med.startDate,
            endDate,
            doctor: prescription.doctorId,
            issuedAt: prescription.createdAt
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      data: activeMedications
    });

  } catch (error) {
    console.error('Error fetching active medications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active medications',
      error: error.message
    });
  }
};

/**
 * Update medication chosen times (patient sets specific times)
 * @route PATCH /api/prescriptions/:prescriptionId/medications/:medicineIndex/set-times
 */
exports.setMedicationTimes = async (req, res) => {
  try {
    const { prescriptionId, medicineIndex } = req.params;
    const { chosenTimes } = req.body;

    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const medication = prescription.medications[medicineIndex];

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    // Validate chosen times are within allowed time slots
    const validationErrors = [];
    chosenTimes.forEach(chosenTime => {
      const slot = medication.timeSlots.find(s => s.label === chosenTime.label);
      if (!slot) {
        validationErrors.push(`Invalid slot label: ${chosenTime.label}`);
        return;
      }

      const chosenMinutes = timeToMinutes(chosenTime.time);
      const startMinutes = timeToMinutes(slot.start);
      const endMinutes = timeToMinutes(slot.end);

      if (chosenMinutes < startMinutes || chosenMinutes > endMinutes) {
        validationErrors.push(`Time ${chosenTime.time} is outside allowed range ${slot.start}-${slot.end} for ${slot.label}`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time selections',
        errors: validationErrors
      });
    }

    // Update chosen times
    prescription.medications[medicineIndex].chosenTimes = chosenTimes;
    await prescription.save();

    res.status(200).json({
      success: true,
      message: 'Medication times updated successfully',
      data: prescription.medications[medicineIndex]
    });

  } catch (error) {
    console.error('Error setting medication times:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set medication times',
      error: error.message
    });
  }
};

/**
 * Get prescription by ID
 * @route GET /api/prescriptions/:id
 */
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id)
      .populate('doctorId', 'name specialization email phone')
      .populate('patientId', 'name email phone dateOfBirth gender');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });

  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription',
      error: error.message
    });
  }
};

/**
 * Update prescription status
 * @route PATCH /api/prescriptions/:id/status
 */
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { status, isActive: status === 'active' },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prescription status updated',
      data: prescription
    });

  } catch (error) {
    console.error('Error updating prescription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription status',
      error: error.message
    });
  }
};

// Helper functions

/**
 * Generate default time slots based on frequency
 */
function generateDefaultTimeSlots(frequency) {
  const slots = {
    once_daily: [
      { label: 'Morning', start: '07:00', end: '10:00' }
    ],
    twice_daily: [
      { label: 'Morning', start: '07:00', end: '09:00' },
      { label: 'Night', start: '20:00', end: '22:00' }
    ],
    thrice_daily: [
      { label: 'Morning', start: '07:00', end: '09:00' },
      { label: 'Afternoon', start: '13:00', end: '15:00' },
      { label: 'Night', start: '20:00', end: '22:00' }
    ],
    every_6_hours: [
      { label: 'Morning', start: '06:00', end: '08:00' },
      { label: 'Noon', start: '12:00', end: '14:00' },
      { label: 'Evening', start: '18:00', end: '20:00' },
      { label: 'Night', start: '00:00', end: '02:00' }
    ],
    every_8_hours: [
      { label: 'Morning', start: '07:00', end: '09:00' },
      { label: 'Afternoon', start: '15:00', end: '17:00' },
      { label: 'Night', start: '23:00', end: '01:00' }
    ],
    every_12_hours: [
      { label: 'Morning', start: '07:00', end: '09:00' },
      { label: 'Night', start: '19:00', end: '21:00' }
    ],
    as_needed: [],
    custom: []
  };

  return slots[frequency] || [];
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
