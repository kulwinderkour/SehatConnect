const MedicineReminder = require('../models/MedicineReminder');
const Prescription = require('../models/Prescription');

/**
 * Medicine Reminder Controller
 * Handles all reminder-related operations
 */

/**
 * @desc    Get all reminders for a user
 * @route   GET /api/reminders
 * @access  Private
 */
exports.getUserReminders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isActive, startDate, endDate } = req.query;

    let query = { userId };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    const reminders = await MedicineReminder.find(query)
      .populate('prescriptionId', 'diagnosis doctorId createdAt')
      .sort({ startDate: 1, 'times.0': 1 });

    res.json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error('Error fetching user reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reminders',
      error: error.message,
    });
  }
};

/**
 * @desc    Get today's reminders for a user
 * @route   GET /api/reminders/today
 * @access  Private
 */
exports.getTodayReminders = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reminders = await MedicineReminder.find({
      userId,
      isActive: true,
      startDate: { $lte: tomorrow },
      endDate: { $gte: today },
    })
      .populate('prescriptionId', 'diagnosis doctorId')
      .sort({ 'times.0': 1 });

    res.json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error('Error fetching today reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s reminders',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a medicine reminder
 * @route   POST /api/reminders
 * @access  Private
 */
exports.createReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const reminderData = {
      ...req.body,
      userId,
    };

    // Validate dates
    const startDate = new Date(reminderData.startDate);
    const endDate = new Date(reminderData.endDate);

    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
    }

    // Calculate total doses
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const timesPerDay = reminderData.times.length;
    reminderData.totalDoses = daysDiff * timesPerDay;

    const reminder = await MedicineReminder.create(reminderData);

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder,
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reminder',
      error: error.message,
    });
  }
};

/**
 * @desc    Create reminders from prescription
 * @route   POST /api/reminders/from-prescription/:prescriptionId
 * @access  Private
 */
exports.createRemindersFromPrescription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prescriptionId } = req.params;
    const { startDate } = req.body; // Optional: custom start date

    // Get prescription
    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      patientId: userId,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    const reminders = [];
    const baseStartDate = startDate ? new Date(startDate) : new Date();

    // Create reminder for each medication
    for (const medication of prescription.medications) {
      // Parse duration (e.g., "7 days", "2 weeks", "1 month")
      const endDate = this.calculateEndDate(baseStartDate, medication.duration);

      // Parse frequency to times
      const times = this.parseFrequencyToTimes(medication.frequency);

      const reminderData = {
        userId,
        prescriptionId,
        medicineName: medication.name,
        dosage: medication.dosage,
        frequency: this.mapFrequency(medication.frequency),
        times,
        startDate: baseStartDate,
        endDate,
        instructions: medication.instructions,
        beforeMeal: medication.timing === 'before_meal',
        afterMeal: medication.timing === 'after_meal',
        enableNotification: true,
        isActive: true,
      };

      // Calculate total doses
      const daysDiff = Math.ceil((endDate - baseStartDate) / (1000 * 60 * 60 * 24)) + 1;
      reminderData.totalDoses = daysDiff * times.length;

      const reminder = await MedicineReminder.create(reminderData);
      reminders.push(reminder);
    }

    res.status(201).json({
      success: true,
      message: `Created ${reminders.length} reminders from prescription`,
      data: reminders,
    });
  } catch (error) {
    console.error('Error creating reminders from prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reminders from prescription',
      error: error.message,
    });
  }
};

/**
 * @desc    Update a reminder
 * @route   PUT /api/reminders/:id
 * @access  Private
 */
exports.updateReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const reminder = await MedicineReminder.findOne({
      _id: id,
      userId,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
      });
    }

    // Update reminder
    Object.assign(reminder, req.body);
    await reminder.save();

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      data: reminder,
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating reminder',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark dose as taken
 * @route   POST /api/reminders/:id/doses/:doseId/taken
 * @access  Private
 */
exports.markDoseTaken = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id, doseId } = req.params;
    const { takenAt, notes } = req.body;

    const reminder = await MedicineReminder.findOne({
      _id: id,
      userId,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
      });
    }

    await reminder.markDoseTaken(doseId, takenAt ? new Date(takenAt) : new Date());

    if (notes) {
      const dose = reminder.doses.id(doseId);
      if (dose) {
        dose.notes = notes;
        await reminder.save();
      }
    }

    res.json({
      success: true,
      message: 'Dose marked as taken',
      data: reminder,
    });
  } catch (error) {
    console.error('Error marking dose as taken:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking dose as taken',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark dose as missed
 * @route   POST /api/reminders/:id/doses/:doseId/missed
 * @access  Private
 */
exports.markDoseMissed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id, doseId } = req.params;

    const reminder = await MedicineReminder.findOne({
      _id: id,
      userId,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
      });
    }

    await reminder.markDoseMissed(doseId);

    res.json({
      success: true,
      message: 'Dose marked as missed',
      data: reminder,
    });
  } catch (error) {
    console.error('Error marking dose as missed:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking dose as missed',
      error: error.message,
    });
  }
};

/**
 * @desc    Snooze dose
 * @route   POST /api/reminders/:id/doses/:doseId/snooze
 * @access  Private
 */
exports.snoozeDose = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id, doseId } = req.params;
    const { snoozeMinutes = 10 } = req.body;

    const reminder = await MedicineReminder.findOne({
      _id: id,
      userId,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
      });
    }

    await reminder.snoozeDose(doseId, snoozeMinutes);

    res.json({
      success: true,
      message: `Dose snoozed for ${snoozeMinutes} minutes`,
      data: reminder,
    });
  } catch (error) {
    console.error('Error snoozing dose:', error);
    res.status(500).json({
      success: false,
      message: 'Error snoozing dose',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a reminder
 * @route   DELETE /api/reminders/:id
 * @access  Private
 */
exports.deleteReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const reminder = await MedicineReminder.findOne({
      _id: id,
      userId,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
      });
    }

    await reminder.deleteOne();

    res.json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reminder',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle reminder active status
 * @route   PATCH /api/reminders/:id/toggle
 * @access  Private
 */
exports.toggleReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const reminder = await MedicineReminder.findOne({
      _id: id,
      userId,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
      });
    }

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    res.json({
      success: true,
      message: `Reminder ${reminder.isActive ? 'activated' : 'deactivated'}`,
      data: reminder,
    });
  } catch (error) {
    console.error('Error toggling reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling reminder',
      error: error.message,
    });
  }
};

/**
 * @desc    Get reminder statistics
 * @route   GET /api/reminders/stats
 * @access  Private
 */
exports.getReminderStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const reminders = await MedicineReminder.find({
      userId,
      isActive: true,
    });

    const stats = {
      totalReminders: reminders.length,
      totalDoses: 0,
      takenDoses: 0,
      missedDoses: 0,
      overallAdherence: 0,
    };

    reminders.forEach(reminder => {
      stats.totalDoses += reminder.totalDoses;
      stats.takenDoses += reminder.takenDoses;
      stats.missedDoses += reminder.missedDoses;
    });

    if (stats.totalDoses > 0) {
      stats.overallAdherence = Math.round((stats.takenDoses / stats.totalDoses) * 100);
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching reminder stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reminder statistics',
      error: error.message,
    });
  }
};

// Helper functions
exports.calculateEndDate = (startDate, duration) => {
  const start = new Date(startDate);
  const durationLower = duration.toLowerCase();

  if (durationLower.includes('day')) {
    const days = parseInt(durationLower);
    start.setDate(start.getDate() + days);
  } else if (durationLower.includes('week')) {
    const weeks = parseInt(durationLower);
    start.setDate(start.getDate() + (weeks * 7));
  } else if (durationLower.includes('month')) {
    const months = parseInt(durationLower);
    start.setMonth(start.getMonth() + months);
  } else {
    // Default to 7 days
    start.setDate(start.getDate() + 7);
  }

  return start;
};

exports.parseFrequencyToTimes = (frequency) => {
  const freqLower = frequency.toLowerCase();

  if (freqLower.includes('once') || freqLower.includes('1')) {
    return ['09:00'];
  } else if (freqLower.includes('twice') || freqLower.includes('2')) {
    return ['09:00', '21:00'];
  } else if (freqLower.includes('thrice') || freqLower.includes('three') || freqLower.includes('3')) {
    return ['09:00', '14:00', '21:00'];
  } else if (freqLower.includes('four') || freqLower.includes('4')) {
    return ['08:00', '12:00', '16:00', '20:00'];
  } else {
    return ['09:00'];
  }
};

exports.mapFrequency = (frequency) => {
  const freqLower = frequency.toLowerCase();

  if (freqLower.includes('once') || freqLower.includes('1')) {
    return 'once_daily';
  } else if (freqLower.includes('twice') || freqLower.includes('2')) {
    return 'twice_daily';
  } else if (freqLower.includes('thrice') || freqLower.includes('three') || freqLower.includes('3')) {
    return 'thrice_daily';
  } else if (freqLower.includes('four') || freqLower.includes('4')) {
    return 'four_times_daily';
  } else {
    return 'as_needed';
  }
};
