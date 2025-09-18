# SehatConnect - Healthcare Mobile App

A comprehensive React Native healthcare application that provides telemedicine, pharmacy services, health records management, and emergency features.

## 🏥 Features

- **Telemedicine**: Video consultations with healthcare providers
- **Pharmacy Services**: Medicine ordering and delivery
- **Health Records**: Digital health record management
- **Emergency Services**: Quick access to emergency contacts
- **Multi-language Support**: English, Hindi, and Punjabi
- **Offline Support**: Works without internet connection
- **Profile Management**: User profile and photo management

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (v20 or higher)
   ```bash
   # Check your Node.js version
   node --version
   ```

2. **npm** (comes with Node.js)
   ```bash
   # Check your npm version
   npm --version
   ```

3. **React Native CLI**
   ```bash
   npm install -g @react-native-community/cli
   ```

4. **Java Development Kit (JDK) 17**
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use OpenJDK
   - Set `JAVA_HOME` environment variable

5. **Android Studio** (for Android development)
   - Download from [Android Studio](https://developer.android.com/studio)
   - Install Android SDK (API level 33 or higher)
   - Set up Android emulator or connect physical device

6. **Xcode** (for iOS development - macOS only)
   - Download from Mac App Store
   - Install Xcode Command Line Tools: `xcode-select --install`

7. **CocoaPods** (for iOS dependencies)
   ```bash
   sudo gem install cocoapods
   ```

8. **Ruby** (v2.6.10 or higher)
   - macOS: Usually pre-installed
   - Linux/Windows: Install from [Ruby website](https://www.ruby-lang.org/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd SehatConnet
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && bundle install && bundle exec pod install && cd ..
```

### 3. Environment Setup

#### For iOS (macOS only):
Create a local environment file for Xcode:
```bash
# Create .xcode.env.local file
echo 'export NODE_BINARY=$(command -v node)' > ios/.xcode.env.local
```

#### For Android:
Ensure your Android SDK is properly configured and `ANDROID_HOME` is set:
```bash
# Add to your ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 4. Start Metro Bundler

```bash
npm start
```

### 5. Run the Application

#### For Android:
```bash
# In a new terminal window
npm run android
```

#### For iOS (macOS only):
```bash
# In a new terminal window
npm run ios
```

## 📱 Platform-Specific Setup

### Android Setup

1. **Install Android Studio**
2. **Configure Android SDK**:
   - Open Android Studio
   - Go to SDK Manager
   - Install Android SDK Platform 33
   - Install Android SDK Build-Tools 33.0.0
   - Install Android SDK Platform-Tools

3. **Set up Android Emulator**:
   - Open AVD Manager in Android Studio
   - Create a new Virtual Device
   - Choose a device definition (e.g., Pixel 6)
   - Select a system image (API 33)
   - Finish setup

4. **Enable Developer Options** (for physical device):
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

### iOS Setup (macOS only)

1. **Install Xcode** from Mac App Store
2. **Install Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
3. **Install CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```
4. **Install iOS dependencies**:
   ```bash
   cd ios && bundle exec pod install && cd ..
   ```

## 🛠️ Development

### Available Scripts

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Run linter
npm run lint
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Input, etc.)
│   ├── consultations/  # Consultation-related components
│   ├── home/          # Home screen components
│   ├── pharmacy/      # Pharmacy components
│   └── profile/       # Profile components
├── contexts/          # React contexts for state management
├── hooks/             # Custom React hooks
├── i18n/              # Internationalization files
├── navigation/        # Navigation configuration
├── screens/           # Screen components
├── services/          # API and service layer
├── store/             # Redux store and slices
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🌐 Internationalization

The app supports multiple languages:
- English (en)
- Hindi (hi)
- Punjabi (pa)

Language files are located in `src/i18n/` directory.

## 📸 Profile Photos

To add profile photos:

1. Place your photo in `src/assets/images/profile-photos/`
2. Follow the naming convention: `username.jpg`
3. Recommended size: 400x400 pixels
4. Supported formats: JPG, PNG, WebP

See `PROFILE_PHOTO_GUIDE.md` for detailed instructions.

## 🔧 Troubleshooting

### Common Issues

#### Metro bundler issues:
```bash
# Clear Metro cache
npx react-native start --reset-cache
```

#### Android build issues:
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

#### iOS build issues:
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..
# Reinstall pods
cd ios && rm -rf Pods && bundle exec pod install && cd ..
```

#### Node version issues:
```bash
# Use Node Version Manager (nvm)
nvm install 20
nvm use 20
```

### Environment Variables

If you encounter issues with Node.js path on iOS:
1. Create `ios/.xcode.env.local`
2. Add: `export NODE_BINARY=$(command -v node)`

## 📦 Dependencies

### Main Dependencies
- React Native 0.81.4
- React Navigation 7.x
- React Native Bootsplash
- React Native Linear Gradient
- React Native Gesture Handler
- React Native Safe Area Context
- React Native Screens

### Development Dependencies
- TypeScript 5.8.3
- ESLint
- Prettier
- Jest
- Babel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Run linter: `npm run lint`
6. Commit your changes: `git commit -m 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about your problem
4. Include your system information (OS, Node.js version, etc.)

## 📞 Contact

For questions or support, please contact the development team.

---

**Happy Coding! 🚀**