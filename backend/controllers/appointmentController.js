/**
 * Simplified Appointment Controller
 * All appointments go to Dr. Rajesh Sharma
 */

const { Appointment, User } = require('../models');

/**
 * @desc    Book appointment with Dr. Rajesh Sharma
 * @route   POST /api/appointments
 * @access  Private
 */
const bookAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime, type, reason, symptoms } = req.body;

    console.log('Booking appointment:', { appointmentDate, appointmentTime, type, reason });

    // Find Dr. Rajesh Sharma
    const doctor = await User.findOne({ email: 'drrajesh@sehat.com', role: 'doctor' });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Dr. Rajesh Sharma not found. Please run initialization script.',
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId: doctor._id,
      appointmentDate,
      appointmentTime,
      type: type || 'video',
      reason,
      symptoms: symptoms || [],
      status: 'scheduled',
      payment: {
        amount: doctor.doctorInfo.consultationFee || 500,
        status: 'pending',
      },
    });

    // Populate the appointment with user details
    await appointment.populate('patientId', 'profile patientInfo');
    await appointment.populate('doctorId', 'profile doctorInfo');

    console.log('✅ Appointment created:', appointment._id);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully with Dr. Rajesh Sharma',
      data: { appointment },
    });
  } catch (error) {
    console.error('❌ Appointment booking error:', error);
    next(error);
  }
};

/**
 * @desc    Get user appointments
 * @route   GET /api/appointments
 * @access  Private
 */
const getAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const query = {};
    
    // Check if user is doctor or patient
    if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    } else {
      query.patientId = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'profile patientInfo email phone')
      .populate('doctorId', 'profile doctorInfo email phone')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ appointmentDate: -1, createdAt: -1 });

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('❌ Get appointments error:', error);
    next(error);
  }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'profile patientInfo email phone')
      .populate('doctorId', 'profile doctorInfo email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
    }

    // Check authorization
    if (
      appointment.patientId._id.toString() !== req.user._id.toString() &&
      appointment.doctorId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this appointment',
      });
    }

    res.status(200).json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel appointment
 * @route   PUT /api/appointments/:id/cancel
 * @access  Private
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
    }

    // Check authorization
    if (
      appointment.patientId.toString() !== req.user._id.toString() &&
      appointment.doctorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this appointment',
      });
    }

    // Check if already cancelled/completed
    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel ${appointment.status} appointment`,
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledBy = req.user._id;
    appointment.cancelledAt = new Date();
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete appointment
 * @route   PUT /api/appointments/:id/complete
 * @access  Private (Doctor only)
 */
const completeAppointment = async (req, res, next) => {
  try {
    const { notes } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
    }

    appointment.status = 'completed';
    appointment.completedAt = new Date();
    appointment.notes = notes;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment marked as completed',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
const updateAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime, reason, symptoms, notes, status } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
    }

    // Check authorization
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    // Update fields
    if (appointmentDate) appointment.appointmentDate = appointmentDate;
    if (appointmentTime) appointment.appointmentTime = appointmentTime;
    if (reason) appointment.reason = reason;
    if (symptoms) appointment.symptoms = symptoms;
    if (notes && isDoctor) appointment.notes = notes;
    if (status && isDoctor) appointment.status = status;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  completeAppointment,
  updateAppointment,
};
