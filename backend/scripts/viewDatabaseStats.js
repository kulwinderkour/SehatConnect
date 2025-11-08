/**
 * Database Stats Viewer
 * Quick script to view database statistics
 */

require('dotenv').config();
const mongoose = require('mongoose');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

async function viewStats() {
  try {
    console.log(`${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║   SEHATCONNECT DATABASE STATISTICS             ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;

    // Get database stats
    const dbStats = await db.stats();

    console.log(`${colors.bright}Database: ${dbStats.db}${colors.reset}`);
    console.log(`${colors.green}✓ Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB${colors.reset}`);
    console.log(`${colors.green}✓ Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB${colors.reset}`);
    console.log(`${colors.green}✓ Collections: ${dbStats.collections}${colors.reset}\n`);

    // Get collections
    const collections = await db.listCollections().toArray();

    console.log(`${colors.bright}Collections Details:${colors.reset}\n`);

    let totalDocs = 0;
    let totalIndexes = 0;

    for (const collInfo of collections) {
      const collection = db.collection(collInfo.name);
      const count = await collection.countDocuments();
      const indexes = await collection.indexes();

      totalDocs += count;
      totalIndexes += indexes.length;

      const docStr = count > 0 ? `${colors.green}${count}${colors.reset}` : `${colors.yellow}0${colors.reset}`;
      const indexStr = `${colors.blue}${indexes.length}${colors.reset}`;

      console.log(`  ${collInfo.name.padEnd(25)} │ Docs: ${docStr.padEnd(15)} │ Indexes: ${indexStr}`);
    }

    console.log(`\n${colors.cyan}─────────────────────────────────────────────────${colors.reset}`);
    console.log(`${colors.bright}Total Documents: ${totalDocs}${colors.reset}`);
    console.log(`${colors.bright}Total Indexes: ${totalIndexes}${colors.reset}`);
    console.log(`${colors.cyan}─────────────────────────────────────────────────${colors.reset}\n`);

    // Check geospatial indexes
    console.log(`${colors.bright}Geospatial Indexes:${colors.reset}\n`);

    const geoCollections = ['users', 'pharmacies', 'emergencycontacts'];
    for (const collName of geoCollections) {
      const collection = db.collection(collName);
      const indexes = await collection.indexes();
      const geoIndex = indexes.find((idx) => {
        return Object.values(idx.key).includes('2dsphere');
      });
      if (geoIndex) {
        console.log(`  ${colors.green}✓${colors.reset} ${collName}: ${Object.keys(geoIndex.key)[0]}`);
      }
    }

    console.log(`\n${colors.green}✓ Database is ready for use!${colors.reset}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

viewStats();
