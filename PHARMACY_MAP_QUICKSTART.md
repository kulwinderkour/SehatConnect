# Nearby Pharmacies Map Feature - Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS  
   - Places API
4. Create API key in Credentials
5. Copy your API key

### 2. Configure Android

Edit `android/app/src/main/AndroidManifest.xml`, add inside `<application>` tag:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_API_KEY_HERE"/>
```

### 3. Configure iOS

Edit `ios/SehatConnect/AppDelegate.mm`, add at the top:

```objc
#import <GoogleMaps/GoogleMaps.h>
```

Add in `didFinishLaunchingWithOptions` before RCTRootView:

```objc
[GMSServices provideAPIKey:@"YOUR_API_KEY_HERE"];
```

Then run:
```bash
cd ios && pod install && cd ..
```

### 4. Update Code

Edit `src/components/pharmacy/NearbyPharmaciesMapModal.tsx`:

Find line ~162 and ~366:
```typescript
const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
```

Replace with your actual key:
```typescript
const apiKey = 'AIzaSyC...your-key';
```

### 5. Build and Run

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## ✅ What You Get

- 📍 Real-time location-based pharmacy search
- 🗺️ Interactive Google Maps with pharmacy markers
- 🏥 Generic medicine stores (green markers)
- 💊 Private pharmacies (blue markers)  
- 📞 Call pharmacies directly
- 🧭 Turn-by-turn directions
- ⭐ Ratings and reviews
- 🕐 Opening hours and status

## 📋 Features

### Map View
- Zoom in/out with pinch gestures
- Tap markers to see pharmacy details
- Real-time user location (blue dot)
- Toggle between map and list view

### Pharmacy Information
- Name and address
- Distance from your location
- Ratings (from Google)
- Open/Closed status
- Phone number (when available)

### Actions
- **Directions**: Opens in Google/Apple Maps for navigation
- **Call**: Direct call to pharmacy
- **View Details**: Tap marker for more info

## 🔧 Troubleshooting

**Map not showing?**
- Verify API key is correct
- Check APIs are enabled in Google Cloud
- Rebuild app completely

**No pharmacies appearing?**
- App uses demo data if API is not configured
- Check Places API is enabled
- Verify API key restrictions

**Location not working?**
- Grant location permissions when prompted
- App falls back to Jalandhar if denied
- Check device location services are enabled

## 📚 Full Documentation

See [PHARMACY_MAP_SETUP.md](./PHARMACY_MAP_SETUP.md) for complete setup guide including:
- Detailed API configuration
- iOS and Android setup
- Security best practices
- Cost considerations
- Advanced troubleshooting

## 💡 Using Without API Key

The feature works with demo data if you haven't configured Google Maps API:
- Shows sample pharmacies in Jalandhar
- All UI features work
- No real-time data or real locations
- Good for testing and development

## 🎯 Next Steps

1. ✅ Set up Google Maps API (follow steps above)
2. ✅ Test on physical device for best results
3. ✅ Customize pharmacy types and filters
4. ✅ Add caching for better performance
5. ✅ Consider adding favorite pharmacies feature

---

**Need help?** Check the full setup guide in `PHARMACY_MAP_SETUP.md`
