#!/bin/bash

# SehatConnect APK Build Script
# This script builds a release APK for Android

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║        🏥  BUILDING SEHATCONNECT APK  🏥              ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to android directory
cd android

echo -e "${BLUE}📦 Cleaning previous builds...${NC}"
./gradlew clean

echo ""
echo -e "${BLUE}🔨 Building Release APK...${NC}"
echo "This may take a few minutes..."
echo ""

# Build the release APK
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ APK built successfully!${NC}"
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                APK BUILD COMPLETE                      ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}📱 APK Location:${NC}"
    echo "   android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    echo -e "${YELLOW}📋 Install Instructions:${NC}"
    echo "   1. Transfer app-release.apk to your Android device"
    echo "   2. Enable 'Install from Unknown Sources' in Settings"
    echo "   3. Open the APK file and install"
    echo ""
    echo -e "${BLUE}💡 Quick Install (if device connected):${NC}"
    echo "   adb install -r app/build/outputs/apk/release/app-release.apk"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Build failed! Please check the errors above.${NC}"
    exit 1
fi
