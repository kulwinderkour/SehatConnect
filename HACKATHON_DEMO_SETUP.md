# 🎯 Hackathon Demo Setup - Dr. Rajesh Sharma Profile

## Overview
This document describes the demo setup for the SehatConnect hackathon demonstration, featuring **Dr. Rajesh Sharma** as the primary doctor profile.

## 🔐 Demo Credentials

### Patient Account
- **Email:** `patient@sehat.com`
- **Password:** `Patient@123`
- **Role:** Patient

### Doctor Account (Dr. Rajesh Sharma)
- **Email:** `drrajesh@sehat.com`
- **Password:** `Rajesh@123`
- **Role:** Doctor
- **Specialty:** General Medicine
- **Hospital:** Apollo Hospital
- **Experience:** 12 years
- **Registration Number:** MCI-12345-RS
- **Rating:** 4.8/5.0 (127 reviews)

## 📋 Setup Instructions

### 1. Create Demo Users in Database

Run the demo user creation script to set up both accounts:

```bash
cd backend
node create-demo-user.js
```

This will:
- Delete any existing demo users
- Create a patient account
- Create Dr. Rajesh Sharma's doctor account with complete profile
- Display credentials in the console

### 2. Start Backend Services

```bash
# Terminal 1: Start Node.js Backend
cd backend
npm start

# Terminal 2: Start Python Chatbot Backend
cd backend-chatbot
python3 chat_api.py
```

### 3. Start Mobile App

```bash
# For Android
npx react-native run-android

# For iOS
npx react-native run-ios
```

## 🎬 Demo Flow

### Complete Appointment Booking and Video Consultation Flow

1. **Patient Login**
   - Open the app
   - Click "👤 Patient" demo button on login screen
   - Credentials auto-fill → Click "Sign In"

2. **Book Appointment with Dr. Rajesh**
   - Navigate to Home screen
   - Click "Schedule Appointment" or find "Dr. Rajesh Sharma" in doctor list
   - **Doctor Details:**
     - Name: Dr. Rajesh Sharma
     - Specialty: General Medicine
     - Hospital: Apollo Hospital
     - Rating: 4.8 ⭐ (127 reviews)
     - Consultation Fee: Free
   
3. **Select Appointment Details**
   - Choose Date (e.g., Tomorrow)
   - Select Time Slot (e.g., 2:00 PM)
   - Appointment Type: Video Consultation
   - Add Symptoms (optional): Fever, Headache, etc.
   - Add Notes: Brief description of the problem
   - Confirm booking

4. **Patient View - Appointment Confirmation**
   - Appointment appears in "My Appointments" section
   - Status: "Confirmed" or "Scheduled"
   - Shows doctor name, date, time, and type
   - Option to "Join" video call when time comes

5. **Doctor Login (Dr. Rajesh Sharma)**
   - Logout from patient account
   - Click "👨‍⚕️ Dr. Rajesh" demo button on login screen
   - Credentials auto-fill → Click "Sign In"

6. **Doctor Dashboard**
   - Dashboard shows Dr. Rajesh Sharma's profile
   - **Today's Statistics:**
     - Total appointments
     - Completed consultations
     - Pending appointments
   - **Upcoming Appointments:**
     - Shows the appointment booked by the patient
     - Patient name, time, appointment type
     - Symptoms and notes visible

7. **Video Consultation (Both Sides)**
   
   **Patient Side:**
   - Go to Appointments section
   - Click "Join" on the scheduled appointment
   - Enters video call screen with Dr. Rajesh Sharma

   **Doctor Side:**
   - Go to Appointments Management
   - Click "Start" or "Join Call" for the patient's appointment
   - Enters video call screen with patient details

8. **During Video Call**
   - Both patient and doctor see each other's video feed
   - Controls available:
     - Mute/Unmute microphone
     - Turn camera on/off
     - End call
   - Doctor can see patient symptoms and notes
   - Call duration timer visible

9. **Post-Consultation**
   - Doctor can add prescription
   - Mark appointment as "Completed"
   - Schedule follow-up if needed
   - Patient receives consultation summary

## 🏥 Dr. Rajesh Sharma Profile Details

### Professional Information
- **Full Name:** Dr. Rajesh Sharma
- **Specialty:** General Medicine
- **Qualifications:** MBBS, MD General Medicine
- **Registration Number:** MCI-12345-RS
- **Hospital/Clinic:** Apollo Hospital
- **Experience:** 12 years
- **Consultation Fee:** Free (for demo)

### Ratings & Reviews
- **Overall Rating:** 4.8 out of 5.0
- **Total Reviews:** 127
- **Consultation Count:** 10,121+

### Availability
- **Working Days:** Monday to Saturday
- **Working Hours:** 9:00 AM - 6:00 PM
- **Available Slots:** Every 30 minutes
- **Online Status:** Available Now

### Expertise Areas
- Heart Health
- Diabetes Care
- General Health Checkups
- Chronic Disease Management

### Languages Spoken
- English
- Hindi

## 🔄 Key Features to Demonstrate

### 1. Appointment Booking
✅ Browse available doctors
✅ Select Dr. Rajesh Sharma
✅ Choose date and time slot
✅ Add symptoms and notes
✅ Confirm booking

### 2. Dual-Side View
✅ Patient sees appointment in their list
✅ Doctor sees same appointment in their dashboard
✅ Real-time status updates

### 3. Video Consultation
✅ Seamless video call integration
✅ Doctor can view patient history
✅ Prescription can be added during/after call

### 4. Doctor Profile
✅ Complete doctor information visible
✅ Ratings and reviews
✅ Availability calendar
✅ Specialization details

## 🐛 Troubleshooting

### Issue: Demo users not created
**Solution:**
```bash
cd backend
node create-demo-user.js
```

### Issue: Cannot login as Dr. Rajesh
**Check:**
1. Backend server is running
2. MongoDB is connected
3. Credentials are correct: `drrajesh@sehat.com` / `Rajesh@123`

### Issue: Appointments not syncing
**Check:**
1. Both backend servers are running
2. Mobile app is connected to correct backend URL
3. Check network connectivity

### Issue: Video call not working
**Note:** Video calling uses WebRTC and may require:
- Camera and microphone permissions
- Network connectivity
- Both parties to be online simultaneously

## 📝 Quick Reference

### Login Shortcuts
In the login screen, click these demo buttons for auto-fill:
- **👤 Patient** → Auto-fills patient credentials
- **👨‍⚕️ Dr. Rajesh** → Auto-fills Dr. Rajesh Sharma credentials

### Testing Scenarios

#### Scenario 1: Basic Appointment
1. Login as Patient
2. Book appointment with Dr. Rajesh
3. Logout
4. Login as Dr. Rajesh
5. See the appointment in dashboard

#### Scenario 2: Video Consultation
1. Login as Patient
2. Join scheduled appointment (video call)
3. Switch to Dr. Rajesh (separate device/simulator)
4. Join the same call
5. Test audio/video controls
6. End call

#### Scenario 3: Complete Workflow
1. Patient books appointment
2. Dr. Rajesh accepts and starts consultation
3. Video call conducted
4. Prescription added by doctor
5. Appointment marked complete
6. Follow-up scheduled if needed

## 🎓 Presentation Tips

1. **Start Clean:** Show the login screen with demo buttons
2. **Patient Journey:** Walk through patient booking process
3. **Doctor View:** Switch to Dr. Rajesh to show the other side
4. **Highlight Features:** Show appointment sync, video call, profile details
5. **End-to-End:** Demonstrate complete consultation cycle

## 📞 Support

For issues during the hackathon:
1. Check backend logs: `backend/logs`
2. Check mobile app logs in Metro bundler
3. Verify all services are running
4. Restart services if needed

---

**Last Updated:** November 8, 2025
**Version:** 1.0
**Purpose:** SIH 2024 Hackathon Demonstration
