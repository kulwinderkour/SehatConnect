# SehatConnect - Offline Functionality Guide

## 🔔 Medicine Reminders - Offline Support

### ✅ What Works Offline:

1. **All Scheduled Reminders**
   - Medicine reminders are scheduled locally on your device using Android's AlarmManager
   - They will trigger even when you have:
     - ❌ No WiFi
     - ❌ No Mobile Data
     - ❌ Airplane Mode ON
     - ❌ Phone Restarted (Android will reschedule)

2. **Notification Features**
   - ✅ Sound/Ringtone
   - ✅ Vibration
   - ✅ LED lights (if your phone supports it)
   - ✅ Action buttons (Mark as Taken, Snooze)
   - ✅ Notification badge

3. **Viewing Reminders**
   - Previously loaded reminders are cached locally
   - You can view them offline in the Medicine Reminders screen

### ⚠️ What Requires Internet:

1. **Creating New Reminders**
   - Requires connection to sync with backend
   - Can be created offline but won't sync until online

2. **Syncing Adherence Data**
   - "Mark as Taken" status needs internet to update backend
   - Will be queued locally until connection is restored

3. **Loading Updated Reminders**
   - New reminders from prescriptions need internet
   - Pull-to-refresh requires connection

## 📱 How Reminders Work:

1. **When you add a reminder** (online):
   ```
   App → Backend API → Save to Database
                    ↓
   App ← Returns reminder data
        ↓
   Local Storage (cached)
        ↓
   Schedule notifications using Notifee/AlarmManager
   ```

2. **When reminder triggers** (offline):
   ```
   Android AlarmManager → Triggers at scheduled time
                       ↓
   Notifee → Shows notification with sound & vibration
          ↓
   User sees reminder (NO internet needed!)
   ```

## 🏥 Current Dummy Medicines (From Backend):

The following 8 medicine reminders are in your database and will trigger offline:

1. **Metformin** - 500mg, twice daily (1:00 AM, 7:00 PM)
2. **Ibuprofen** - 400mg, thrice daily (1:15 AM, 1:15 PM, 9:15 PM)
3. **Dolo 650** - 650mg, twice daily (1:30 AM, 1:30 PM)
4. **Azithromycin** - 500mg, once daily (2:00 AM)
5. **Cetirizine** - 10mg, once daily (2:30 AM)
6. **Amoxicillin** - 500mg, once daily (9:52 AM)
7. **Paracetamol** - 500mg, once daily (9:50 PM)
8. **Omeprazole** - 20mg, once daily (10:05 PM)

## 🔧 Technical Details:

### Notification System:
- **Library**: `@notifee/react-native`
- **Channel**: `medicine-reminders-alarm` (HIGH importance)
- **Sound**: System default (can be changed in Android Settings)
- **Persistence**: Survives app closure and phone restart

### Storage:
- **Cache**: AsyncStorage (local SQLite)
- **Keys**: 
  - `medicine_reminders_cache` - All reminders
  - `today_reminders_cache` - Today's schedule
  - `reminder_stats_cache` - Adherence statistics

### Permissions Required:
- ✅ POST_NOTIFICATIONS
- ✅ SCHEDULE_EXACT_ALARM
- ✅ USE_EXACT_ALARM
- ✅ VIBRATE

## 📲 Installing the APK:

1. **Build the APK** (already in progress):
   ```bash
   ./build-apk.sh
   ```

2. **Find the APK**:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

3. **Transfer to Phone**:
   - Email it to yourself
   - Use Google Drive / Dropbox
   - USB cable
   - ADB: `adb install -r app-release.apk`

4. **Install on Phone**:
   - Enable "Install from Unknown Sources" in Settings
   - Open the APK file
   - Grant all permissions when prompted
   - Open the app and log in

5. **Load Reminders** (requires internet first time):
   - Open the app while connected to WiFi/Data
   - Go to Medicine Reminders screen
   - Reminders will be downloaded and scheduled locally
   - **Now you can go offline!**

## 🎯 Testing Offline Mode:

1. Load the app with internet connection
2. Go to Medicine Reminders screen (loads from backend)
3. Turn OFF WiFi and Mobile Data
4. Wait for scheduled time or create a test reminder
5. Notification should still appear with sound!

## 🔊 Changing Notification Sound:

Since you're using a physical device and want a louder alarm:

1. Open **Settings** → **Apps** → **SehatConnect**
2. Tap **Notifications**
3. Find **"Medicine Reminders"** channel
4. Tap **Sound**
5. Choose an **alarm ringtone** (louder than notification sounds)
6. Enable **Vibration** if not already enabled

---

**Note**: The first time you install the APK, you MUST be online to:
- Log in with your account
- Load medicine reminders from the backend
- Schedule the notifications locally

After that, all reminders will work 100% offline! 🎉
