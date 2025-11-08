/**
 * Diagnostic script to check if everything is set up correctly
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
    return true;
  } catch (error) {
    return false;
  }
};

const diagnose = async () => {
  console.log('\n🔍 SehatConnect Medicine Reminders Diagnostic\n');
  console.log('═'.repeat(50));
  
  // 1. Check MongoDB connection
  console.log('\n1️⃣  Checking MongoDB connection...');
  const connected = await connectDB();
  if (connected) {
    console.log('   ✅ MongoDB connected successfully');
  } else {
    console.log('   ❌ MongoDB connection failed');
    console.log('   💡 Fix: Start MongoDB or check MONGODB_URI in .env');
    console.log('═'.repeat(50));
    process.exit(1);
  }

  // 2. Check if demo users exist
  console.log('\n2️⃣  Checking demo users...');
  const patient = await User.findOne({ email: 'patient@sehat.com' });
  const doctor = await User.findOne({ email: 'drrajesh@sehat.com' });
  
  if (patient && doctor) {
    console.log('   ✅ Demo users exist');
    console.log(`      Patient: ${patient.email} (${patient._id})`);
    console.log(`      Doctor: ${doctor.email} (${doctor._id})`);
  } else {
    console.log('   ❌ Demo users not found');
    console.log('   💡 Fix: Run "node scripts/initDemoUsers.js"');
    console.log('═'.repeat(50));
    await mongoose.connection.close();
    process.exit(1);
  }

  // 3. Check medicine reminders
  console.log('\n3️⃣  Checking medicine reminders...');
  const allReminders = await MedicineReminder.find({ userId: patient._id });
  
  if (allReminders.length === 0) {
    console.log('   ❌ No reminders found');
    console.log('   💡 Fix: Run "npm run create-dummy-reminders"');
    console.log('═'.repeat(50));
    await mongoose.connection.close();
    process.exit(1);
  } else {
    console.log(`   ✅ Found ${allReminders.length} reminders`);
  }

  // 4. Check today's reminders
  console.log('\n4️⃣  Checking today\'s reminders...');
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

  if (todayReminders.length === 0) {
    console.log('   ⚠️  No reminders for today');
    console.log('   💡 This might be a date issue');
    console.log(`      Today: ${today.toISOString()}`);
    console.log(`      Reminders date ranges:`);
    allReminders.forEach(r => {
      console.log(`      - ${r.medicineName}: ${new Date(r.startDate).toISOString()} to ${new Date(r.endDate).toISOString()}`);
    });
  } else {
    console.log(`   ✅ Found ${todayReminders.length} reminders for today`);
  }

  // 5. List all reminders
  console.log('\n5️⃣  Reminder details:');
  allReminders.forEach((reminder, index) => {
    const isToday = todayReminders.some(r => r._id.toString() === reminder._id.toString());
    console.log(`\n   ${index + 1}. ${reminder.medicineName} (${reminder.dosage})`);
    console.log(`      Times: ${reminder.times.join(', ')}`);
    console.log(`      Active: ${reminder.isActive}`);
    console.log(`      Dates: ${new Date(reminder.startDate).toLocaleDateString()} - ${new Date(reminder.endDate).toLocaleDateString()}`);
    console.log(`      Shows today: ${isToday ? '✅ Yes' : '❌ No'}`);
  });

  // 6. Summary
  console.log('\n' + '═'.repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   • MongoDB: ✅ Connected`);
  console.log(`   • Demo Users: ✅ Exist`);
  console.log(`   • Total Reminders: ${allReminders.length}`);
  console.log(`   • Today's Reminders: ${todayReminders.length}`);
  
  if (todayReminders.length > 0) {
    console.log('\n✅ Everything looks good!');
    console.log('\nIf reminders still don\'t show in the app:');
    console.log('   1. Make sure backend server is running (npm start)');
    console.log('   2. Check backend port (should be 5000)');
    console.log('   3. Restart the mobile app');
    console.log('   4. Login as: patient@sehat.com / Patient@123');
    console.log('   5. Pull to refresh on Home screen');
  } else {
    console.log('\n⚠️  Issue detected: No reminders for today');
    console.log('\n💡 Solution: Run "npm run create-dummy-reminders" again');
  }
  
  console.log('\n' + '═'.repeat(50) + '\n');
};

const main = async () => {
  try {
    await diagnose();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { diagnose };

