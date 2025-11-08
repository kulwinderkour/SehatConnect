const IntakeLog = require('../models/IntakeLog');
const Prescription = require('../models/Prescription');

/**
 * Schedule intake reminders for a medication
 * @route POST /api/intake/schedule
 */
exports.scheduleIntakeReminders = async (req, res) => {
  try {
    const { prescriptionId, medicineIndex, chosenTimes } = req.body;

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

    // Generate intake logs for the duration of the prescription
    const intakeLogs = [];
    const startDate = new Date(medication.startDate);
    const endDate = medication.endDate || new Date(startDate.getTime() + medication.durationDays * 24 * 60 * 60 * 1000);

    // Create intake logs for each day
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      for (const chosenTime of chosenTimes) {
        const intakeLog = new IntakeLog({
          prescriptionId: prescription._id,
          medicineIndex,
          medicineName: medication.name,
          slotLabel: chosenTime.label,
          scheduledTime: chosenTime.time,
          scheduledDate: new Date(date),
          status: 'pending',
          patientId: prescription.patientId,
        });

        intakeLogs.push(intakeLog);
      }
    }

    // Save all intake logs
    await IntakeLog.insertMany(intakeLogs);

    res.status(201).json({
      success: true,
      message: 'Intake reminders scheduled successfully',
      data: {
        totalReminders: intakeLogs.length,
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Error scheduling intake reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule intake reminders',
      error: error.message
    });
  }
};

/**
 * Update notification ID for an intake log
 * @route PATCH /api/intake/:intakeId/notification
 */
exports.updateNotificationId = async (req, res) => {
  try {
    const { intakeId } = req.params;
    const { notificationId } = req.body;

    const intakeLog = await IntakeLog.findByIdAndUpdate(
      intakeId,
      { notificationId },
      { new: true }
    );

    if (!intakeLog) {
      return res.status(404).json({
        success: false,
        message: 'Intake log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: intakeLog
    });

  } catch (error) {
    console.error('Error updating notification ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification ID',
      error: error.message
    });
  }
};

/**
 * Mark medication as taken
 * @route PATCH /api/intake/:intakeId/mark-taken
 */
exports.markAsTaken = async (req, res) => {
  try {
    const { intakeId } = req.params;
    const { takenAt, notes } = req.body;

    const intakeLog = await IntakeLog.findById(intakeId);

    if (!intakeLog) {
      return res.status(404).json({
        success: false,
        message: 'Intake log not found'
      });
    }

    // Check if already taken
    if (intakeLog.status === 'taken') {
      return res.status(400).json({
        success: false,
        message: 'Medication already marked as taken'
      });
    }

    // Prevent double intake (within 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentIntake = await IntakeLog.findOne({
      prescriptionId: intakeLog.prescriptionId,
      medicineIndex: intakeLog.medicineIndex,
      status: 'taken',
      takenAt: { $gte: twoHoursAgo }
    });

    if (recentIntake) {
      return res.status(400).json({
        success: false,
        message: 'Medication was taken less than 2 hours ago. Please wait before taking again.'
      });
    }

    // Update intake log
    intakeLog.status = 'taken';
    intakeLog.takenAt = takenAt || new Date();
    if (notes) {
      intakeLog.notes = notes;
    }

    await intakeLog.save();

    res.status(200).json({
      success: true,
      message: 'Medication marked as taken',
      data: intakeLog
    });

  } catch (error) {
    console.error('Error marking intake as taken:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark medication as taken',
      error: error.message
    });
  }
};

/**
 * Snooze a medication reminder
 * @route PATCH /api/intake/:intakeId/snooze
 */
exports.snoozeIntake = async (req, res) => {
  try {
    const { intakeId } = req.params;
    const { snoozeMinutes = 15 } = req.body;

    const intakeLog = await IntakeLog.findById(intakeId);

    if (!intakeLog) {
      return res.status(404).json({
        success: false,
        message: 'Intake log not found'
      });
    }

    if (intakeLog.status === 'taken') {
      return res.status(400).json({
        success: false,
        message: 'Cannot snooze already taken medication'
      });
    }

    // Limit snooze count
    if (intakeLog.snoozeCount >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum snooze limit reached'
      });
    }

    intakeLog.status = 'snoozed';
    intakeLog.snoozeCount += 1;
    await intakeLog.save();

    res.status(200).json({
      success: true,
      message: `Reminder snoozed for ${snoozeMinutes} minutes`,
      data: {
        intakeLog,
        snoozeMinutes
      }
    });

  } catch (error) {
    console.error('Error snoozing intake:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to snooze reminder',
      error: error.message
    });
  }
};

/**
 * Skip a medication dose
 * @route PATCH /api/intake/:intakeId/skip
 */
exports.skipIntake = async (req, res) => {
  try {
    const { intakeId } = req.params;
    const { reason } = req.body;

    const intakeLog = await IntakeLog.findByIdAndUpdate(
      intakeId,
      { 
        status: 'skipped',
        notes: reason
      },
      { new: true }
    );

    if (!intakeLog) {
      return res.status(404).json({
        success: false,
        message: 'Intake log not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medication dose skipped',
      data: intakeLog
    });

  } catch (error) {
    console.error('Error skipping intake:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to skip medication',
      error: error.message
    });
  }
};

/**
 * Get upcoming intakes for a patient
 * @route GET /api/intake/patient/:patientId/upcoming
 */
exports.getUpcomingIntakes = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { days = 1 } = req.query;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + parseInt(days));

    const intakes = await IntakeLog.find({
      patientId,
      scheduledDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['pending', 'snoozed'] }
    })
      .populate('prescriptionId', 'doctorId')
      .sort({ scheduledDate: 1, scheduledTime: 1 });

    res.status(200).json({
      success: true,
      data: intakes
    });

  } catch (error) {
    console.error('Error fetching upcoming intakes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming intakes',
      error: error.message
    });
  }
};

/**
 * Get intake history for a patient
 * @route GET /api/intake/patient/:patientId/history
 */
exports.getIntakeHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { startDate, endDate, status } = req.query;

    const query = { patientId };

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    if (status) {
      query.status = status;
    }

    const history = await IntakeLog.find(query)
      .populate('prescriptionId', 'doctorId diagnosis')
      .sort({ scheduledDate: -1, scheduledTime: -1 })
      .limit(100);

    // Calculate adherence stats
    const stats = {
      total: history.length,
      taken: history.filter(i => i.status === 'taken').length,
      missed: history.filter(i => i.status === 'missed').length,
      skipped: history.filter(i => i.status === 'skipped').length,
      adherenceRate: 0
    };

    if (stats.total > 0) {
      stats.adherenceRate = ((stats.taken / stats.total) * 100).toFixed(2);
    }

    res.status(200).json({
      success: true,
      data: {
        history,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching intake history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch intake history',
      error: error.message
    });
  }
};

/**
 * Check for missed intakes and update status
 * @route POST /api/intake/check-missed
 */
exports.checkMissedIntakes = async (req, res) => {
  try {
    const now = new Date();

    // Find pending intakes that are overdue
    const overdueIntakes = await IntakeLog.find({
      status: 'pending',
      scheduledDate: { $lt: now }
    });

    const updatePromises = overdueIntakes.map(async (intake) => {
      const scheduledDateTime = new Date(intake.scheduledDate);
      const [hours, minutes] = intake.scheduledTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // If more than 1 hour past scheduled time, mark as missed
      if (now - scheduledDateTime > 60 * 60 * 1000) {
        intake.status = 'missed';
        return intake.save();
      }
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `Checked and updated ${overdueIntakes.length} intake logs`
    });

  } catch (error) {
    console.error('Error checking missed intakes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check missed intakes',
      error: error.message
    });
  }
};

/**
 * Get today's medication schedule for a patient
 * @route GET /api/intake/patient/:patientId/today
 */
exports.getTodaySchedule = async (req, res) => {
  try {
    const { patientId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedule = await IntakeLog.find({
      patientId,
      scheduledDate: { $gte: today, $lt: tomorrow }
    })
      .populate({
        path: 'prescriptionId',
        select: 'doctorId medications',
        populate: {
          path: 'doctorId',
          select: 'name specialization'
        }
      })
      .sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error('Error fetching today\'s schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s schedule',
      error: error.message
    });
  }
};
