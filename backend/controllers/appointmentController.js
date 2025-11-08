/**
 * Appointment Controller
 * Handles appointment booking, cancellation, scheduling
 */

const { Appointment, User, Notification } = require('../models');
const { sendAppointmentEmail } = require('../utils/emailService');

/**
 * @desc    Book appointment
 * @route   POST /api/appointments
 * @access  Private
 */
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, type, reason } = req.body;

    // Check if doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found',
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      appointmentDate,
      appointmentTime,
      type,
      reason,
      status: 'scheduled',
    });

    // Send email notification
    await sendAppointmentEmail(req.user.email, {
      patientName: req.user.profile.fullName,
      doctorName: doctor.profile.fullName,
      date: appointmentDate,
      time: appointmentTime,
      specialty: doctor.doctorInfo.specialty,
      hospital: doctor.doctorInfo.hospital,
    });

    // Create notification for doctor
    await Notification.create({
      userId: doctorId,
      type: 'appointment',
      title: 'New Appointment',
      message: `New appointment booked by ${req.user.profile.fullName}`,
      relatedId: appointment._id,
      relatedModel: 'Appointment',
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: { appointment },
    });
  } catch (error) {
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
    const { status, page = 1, limit = 10 } = req.query;

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
      .populate('patientId', 'profile')
      .populate('doctorId', 'profile doctorInfo')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ appointmentDate: -1 });

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
      .populate('patientId', 'profile patientInfo')
      .populate('doctorId', 'profile doctorInfo');

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

    // Notify the other party
    const notifyUserId =
      req.user.role === 'doctor' ? appointment.patientId : appointment.doctorId;

    await Notification.create({
      userId: notifyUserId,
      type: 'appointment',
      title: 'Appointment Cancelled',
      message: `Your appointment has been cancelled${cancellationReason ? `: ${cancellationReason}` : ''}`,
      relatedId: appointment._id,
      relatedModel: 'Appointment',
    });

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
    const { notes, prescriptionId } = req.body;

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
    if (prescriptionId) {
      appointment.prescriptionId = prescriptionId;
    }

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
 * @desc    Reschedule appointment
 * @route   PUT /api/appointments/:id/reschedule
 * @access  Private
 */
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;

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
        error: 'Not authorized',
      });
    }

    appointment.appointmentDate = appointmentDate;
    appointment.appointmentTime = appointmentTime;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
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
  rescheduleAppointment,
};
