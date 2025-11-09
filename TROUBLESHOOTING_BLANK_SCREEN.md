# Troubleshooting: Blank/White Screen After Installing Maps

## Issue
After installing `react-native-maps` and `@react-native-community/geolocation`, the app shows a blank white screen.

## Why This Happens
React Native Maps requires native code compilation. Simply installing via npm is not enough - you must rebuild the native apps.

---

## ✅ Solution for Android

### 1. Clean Build
```bash
cd android
./gradlew clean
cd ..
```

### 2. Rebuild the App
```bash
npx react-native run-android
```

### 3. If Still Blank, Add Google Maps API Key

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <!-- Add this INSIDE the <application> tag -->
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="AIzaSyC...your-key-here"/>
    
  <!-- Rest of your application -->
</application>
```

**Note**: The app should work with demo data even without the API key. If it's still blank, the issue is the native rebuild.

---

## ✅ Solution for iOS

### 1. Install Pods
```bash
cd ios
pod install
cd ..
```

**If you get Ruby/CocoaPods errors:**
```bash
# Update Ruby gems
sudo gem update --system
sudo gem install cocoapods

# Try again
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### 2. Add Google Maps to AppDelegate

Edit `ios/SehatConnect/AppDelegate.mm`:

```objc
#import "AppDelegate.h"
#import <GoogleMaps/GoogleMaps.h>  // ADD THIS LINE
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // ADD THIS LINE (with your API key)
  [GMSServices provideAPIKey:@"AIzaSyC...your-key-here"];
  
  self.moduleName = @"SehatConnect";
  // ... rest of code
}
@end
```

### 3. Rebuild the App
```bash
npx react-native run-ios
```

---

## 🔍 Debugging Steps

### Check Metro Bundler
Make sure Metro bundler is running:
```bash
npx react-native start --reset-cache
```

### Check React Native Logs

**Android:**
```bash
npx react-native log-android
```

**iOS:**
```bash
npx react-native log-ios
```

Look for errors related to:
- `react-native-maps`
- `AirGoogleMaps`
- `Geolocation`
- Permissions

### Common Errors

**Error: "Invariant Violation: requireNativeComponent: AIRMap was not found"**
- **Solution**: Rebuild the native app completely
- Android: `cd android && ./gradlew clean && cd .. && npx react-native run-android`
- iOS: `cd ios && pod install && cd .. && npx react-native run-ios`

**Error: "Google Maps SDK API Key is missing"**
- **Solution**: Add API key to AndroidManifest.xml or AppDelegate.mm
- **Or**: App should still work with demo data - check for other errors

**Error: "Location permission denied"**
- **Solution**: Grant location permission when prompted
- App will fall back to default location (Jalandhar)

---

## 🎯 Quick Fix Checklist

1. ✅ Stop the Metro bundler (`Ctrl+C` in terminal)
2. ✅ Clean Android build: `cd android && ./gradlew clean && cd ..`
3. ✅ Clear Metro cache: `npx react-native start --reset-cache` (in new terminal)
4. ✅ Rebuild Android: `npx react-native run-android`
5. ✅ Check logs for errors: `npx react-native log-android`

For iOS:
1. ✅ Run `cd ios && pod install && cd ..`
2. ✅ Rebuild: `npx react-native run-ios`

---

## 🚨 If Still Not Working

### Test with Old Modal First

Temporarily revert to the old modal to verify the issue:

Edit `src/screens/PharmacyScreen.tsx`:

```typescript
// Comment out the new import
// import NearbyPharmaciesMapModal from '../components/pharmacy/NearbyPharmaciesMapModal';

// Use the old import
import NearbyPharmaciesModal from '../components/pharmacy/NearbyPharmaciesModal';

// Use old modal
<NearbyPharmaciesModal
  visible={showNearbyPharmaciesModal}
  onClose={() => setShowNearbyPharmaciesModal(false)}
/>
```

Reload the app (`r` in Metro bundler or shake device → Reload).

**If old modal works**: The issue is with the new map component - need to configure Google Maps
**If old modal also blank**: The issue is elsewhere in the app - check for JavaScript errors

---

## 📱 Testing the Map Feature

Once rebuilt successfully:

1. Open app → Go to "Medical Store" tab
2. Tap "Find Nearby Pharmacies" (red banner)
3. Grant location permission
4. Should see map with demo pharmacies
5. Markers should appear (green/blue pins)

**Without Google API Key**: You'll see demo pharmacies in Jalandhar
**With Google API Key**: You'll see real nearby pharmacies from Google Places

---

## 💡 Pro Tips

### Development Mode
For faster development, use the demo data:
- No API key needed
- Faster testing
- No API costs

### Production Mode
Configure Google Maps API key:
- Real pharmacy locations
- Actual ratings and hours
- Better user experience

### Verify Installation
Check if maps is installed:
```bash
npm list react-native-maps
npm list @react-native-community/geolocation
```

Should show:
```
react-native-maps@1.x.x
@react-native-community/geolocation@3.x.x
```

---

## 📚 More Help

- Full Setup Guide: `PHARMACY_MAP_SETUP.md`
- Quick Start: `PHARMACY_MAP_QUICKSTART.md`
- Implementation Details: `PHARMACY_MAP_IMPLEMENTATION.md`

---

## Still Having Issues?

1. Check Metro bundler for red screen errors
2. Check device/emulator logs
3. Verify all native dependencies are linked
4. Try on a physical device (emulators can have issues)
5. Make sure you're running the latest build (not old cached version)

**Most Common Fix**: Just rebuild the native app after installing new packages! 🎯
