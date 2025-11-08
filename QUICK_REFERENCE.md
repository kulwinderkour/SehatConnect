# 🎯 SehatConnect Hackathon - Quick Reference Card

## 🔐 Demo Login Credentials

### Patient Account
```
Email: patient@sehat.com
Password: Patient@123
```

### Dr. Rajesh Sharma (Doctor)
```
Email: drrajesh@sehat.com
Password: Rajesh@123
```

## 🚀 Quick Start (3 Commands)

```bash
# Terminal 1: Backend Server
cd backend && npm start

# Terminal 2: Chatbot Backend  
cd backend-chatbot && python3 chat_api.py

# Terminal 3: Mobile App
npx react-native run-android
```

## 📱 Demo Flow (5 Minutes)

### Part 1: Patient Books Appointment (2 min)
1. ✅ Open app → Click "👤 Patient" button → Login
2. ✅ Home → "Schedule Appointment"
3. ✅ Select "Dr. Rajesh Sharma"
4. ✅ Choose Date & Time → Add Symptoms → Confirm
5. ✅ See appointment in "My Appointments"

### Part 2: Doctor Receives Appointment (1 min)
1. ✅ Logout → Click "👨‍⚕️ Dr. Rajesh" button → Login
2. ✅ Dashboard shows new appointment
3. ✅ See patient details, symptoms, scheduled time

### Part 3: Video Consultation (2 min)
1. ✅ Patient: Join appointment → Video call starts
2. ✅ Doctor: Join same appointment → Both connected
3. ✅ Test controls (mute, camera, etc.)
4. ✅ End call → Prescription/Follow-up options

## 🏥 Dr. Rajesh Sharma Profile

```
Name: Dr. Rajesh Sharma
Specialty: General Medicine
Hospital: Apollo Hospital
Experience: 12 years
Rating: 4.8 ⭐ (127 reviews)
Registration: MCI-12345-RS
Consultation: Free (Demo)
```

## 🎬 Key Features to Highlight

✅ **Dual Login System** - Patient & Doctor separate interfaces
✅ **Real-time Sync** - Appointments visible to both sides
✅ **Video Consultation** - WebRTC-based video calling
✅ **Doctor Profile** - Complete professional information
✅ **Smart Booking** - Date/Time selection with availability
✅ **Symptom Tracking** - Pre-consultation symptom entry
✅ **Prescription Management** - Post-consultation prescriptions

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Run: `./setup-demo.sh` |
| Backend not connecting | Check: `npm start` in backend folder |
| Chatbot not working | Start: `python3 chat_api.py` |
| App not loading | Run: `npx react-native run-android` |

## 📊 Demo Statistics

- **Appointment Booking Time**: < 1 minute
- **Video Call Setup**: Instant
- **Doctor Response Time**: Real-time
- **User Interface**: Intuitive, 0 learning curve

## 💡 Presentation Tips

1. **Start Clean**: Show login screen with demo buttons
2. **Patient-First**: Book appointment as patient
3. **Switch View**: Login as Dr. Rajesh to show other side
4. **Highlight Sync**: Emphasize real-time appointment sync
5. **Video Demo**: Show working video consultation
6. **End Strong**: Complete workflow with prescription

## 📞 Emergency Contacts

- Backend Logs: `backend/logs/`
- Mobile Logs: Metro Bundler console
- Database: MongoDB Compass

---

**Setup Time**: 2 minutes  
**Demo Time**: 5 minutes  
**Reset**: Run `./setup-demo.sh` again
