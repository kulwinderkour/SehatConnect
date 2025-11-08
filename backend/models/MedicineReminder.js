const mongoose = require('mongoose');

/**
 * Medicine Reminders Schema
 * Handles medication reminder schedules and tracking
 */
const medicineReminderSchema = new mongoose.Schema(
  {
    // References
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    medicationId: mongoose.Schema.Types.ObjectId,

    // Medicine Info
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
    },

    // Schedule
    frequency: {
      type: String,
      enum: ['once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'as_needed'],
      required: true,
    },
    times: [String], // ["08:00", "14:00", "20:00"]

    // Duration
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },

    // Days
    daysOfWeek: [
      {
        type: Number,
        min: 0,
        max: 6, // 0-6 (Sunday-Saturday)
      },
    ],

    // Timing Context
    beforeMeal: {
      type: Boolean,
      default: false,
    },
    afterMeal: {
      type: Boolean,
      default: false,
    },
    withMeal: {
      type: Boolean,
      default: false,
    },
    emptyStomach: {
      type: Boolean,
      default: false,
    },

    // Instructions
    instructions: String,
    specialInstructions: String,

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },

    // Notifications
    enableNotification: {
      type: Boolean,
      default: true,
    },
    notificationSound: {
      type: String,
      default: 'default',
    },
    snoozeMinutes: {
      type: Number,
      default: 10,
    },

    // Tracking
    doses: [
      {
        scheduledTime: Date,
        takenAt: Date,
        status: {
          type: String,
          enum: ['pending', 'taken', 'missed', 'skipped'],
          default: 'pending',
        },
        notes: String,
        isSnoozed: {
          type: Boolean,
          default: false,
        },
        snoozedUntil: Date,
      },
    ],

    // Statistics
    totalDoses: {
      type: Number,
      default: 0,
    },
    takenDoses: {
      type: Number,
      default: 0,
    },
    missedDoses: {
      type: Number,
      default: 0,
    },
    adherenceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
medicineReminderSchema.index({ userId: 1, isActive: 1 });
medicineReminderSchema.index({ userId: 1, startDate: 1, endDate: 1 });
medicineReminderSchema.index({ 'doses.scheduledTime': 1, 'doses.status': 1 });

// Pre-save middleware to calculate adherence rate
medicineReminderSchema.pre('save', function (next) {
  if (this.totalDoses > 0) {
    this.adherenceRate = Math.round((this.takenDoses / this.totalDoses) * 100);
  }
  next();
});

// Method to mark dose as taken
medicineReminderSchema.methods.markDoseTaken = function (doseId, takenAt = new Date()) {
  const dose = this.doses.id(doseId);
  if (dose) {
    dose.status = 'taken';
    dose.takenAt = takenAt;
    this.takenDoses += 1;
    this.adherenceRate = Math.round((this.takenDoses / this.totalDoses) * 100);
  }
  return this.save();
};

// Method to mark dose as missed
medicineReminderSchema.methods.markDoseMissed = function (doseId) {
  const dose = this.doses.id(doseId);
  if (dose) {
    dose.status = 'missed';
    this.missedDoses += 1;
    this.adherenceRate = Math.round((this.takenDoses / this.totalDoses) * 100);
  }
  return this.save();
};

// Method to snooze dose
medicineReminderSchema.methods.snoozeDose = function (doseId, snoozeMinutes) {
  const dose = this.doses.id(doseId);
  if (dose) {
    dose.isSnoozed = true;
    dose.snoozedUntil = new Date(Date.now() + snoozeMinutes * 60000);
  }
  return this.save();
};

module.exports = mongoose.model('MedicineReminder', medicineReminderSchema);
