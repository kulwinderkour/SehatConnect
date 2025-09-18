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

### Required Software (All Platforms)

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

4. **Java Development Kit (JDK) 17)**
   - **Windows**: Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use [OpenJDK](https://adoptium.net/)
   - **macOS**: Use Homebrew: `brew install openjdk@17`
   - Set `JAVA_HOME` environment variable

5. **Android Studio** (for Android development)
   - Download from [Android Studio](https://developer.android.com/studio)
   - Install Android SDK (API level 33 or higher)
   - Set up Android emulator or connect physical device

### Platform-Specific Requirements

#### For macOS Users:
6. **Xcode** (for iOS development)
   - Download from Mac App Store
   - Install Xcode Command Line Tools: `xcode-select --install`

7. **CocoaPods** (for iOS dependencies)
   ```bash
   sudo gem install cocoapods
   ```

8. **Ruby** (v2.6.10 or higher)
   - Usually pre-installed on macOS
   - If not: `brew install ruby`

#### For Windows Users:
6. **Ruby** (v2.6.10 or higher)
   - Download from [RubyInstaller](https://rubyinstaller.org/)
   - Choose Ruby+Devkit version
   - Follow installation wizard

7. **Git for Windows**
   - Download from [Git for Windows](https://git-scm.com/download/win)
   - Use Git Bash for terminal commands

8. **Windows Build Tools**
   ```bash
   npm install -g windows-build-tools
   ```

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

### 3. Platform-Specific Quick Start

#### For Windows Users:
```cmd
# 1. Open Command Prompt or PowerShell as Administrator
# 2. Navigate to project directory
cd SehatConnet

# 3. Install dependencies
npm install

# 4. Start Metro bundler
npm start

# 5. In a new terminal, run Android
npm run android
```

#### For macOS Users:
```bash
# 1. Open Terminal
# 2. Navigate to project directory
cd SehatConnet

# 3. Install dependencies
npm install

# 4. Install iOS dependencies (if developing for iOS)
cd ios && bundle install && bundle exec pod install && cd ..

# 5. Start Metro bundler
npm start

# 6. In a new terminal, run your preferred platform
npm run android  # For Android
npm run ios      # For iOS
```

### 4. Environment Setup

#### For iOS (macOS only):
Create a local environment file for Xcode:
```bash
# Create .xcode.env.local file
echo 'export NODE_BINARY=$(command -v node)' > ios/.xcode.env.local
```

#### For Android (All Platforms):
Ensure your Android SDK is properly configured and `ANDROID_HOME` is set:

**On macOS/Linux:**
```bash
# Add to your ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**On Windows:**
```cmd
# Add to your system environment variables
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\emulator
PATH=%PATH%;%ANDROID_HOME%\tools
PATH=%PATH%;%ANDROID_HOME%\tools\bin
PATH=%PATH%;%ANDROID_HOME%\platform-tools
```

**Alternative for Windows (PowerShell):**
```powershell
# Add to your PowerShell profile
$env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin;$env:ANDROID_HOME\platform-tools"
```

### 5. Start Metro Bundler

```bash
npm start
```

### 6. Run the Application

#### For Android:
```bash
# In a new terminal window
npm run android

# OR use npx directly
npx react-native run-android
```

#### For iOS (macOS only):
```bash
# In a new terminal window
npm run ios

# OR use npx directly
npx react-native run-ios
```

## 📱 Platform-Specific Setup

### Android Setup (All Platforms)

1. **Install Android Studio**
   - **Windows**: Download from [Android Studio](https://developer.android.com/studio)
   - **macOS**: Download from [Android Studio](https://developer.android.com/studio) or use Homebrew: `brew install --cask android-studio`

2. **Configure Android SDK**:
   - Open Android Studio
   - Go to SDK Manager (Tools > SDK Manager)
   - Install Android SDK Platform 33
   - Install Android SDK Build-Tools 33.0.0
   - Install Android SDK Platform-Tools
   - Install Android SDK Command-line Tools

3. **Set up Android Emulator**:
   - Open AVD Manager in Android Studio (Tools > AVD Manager)
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

### Windows-Specific Setup

1. **Install Visual Studio Build Tools**:
   - Download from [Visual Studio](https://visualstudio.microsoft.com/downloads/)
   - Install "C++ build tools" workload
   - Or install Visual Studio Community with C++ development tools

2. **Configure Windows Defender**:
   - Add your project folder to Windows Defender exclusions
   - This prevents build performance issues

3. **Use Git Bash or PowerShell**:
   - Use Git Bash for Unix-like commands
   - Or use PowerShell with proper PATH configuration

## 🛠️ Development

### Available Scripts

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android
# OR
npx react-native run-android

# Run on iOS (macOS only)
npm run ios
# OR
npx react-native run-ios

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

#### iOS build issues (macOS only):
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

#### Windows-specific issues:

**PowerShell execution policy:**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Long path issues on Windows:**
```cmd
# Enable long paths in Windows
git config --global core.longpaths true
```

**Build tools not found:**
```bash
# Install Windows build tools
npm install -g windows-build-tools
# Or install Visual Studio Build Tools manually
```

**Android SDK not found:**
```cmd
# Check if ANDROID_HOME is set
echo %ANDROID_HOME%
# If not set, add to system environment variables
```

### Environment Variables

#### For iOS (macOS only):
If you encounter issues with Node.js path on iOS:
1. Create `ios/.xcode.env.local`
2. Add: `export NODE_BINARY=$(command -v node)`

#### For Windows:
If you encounter PATH issues:
1. Add Node.js to system PATH: `C:\Program Files\nodejs\`
2. Add Android SDK to system PATH
3. Restart your terminal/IDE after changing environment variables

#### For macOS:
If you encounter permission issues:
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

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