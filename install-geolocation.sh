#!/bin/bash

# Installation Script for Geolocation Package
# This enables automatic location detection for the Nearby Pharmacy feature

echo "🚀 Installing @react-native-community/geolocation..."

# Install the package
npm install @react-native-community/geolocation

# For iOS, install pods
if [ -d "ios" ]; then
  echo "📱 Installing iOS pods..."
  cd ios
  pod install
  cd ..
fi

echo "✅ Installation complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Open src/services/PharmacyLocationService.ts"
echo "2. Uncomment line 6: import Geolocation from '@react-native-community/geolocation';"
echo "3. Uncomment lines 100-119 (Geolocation.getCurrentPosition code)"
echo "4. Comment out lines 96-98 (default location fallback)"
echo ""
echo "📄 Add permissions to AndroidManifest.xml:"
echo "   <uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\" />"
echo "   <uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\" />"
echo ""
echo "📄 Add permissions to iOS Info.plist:"
echo "   <key>NSLocationWhenInUseUsageDescription</key>"
echo "   <string>We need your location to find nearby pharmacies</string>"
echo ""
echo "🎉 All done! Rebuild your app to test the feature."
