const mongoose = require('mongoose');

/**
 * Medical Record Schema
 * Stores patient medical documents, reports, scans, etc.
 */

const medicalRecordSchema = new mongoose.Schema({
  // Reference
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
  },

  // Record details
  recordType: {
    type: String,
    enum: ['lab_report', 'scan', 'xray', 'prescription', 'vaccination', 'discharge_summary', 'other'],
    required: [true, 'Record type is required'],
  },

  title: {
    type: String,
    required: [true, 'Title is required'],
  },

  description: {
    type: String,
  },

  date: {
    type: Date,
    required: [true, 'Record date is required'],
    default: Date.now,
  },

  // Files/Documents
  files: [{
    url: {
      type: String,
      required: true,
    },
    fileName: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // Additional metadata
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  hospitalName: String,

  doctorName: String,

  tags: [{
    type: String,
  }],

  // Timestamps
}, {
  timestamps: true,
});

// Indexes for better query performance
medicalRecordSchema.index({ patientId: 1, date: -1 });
medicalRecordSchema.index({ recordType: 1 });
medicalRecordSchema.index({ tags: 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;
