# 🚀 SehatConnect - Complete Startup Guide

This guide will help you start all servers and configure the complete SehatConnect application.

## 📋 Prerequisites Checklist

Before starting, ensure you have installed:

- ✅ Node.js v20+
- ✅ Python 3.8+
- ✅ MongoDB (local or Atlas account)
- ✅ Android Studio / Xcode
- ✅ Git

## 🔐 Environment Configuration

### 1. Backend Server Environment Setup

Create `backend/.env` file with the following configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=*

# MongoDB Configuration
# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/sehatconnect

# Option B: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sehatconnect?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email Service Configuration (for OTP)
# Option A: Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Option B: Other SMTP providers
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=your-sendgrid-api-key

# SMS Service Configuration (Optional - for OTP via SMS)
# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload Configuration (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 2. Get Email Credentials (Gmail)

To enable OTP email sending:

1. **Enable 2-Step Verification** on your Google Account
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select app: Mail
   - Select device: Other (Custom name)
   - Enter "SehatConnect Backend"
   - Copy the 16-character password
   - Use this in `SMTP_PASS` (no spaces)

### 3. Get SMS Credentials (Twilio - Optional)

1. **Create Twilio Account**
   - Sign up at https://www.twilio.com/try-twilio
   - Verify your phone number

2. **Get Credentials**
   - Go to Console Dashboard
   - Copy Account SID → `TWILIO_ACCOUNT_SID`
   - Copy Auth Token → `TWILIO_AUTH_TOKEN`
   - Get a phone number → `TWILIO_PHONE_NUMBER`

### 4. Get Cloudinary Credentials (Optional - for file uploads)

1. **Create Cloudinary Account**
   - Sign up at https://cloudinary.com/users/register/free

2. **Get Credentials**
   - Go to Dashboard
   - Copy Cloud Name → `CLOUDINARY_CLOUD_NAME`
   - Copy API Key → `CLOUDINARY_API_KEY`
   - Copy API Secret → `CLOUDINARY_API_SECRET`

### 5. MongoDB Setup

#### Option A: Local MongoDB (Recommended for Development)

**macOS:**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify it's running
mongosh
# You should see MongoDB shell
```

**Windows:**
```cmd
# Download MongoDB Community Server from:
# https://www.mongodb.com/try/download/community

# After installation, start MongoDB service:
# Open Services → Find "MongoDB Server" → Start

# Or via command line:
net start MongoDB
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. **Create Free Account**: https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster**: Choose free tier (M0)
3. **Database Access**: Create user with password
4. **Network Access**: Add IP (0.0.0.0/0 for development)
5. **Get Connection String**: Click "Connect" → "Connect your application"
6. **Update .env**: Replace username, password in `MONGODB_URI`

## 🏃 Starting All Servers

### Step 1: Start MongoDB (if using local)

```bash
# macOS
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

### Step 2: Start Backend Server

```bash
# Terminal 1 - Backend API Server
cd backend
npm install          # First time only
npm start           # Production mode
# OR
npm run dev         # Development mode (auto-reload)

# You should see:
# ╔════════════════════════════════════════════════════════╗
# ║        🏥  SEHATCONNECT BACKEND SERVER STARTED  🏥     ║
# ╚════════════════════════════════════════════════════════╝
# 🚀 Server running in development mode
# 🌐 Server URL: http://localhost:5000
```

**Test Backend:**
```bash
# In a new terminal
curl http://localhost:5000/health
# Should return: {"success":true,"message":"SehatConnect Backend is running!"}
```

### Step 3: Start AI Chatbot Backend

```bash
# Terminal 2 - AI Chatbot Server
cd backend-chatbot

# First time setup (only needed once)
python3 -m venv venv
source venv/bin/activate    # macOS/Linux
# OR
venv\Scripts\activate       # Windows

pip install -r requirements.txt

# Start chatbot server
python3 chat_api.py

# You should see:
# * Running on http://0.0.0.0:5001
```

**Update Chatbot IP in App:**

1. Get your local IP:
   ```bash
   # From project root
   ./get-ip.sh
   # Note the IP address (e.g., 192.168.1.100)
   ```

2. Update `src/services/ChatbotService.ts`:
   ```typescript
   // Line 22 - Replace with your IP
   const CHATBOT_API_URL = 'http://YOUR_IP_HERE:5001';
   ```

### Step 4: Start React Native Metro Bundler

```bash
# Terminal 3 - Metro Bundler
npm install          # First time only
npm start

# You should see Metro Bundler running
```

### Step 5: Run the Mobile App

```bash
# Terminal 4 - Run the app

# For Android:
npm run android

# For iOS (macOS only):
npm run ios
```

## 🧪 Testing the Complete Setup

### 1. Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# API endpoints
curl http://localhost:5000/api
```

### 2. Test Chatbot

```bash
# Test chatbot endpoint
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I have a headache"}'
```

### 3. Test User Registration (with OTP)

```bash
# Register a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "phone": "+1234567890",
    "profile": {
      "fullName": "Test User",
      "gender": "male"
    }
  }'

# Check your email for OTP code
```

## 📱 Quick Start Commands

Use these scripts to start everything quickly:

### Create Startup Script (macOS/Linux)

Create `start-all.sh` in project root:

```bash
#!/bin/bash

echo "🚀 Starting SehatConnect Services..."

# Start MongoDB (if local)
brew services start mongodb-community

# Start Backend Server
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/backend && npm run dev"'

# Start Chatbot Server
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/backend-chatbot && source venv/bin/activate && python3 chat_api.py"'

# Start Metro Bundler
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)' && npm start"'

echo "✅ All services started!"
echo "📱 Run 'npm run android' or 'npm run ios' to start the app"
```

Make executable:
```bash
chmod +x start-all.sh
./start-all.sh
```

### Create Startup Script (Windows)

Create `start-all.bat` in project root:

```batch
@echo off
echo Starting SehatConnect Services...

:: Start MongoDB
net start MongoDB

:: Start Backend Server
start cmd /k "cd backend && npm run dev"

:: Start Chatbot Server
start cmd /k "cd backend-chatbot && venv\Scripts\activate && python chat_api.py"

:: Start Metro Bundler
start cmd /k "npm start"

echo All services started!
echo Run 'npm run android' to start the app
pause
```

Run by double-clicking `start-all.bat`

## 🛑 Stopping All Servers

### Manual Stop

- Press `Ctrl + C` in each terminal window

### Stop MongoDB

```bash
# macOS
brew services stop mongodb-community

# Windows
net stop MongoDB

# Linux
sudo systemctl stop mongod
```

## ⚠️ Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution:**
```bash
# Check if MongoDB is running
brew services list    # macOS
# OR
mongosh               # Try connecting

# Restart MongoDB
brew services restart mongodb-community
```

### Issue: Port 5000 Already in Use

**Solution:**
```bash
# Find process using port 5000
lsof -ti:5000         # macOS/Linux
netstat -ano | findstr :5000   # Windows

# Kill the process
kill -9 <PID>         # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in backend/.env
PORT=5001
```

### Issue: Email OTP Not Sending

**Solution:**
- Verify Gmail App Password is correct (no spaces)
- Check `SMTP_USER` and `SMTP_PASS` in `.env`
- Test with a simple email first
- Check Gmail security settings

### Issue: Chatbot Server Not Responding

**Solution:**
```bash
# Reinstall Python dependencies
cd backend-chatbot
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: React Native App Can't Connect to Backend

**Solution:**
1. Make sure backend is running on `http://localhost:5000`
2. For Android emulator, use `http://10.0.2.2:5000` instead
3. For physical device, use your computer's IP: `http://192.168.1.XXX:5000`
4. Update `src/services/api.ts` with correct base URL

## 📊 Service Ports Reference

| Service | Port | URL |
|---------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Chatbot API | 5001 | http://localhost:5001 |
| Metro Bundler | 8081 | http://localhost:8081 |
| MongoDB | 27017 | mongodb://localhost:27017 |

## ✅ Verification Checklist

Before running the app, verify:

- [ ] MongoDB is running
- [ ] Backend server shows "SERVER STARTED" message
- [ ] Chatbot server shows "Running on http://0.0.0.0:5001"
- [ ] Metro bundler is running
- [ ] `.env` file is configured with credentials
- [ ] Chatbot IP updated in `ChatbotService.ts`

## 🎯 Next Steps

1. **Create Demo User** (optional):
   ```bash
   cd backend
   node create-demo-user.js
   # Creates: patient@sehat.com / Patient@123
   ```

2. **Test Login in App**:
   - Open app on device/emulator
   - Try registering a new user
   - Check email for OTP
   - Verify OTP and login

3. **Test Chatbot**:
   - Navigate to Chatbot screen
   - Send a test message
   - Verify response

---

**Need Help?** Check the main `README.md` or `backend/README.md` for more detailed information.

**Happy Coding! 🚀**
