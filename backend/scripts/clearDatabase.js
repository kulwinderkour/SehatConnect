/**
 * Clear all data from database (for testing)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

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

const clearDatabase = async () => {
  try {
    console.log('\n⚠️  WARNING: This will delete ALL data from the database!\n');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Are you sure? Type "yes" to confirm: ', async (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'yes') {
        console.log('\n🗑️  Clearing database...\n');
        
        const collections = await mongoose.connection.db.collections();
        
        for (let collection of collections) {
          const count = await collection.countDocuments();
          await collection.deleteMany({});
          console.log(`✅ Cleared ${collection.collectionName}: ${count} documents`);
        }
        
        console.log('\n✅ Database cleared successfully!\n');
      } else {
        console.log('\n❌ Operation cancelled\n');
      }
      
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

const main = async () => {
  try {
    await connectDB();
    await clearDatabase();
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { clearDatabase };

