#!/bin/bash

# Install APK to connected Android device

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║        📱  INSTALLING SEHATCONNECT APK  📱            ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK not found at: $APK_PATH"
    echo "Please build the APK first by running: ./build-apk.sh"
    exit 1
fi

# Check if device is connected
echo "🔍 Checking for connected devices..."
DEVICES=$(adb devices | grep -w "device" | wc -l)

if [ $DEVICES -eq 0 ]; then
    echo "❌ No Android device connected!"
    echo ""
    echo "Please connect your device via USB and enable USB debugging:"
    echo "  1. Go to Settings → About Phone"
    echo "  2. Tap 'Build Number' 7 times to enable Developer Options"
    echo "  3. Go to Settings → Developer Options"
    echo "  4. Enable 'USB Debugging'"
    echo "  5. Connect your phone via USB"
    echo "  6. Accept the debugging prompt on your phone"
    exit 1
fi

echo "✅ Device connected!"
echo ""
echo "📦 Installing APK..."
adb install -r "$APK_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation successful!"
    echo ""
    echo "🎉 SehatConnect is now installed on your device!"
    echo ""
    echo "📱 You can now:"
    echo "   1. Open SehatConnect app on your phone"
    echo "   2. Log in with: patient@sehat.com / patient123"
    echo "   3. Go to Medicine Reminders to see your scheduled reminders"
    echo "   4. Turn off WiFi/Data - reminders will still work!"
    echo ""
else
    echo ""
    echo "❌ Installation failed!"
    echo "Try manually installing:"
    echo "  1. Transfer $APK_PATH to your phone"
    echo "  2. Enable 'Install from Unknown Sources' in Settings"
    echo "  3. Open the APK file and install"
    echo ""
fi
