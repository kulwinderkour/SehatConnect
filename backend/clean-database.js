const mongoose = require('mongoose');
const { Appointment, User } = require('./models');
require('dotenv').config();

async function cleanDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehatconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // 1. Delete all appointments
        const deletedAppointments = await Appointment.deleteMany({});
        console.log(`🗑️  Deleted ${deletedAppointments.deletedCount} appointments`);

        // 2. Update demo patient name to "Rajinder Singh"
        const demoPatient = await User.findOne({ role: 'patient' });

        if (demoPatient) {
            demoPatient.profile.fullName = 'Rajinder Singh';
            demoPatient.profile.shortName = 'Rajinder';
            await demoPatient.save();
            console.log('✅ Updated demo patient name to "Rajinder Singh"');
            console.log('   Patient ID:', demoPatient.patientInfo?.patientId);
            console.log('   Email:', demoPatient.email);
        } else {
            console.log('⚠️  No patient found');
        }

        // 3. Update doctor name to ensure consistency
        const demoDoctor = await User.findOne({ role: 'doctor' });

        if (demoDoctor) {
            demoDoctor.profile.fullName = 'Dr. Rajesh Sharma';
            demoDoctor.profile.shortName = 'Dr. Rajesh';
            await demoDoctor.save();
            console.log('✅ Updated doctor name to "Dr. Rajesh Sharma"');
            console.log('   Doctor ID:', demoDoctor._id);
            console.log('   Email:', demoDoctor.email);
        } else {
            console.log('⚠️  No doctor found');
        }

        console.log('\n✨ Database cleaned successfully!');
        console.log('📝 You can now book new appointments with correct patient names.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        process.exit(1);
    }
}

cleanDatabase();
