# Backend Setup Guide for SehatConnect

## 🏗️ Backend Architecture Options

### Option 1: Node.js + Express (Recommended)
```
backend/
├── src/
│   ├── controllers/
│   │   ├── doctorController.js
│   │   ├── videoConsultController.js
│   │   └── appointmentController.js
│   ├── services/
│   │   ├── doctorService.js
│   │   ├── videoConsultService.js
│   │   └── webrtcService.js
│   ├── models/
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   └── VideoSession.js
│   ├── routes/
│   │   ├── doctors.js
│   │   ├── video-consultation.js
│   │   └── appointments.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   └── config/
│       ├── database.js
│       └── webrtc.js
├── package.json
└── server.js
```

### Option 2: Python + FastAPI
```
backend/
├── app/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   └── middleware/
├── requirements.txt
└── main.py
```

### Option 3: Java + Spring Boot
```
backend/
├── src/main/java/com/sehatconnect/
│   ├── controller/
│   ├── service/
│   ├── model/
│   └── repository/
├── pom.xml
└── Application.java
```

## 📋 Required API Endpoints

### Doctor Management
- `GET /api/doctors` - Get all doctors with filters
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/search` - Search doctors
- `GET /api/doctors/:id/availability` - Get doctor availability
- `GET /api/doctors/:id/reviews` - Get doctor reviews
- `GET /api/doctors/specialties` - Get all specialties
- `GET /api/doctors/nearby` - Get nearby doctors

### Video Consultation
- `POST /api/video-consultation/initiate` - Start video consultation
- `GET /api/video-consultation/:id/token` - Get WebRTC token
- `POST /api/video-consultation/:id/join` - Join video call
- `POST /api/video-consultation/:id/end` - End consultation
- `GET /api/video-consultation/history/:patientId` - Get consultation history
- `POST /api/video-consultation/:id/feedback` - Send feedback

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

## 🗄️ Database Schema

### Doctors Table
```sql
CREATE TABLE doctors (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  experience INT NOT NULL,
  consultation_fee DECIMAL(10,2) NOT NULL,
  languages JSON,
  hospital VARCHAR(255),
  qualifications JSON,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Video Sessions Table
```sql
CREATE TABLE video_sessions (
  id VARCHAR(36) PRIMARY KEY,
  doctor_id VARCHAR(36) NOT NULL,
  patient_id VARCHAR(36) NOT NULL,
  status ENUM('initiated', 'connecting', 'connected', 'ended', 'failed'),
  room_id VARCHAR(255) NOT NULL,
  token TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);
```

## 🔧 WebRTC Integration

### Required Services
1. **Signaling Server** - Handle call setup
2. **TURN/STUN Server** - Handle NAT traversal
3. **Media Server** - Optional, for recording

### Popular WebRTC Solutions
- **Agora.io** - Complete video calling platform
- **Twilio Video** - WebRTC as a service
- **Daily.co** - Video calling API
- **Jitsi Meet** - Open source solution

## 🚀 Quick Start with Node.js

### 1. Initialize Backend Project
```bash
mkdir sehatconnect-backend
cd sehatconnect-backend
npm init -y
```

### 2. Install Dependencies
```bash
npm install express cors helmet morgan dotenv
npm install mysql2 sequelize
npm install socket.io
npm install jsonwebtoken bcryptjs
npm install multer
npm install --save-dev nodemon
```

### 3. Basic Server Setup
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/video-consultation', require('./routes/video-consultation'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 🔐 Authentication

### JWT Token Structure
```javascript
{
  "userId": "patient_123",
  "userType": "patient", // or "doctor"
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Middleware Example
```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

## 📱 Frontend Integration

### Update API Service
```javascript
// In your React Native app
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api' // Android emulator
  : 'https://your-production-api.com/api';
```

### Environment Variables
Create `.env` file in your React Native project:
```
API_BASE_URL=http://localhost:3000/api
JWT_SECRET=your-secret-key
```

## 🧪 Testing

### API Testing with Postman
1. Import the API collection
2. Set up environment variables
3. Test all endpoints

### Unit Testing
```bash
npm install --save-dev jest supertest
```

## 🚀 Deployment

### Options
1. **Heroku** - Easy deployment
2. **AWS EC2** - Full control
3. **DigitalOcean** - Cost-effective
4. **Railway** - Modern platform

### Environment Variables for Production
```
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-production-secret
```

## 📊 Monitoring

### Recommended Tools
- **Winston** - Logging
- **Morgan** - HTTP request logging
- **New Relic** - Application monitoring
- **Sentry** - Error tracking

This guide provides a complete roadmap for setting up your backend. Choose the technology stack that best fits your team's expertise and project requirements!
