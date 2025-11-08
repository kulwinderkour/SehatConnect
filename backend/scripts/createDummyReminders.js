/**
 * Script to create dummy medicine reminders
 * Creates reminders for Paracetamol, Dolo, and other common medicines
 * with time slots like 1am-2am, etc.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MedicineReminder = require('../models/MedicineReminder');
const User = require('../models/User');

// Connect to database
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

// Dummy medicines with time slots
const dummyMedicines = [
  {
    medicineName: 'Paracetamol',
    dosage: '500mg',
    frequency: 'thrice_daily',
    times: ['01:00', '13:00', '21:00'], // 1am, 1pm, 9pm
    beforeMeal: false,
    afterMeal: true,
    instructions: 'Take after meals to avoid stomach upset',
  },
  {
    medicineName: 'Dolo 650',
    dosage: '650mg',
    frequency: 'twice_daily',
    times: ['01:30', '13:30'], // 1:30am, 1:30pm
    beforeMeal: false,
    afterMeal: true,
    instructions: 'Take with plenty of water',
  },
  {
    medicineName: 'Azithromycin',
    dosage: '500mg',
    frequency: 'once_daily',
    times: ['02:00'], // 2am
    beforeMeal: true,
    afterMeal: false,
    instructions: 'Take on empty stomach, 1 hour before food',
  },
  {
    medicineName: 'Amoxicillin',
    dosage: '500mg',
    frequency: 'thrice_daily',
    times: ['01:00', '09:00', '17:00'], // 1am, 9am, 5pm
    beforeMeal: false,
    afterMeal: true,
    instructions: 'Complete the full course as prescribed',
  },
  {
    medicineName: 'Cetirizine',
    dosage: '10mg',
    frequency: 'once_daily',
    times: ['02:30'], // 2:30am
    beforeMeal: false,
    afterMeal: false,
    instructions: 'May cause drowsiness, take at night',
  },
  {
    medicineName: 'Omeprazole',
    dosage: '20mg',
    frequency: 'once_daily',
    times: ['01:00'], // 1am
    beforeMeal: true,
    afterMeal: false,
    instructions: 'Take 30 minutes before breakfast',
  },
  {
    medicineName: 'Metformin',
    dosage: '500mg',
    frequency: 'twice_daily',
    times: ['01:00', '19:00'], // 1am, 7pm
    beforeMeal: false,
    afterMeal: true,
    instructions: 'Take with meals to reduce side effects',
  },
  {
    medicineName: 'Ibuprofen',
    dosage: '400mg',
    frequency: 'thrice_daily',
    times: ['01:15', '13:15', '21:15'], // 1:15am, 1:15pm, 9:15pm
    beforeMeal: false,
    afterMeal: true,
    instructions: 'Take with food to prevent stomach irritation',
  },
];

const createDummyReminders = async () => {
  try {
    // Find the demo patient user (patient@sehat.com) - this matches the demo user middleware
    let patient = await User.findOne({ email: 'patient@sehat.com' });
    
    // Fallback to any patient
    if (!patient) {
      patient = await User.findOne({ role: 'patient' });
    }
    
    if (!patient) {
      console.log('⚠️  No patient found. Please run the initDemoUsers script first.');
      console.log('   Run: npm run setup-db or node scripts/initDemoUsers.js');
      return [];
    }

    console.log(`\n📋 Creating reminders for patient: ${patient.email} (${patient._id})\n`);

    // Calculate dates - start from today, end 7 days from now
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(today); // Start today
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7); // 7 days from today
    endDate.setHours(23, 59, 59, 999);

    // Delete existing reminders for this user to avoid duplicates
    const deletedCount = await MedicineReminder.deleteMany({ userId: patient._id });
    if (deletedCount.deletedCount > 0) {
      console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing reminders\n`);
    }

    const createdReminders = [];

    for (const medicine of dummyMedicines) {
      // Check if reminder already exists
      const existing = await MedicineReminder.findOne({
        userId: patient._id,
        medicineName: medicine.medicineName,
        isActive: true,
      });

      if (existing) {
        console.log(`⏭️  Skipping ${medicine.medicineName} - already exists`);
        continue;
      }

      // Calculate total doses
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const timesPerDay = medicine.times.length;
      const totalDoses = daysDiff * timesPerDay;

      const reminder = await MedicineReminder.create({
        userId: patient._id,
        medicineName: medicine.medicineName,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        times: medicine.times,
        startDate,
        endDate,
        beforeMeal: medicine.beforeMeal,
        afterMeal: medicine.afterMeal,
        instructions: medicine.instructions,
        enableNotification: true,
        notificationSound: 'default',
        isActive: true,
        totalDoses,
        takenDoses: 0,
        missedDoses: 0,
        adherenceRate: 0,
      });

      createdReminders.push(reminder);
      console.log(`✅ Created reminder for ${medicine.medicineName}`);
      console.log(`   Times: ${medicine.times.join(', ')}`);
      console.log(`   Total doses: ${totalDoses}\n`);
    }

    console.log(`\n🎉 Successfully created ${createdReminders.length} medicine reminders!`);
    console.log(`\n📊 Summary:`);
    console.log(`   Patient: ${patient.email}`);
    console.log(`   Reminders: ${createdReminders.length}`);
    console.log(`   Start Date: ${startDate.toLocaleDateString()}`);
    console.log(`   End Date: ${endDate.toLocaleDateString()}`);

    return createdReminders;
  } catch (error) {
    console.error('❌ Error creating dummy reminders:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await createDummyReminders();
    await mongoose.connection.close();
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createDummyReminders };

