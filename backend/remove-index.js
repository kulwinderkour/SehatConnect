const mongoose = require('mongoose');
require('dotenv').config();

async function removeIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehatconnect');

        const db = mongoose.connection.db;
        const collection = db.collection('appointments');

        // List existing indexes
        const indexes = await collection.indexes();
        console.log('📋 Current indexes:');
        indexes.forEach(idx => console.log('  -', idx.name));

        // Drop the problematic index
        try {
            await collection.dropIndex('doctorId_1_appointmentDate_1_slot.startTime_1');
            console.log('\n✅ Dropped problematic index: doctorId_1_appointmentDate_1_slot.startTime_1');
        } catch (err) {
            console.log('\n⚠️  Index already removed or does not exist');
        }

        console.log('\n✨ Index cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

removeIndex();
