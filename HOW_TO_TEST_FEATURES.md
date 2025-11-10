# How to Test Pharmacy Locator & Prescription Scanner

## ✅ Both Features Are Configured and Ready!

### Backend Status:
- ✅ Server is running on port 5000
- ✅ Gemini API Key is configured
- ✅ Prescription decoder endpoint is ready

---

## 1. Testing Pharmacy Locator

### Setup Location on Android Emulator:

#### Option A: Using Emulator Extended Controls
1. Click the **3 dots (⋯)** on the emulator toolbar
2. Select **Location**
3. Enter coordinates:
   - Latitude: `30.9010` (Jalandhar)
   - Longitude: `75.8573`
4. Click **Send**

#### Option B: Using adb command
```bash
adb emu geo fix 75.8573 30.9010
```

### Test Steps:
1. Open the app
2. Go to **Pharmacy** tab (bottom navigation)
3. Tap the red **"Find Nearby Pharmacies"** button
4. **Grant location permission** when prompted
5. Map should appear showing your location and nearby pharmacies

### If it doesn't work:
- Check if location permission was granted
- Try setting location again on emulator
- Check terminal/logcat for errors

---

## 2. Testing Prescription Scanner/Decoder

### Test Steps:
1. Open the app
2. Go to **Records** tab (bottom navigation)
3. Find and tap **"Scan Prescription"** or **"Upload Prescription"** button
4. Choose to:
   - **Take Photo**: Camera will open to take a new prescription photo
   - **Choose from Gallery**: Select an existing prescription image
5. After selecting image, the app will:
   - Upload to backend
   - Call Gemini Vision API
   - Decode medications, dosages, timings
   - Show decoded results
6. You can then:
   - Review medications
   - Schedule reminders
   - Save to your records

### Sample Prescription Images to Test:
You can use any prescription image that contains:
- Medicine names
- Dosage (e.g., "1 tablet")
- Frequency (e.g., "BD", "TDS", "twice daily")
- Duration (e.g., "5 days", "2 weeks")

### Expected Results:
- **Medications** decoded with name, dosage, timing
- **Tests** (if any) extracted
- **Reminders** can be scheduled
- **Safety alerts** if drug interactions detected

### If it doesn't work:
1. Check backend logs:
   ```bash
   cd backend
   npm start
   # Watch for errors in terminal
   ```

2. Verify API key:
   ```bash
   cd backend
   cat .env | grep GEMINI_API_KEY
   # Should show: GEMINI_API_KEY=AIzaSy...
   ```

3. Test backend directly:
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"status":"ok"}
   ```

4. Check app logs in terminal for network errors

---

## Common Issues:

### Pharmacy Locator:
❌ **"Location permission denied"**
- Go to emulator Settings → Apps → SehatConnect → Permissions
- Enable Location permission

❌ **"No pharmacies found"**
- Make sure location is set on emulator
- Try a different location (urban area)

### Prescription Scanner:
❌ **"Cannot connect to server"**
- Backend not running → Run: `cd backend && npm start`

❌ **"Prescription decoder service error"**
- Gemini API key issue → Check backend/.env

❌ **"Failed to decode"**
- Image too blurry/dark
- Try a clearer prescription image

---

## Quick Test Commands:

```bash
# Check backend status
curl http://localhost:5000/api/health

# Set emulator location
adb emu geo fix 75.8573 30.9010

# View backend logs
cd backend && npm start

# Reload app on emulator
adb shell input text "RR"
```

---

## Need Help?

If both features still don't work:
1. Check Metro bundler terminal for errors
2. Check backend terminal for errors  
3. Check Android logcat: `adb logcat | grep -i sehat`
4. Take a screenshot of the error and share it
