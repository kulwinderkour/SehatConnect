
const mongoose = require('mongoose');
const { Appointment, User } = require('./models');
require('dotenv').config();

async function resetDemoState() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehatconnect');
        console.log('✅ Connected to MongoDB');

        // 1. Delete all appointments
        await Appointment.deleteMany({});
        console.log('🗑️  All old appointments deleted');

        // 2. Find Patient and Doctor
        const patient = await User.findOne({ role: 'patient' });
        const doctor = await User.findOne({ role: 'doctor' });

        if (!patient || !doctor) {
            console.error('❌ Missing demo patient or doctor. Run "node create-demo-user.js" first.');
            process.exit(1);
        }

        // 3. Create a single Video Consultation for TODAY
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Set time to now + 30 mins just so it's "upcoming"
        // Actually, with hacked logic it doesn't matter, but let's be clean
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        const appointment = await Appointment.create({
            patientId: patient._id,
            doctorId: doctor._id,
            appointmentDate: today, // Schema expects Date object
            appointmentTime: timeStr,
            type: 'video-consultation',
            status: 'scheduled',
            reason: 'General Video Consultation',
            symptoms: ['Routine Checkup'],
            notes: 'Demo video call created by reset script',
            payment: {
                amount: 500,
                status: 'pending'
            }
        });

        console.log('✨ Created new video appointment for TODAY');
        console.log('   ID:', appointment._id);
        console.log('   Time:', dateStr, timeStr);
        console.log('   Patient:', patient.email);
        console.log('   Doctor:', doctor.email);
        console.log('\n🚀 READY FOR HACKATHON DEMO!');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error resetting state:', error);
        process.exit(1);
    }
}

resetDemoState();
