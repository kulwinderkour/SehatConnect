/**
 * Create Demo User Script
 * Run: node create-demo-user.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sehatconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  profile: {
    fullName: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createDemoUsers() {
  try {
    console.log('🔄 Creating demo users...');

    // Hash passwords
    const patientPassword = await bcrypt.hash('Patient@123', 12);
    const drRajeshPassword = await bcrypt.hash('Rajesh@123', 12);

    // Delete existing demo users if they exist
    await User.deleteMany({ email: { $in: ['patient@sehat.com', 'drrajesh@sehat.com', 'doctor@sehat.com'] } });

    // Create Patient
    const patient = await User.create({
      email: 'patient@sehat.com',
      password: patientPassword,
      phone: '9876543210',
      role: 'patient',
      profile: {
        fullName: 'Demo Patient',
        shortName: 'Demo',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
      },
      isVerified: true,
      isActive: true,
    });

    console.log('✅ Patient created:', patient.email);

    // Create Dr. Rajesh Sharma (for Hackathon Demo)
    const drRajesh = await User.create({
      email: 'drrajesh@sehat.com',
      password: drRajeshPassword,
      phone: '9876543299',
      role: 'doctor',
      profile: {
        fullName: 'Dr. Rajesh Sharma',
        shortName: 'Dr. Rajesh',
        dateOfBirth: new Date('1982-05-15'),
        gender: 'male',
      },
      doctorInfo: {
        specialty: 'General Medicine',
        qualifications: ['MBBS', 'MD General Medicine'],
        registrationNumber: 'MCI-12345-RS',
        hospital: 'Apollo Hospital',
        experience: 12,
        consultationFee: 0,
        rating: 4.8,
        totalReviews: 127,
        availableSlots: [
          { day: 'monday', startTime: '09:00', endTime: '18:00' },
          { day: 'tuesday', startTime: '09:00', endTime: '18:00' },
          { day: 'wednesday', startTime: '09:00', endTime: '18:00' },
          { day: 'thursday', startTime: '09:00', endTime: '18:00' },
          { day: 'friday', startTime: '09:00', endTime: '18:00' },
          { day: 'saturday', startTime: '09:00', endTime: '18:00' },
        ],
      },
      isVerified: true,
      isActive: true,
    });

    console.log('✅ Dr. Rajesh Sharma created:', drRajesh.email);

    console.log('\n🎉 Demo users created successfully!');
    console.log('\n📝 Login Credentials for Hackathon Demo:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Patient: patient@sehat.com / Patient@123');
    console.log('Doctor (Dr. Rajesh Sharma): drrajesh@sehat.com / Rajesh@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    process.exit(1);
  }
}

createDemoUsers();
