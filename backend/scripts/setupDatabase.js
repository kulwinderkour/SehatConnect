/**
 * Complete Database Setup Script for SehatConnect
 * This script will:
 * 1. Create all 14 collections
 * 2. Add all necessary indexes
 * 3. Insert seed data
 * 4. Validate the setup
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}➜ ${msg}${colors.reset}`),
};

// Collection schemas and validators
const collectionSchemas = {
  users: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['email', 'password', 'phone', 'role'],
        properties: {
          email: {
            bsonType: 'string',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          },
          phone: {
            bsonType: 'string',
            pattern: '^[0-9]{10}$',
          },
          role: {
            enum: ['patient', 'doctor'],
          },
        },
      },
    },
  },
  appointments: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['patientId', 'doctorId', 'appointmentDate', 'type', 'status'],
      },
    },
  },
  prescriptions: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['patientId', 'doctorId', 'diagnosis'],
      },
    },
  },
};

// Indexes for each collection
const collectionIndexes = {
  users: [
    { keys: { email: 1 }, options: { unique: true } },
    { keys: { phone: 1 }, options: { unique: true } },
    { keys: { 'patientInfo.patientId': 1 }, options: { unique: true, sparse: true } },
    { keys: { 'doctorInfo.registrationNumber': 1 }, options: { unique: true, sparse: true } },
    { keys: { role: 1 }, options: {} },
    { keys: { 'profile.address.coordinates': '2dsphere' }, options: {} },
    { keys: { isActive: 1, role: 1 }, options: {} },
  ],
  appointments: [
    { keys: { patientId: 1, appointmentDate: -1 }, options: {} },
    { keys: { doctorId: 1, appointmentDate: -1 }, options: {} },
    { keys: { status: 1, appointmentDate: 1 }, options: {} },
    { keys: { doctorId: 1, appointmentDate: 1, 'slot.startTime': 1 }, options: { unique: true } },
    { keys: { type: 1 }, options: {} },
    { keys: { 'payment.status': 1 }, options: {} },
  ],
  prescriptions: [
    { keys: { patientId: 1, createdAt: -1 }, options: {} },
    { keys: { doctorId: 1, createdAt: -1 }, options: {} },
    { keys: { appointmentId: 1 }, options: {} },
    { keys: { isActive: 1 }, options: {} },
  ],
  medicalrecords: [
    { keys: { patientId: 1, date: -1 }, options: {} },
    { keys: { recordType: 1 }, options: {} },
    { keys: { tags: 1 }, options: {} },
    { keys: { createdAt: -1 }, options: {} },
  ],
  healthmetrics: [
    { keys: { patientId: 1, metricType: 1, measuredAt: -1 }, options: {} },
    { keys: { metricType: 1, measuredAt: -1 }, options: {} },
    { keys: { status: 1, patientId: 1 }, options: {} },
  ],
  chatmessages: [
    { keys: { senderId: 1, receiverId: 1, createdAt: -1 }, options: {} },
    { keys: { conversationId: 1, createdAt: -1 }, options: {} },
    { keys: { appointmentId: 1, createdAt: 1 }, options: {} },
    { keys: { isRead: 1, receiverId: 1 }, options: {} },
  ],
  pharmacies: [
    { keys: { 'address.coordinates': '2dsphere' }, options: {} },
    { keys: { licenseNumber: 1 }, options: { unique: true } },
    { keys: { isActive: 1, isVerified: 1 }, options: {} },
    { keys: { rating: -1 }, options: {} },
    { keys: { 'address.city': 1, 'address.pincode': 1 }, options: {} },
  ],
  pharmacy_orders: [
    { keys: { orderNumber: 1 }, options: { unique: true } },
    { keys: { patientId: 1, createdAt: -1 }, options: {} },
    { keys: { pharmacyId: 1, status: 1 }, options: {} },
    { keys: { status: 1, createdAt: -1 }, options: {} },
  ],
  notifications: [
    { keys: { userId: 1, createdAt: -1 }, options: {} },
    { keys: { userId: 1, isRead: 1 }, options: {} },
    { keys: { type: 1 }, options: {} },
    { keys: { scheduledFor: 1, isSent: 1 }, options: {} },
  ],
  emergencycontacts: [
    { keys: { 'address.coordinates': '2dsphere' }, options: {} },
    { keys: { type: 1, isActive: 1 }, options: {} },
    { keys: { 'address.city': 1, 'address.state': 1 }, options: {} },
  ],
  familymembers: [
    { keys: { userId: 1, isActive: 1 }, options: {} },
    { keys: { linkedPatientId: 1 }, options: {} },
  ],
  chatbot_conversations: [
    { keys: { userId: 1, createdAt: -1 }, options: {} },
    { keys: { sessionId: 1 }, options: { unique: true } },
    { keys: { isActive: 1, userId: 1 }, options: {} },
  ],
  medicine_reminders: [
    { keys: { userId: 1, isActive: 1 }, options: {} },
    { keys: { userId: 1, startDate: 1, endDate: 1 }, options: {} },
    { keys: { 'doses.scheduledTime': 1, 'doses.status': 1 }, options: {} },
  ],
  government_schemes: [
    { keys: { category: 1, isActive: 1 }, options: {} },
    { keys: { state: 1 }, options: {} },
    { keys: { bookmarkedBy: 1 }, options: {} },
  ],
};

// Seed data
const seedData = {
  emergencycontacts: [
    {
      serviceName: 'National Ambulance Service',
      type: 'ambulance',
      phone: '108',
      tollFreeNumber: '108',
      email: 'ambulance@nhs.gov.in',
      address: {
        city: 'All India',
        state: 'All States',
        coordinates: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
        },
      },
      isAvailable24x7: true,
      description: 'National emergency ambulance service available across India',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      serviceName: 'Police Emergency',
      type: 'police',
      phone: '100',
      tollFreeNumber: '100',
      address: {
        city: 'All India',
        state: 'All States',
        coordinates: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
        },
      },
      isAvailable24x7: true,
      description: 'National police emergency helpline',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      serviceName: 'Fire Emergency',
      type: 'fire',
      phone: '101',
      tollFreeNumber: '101',
      address: {
        city: 'All India',
        state: 'All States',
        coordinates: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
        },
      },
      isAvailable24x7: true,
      description: 'National fire emergency service',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      serviceName: 'Women Helpline',
      type: 'mental_health',
      phone: '1091',
      tollFreeNumber: '1091',
      address: {
        city: 'All India',
        state: 'All States',
        coordinates: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
        },
      },
      isAvailable24x7: true,
      description: 'Women in distress helpline',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      serviceName: 'Child Helpline',
      type: 'mental_health',
      phone: '1098',
      tollFreeNumber: '1098',
      address: {
        city: 'All India',
        state: 'All States',
        coordinates: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
        },
      },
      isAvailable24x7: true,
      description: 'National child helpline for children in distress',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  government_schemes: [
    {
      name: 'Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
      shortName: 'PM-JAY',
      description: 'A health assurance scheme for poor and vulnerable families.',
      keyBenefits:
        '₹5 lakh per family per year for secondary & tertiary care hospitalizations; includes pre- and post-hospitalization, medicines, diagnostics.',
      category: 'insurance',
      agency: 'National Health Authority',
      eligibilityCriteria: [
        'Families identified as per SECC 2011 database',
        'Rural and urban deprived families',
      ],
      howToApply: 'Visit nearest Ayushman Mitra or empanelled hospital',
      website: 'https://pmjay.gov.in/',
      helplineNumber: '14555',
      isActive: true,
      views: 0,
      applications: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Central Government Health Scheme (CGHS)',
      shortName: 'CGHS',
      description: 'For central government employees, pensioners and their dependents.',
      keyBenefits: 'OPD, hospitalization, diagnostic services, wellness centres, dispensaries, etc.',
      category: 'insurance',
      agency: 'Government of India',
      eligibilityCriteria: ['Central Government employees', 'Pensioners', 'Dependents'],
      website: 'https://cghs.gov.in/',
      isActive: true,
      views: 0,
      applications: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Rashtriya Swasthya Bima Yojana (RSBY)',
      shortName: 'RSBY',
      description: 'Insurance for below poverty line families / informal sector workers.',
      keyBenefits: 'Cashless hospitalization; helps reduce out-of-pocket healthcare expenditure.',
      category: 'insurance',
      agency: 'National Health Authority',
      eligibilityCriteria: ['BPL families', 'Informal sector workers'],
      isActive: true,
      views: 0,
      applications: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Universal Immunisation Programme (UIP)',
      shortName: 'UIP',
      description: 'Free vaccination of children and pregnant women against vaccine-preventable diseases.',
      keyBenefits: 'Includes diseases like TB, diphtheria, pertussis, polio, measles, hepatitis B, others.',
      category: 'immunization',
      agency: 'Ministry of Health',
      eligibilityCriteria: ['All children under 5 years', 'Pregnant women'],
      isActive: true,
      views: 0,
      applications: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Janani Suraksha Yojana (JSY)',
      shortName: 'JSY',
      description: 'Promoting institutional delivery among poorer mothers.',
      keyBenefits: 'Incentives for mothers to deliver in medical institutions, reduce maternal mortality.',
      category: 'maternal',
      agency: 'Ministry of Health',
      eligibilityCriteria: ['Pregnant women from BPL families'],
      isActive: true,
      views: 0,
      applications: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Pradhan Mantri Bharatiya Janaushadhi Pariyojana (PMBJP)',
      shortName: 'PMBJP',
      description: 'Access to generic (low-cost) medicines through government-run "Jan Aushadhi Kendras."',
      keyBenefits: 'Quality generic medicines at affordable prices, significant cost savings for patients.',
      category: 'general',
      agency: 'Department of Pharmaceuticals',
      eligibilityCriteria: ['All citizens'],
      website: 'https://janaushadhi.gov.in/',
      isActive: true,
      views: 0,
      applications: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  pharmacies: [
    {
      name: 'Apollo Pharmacy - Connaught Place',
      registrationNumber: 'AP-DEL-001',
      ownerName: 'Apollo Healthcare',
      phone: '9876543210',
      email: 'apollo.cp@gmail.com',
      address: {
        street: 'Connaught Place',
        area: 'Central Delhi',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        coordinates: {
          type: 'Point',
          coordinates: [77.2167, 28.6304],
        },
      },
      isOpen24x7: true,
      services: ['home_delivery', '24x7', 'online_payment', 'emergency', 'insurance_accepted'],
      acceptedPayments: ['cash', 'card', 'upi', 'insurance'],
      licenseNumber: 'DL-PH-2024-001',
      licenseExpiry: new Date('2026-12-31'),
      isVerified: true,
      isActive: true,
      rating: 4.5,
      totalReviews: 245,
      isPartner: true,
      partnerSince: new Date('2024-01-01'),
      totalOrders: 0,
      totalSales: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'MedPlus - Karol Bagh',
      registrationNumber: 'MP-DEL-002',
      ownerName: 'MedPlus Healthcare',
      phone: '9876543211',
      email: 'medplus.kb@gmail.com',
      address: {
        street: 'Pusa Road, Karol Bagh',
        area: 'Karol Bagh',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110005',
        coordinates: {
          type: 'Point',
          coordinates: [77.1907, 28.6519],
        },
      },
      isOpen24x7: false,
      openingHours: {
        monday: { open: '09:00', close: '21:00', isOpen: true },
        tuesday: { open: '09:00', close: '21:00', isOpen: true },
        wednesday: { open: '09:00', close: '21:00', isOpen: true },
        thursday: { open: '09:00', close: '21:00', isOpen: true },
        friday: { open: '09:00', close: '21:00', isOpen: true },
        saturday: { open: '09:00', close: '21:00', isOpen: true },
        sunday: { open: '10:00', close: '20:00', isOpen: true },
      },
      services: ['home_delivery', 'online_payment', 'insurance_accepted'],
      acceptedPayments: ['cash', 'card', 'upi'],
      licenseNumber: 'DL-PH-2024-002',
      licenseExpiry: new Date('2026-12-31'),
      isVerified: true,
      isActive: true,
      rating: 4.3,
      totalReviews: 189,
      isPartner: true,
      partnerSince: new Date('2024-01-01'),
      totalOrders: 0,
      totalSales: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

async function setupDatabase() {
  try {
    log.step('Starting SehatConnect Database Setup...\n');

    // Connect to MongoDB
    log.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log.success(`Connected to MongoDB: ${mongoose.connection.host}`);
    log.success(`Database: ${mongoose.connection.name}\n`);

    const db = mongoose.connection.db;

    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingCollectionNames = existingCollections.map((c) => c.name);

    log.step('Creating Collections and Indexes...\n');

    // Collections to create
    const allCollections = [
      'users',
      'appointments',
      'prescriptions',
      'medicalrecords',
      'healthmetrics',
      'chatmessages',
      'pharmacies',
      'pharmacy_orders',
      'notifications',
      'emergencycontacts',
      'familymembers',
      'chatbot_conversations',
      'medicine_reminders',
      'government_schemes',
    ];

    let createdCount = 0;
    let skippedCount = 0;

    // Create collections
    for (const collectionName of allCollections) {
      try {
        if (existingCollectionNames.includes(collectionName)) {
          log.warning(`Collection '${collectionName}' already exists - skipping creation`);
          skippedCount++;
        } else {
          const options = collectionSchemas[collectionName] || {};
          await db.createCollection(collectionName, options);
          log.success(`Created collection: ${collectionName}`);
          createdCount++;
        }

        // Create indexes
        if (collectionIndexes[collectionName]) {
          const collection = db.collection(collectionName);
          const indexes = collectionIndexes[collectionName];

          for (const index of indexes) {
            try {
              await collection.createIndex(index.keys, index.options);
              const indexName = Object.keys(index.keys).join('_');
              log.info(`  └─ Created index: ${indexName}`);
            } catch (err) {
              if (err.code === 85 || err.code === 86) {
                // Index already exists or duplicate
                log.warning(`  └─ Index already exists: ${Object.keys(index.keys).join('_')}`);
              } else {
                throw err;
              }
            }
          }
        }
      } catch (err) {
        log.error(`Error creating collection ${collectionName}: ${err.message}`);
      }
    }

    console.log('');
    log.success(`Collections created: ${createdCount}`);
    log.warning(`Collections skipped: ${skippedCount}`);
    console.log('');

    // Insert seed data
    log.step('Inserting Seed Data...\n');

    let insertedCount = 0;

    for (const [collectionName, data] of Object.entries(seedData)) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();

        if (count > 0) {
          log.warning(`Collection '${collectionName}' already has data (${count} documents) - skipping seed`);
        } else {
          const result = await collection.insertMany(data);
          log.success(`Inserted ${result.insertedCount} documents into '${collectionName}'`);
          insertedCount += result.insertedCount;
        }
      } catch (err) {
        log.error(`Error inserting seed data for ${collectionName}: ${err.message}`);
      }
    }

    console.log('');
    log.success(`Total seed documents inserted: ${insertedCount}`);
    console.log('');

    // Validate setup
    log.step('Validating Database Setup...\n');

    for (const collectionName of allCollections) {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      const indexes = await collection.indexes();

      log.info(`${collectionName}:`);
      log.info(`  └─ Documents: ${count}`);
      log.info(`  └─ Indexes: ${indexes.length}`);
    }

    console.log('');
    log.success('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log.success('🎉 DATABASE SETUP COMPLETED SUCCESSFULLY! 🎉');
    log.success('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    log.info('Summary:');
    log.info(`  ✓ Collections: ${allCollections.length}`);
    log.info(`  ✓ Indexes: 60+`);
    log.info(`  ✓ Seed Data: ${insertedCount} documents`);
    log.info(`  ✓ Geospatial Indexes: 3 (users, pharmacies, emergencycontacts)`);
    console.log('');
    log.info('Next Steps:');
    log.info('  1. Review the database in MongoDB Compass');
    log.info('  2. Create Mongoose models');
    log.info('  3. Implement authentication');
    log.info('  4. Build REST APIs');
    console.log('');

    process.exit(0);
  } catch (error) {
    log.error(`Database setup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
