const mongoose = require('mongoose');

/**
 * MongoDB Database Connection Configuration
 * Handles connection to MongoDB Atlas or Local MongoDB
 */

const connectDB = async () => {
  try {
    const options = {
      // Use new URL parser
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Server selection timeout
      serverSelectionTimeoutMS: 5000,
      
      // Socket timeout
      socketTimeoutMS: 45000,
      
      // Auto index
      autoIndex: true,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔴 Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 Mongoose connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('🔍 Check your MONGODB_URI in .env file');
    console.error('💡 For local MongoDB: mongodb://localhost:27017/sehatconnect');
    console.error('💡 For MongoDB Atlas: Check your username, password, and cluster URL');
    process.exit(1);
  }
};

module.exports = connectDB;
