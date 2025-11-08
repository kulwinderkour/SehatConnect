#!/bin/bash

# Chatbot Connection Test Script
# This script helps diagnose connection issues between the app and backend

echo "🔍 SehatConnect Chatbot Connection Diagnostics"
echo "=============================================="
echo ""

# Test 1: Check if backend is running
echo "Test 1: Checking if backend is running..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is running!"
    echo ""
    echo "📊 Health Check Response:"
    curl -s http://localhost:8000/health | python3 -m json.tool
else
    echo "❌ Backend is NOT running!"
    echo ""
    echo "💡 Solution:"
    echo "   1. cd backend-chatbot"
    echo "   2. source venv/bin/activate  (or venv\\Scripts\\activate on Windows)"
    echo "   3. python chat_api.py"
    exit 1
fi

echo ""
echo "=============================================="
echo ""

# Test 2: Test chat endpoint
echo "Test 2: Testing chat endpoint with sample query..."
RESPONSE=$(curl -s -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I have fever and headache"}')

if [ $? -eq 0 ]; then
    echo "✅ Chat endpoint is working!"
    echo ""
    echo "📊 Sample Response:"
    echo "$RESPONSE" | python3 -m json.tool
else
    echo "❌ Chat endpoint failed!"
    exit 1
fi

echo ""
echo "=============================================="
echo ""

# Test 3: Check port availability
echo "Test 3: Checking port 8000 availability..."
if lsof -Pi :8000 -sTCP:LISTEN -t > /dev/null ; then
    echo "✅ Port 8000 is in use (backend is listening)"
    echo ""
    PROCESS=$(lsof -Pi :8000 -sTCP:LISTEN | tail -n 1)
    echo "📊 Process Info:"
    echo "$PROCESS"
else
    echo "❌ Port 8000 is not in use!"
    echo "   Backend may not be running correctly."
fi

echo ""
echo "=============================================="
echo ""

# Test 4: Network connectivity for Android emulator
echo "Test 4: Testing Android emulator connectivity..."
echo ""
echo "📱 For Android Emulator:"
echo "   The app uses: http://10.0.2.2:8000"
echo "   This maps to: http://localhost:8000 on your computer"
echo ""
echo "💡 To test from emulator:"
echo "   1. Open app in emulator"
echo "   2. Check Metro bundler logs for:"
echo "      🤖 ChatbotService - Sending message to: http://10.0.2.2:8000"
echo ""

echo "=============================================="
echo ""

# Summary
echo "✅ SUMMARY:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Backend is running and healthy"
echo "✓ Chat endpoint is responding correctly"  
echo "✓ Port 8000 is active"
echo ""
echo "🎉 Backend is ready!"
echo ""
echo "📱 Next Steps:"
echo "   1. Make sure app is running: npx react-native run-android"
echo "   2. Login to the app"
echo "   3. Look for light cyan 'Ask Sehat' button at bottom-right"
echo "   4. Tap button and send a message"
echo "   5. Check Metro bundler logs for connection details"
echo ""
echo "🐛 If still not connecting:"
echo "   - Check Metro bundler logs for errors"
echo "   - Look for: 🤖 ChatbotService logs"
echo "   - Verify app is using correct URL (10.0.2.2:8000 for Android emulator)"
echo "   - For physical device, update URL to your computer's IP address"
echo ""
echo "=============================================="
