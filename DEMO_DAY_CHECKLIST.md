# ✅ Hackathon Demo Day Checklist

## 📋 Pre-Demo Setup (15 minutes before)

### System Check
- [ ] MongoDB is running
  ```bash
  brew services start mongodb-community
  mongosh --eval "db.adminCommand('ping')"
  ```

- [ ] Demo users are created
  ```bash
  ./setup-demo.sh
  ```

- [ ] Backend server is running (Terminal 1)
  ```bash
  cd backend
  npm start
  # Should show: "✅ Server is running on port 5000"
  ```

- [ ] Chatbot backend is running (Terminal 2)
  ```bash
  cd backend-chatbot
  python3 chat_api.py
  # Should show: "Running on http://127.0.0.1:8000"
  ```

- [ ] Mobile app is launched (Terminal 3)
  ```bash
  npx react-native run-android
  # Should show Metro bundler running
  ```

### App Verification
- [ ] App opens to login screen
- [ ] "Hackathon Demo Credentials" section visible
- [ ] Demo buttons (👤 Patient, 👨‍⚕️ Dr. Rajesh) working
- [ ] Can login as patient successfully
- [ ] Can logout and login as Dr. Rajesh

### Network Check
- [ ] Backend URL configured correctly in app
- [ ] API calls working (test login)
- [ ] Video call permissions granted (camera, microphone)

## 🎬 During Demo

### Step 1: Introduction (30 seconds)
- [ ] Show login screen
- [ ] Explain dual login system (Patient & Doctor)
- [ ] Mention "Dr. Rajesh Sharma" profile for demo

### Step 2: Patient Journey (2 minutes)
- [ ] Click "👤 Patient" demo button
- [ ] Show credentials auto-fill
- [ ] Login successfully
- [ ] Navigate to Home screen
- [ ] Click "Schedule Appointment"
- [ ] Select Dr. Rajesh Sharma from list
- [ ] Show doctor profile details
  - [ ] Name, specialty, hospital visible
  - [ ] Rating and reviews shown
  - [ ] Experience and qualifications listed
- [ ] Choose appointment date (tomorrow)
- [ ] Select time slot (2:00 PM)
- [ ] Choose "Video Consultation"
- [ ] Add symptoms (Fever, Headache)
- [ ] Add notes (brief description)
- [ ] Confirm booking
- [ ] Show confirmation message
- [ ] Navigate to "My Appointments"
- [ ] Show appointment in list with "Confirmed" status

### Step 3: Doctor View (1.5 minutes)
- [ ] Logout from patient account
- [ ] Click "👨‍⚕️ Dr. Rajesh" demo button
- [ ] Login as Dr. Rajesh Sharma
- [ ] Show doctor dashboard
  - [ ] Welcome message with doctor's name
  - [ ] Today's statistics visible
  - [ ] Pending appointments count
- [ ] Navigate to Appointments section
- [ ] Show the newly booked appointment
  - [ ] Patient name visible
  - [ ] Date and time correct
  - [ ] Symptoms and notes accessible
  - [ ] "Start" or "Join" button available

### Step 4: Video Consultation Demo (1.5 minutes)
**Note:** This may need two devices or simulators

- [ ] Patient side: Join appointment
- [ ] Doctor side: Join same appointment
- [ ] Both sides show video call screen
- [ ] Test controls:
  - [ ] Mute/Unmute microphone
  - [ ] Camera on/off
  - [ ] End call button
- [ ] Show call duration timer
- [ ] End call from doctor side

### Step 5: Post-Consultation (30 seconds)
- [ ] Doctor can mark appointment complete
- [ ] Option to add prescription visible
- [ ] Follow-up scheduling available
- [ ] Patient receives consultation summary

## 🎯 Key Points to Emphasize

### Technical Features
- [ ] **Real-time Synchronization**: Appointment visible to both patient & doctor instantly
- [ ] **WebRTC Integration**: Working video consultation system
- [ ] **Role-based Access**: Different dashboards for patient & doctor
- [ ] **Complete Workflow**: End-to-end appointment management

### User Experience
- [ ] **Easy Login**: Demo buttons for quick access
- [ ] **Intuitive UI**: Simple, clean interface
- [ ] **Fast Booking**: Appointment in under 1 minute
- [ ] **Professional Profile**: Complete doctor information

### Scalability
- [ ] **Multiple Doctors**: System supports many doctors (show list)
- [ ] **Appointment Management**: Scheduling system with time slots
- [ ] **History Tracking**: Past appointments visible
- [ ] **Prescription System**: Digital prescription management

## 🚨 Emergency Backup Plans

### If Video Call Doesn't Work
- [ ] Show the video call UI
- [ ] Explain the WebRTC implementation
- [ ] Show the appointment flow instead
- [ ] Demonstrate other features (chatbot, pharmacy, etc.)

### If Backend is Down
- [ ] Restart backend: `cd backend && npm start`
- [ ] Check MongoDB: `brew services restart mongodb-community`
- [ ] Use offline mode (show UI/UX only)

### If App Crashes
- [ ] Have screenshot/video backup ready
- [ ] Reload app: Shake device → Reload
- [ ] Restart Metro: `npx react-native start --reset-cache`

## 📱 Alternative Demo Flows

### Quick Demo (2 minutes)
1. Login as patient → Book appointment → Show in list
2. Login as doctor → Show appointment → Done

### Full Demo (5 minutes)
1. Patient books appointment with all details
2. Doctor views appointment
3. Both join video call
4. Complete consultation with prescription

### Feature-focused Demo
1. Show multiple doctors list
2. Demonstrate chatbot feature
3. Show pharmacy integration
4. Highlight government schemes
5. Emergency SOS feature

## ✅ Post-Demo

### Data Cleanup
- [ ] Appointments can stay for next demo
- [ ] Or run `./setup-demo.sh` to reset

### Audience Q&A Prep
- [ ] How many doctors supported? (Unlimited)
- [ ] Video quality? (Adjustable, depends on network)
- [ ] Security? (JWT authentication, encrypted data)
- [ ] Scalability? (MongoDB + Node.js + React Native)

## 📊 Demo Success Metrics

- [ ] Login demonstrated: Both patient & doctor
- [ ] Appointment booked successfully
- [ ] Real-time sync shown
- [ ] Doctor profile displayed
- [ ] Video call UI demonstrated
- [ ] No crashes or major errors
- [ ] Audience engaged and interested

## 🎓 Backup Materials

- [ ] HACKATHON_DEMO_SETUP.md ready to share
- [ ] QUICK_REFERENCE.md printed/available
- [ ] Screenshots of key screens
- [ ] Video recording of working demo
- [ ] Architecture diagram ready

---

**Total Demo Time**: 5-6 minutes  
**Setup Time**: 15 minutes  
**Confidence Level**: 🚀🚀🚀

**Good Luck! 🍀**
