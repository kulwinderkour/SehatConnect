# 🏥 SehatConnect Backend - Setup Guide

## 📋 Prerequisites

Before running the backend, make sure you have:

1. **Node.js v20+** installed
2. **MongoDB** installed (local) OR **MongoDB Atlas** account (cloud)
3. **npm** or **yarn** package manager

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure MongoDB

Choose one of these options:

#### **Option A: Local MongoDB (Recommended for Development)**

1. **Install MongoDB:**
   ```bash
   # macOS
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB service
   brew services start mongodb-community
   ```

2. **Verify MongoDB is running:**
   ```bash
   mongosh
   # You should see MongoDB shell
   ```

3. **The `.env` file is already configured for local MongoDB**

#### **Option B: MongoDB Atlas (Cloud Database)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Get your connection string
4. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sehatconnect?retryWrites=true&w=majority
   ```

### Step 3: Test Database Connection

```bash
npm run test-db
# or
node test-connection.js
```

You should see:
```
✅ Successfully connected to MongoDB!
📊 Database Information...
```

### Step 4: Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║        🏥  SEHATCONNECT BACKEND SERVER STARTED  🏥     ║
╚════════════════════════════════════════════════════════╝

🚀 Server running in development mode
🌐 Server URL: http://localhost:5000
💚 Health Check: http://localhost:5000/health
📡 API Endpoint: http://localhost:5000/api
```

### Step 5: Test the Server

Open browser or use curl:
```bash
# Health check
curl http://localhost:5000/health

# API info
curl http://localhost:5000/api
```

---

## 📦 Database Schema

The following collections are created:

- ✅ **users** - Patients and Doctors (unified)
- ✅ **appointments** - Appointment bookings
- ✅ **prescriptions** - Medical prescriptions
- ✅ **medicalrecords** - Patient medical documents
- ✅ **healthmetrics** - Health tracking data (BP, sugar, etc.)
- ✅ **chatmessages** - Doctor-patient chat
- ✅ **pharmacies** - Nearby pharmacy data
- ✅ **notifications** - App notifications
- ✅ **emergencycontacts** - Emergency services

---

## 🔧 NPM Scripts

```bash
npm start          # Start server (production)
npm run dev        # Start server with nodemon (development)
npm run test-db    # Test database connection
```

---

## 🌍 Environment Variables

Key variables in `.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sehatconnect
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

## ✅ What's Completed (CHUNK 1)

- [x] Backend folder structure
- [x] package.json with all dependencies
- [x] MongoDB connection configuration
- [x] 9 Mongoose models created:
  - User (with patient/doctor roles)
  - Appointment
  - Prescription
  - MedicalRecord
  - HealthMetric
  - ChatMessage
  - Pharmacy
  - Notification
  - EmergencyContact
- [x] Server.js with Express setup
- [x] Database test script
- [x] Environment configuration

---

## 📝 Next Steps (CHUNK 2)

In the next chunk, we'll create:

1. **Authentication routes** (login, signup, logout)
2. **JWT middleware** for protected routes
3. **Auth controller** with bcrypt password hashing
4. **Token generation & refresh** mechanism
5. **Connect frontend** to real backend

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
brew services list

# Start MongoDB
brew services start mongodb-community

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Testing

Once the server is running, you can:

1. Visit http://localhost:5000/health
2. Visit http://localhost:5000/api
3. Check MongoDB Compass to see the database

---

**Ready to proceed to CHUNK 2 (Authentication)? 🚀**
