/**
 * Database Connection Test Script
 * Tests MongoDB connection and displays all collections
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import all models to register them
const {
  User,
  Appointment,
  Prescription,
  MedicalRecord,
  HealthMetric,
  ChatMessage,
  Pharmacy,
  Notification,
  EmergencyContact,
} = require('./models');

async function testDatabaseConnection() {
  try {
    console.log('');
    console.log('🔍 Testing MongoDB Connection...');
    console.log('📍 Connection String:', process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//<credentials>@'));
    console.log('');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Successfully connected to MongoDB!');
    console.log('');
    console.log('📊 Database Information:');
    console.log(`   Database Name: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    console.log('');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📂 Available Collections:');
    if (collections.length === 0) {
      console.log('   No collections yet (will be created when you insert data)');
    } else {
      collections.forEach((collection, index) => {
        console.log(`   ${index + 1}. ${collection.name}`);
      });
    }
    console.log('');

    // List registered models
    console.log('🏗️  Registered Mongoose Models:');
    const modelNames = mongoose.modelNames();
    modelNames.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });
    console.log('');

    // Test creating a sample user (optional)
    console.log('🧪 Testing Model Operations...');
    
    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@sehatconnect.com' });
    
    if (!existingUser) {
      console.log('   Creating test patient user...');
      const testUser = await User.create({
        role: 'patient',
        email: 'test@sehatconnect.com',
        password: 'Test@123',
        phone: '+91 98765 43210',
        profile: {
          fullName: 'Test Patient',
          shortName: 'Test',
        },
      });
      console.log(`   ✅ Test user created with ID: ${testUser._id}`);
      console.log(`   📝 Patient ID: ${testUser.patientInfo.patientId}`);
    } else {
      console.log(`   ✅ Test user already exists (ID: ${existingUser._id})`);
      console.log(`   📝 Patient ID: ${existingUser.patientInfo.patientId}`);
    }

    console.log('');
    console.log('✨ Database test completed successfully!');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Database Connection Error:');
    console.error('   Message:', error.message);
    console.error('');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Solution:');
      console.error('   1. Make sure MongoDB is installed and running');
      console.error('   2. For local MongoDB: brew services start mongodb-community');
      console.error('   3. Or use MongoDB Atlas cloud database');
      console.error('');
    } else if (error.message.includes('Authentication failed')) {
      console.error('💡 Solution:');
      console.error('   1. Check your MongoDB username and password in .env file');
      console.error('   2. Make sure the user has proper database permissions');
      console.error('');
    }
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    console.log('');
    process.exit(0);
  }
}

// Run the test
testDatabaseConnection();
