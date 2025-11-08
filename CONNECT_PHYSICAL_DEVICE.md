# Connect Physical Android Device to Laptop

## Step 1: Enable USB Debugging on Your Phone

1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times to enable Developer Options
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Enable **Install via USB** (if available)

## Step 2: Connect Your Phone via USB

1. Connect your phone to laptop using USB cable
2. On your phone, when prompted, tap **"Allow USB Debugging"** and check **"Always allow from this computer"**

## Step 3: Verify ADB Connection

Run this command in terminal:
```bash
adb devices
```

You should see your device listed, for example:
```
List of devices attached
ABC123XYZ456    device
```

If you see "unauthorized", check your phone and allow USB debugging.

## Step 4: Get Your Laptop's IP Address

Your laptop's IP is: **192.168.221.67** (already configured in ApiService.ts)

If you need to find it again:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or use the script
./get-ip.sh
```

## Step 5: Connect Phone and Laptop to Same WiFi

**IMPORTANT:** Both your phone and laptop must be on the **same WiFi network** for the app to connect to the backend.

## Step 6: Update API URL (if needed)

The API URL is already set to: `http://192.168.221.67:5001/api`

If your IP changes, update `src/services/ApiService.ts` line 12.

## Step 7: Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on port 5001.

## Step 8: Run React Native App on Physical Device

```bash
# Make sure you're in the project root
npx react-native run-android
```

This will:
- Build the app
- Install it on your connected device
- Start Metro bundler
- Launch the app

## Troubleshooting

### Device not showing in `adb devices`
- Try different USB cable
- Try different USB port
- Restart ADB: `adb kill-server && adb start-server`
- Check if USB drivers are installed (Windows)

### App can't connect to backend
- Make sure backend is running: `http://192.168.221.67:5001/health`
- Check phone and laptop are on same WiFi
- Verify IP address is correct in `ApiService.ts`
- Check firewall isn't blocking port 5001

### "Network request failed" error
- Test backend from phone's browser: `http://192.168.221.67:5001/health`
- If it works in browser but not in app, check API URL in code
- Try restarting Metro bundler: `npm start -- --reset-cache`

### Port already in use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

## Quick Commands

```bash
# Check connected devices
adb devices

# Get laptop IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Start backend
cd backend && npm run dev

# Run app on device
npx react-native run-android

# Restart Metro bundler
npm start -- --reset-cache
```

