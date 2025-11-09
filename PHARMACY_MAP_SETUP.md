# Google Maps Integration Setup Guide for Nearby Pharmacies

This guide will help you set up Google Maps with real pharmacy locations for the SehatConnect app.

## Overview

The "Find Nearby Pharmacies" feature now uses:
- **Google Maps** for displaying pharmacy locations on an interactive map
- **Google Places API** for finding real nearby pharmacies
- **Real-time Geolocation** to get user's current location
- **Turn-by-turn directions** to navigate to pharmacies

---

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A credit card (required for GCP, but free tier is generous)
3. SehatConnect React Native project

---

## Step 1: Get Google Maps API Key

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Name it: `SehatConnect` or similar
5. Click "CREATE"

### 1.2 Enable Required APIs

Enable these APIs for your project:

1. **Maps SDK for Android**
   - Go to: https://console.cloud.google.com/apis/library/maps-android-backend.googleapis.com
   - Click "ENABLE"

2. **Maps SDK for iOS**
   - Go to: https://console.cloud.google.com/apis/library/maps-ios-backend.googleapis.com
   - Click "ENABLE"

3. **Places API**
   - Go to: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
   - Click "ENABLE"

4. **Geocoding API** (optional, for address lookup)
   - Go to: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
   - Click "ENABLE"

### 1.3 Create API Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "CREATE CREDENTIALS" → "API key"
3. Your API key will be created
4. **IMPORTANT**: Click "RESTRICT KEY" to secure it

### 1.4 Restrict API Key (Security Best Practice)

1. Click on your newly created API key
2. Under "Application restrictions":
   - For **Android**: Select "Android apps"
     - Add package name: `com.sehatconnect`
     - Add SHA-1 certificate fingerprint (see below)
   - For **iOS**: Select "iOS apps"
     - Add bundle identifier: `org.reactjs.native.example.SehatConnect`

3. Under "API restrictions":
   - Select "Restrict key"
   - Check these APIs:
     - Maps SDK for Android
     - Maps SDK for iOS
     - Places API
     - Geocoding API

4. Click "SAVE"

---

## Step 2: Get SHA-1 Certificate Fingerprint (Android)

For debug builds:

```bash
cd android
./gradlew signingReport
```

Look for the `SHA1` fingerprint under `Variant: debug` and copy it.

For release builds, you'll need your release keystore's SHA-1.

---

## Step 3: Configure Android

### 3.1 Add API Key to Android Manifest

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <!-- Add this inside the <application> tag -->
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE"/>
    
  <!-- Rest of your application config -->
</application>
```

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key.

### 3.2 Update build.gradle

Make sure `android/app/build.gradle` includes:

```gradle
dependencies {
    // ... other dependencies
    implementation 'com.google.android.gms:play-services-maps:18.1.0'
    implementation 'com.google.android.gms:play-services-location:21.0.1'
}
```

---

## Step 4: Configure iOS

### 4.1 Add API Key to AppDelegate

Edit `ios/SehatConnect/AppDelegate.mm`:

```objc
#import "AppDelegate.h"
#import <GoogleMaps/GoogleMaps.h>  // Add this import
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Add this line BEFORE creating RCTRootView
  [GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY_HERE"];
  
  self.moduleName = @"SehatConnect";
  // ... rest of your code
}

@end
```

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key.

### 4.2 Install CocoaPods

```bash
cd ios
pod install
cd ..
```

### 4.3 Update Info.plist

Add location permissions to `ios/SehatConnect/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>SehatConnect needs your location to find nearby pharmacies and medical stores.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>SehatConnect needs your location to find nearby pharmacies and medical stores.</string>
```

---

## Step 5: Update API Key in Code

Edit the file: `src/components/pharmacy/NearbyPharmaciesMapModal.tsx`

Find these two lines:

```typescript
// Line ~162
const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';

// Line ~366
const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
```

Replace both instances with your actual Google Maps API key:

```typescript
const apiKey = 'AIzaSyC...your-actual-key-here';
```

---

## Step 6: Link Native Dependencies

### For iOS:

```bash
cd ios
pod install
cd ..
```

### For Android:

The Gradle should handle this automatically on next build.

---

## Step 7: Build and Run

### iOS:

```bash
npx react-native run-ios
```

### Android:

```bash
npx react-native run-android
```

---

## Testing the Feature

1. Open the app and navigate to the **Medical Store** tab
2. Tap on the **"Find Nearby Pharmacies"** button (red banner)
3. Grant location permissions when prompted
4. You should see:
   - A Google Maps view centered on your current location (or Jalandhar as default)
   - Red and blue markers showing nearby pharmacies
   - Tap a marker to see pharmacy details
   - Use the list icon (top right) to see all pharmacies in a list
   - Tap "Directions" to get turn-by-turn navigation

---

## Features Available

### ✅ Interactive Google Maps
- Real-time map with pharmacy markers
- Green markers = Generic medicine stores (Jan Aushadhi)
- Blue markers = Private pharmacies
- User location displayed with blue dot

### ✅ Real Pharmacy Data
- Automatically fetches nearby pharmacies using Google Places API
- Shows real pharmacy names, addresses, ratings
- Displays opening hours and open/closed status

### ✅ Navigation & Actions
- Get directions: Opens in Google Maps or Apple Maps
- Call pharmacy: Taps phone icon to call
- View details: Tap marker for more information

### ✅ List View
- Toggle between map and list view
- Sorted by distance (nearest first)
- Shows distance in kilometers
- Tap to zoom to pharmacy on map

---

## Troubleshooting

### Map not showing / Blank screen

**Problem**: Google Maps API key not configured properly

**Solution**:
1. Verify API key is correct in both code files and AndroidManifest.xml/AppDelegate
2. Check that Maps SDK for Android/iOS is enabled in Google Cloud Console
3. For Android: Verify SHA-1 fingerprint is added correctly
4. Rebuild the app completely:
   ```bash
   # iOS
   cd ios && pod install && cd ..
   npx react-native run-ios
   
   # Android
   cd android && ./gradlew clean && cd ..
   npx react-native run-android
   ```

### No pharmacies showing / "Demo data" message

**Problem**: Google Places API not configured or key restricted

**Solution**:
1. Verify Places API is enabled in Google Cloud Console
2. Check API key restrictions - should allow Places API
3. Update the API key in `NearbyPharmaciesMapModal.tsx` (line ~162 and ~366)

### Location permission denied

**Problem**: User denied location access or permissions not configured

**Solution**:
1. Check `AndroidManifest.xml` has location permissions:
   ```xml
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   ```
2. Check `Info.plist` has location usage descriptions (iOS)
3. Ask user to enable location in device settings
4. The app will fall back to Jalandhar as default location if denied

### Markers not displaying

**Problem**: API key restrictions or Places API quota exceeded

**Solution**:
1. Check Google Cloud Console for API quotas
2. Places API has free tier: 
   - First $200/month free
   - After that, $17 per 1,000 requests
3. Consider caching results to reduce API calls

### Build errors on iOS

**Problem**: CocoaPods not installed or outdated

**Solution**:
```bash
# Update CocoaPods
sudo gem install cocoapods

# Clean and reinstall
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..

# Clean build
npx react-native run-ios --clean
```

### Build errors on Android

**Problem**: Gradle dependencies conflict

**Solution**:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android --clean
```

---

## Cost Considerations

### Google Maps Pricing (as of 2024)

Google provides **$200 free credit per month**, which covers:

- **Maps SDK for Android/iOS**: $7 per 1,000 loads (free tier = ~28,500 loads/month)
- **Places API - Nearby Search**: $32 per 1,000 requests (free tier = ~6,200 searches/month)
- **Directions API**: $5 per 1,000 requests (free tier = ~40,000 directions/month)

For a small to medium-sized app, you should stay within the free tier.

### Tips to Stay Within Free Tier

1. **Cache pharmacy results** for 1 hour to avoid repeated API calls
2. **Limit search radius** to 5-10 km
3. **Rate limit** searches (e.g., max 1 search per minute per user)
4. **Use demo data** for development/testing

---

## Alternative: Using Demo Data

If you don't want to configure Google Maps API immediately, the app will automatically fall back to demo data showing sample pharmacies in Jalandhar.

To use demo data:
- Simply don't configure the API key
- The app will show a notice and use hardcoded pharmacy locations
- All features work except real-time pharmacy data

---

## Security Best Practices

### ⚠️ NEVER Commit API Keys to Git

1. Create `.env` file:
   ```
   GOOGLE_MAPS_API_KEY=your_key_here
   ```

2. Add to `.gitignore`:
   ```
   .env
   ```

3. Use `react-native-config` to load API keys:
   ```bash
   npm install react-native-config
   ```

4. Update code to use:
   ```typescript
   import Config from 'react-native-config';
   const apiKey = Config.GOOGLE_MAPS_API_KEY;
   ```

### 🔒 Restrict Your API Key

Always restrict your API key to:
- Specific Android package names
- Specific iOS bundle identifiers
- Only the APIs you need
- Consider HTTP referrer restrictions for web builds

---

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [React Native Geolocation](https://github.com/react-native-geolocation/react-native-geolocation)

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Google Cloud Console for API errors
3. Check React Native logs: `npx react-native log-android` or `npx react-native log-ios`
4. Verify all dependencies are installed correctly

---

## Summary

You've successfully integrated Google Maps with real pharmacy locations! 🎉

The app now:
- ✅ Shows real nearby pharmacies on Google Maps
- ✅ Uses your actual location (with permission)
- ✅ Provides turn-by-turn navigation
- ✅ Displays pharmacy ratings, hours, and contact info
- ✅ Falls back to demo data if API is not configured

Enjoy finding nearby pharmacies with ease!
