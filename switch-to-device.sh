#!/bin/bash
# Script to switch to physical device and run app

echo "🔍 Checking connected devices..."
adb devices

echo ""
echo "📱 Looking for device A6N7P7PVJJ9XIN65..."

# Check if device is online
DEVICE_STATUS=$(adb devices | grep "A6N7P7PVJJ9XIN65" | awk '{print $2}')

if [ "$DEVICE_STATUS" = "device" ]; then
    echo "✅ Device is online!"
    echo ""
    echo "🚀 Running app on your physical device..."
    npx react-native run-android --device=A6N7P7PVJJ9XIN65
elif [ "$DEVICE_STATUS" = "offline" ]; then
    echo "⚠️  Device is offline!"
    echo ""
    echo "Please:"
    echo "1. Unplug and replug USB cable"
    echo "2. Allow USB Debugging on your phone"
    echo "3. Run this script again: ./switch-to-device.sh"
else
    echo "❌ Device not found!"
    echo ""
    echo "Please:"
    echo "1. Connect your phone via USB"
    echo "2. Enable USB Debugging"
    echo "3. Run: adb devices"
fi

