/**
 * Initialize Demo Users
 * Creates two users: Demo Patient and Dr. Rajesh Sharma
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const demoUsers = [
  {
    email: 'patient@sehat.com',
    password: 'Patient@123',
    phone: '+91-9876543210',
    role: 'patient',
    profile: {
      fullName: 'Demo Patient',
      shortName: 'Demo',
      profileImage: '',
      dateOfBirth: '1990-01-15',
      gender: 'male',
      bloodGroup: 'O+',
      address: {
        street: '123 Health Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
    },
    patientInfo: {
      patientId: 'SH100001',
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+91-9876543211',
        relation: 'Family',
      },
      allergies: ['Penicillin'],
      chronicDiseases: [],
    },
    isActive: true,
    isVerified: true,
  },
  {
    email: 'drrajesh@sehat.com',
    password: 'Rajesh@123',
    phone: '+91-9876543212',
    role: 'doctor',
    profile: {
      fullName: 'Dr. Rajesh Sharma',
      shortName: 'Dr. Rajesh',
      profileImage: '',
      dateOfBirth: '1980-05-20',
      gender: 'male',
      address: {
        street: '456 Medical Complex',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110002',
      },
    },
    doctorInfo: {
      specialty: 'General Physician',
      qualifications: ['MBBS', 'MD'],
      registrationNumber: 'MCI-12345',
      hospital: 'City Hospital',
      experience: 15,
      consultationFee: 500,
      rating: 4.8,
      totalReviews: 150,
    },
    isActive: true,
    isVerified: true,
  },
];

const initializeUsers = async () => {
  try {
    await connectDB();

    console.log('\n🚀 Starting demo user initialization...\n');

    // Clear existing users
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing users`);
      console.log('🗑️  Deleting all existing users...');
      await User.deleteMany({});
      console.log('✅ Existing users deleted\n');
    }

    // Create demo users
    console.log('👥 Creating demo users...\n');

    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created ${user.role}: ${user.email}`);
      console.log(`   - Name: ${user.profile.fullName}`);
      console.log(`   - Password: ${userData.password}`);
      console.log(`   - Role: ${user.role}`);
      if (user.role === 'patient') {
        console.log(`   - Patient ID: ${user.patientInfo.patientId}`);
      } else if (user.role === 'doctor') {
        console.log(`   - Specialty: ${user.doctorInfo.specialty}`);
        console.log(`   - Hospital: ${user.doctorInfo.hospital}`);
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 DEMO USERS INITIALIZED SUCCESSFULLY! 🎉');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Login Credentials:\n');
    console.log('1️⃣  DEMO PATIENT');
    console.log('   Email: patient@sehat.com');
    console.log('   Password: Patient@123\n');
    console.log('2️⃣  DR. RAJESH SHARMA');
    console.log('   Email: drrajesh@sehat.com');
    console.log('   Password: Rajesh@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing demo users:', error);
    process.exit(1);
  }
};

initializeUsers();
