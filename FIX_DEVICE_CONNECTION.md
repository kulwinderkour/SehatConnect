# Fix Device Connection Issue

## Current Status
✅ **Backend is running** on port 5001  
✅ **App is built** successfully  
⚠️ **Device shows as offline** in ADB

## Quick Fix Steps

### 1. On Your Phone:
- Unplug and replug the USB cable
- When prompted, tap **"Allow USB Debugging"** again
- Make sure you check **"Always allow from this computer"**

### 2. Restart ADB Connection:
```bash
adb kill-server
adb start-server
adb devices
```

### 3. If Still Offline, Try:
```bash
# Revoke USB debugging authorizations on phone
# Settings → Developer Options → Revoke USB debugging authorizations

# Then reconnect and allow again
```

### 4. Alternative: Install APK Manually

The APK is already built at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Option A: Transfer and Install**
1. Copy APK to your phone (via USB file transfer or cloud)
2. On phone, open the APK file
3. Allow installation from unknown sources if prompted
4. Install the app

**Option B: Use ADB Once Device is Online**
```bash
adb devices  # Make sure device shows as "device" not "offline"
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.sehatconnect/.MainActivity
```

### 5. Start Metro Bundler (if not running):
```bash
npm start
```

## Current Status Summary

✅ **Backend Server**: Running on http://192.168.221.67:5001  
✅ **APK Built**: android/app/build/outputs/apk/debug/app-debug.apk  
✅ **Metro Bundler**: Starting in background  
⚠️ **Device**: Needs reconnection (currently offline)

## Once Device is Connected:

1. **Install the app** (if not already installed)
2. **Open the app** on your phone
3. **Verify backend connection** - The app should connect to http://192.168.221.67:5001/api

## Test Backend from Phone:

Open your phone's browser and go to:
```
http://192.168.221.67:5001/health
```

You should see:
```json
{"success":true,"message":"SehatConnect Backend is running!"}
```

If this works, your phone can reach the backend and the app will work too!

