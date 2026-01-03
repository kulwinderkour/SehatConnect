const mongoose = require('mongoose');
const { User } = require('./models');
require('dotenv').config();

async function setPatientId() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehatconnect');

        const demoPatient = await User.findOne({ role: 'patient' });

        if (demoPatient) {
            // Set patient ID if not already set
            if (!demoPatient.patientInfo) {
                demoPatient.patientInfo = {};
            }
            demoPatient.patientInfo.patientId = 'SH001234';
            await demoPatient.save();

            console.log('✅ Updated patient:');
            console.log('   Name:', demoPatient.profile.fullName);
            console.log('   Patient ID:', demoPatient.patientInfo.patientId);
            console.log('   Email:', demoPatient.email);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setPatientId();
