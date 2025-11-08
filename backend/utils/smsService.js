/**
 * SMS Service
 * Handles sending SMS using Twilio or similar service
 */

// You can use Twilio, AWS SNS, or any SMS provider
// This is a placeholder implementation

/**
 * Send SMS
 * @param {string} phone - Recipient phone number
 * @param {string} message - SMS message
 */
const sendSMS = async (phone, message) => {
  try {
    // Implement your SMS provider here
    // Example with Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    console.log('SMS sent:', result.sid);
    return result;
    */

    // For development: just log the SMS
    console.log('SMS to:', phone);
    console.log('Message:', message);
    
    return { success: true };
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw new Error('Failed to send SMS');
  }
};

/**
 * Send OTP SMS
 */
const sendOTPSMS = async (phone, otp, name = 'User') => {
  const message = `Hello ${name}! Your SehatConnect OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
  return sendSMS(phone, message);
};

/**
 * Send Appointment Reminder SMS
 */
const sendAppointmentReminderSMS = async (phone, appointmentDetails) => {
  const { patientName, doctorName, date, time } = appointmentDetails;
  const message = `Hello ${patientName}! Reminder: You have an appointment with Dr. ${doctorName} on ${date} at ${time}. Please arrive 15 minutes early. - SehatConnect`;
  return sendSMS(phone, message);
};

/**
 * Send Medicine Reminder SMS
 */
const sendMedicineReminderSMS = async (phone, medicineDetails) => {
  const { patientName, medicineName, dosage, time } = medicineDetails;
  const message = `Hello ${patientName}! Time to take your medicine: ${medicineName} (${dosage}) at ${time}. - SehatConnect`;
  return sendSMS(phone, message);
};

/**
 * Send Emergency Alert SMS
 */
const sendEmergencyAlertSMS = async (phone, emergencyDetails) => {
  const { patientName, location } = emergencyDetails;
  const message = `EMERGENCY ALERT: ${patientName} needs help at ${location}. Please respond immediately. - SehatConnect`;
  return sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendOTPSMS,
  sendAppointmentReminderSMS,
  sendMedicineReminderSMS,
  sendEmergencyAlertSMS,
};
