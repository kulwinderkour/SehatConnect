/**
 * Model Exports
 * Central export file for all database models
 */

const User = require('./User');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const MedicalRecord = require('./MedicalRecord');
const HealthMetric = require('./HealthMetric');
const ChatMessage = require('./ChatMessage');
const Pharmacy = require('./Pharmacy');
const PharmacyOrder = require('./PharmacyOrder');
const Notification = require('./Notification');
const EmergencyContact = require('./EmergencyContact');
const FamilyMember = require('./FamilyMember');
const ChatbotConversation = require('./ChatbotConversation');
const MedicineReminder = require('./MedicineReminder');
const GovernmentScheme = require('./GovernmentScheme');
const IntakeLog = require('./IntakeLog');

module.exports = {
  User,
  Appointment,
  Prescription,
  MedicalRecord,
  HealthMetric,
  ChatMessage,
  Pharmacy,
  PharmacyOrder,
  Notification,
  EmergencyContact,
  FamilyMember,
  ChatbotConversation,
  MedicineReminder,
  GovernmentScheme,
  IntakeLog,
};
