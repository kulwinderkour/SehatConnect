# Medicine Reminders Setup Guide

## Problem: No reminders showing in the app

Follow these steps in order:

## Step 1: Ensure Backend is Running

```bash
cd backend
npm start
# or
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

## Step 2: Initialize Demo Users (if not done)

```bash
cd backend
node scripts/initDemoUsers.js
```

Expected output:
```
✅ Created patient: patient@sehat.com
✅ Created doctor: drrajesh@sehat.com
```

## Step 3: Create Dummy Reminders

```bash
cd backend
npm run create-dummy-reminders
```

Expected output:
```
✅ Created reminder for Paracetamol
✅ Created reminder for Dolo 650
✅ Created reminder for Azithromycin
...
🎉 Successfully created 8 medicine reminders!
```

## Step 4: Verify Reminders Were Created

```bash
cd backend
npm run check-reminders
```

Expected output:
```
👤 Patient: patient@sehat.com
📋 Total reminders: 8
📅 Today's reminders: 8

1. Paracetamol (500mg)
   Times: 01:00, 13:00, 21:00
   Active: true
   Is Today: true
...
```

## Step 5: Check App

1. **Restart the app** (if running)
2. **Login as patient**: patient@sehat.com / Patient@123
3. **Navigate to Home screen** - you should see reminders
4. **Pull to refresh** if needed

## Troubleshooting

### Backend not running
```bash
cd backend
npm start
```

### MongoDB not connected
Check your `.env` file or use default:
```
MONGODB_URI=mongodb://localhost:27017/sehatconnect
```

### Wrong user logged in
- Logout and login again with: patient@sehat.com / Patient@123

### Port conflict
Backend uses port 5000. Make sure it's not in use.

### Check backend logs
When you refresh the app, you should see in backend console:
```
📋 Fetching today's reminders for user: patient@sehat.com
   Found 8 reminders
```

### Check app logs (Metro console)
Look for:
```
📋 Reminders API Response: { todayCount: 8, ... }
```

### No reminders in database
Run the create script again:
```bash
cd backend
npm run create-dummy-reminders
```

## Quick Test via Terminal

Test the API directly:
```bash
curl http://localhost:5000/api/reminders/today
```

Should return JSON with reminders.

## Complete Reset

If nothing works, reset everything:

```bash
cd backend

# 1. Clear database
node scripts/clearDatabase.js

# 2. Initialize users
node scripts/initDemoUsers.js

# 3. Create reminders
npm run create-dummy-reminders

# 4. Verify
npm run check-reminders

# 5. Restart backend
npm start
```

Then restart the app and login again.

