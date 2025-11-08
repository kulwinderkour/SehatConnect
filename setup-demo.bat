@echo off
REM SehatConnect Hackathon Demo Setup Script for Windows
REM This script sets up Dr. Rajesh Sharma profile for demo

echo ========================================
echo SehatConnect Hackathon Demo Setup
echo Dr. Rajesh Sharma Profile
echo ========================================
echo.

REM Navigate to backend directory
cd backend
if errorlevel 1 (
    echo Error: Could not find backend directory
    pause
    exit /b 1
)

REM Create demo users
echo Creating demo users (Patient ^& Dr. Rajesh Sharma)...
node create-demo-user.js

if errorlevel 1 (
    echo.
    echo Failed to create demo users!
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo ========================================
echo Demo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Start Backend Server:
echo    cd backend
echo    npm start
echo.
echo 2. Start Chatbot Backend (new terminal):
echo    cd backend-chatbot
echo    python chat_api.py
echo.
echo 3. Start Mobile App (new terminal):
echo    npx react-native run-android
echo.
echo 4. Login Credentials:
echo    Patient: patient@sehat.com / Patient@123
echo    Doctor: drrajesh@sehat.com / Rajesh@123
echo.
echo For detailed demo flow, see: HACKATHON_DEMO_SETUP.md
echo ========================================

pause
