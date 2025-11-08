const mongoose = require('mongoose');

/**
 * Health Metric Schema
 * Stores patient health metrics like BP, sugar, weight, etc.
 */

const healthMetricSchema = new mongoose.Schema({
  // Reference
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
  },

  // Metric type
  metricType: {
    type: String,
    enum: ['blood_pressure', 'blood_sugar', 'weight', 'heart_rate', 'temperature', 'oxygen_saturation', 'bmi', 'other'],
    required: [true, 'Metric type is required'],
  },

  // Metric values - flexible structure to accommodate different types
  value: {
    // For blood pressure
    systolic: Number,
    diastolic: Number,
    
    // For single value metrics (sugar, weight, heart rate, etc.)
    level: Number,
    
    // Unit of measurement
    unit: {
      type: String,
      required: [true, 'Unit is required'],
    },
  },

  // When was it measured
  measuredAt: {
    type: Date,
    required: [true, 'Measurement date is required'],
    default: Date.now,
  },

  // Additional notes
  notes: String,

  // Status/Category
  status: {
    type: String,
    enum: ['normal', 'low', 'high', 'critical'],
    default: 'normal',
  },

  // Source of measurement
  source: {
    type: String,
    enum: ['manual', 'device', 'doctor'],
    default: 'manual',
  },

  // Timestamps
}, {
  timestamps: true,
});

// Indexes for better query performance
healthMetricSchema.index({ patientId: 1, measuredAt: -1 });
healthMetricSchema.index({ metricType: 1 });
healthMetricSchema.index({ patientId: 1, metricType: 1, measuredAt: -1 });

// Pre-save hook to auto-calculate status based on values
healthMetricSchema.pre('save', function(next) {
  if (this.metricType === 'blood_pressure' && this.value.systolic && this.value.diastolic) {
    if (this.value.systolic >= 140 || this.value.diastolic >= 90) {
      this.status = 'high';
    } else if (this.value.systolic < 90 || this.value.diastolic < 60) {
      this.status = 'low';
    } else {
      this.status = 'normal';
    }
  } else if (this.metricType === 'blood_sugar' && this.value.level) {
    // Fasting sugar levels
    if (this.value.level >= 126) {
      this.status = 'high';
    } else if (this.value.level < 70) {
      this.status = 'low';
    } else {
      this.status = 'normal';
    }
  } else if (this.metricType === 'heart_rate' && this.value.level) {
    if (this.value.level > 100) {
      this.status = 'high';
    } else if (this.value.level < 60) {
      this.status = 'low';
    } else {
      this.status = 'normal';
    }
  }
  next();
});

const HealthMetric = mongoose.model('HealthMetric', healthMetricSchema);

module.exports = HealthMetric;
