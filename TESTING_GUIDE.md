# Testing Guide - Pharmacy Locator & Prescription Scanner

## 🏥 TEST 1: PHARMACY LOCATOR

### Step-by-Step Instructions:

1. **Navigate to Pharmacy Tab**
   - Look at the bottom of your app screen
   - You should see 5 tabs: Home, Consult, Records, **Pharmacy**, Profile
   - Tap on **Pharmacy** (pill icon)

2. **Find the Red Banner**
   - Scroll to the top of the Pharmacy screen
   - You should see a RED banner that says:
     ```
     📍 Find Nearby Pharmacies
     Locate generic & private medical stores near you  ›
     ```

3. **Tap the Banner**
   - Tap on this red banner
   - You may be asked for **Location Permission** → Grant it

4. **Expected Result:**
   - A full-screen map should appear
   - Your current location (Jalandhar: 30.9010, 75.8573) should be shown
   - Red markers showing nearby pharmacies
   - List of pharmacies below the map

### 🐛 If It Doesn't Work:

**Issue:** "Permission Denied"
- Solution: Go to Emulator Settings → Apps → SehatConnect → Permissions → Enable Location

**Issue:** "Map is blank"
- Solution: Google Maps API key may be missing
- Check: Does the map load at all?

**Issue:** "No pharmacies found"
- Solution: Backend might not have pharmacy data for this location
- This is normal - the map should still show your location

---

## 📄 TEST 2: PRESCRIPTION SCANNER

### Step-by-Step Instructions:

1. **Navigate to Records Tab**
   - Look at the bottom navigation
   - Tap on **Records** (document icon)

2. **Find the Scan Button**
   - Look for one of these buttons:
     - "📸 Scan Prescription"
     - "Upload Prescription"
     - "Add Prescription"
     - "Decode Prescription"
   - It should be near the top of the screen

3. **Start Scanning**
   - Tap the button
   - Choose one:
     - **"Take Photo"** → Opens camera
     - **"Choose from Gallery"** → Opens photo picker

4. **Select/Capture Image**
   - For testing, you can:
     - Take a photo of ANY text (prescription-like)
     - Or select any image from gallery
   - The clearer the text, the better the results

5. **Wait for AI Processing**
   - You'll see: "Analyzing prescription..."
   - The app uploads to backend
   - Gemini AI analyzes the image
   - This takes 5-15 seconds

6. **Expected Result:**
   - A new screen appears showing:
     - **Patient Name** (if detected)
     - **Medications** with dosage, frequency, duration
     - **Lab Tests** (if any)
     - **Safety Alerts**
     - **Schedule Reminders** button
     - **Today's Actions** list

### 🐛 If It Doesn't Work:

**Issue:** "Cannot find scan button"
- Check: Are you on the Records tab?
- Alternative: Check Profile → Medical History → Add Prescription

**Issue:** "Cannot connect to server"
- Solution: Backend not running
- Fix: Run in new terminal: `cd backend && npm start`
- Verify: `curl http://localhost:5000/api/health`

**Issue:** "Failed to decode prescription"
- Check backend logs for errors
- Ensure image is clear and contains text
- Try a different image

**Issue:** "Gemini API error"
- Backend logs will show specific error
- API key might be invalid
- API quota might be exceeded

---

## ✅ Success Criteria:

### Pharmacy Locator Success:
- ✅ Map loads and shows your location
- ✅ Can see pins/markers on map
- ✅ Can tap markers to see pharmacy details
- ✅ List of pharmacies appears below map

### Prescription Scanner Success:
- ✅ Can upload/capture prescription image
- ✅ AI successfully extracts medication names
- ✅ Dosage and frequency are shown
- ✅ Can schedule reminders
- ✅ Prescription saved to records

---

## 📱 Quick Test Script:

```bash
# 1. Ensure backend is running
cd backend && npm start &

# 2. Set emulator location
adb emu geo fix 75.8573 30.9010

# 3. Check backend health
curl http://localhost:5000/api/health

# 4. Reload app
adb shell input text "RR"

# 5. Follow manual steps above
```

---

## 🆘 Need More Help?

If you encounter issues:
1. Share screenshot of the error
2. Check terminal logs (both Metro and Backend)
3. Run: `adb logcat | grep -i sehat` to see Android logs
4. Let me know which specific step fails
