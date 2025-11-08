/**
 * Email Service
 * Handles sending emails using Nodemailer
 */

const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send Email
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SehatConnect" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send OTP Email
 */
const sendOTPEmail = async (email, otp, name = 'User') => {
  const subject = 'Your SehatConnect OTP';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 SehatConnect</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Your OTP for verification is:</p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
          </div>
          <p><strong>This OTP is valid for 10 minutes.</strong></p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <p>Stay healthy! 💚</p>
        </div>
        <div class="footer">
          <p>© 2025 SehatConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to SehatConnect! 🎉';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-item { margin: 15px 0; padding-left: 30px; position: relative; }
        .feature-item:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; font-size: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Welcome to SehatConnect!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}! 👋</h2>
          <p>Thank you for joining SehatConnect - your complete healthcare companion!</p>
          <div class="features">
            <h3>What you can do:</h3>
            <div class="feature-item">Book appointments with verified doctors</div>
            <div class="feature-item">Track your health metrics daily</div>
            <div class="feature-item">Order medicines from nearby pharmacies</div>
            <div class="feature-item">Chat with AI health assistant</div>
            <div class="feature-item">Access emergency services instantly</div>
            <div class="feature-item">Explore government health schemes</div>
          </div>
          <p><strong>Get started now and take control of your health!</strong></p>
          <p>Stay healthy! 💚</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async (email, resetToken, name = 'User') => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy this link: <br/>${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Important:</strong> This link is valid for only 1 hour. If you didn't request this, please ignore this email.
          </div>
          <p>Stay secure! 🔐</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Appointment Confirmation Email
 */
const sendAppointmentEmail = async (email, appointmentDetails) => {
  const { patientName, doctorName, date, time, specialty, hospital } = appointmentDetails;
  
  const subject = 'Appointment Confirmed 📅';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; color: #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Appointment Confirmed</h1>
        </div>
        <div class="content">
          <h2>Hello ${patientName}!</h2>
          <p>Your appointment has been confirmed. Here are the details:</p>
          <div class="appointment-box">
            <div class="detail"><span class="label">Doctor:</span> Dr. ${doctorName}</div>
            <div class="detail"><span class="label">Specialty:</span> ${specialty}</div>
            <div class="detail"><span class="label">Date:</span> ${date}</div>
            <div class="detail"><span class="label">Time:</span> ${time}</div>
            <div class="detail"><span class="label">Hospital:</span> ${hospital}</div>
          </div>
          <p><strong>Please arrive 15 minutes early.</strong></p>
          <p>Stay healthy! 💚</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAppointmentEmail,
};
