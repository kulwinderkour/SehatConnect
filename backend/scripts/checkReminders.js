/**
 * Quick script to check if reminders exist for a user
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MedicineReminder = require('../models/MedicineReminder');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehatconnect', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkReminders = async () => {
  try {
    // Find the demo patient
    const patient = await User.findOne({ email: 'patient@sehat.com' });
    
    if (!patient) {
      console.log('❌ Patient not found. Please run initDemoUsers first.');
      return;
    }

    console.log(`\n👤 Patient: ${patient.email} (${patient._id})\n`);

    // Check all reminders
    const allReminders = await MedicineReminder.find({ userId: patient._id });
    console.log(`📋 Total reminders: ${allReminders.length}\n`);

    if (allReminders.length === 0) {
      console.log('⚠️  No reminders found!');
      console.log('   Run: npm run create-dummy-reminders\n');
      return;
    }

    // Check today's reminders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayReminders = await MedicineReminder.find({
      userId: patient._id,
      isActive: true,
      startDate: { $lte: tomorrow },
      endDate: { $gte: today },
    });

    console.log(`📅 Today's reminders: ${todayReminders.length}\n`);

    // List all reminders
    allReminders.forEach((reminder, index) => {
      console.log(`${index + 1}. ${reminder.medicineName} (${reminder.dosage})`);
      console.log(`   Times: ${reminder.times.join(', ')}`);
      console.log(`   Active: ${reminder.isActive}`);
      console.log(`   Dates: ${new Date(reminder.startDate).toLocaleDateString()} - ${new Date(reminder.endDate).toLocaleDateString()}`);
      console.log(`   Is Today: ${todayReminders.some(r => r._id.toString() === reminder._id.toString())}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await checkReminders();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { checkReminders };

