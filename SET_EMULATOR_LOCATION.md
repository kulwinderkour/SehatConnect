# Setting Android Emulator GPS Location to India

## Issue
Android emulator defaults to Mountain View, California, USA location. To test the pharmacy map feature with Indian locations, you need to set the emulator's GPS coordinates.

---

## ✅ Solution 1: Using Android Studio (Recommended)

### Method A: Extended Controls
1. **Open Android Emulator**
2. Click the **three dots (...)** on the emulator's right side panel
3. Go to **Location**
4. In the location settings:
   - **Latitude**: `31.3260` (Jalandhar)
   - **Longitude**: `75.5762`
   - Click **"Send"**

### Popular Indian City Coordinates

| City | Latitude | Longitude |
|------|----------|-----------|
| Jalandhar, Punjab | 31.3260 | 75.5762 |
| Delhi | 28.7041 | 77.1025 |
| Mumbai | 19.0760 | 72.8777 |
| Bangalore | 12.9716 | 77.5946 |
| Chennai | 13.0827 | 80.2707 |
| Kolkata | 22.5726 | 88.3639 |
| Hyderabad | 17.3850 | 78.4867 |
| Pune | 18.5204 | 73.8567 |

---

## ✅ Solution 2: Using ADB Command

### Set Location via Command Line

```bash
# Set to Jalandhar, Punjab
adb emu geo fix 75.5762 31.3260

# Set to Delhi
adb emu geo fix 77.1025 28.7041

# Set to Mumbai
adb emu geo fix 72.8777 19.0760

# Set to your custom location
adb emu geo fix <LONGITUDE> <LATITUDE>
```

**Note**: The order is `longitude latitude` (reversed!)

---

## ✅ Solution 3: Using Emulator Console

### Telnet to Emulator

```bash
# Find emulator port (usually 5554)
adb devices

# Connect to emulator
telnet localhost 5554

# Set location (longitude latitude)
geo fix 75.5762 31.3260

# Exit telnet
quit
```

---

## 🔍 App Fallback Behavior

The app has been updated with smart location detection:

### Auto-Detection
- ✅ Detects if emulator is using USA default location
- ✅ Automatically switches to Jalandhar, India
- ✅ Shows notification when using default location

### Location Validation
- Checks if coordinates are within India bounds
  - Latitude: 8° to 37° N
  - Longitude: 68° to 97° E
- Falls back to Jalandhar if outside India

---

## 🎯 Quick Test Steps

1. **Set Emulator Location** (choose one method above)
2. **Open SehatConnect App**
3. **Go to Medical Store tab**
4. **Tap "Find Nearby Pharmacies"**
5. **Grant location permission**
6. **Map should now show your selected Indian location**

---

## 🗺️ Map Controls Added

The map now has full zoom and pan controls:

### Available Gestures
- ✅ **Pinch to zoom** - Zoom in/out
- ✅ **Double tap** - Zoom in
- ✅ **Two-finger tap** - Zoom out
- ✅ **Drag** - Pan around the map
- ✅ **Two-finger rotate** - Rotate map
- ✅ **Two-finger drag up/down** - Tilt/pitch

### Controls
- ✅ **Zoom buttons** - + and - buttons on map
- ✅ **My Location button** - Center on your location
- ✅ **Compass** - Shows map orientation
- ✅ **Scale bar** - Shows distance scale

---

## 📱 Testing on Physical Device

For best results, test on a **physical Android device**:
- Real GPS coordinates
- Actual nearby pharmacies
- Better performance
- More accurate location

---

## 💡 Pro Tips

### Simulating Movement
```bash
# Simulate route (multiple locations)
adb emu geo fix 75.5762 31.3260    # Start
sleep 5
adb emu geo fix 75.5800 31.3280    # Move slightly
sleep 5
adb emu geo fix 75.5850 31.3300    # Move more
```

### Quick City Switcher Script
Create `set-location.sh`:
```bash
#!/bin/bash
case $1 in
  jalandhar) adb emu geo fix 75.5762 31.3260 ;;
  delhi) adb emu geo fix 77.1025 28.7041 ;;
  mumbai) adb emu geo fix 72.8777 19.0760 ;;
  *) echo "Usage: ./set-location.sh [jalandhar|delhi|mumbai]" ;;
esac
```

Usage: `./set-location.sh jalandhar`

---

## 🐛 Troubleshooting

### Map still shows USA?
1. Close and reopen the app
2. Tap "My Location" button on map
3. Try setting location via Android Studio Extended Controls

### "Location permission denied"?
1. Go to Android Settings → Apps → SehatConnect → Permissions
2. Enable Location → "Allow only while using the app"
3. Restart the app

### Map shows but no pharmacies?
1. Check internet connection
2. Verify Google Maps API key is configured
3. Check console logs for API errors
4. Google Places API might have usage limits

---

## 📚 More Resources

- [Android Emulator Documentation](https://developer.android.com/studio/run/emulator)
- [Google Maps Platform](https://developers.google.com/maps)
- App Setup Guide: `PHARMACY_MAP_SETUP.md`
- Troubleshooting: `TROUBLESHOOTING_BLANK_SCREEN.md`

---

**Current App Behavior**: 
- ✅ Auto-detects emulator default location
- ✅ Switches to Jalandhar, India automatically
- ✅ Full map zoom and pan controls enabled
- ✅ Shows real nearby pharmacies from Google Places API
