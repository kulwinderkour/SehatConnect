/**
 * Health Metrics & Medicine Reminders Controller
 */

const { HealthMetric, MedicineReminder } = require('../models');

// ============ HEALTH METRICS ============

/**
 * @desc    Add health metric
 * @route   POST /api/health/metrics
 * @access  Private
 */
const addHealthMetric = async (req, res, next) => {
  try {
    const metric = await HealthMetric.create({
      userId: req.user._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: 'Health metric added successfully',
      data: { metric },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get health metrics
 * @route   GET /api/health/metrics
 * @access  Private
 */
const getHealthMetrics = async (req, res, next) => {
  try {
    const { type, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = { userId: req.user._id };

    if (type) {
      query.type = type;
    }

    if (startDate && endDate) {
      query.recordedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const metrics = await HealthMetric.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ recordedAt: -1 });

    const total = await HealthMetric.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        metrics,
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
 * @desc    Get latest health metrics
 * @route   GET /api/health/metrics/latest
 * @access  Private
 */
const getLatestMetrics = async (req, res, next) => {
  try {
    const types = ['blood_pressure', 'blood_sugar', 'weight', 'heart_rate', 'temperature', 'oxygen_saturation'];
    const latestMetrics = {};

    for (const type of types) {
      const metric = await HealthMetric.findOne({
        userId: req.user._id,
        type,
      }).sort({ recordedAt: -1 });

      if (metric) {
        latestMetrics[type] = metric;
      }
    }

    res.status(200).json({
      success: true,
      data: { latestMetrics },
    });
  } catch (error) {
    next(error);
  }
};

// ============ MEDICINE REMINDERS ============

/**
 * @desc    Create medicine reminder
 * @route   POST /api/health/reminders
 * @access  Private
 */
const createReminder = async (req, res, next) => {
  try {
    const reminder = await MedicineReminder.create({
      userId: req.user._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: 'Medicine reminder created successfully',
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reminders
 * @route   GET /api/health/reminders
 * @access  Private
 */
const getReminders = async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const reminders = await MedicineReminder.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await MedicineReminder.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reminders,
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
 * @desc    Mark dose as taken
 * @route   PUT /api/health/reminders/:id/doses/:doseId/taken
 * @access  Private
 */
const markDoseTaken = async (req, res, next) => {
  try {
    const { id, doseId } = req.params;

    const reminder = await MedicineReminder.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found',
      });
    }

    await reminder.markDoseTaken(doseId);

    res.status(200).json({
      success: true,
      message: 'Dose marked as taken',
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update reminder
 * @route   PUT /api/health/reminders/:id
 * @access  Private
 */
const updateReminder = async (req, res, next) => {
  try {
    let reminder = await MedicineReminder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found',
      });
    }

    reminder = await MedicineReminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Reminder updated successfully',
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete reminder
 * @route   DELETE /api/health/reminders/:id
 * @access  Private
 */
const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await MedicineReminder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found',
      });
    }

    reminder.isActive = false;
    await reminder.save();

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Health Metrics
  addHealthMetric,
  getHealthMetrics,
  getLatestMetrics,
  // Medicine Reminders
  createReminder,
  getReminders,
  markDoseTaken,
  updateReminder,
  deleteReminder,
};
