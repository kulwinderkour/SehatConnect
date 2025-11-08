#!/bin/bash

# SehatConnect Hackathon Demo Setup Script
# This script sets up Dr. Rajesh Sharma profile for demo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏥 SehatConnect Hackathon Demo Setup"
echo "   Dr. Rajesh Sharma Profile"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "❌ MongoDB is not running!"
    echo "   Please start MongoDB first:"
    echo "   brew services start mongodb-community"
    exit 1
fi
echo "✅ MongoDB is running"
echo ""

# Navigate to backend directory
cd backend || exit 1

# Create demo users
echo "📝 Creating demo users (Patient & Dr. Rajesh Sharma)..."
node create-demo-user.js

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Demo Setup Complete!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1️⃣  Start Backend Server:"
    echo "   cd backend"
    echo "   npm start"
    echo ""
    echo "2️⃣  Start Chatbot Backend (new terminal):"
    echo "   cd backend-chatbot"
    echo "   python3 chat_api.py"
    echo ""
    echo "3️⃣  Start Mobile App (new terminal):"
    echo "   npx react-native run-android"
    echo ""
    echo "4️⃣  Login Credentials:"
    echo "   Patient: patient@sehat.com / Patient@123"
    echo "   Doctor: drrajesh@sehat.com / Rajesh@123"
    echo ""
    echo "📖 For detailed demo flow, see: HACKATHON_DEMO_SETUP.md"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo "❌ Failed to create demo users!"
    echo "   Please check the error messages above"
    exit 1
fi
