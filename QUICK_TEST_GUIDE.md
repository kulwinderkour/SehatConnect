# Quick Start Guide - Testing the New Authentication

## 🎯 Demo Login Credentials

### Patient Login
```
Email: patient@sehat.com
Password: Patient@123
```

### Doctor Login
```
Email: drrajesh@sehat.com
Password: Rajesh@123
```

## 🚀 Starting the Backend

```bash
# From project root
cd backend
node server.js
```

Server runs on: **http://localhost:5001**

## 📱 Testing in the App

### 1. Login as Patient
1. Open the app
2. Click "👤 Patient" demo button (auto-fills credentials)
3. Click "Sign In"
4. You should see the patient dashboard

### 2. Book an Appointment
1. Navigate to "Book Appointment"
2. Select a date and time
3. Enter reason and symptoms
4. Submit
5. Appointment is automatically assigned to Dr. Rajesh Sharma

### 3. Login as Doctor
1. Logout from patient account
2. Click "👨‍⚕️ Dr. Rajesh" demo button (auto-fills credentials)
3. Click "Sign In"
4. You should see the doctor dashboard
5. The appointment booked by the patient should appear in the appointments list

## 🧪 Testing with cURL

### Login as Patient
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@sehat.com",
    "password": "Patient@123"
  }'
```

### Login as Doctor
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "drrajesh@sehat.com",
    "password": "Rajesh@123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Book Appointment (as Patient)
```bash
curl -X POST http://localhost:5001/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -d '{
    "appointmentDate": "2025-11-09T10:00:00.000Z",
    "appointmentTime": "10:00 AM",
    "type": "video",
    "reason": "Regular checkup",
    "symptoms": ["Headache"]
  }'
```

### Get Appointments (as Doctor)
```bash
curl -X GET http://localhost:5001/api/appointments \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

## ✅ What to Expect

### Patient Login Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "patient@sehat.com",
      "role": "patient",
      "profile": {
        "fullName": "Demo Patient",
        "shortName": "Demo"
      },
      "patientInfo": {
        "patientId": "SH100001"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Doctor Login Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "drrajesh@sehat.com",
      "role": "doctor",
      "profile": {
        "fullName": "Dr. Rajesh Sharma",
        "shortName": "Dr. Rajesh"
      },
      "doctorInfo": {
        "specialty": "General Physician",
        "hospital": "City Hospital",
        "consultationFee": 500
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 🐛 Troubleshooting

### Issue: "Invalid credentials"
- Double-check email and password (case-sensitive)
- Make sure you ran `node scripts/initDemoUsers.js`

### Issue: "User not found"
- Run: `cd backend && node scripts/initDemoUsers.js`

### Issue: "Server not responding"
- Check if server is running: `lsof -i :5001`
- Start server: `cd backend && node server.js`

### Issue: "MongoDB connection error"
- Make sure MongoDB is running: `mongod` or start MongoDB service
- Check `.env` file has correct MONGODB_URI

## 🔍 Checking Data in MongoDB

```bash
# Connect to MongoDB
mongosh

# Use the database
use sehatconnect

# Check users
db.users.find().pretty()

# Check appointments
db.appointments.find().pretty()
```

## 📊 Expected Behavior

1. ✅ Only 2 users exist in the system
2. ✅ Patient can book appointments
3. ✅ All appointments go to Dr. Rajesh Sharma automatically
4. ✅ Doctor can see all patient appointments
5. ✅ No registration option available
6. ✅ No password reset available
7. ✅ Clean, simple login flow

## 🎯 Demo Flow for Presentation

1. **Show Login Screen**
   - Demonstrate demo buttons
   - Quick login as patient

2. **Book Appointment**
   - Navigate to booking
   - Fill details
   - Submit successfully

3. **Switch to Doctor**
   - Logout
   - Login as Dr. Rajesh

4. **Show Doctor Dashboard**
   - See patient's appointment
   - Show appointment details
   - Demonstrate patient info is visible

This demonstrates the complete patient-to-doctor workflow!
