#!/bin/bash
# Network Test Script for Sehat Chatbot

echo "🔍 SEHAT CHATBOT - NETWORK DIAGNOSTICS"
echo "========================================"
echo ""

# 1. Check if backend is running
echo "1️⃣ Checking if backend process is running..."
if ps aux | grep -v grep | grep chat_api.py > /dev/null; then
    echo "   ✅ Backend process is RUNNING"
else
    echo "   ❌ Backend process is NOT running"
    echo "   Run: ./start-backend.sh"
    exit 1
fi
echo ""

# 2. Get current IP
echo "2️⃣ Your computer's IP address:"
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "   📍 IP: $IP"
echo ""

# 3. Test localhost connection
echo "3️⃣ Testing localhost connection..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   ✅ Localhost: WORKING"
else
    echo "   ❌ Localhost: FAILED"
fi
echo ""

# 4. Test IP connection
echo "4️⃣ Testing IP connection ($IP:8000)..."
if curl -s http://$IP:8000/health > /dev/null; then
    echo "   ✅ IP Connection: WORKING"
    echo "   Response:"
    curl -s http://$IP:8000/health | python3 -m json.tool
else
    echo "   ❌ IP Connection: FAILED"
    echo "   This means devices on your network cannot connect!"
fi
echo ""

# 5. Check firewall
echo "5️⃣ Firewall check..."
echo "   ℹ️  If IP connection failed, check:"
echo "   • macOS Firewall: System Settings → Network → Firewall"
echo "   • Allow Python to accept incoming connections"
echo ""

# 6. Show configured IP in app
echo "6️⃣ Your ChatbotService.ts should have:"
echo "   const BACKEND_IP = '$IP';"
echo ""

# 7. Test chat endpoint
echo "7️⃣ Testing chat endpoint..."
RESPONSE=$(curl -s -X POST "http://$IP:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}')

if [ -n "$RESPONSE" ]; then
    echo "   ✅ Chat endpoint: WORKING"
    echo "   Response: $RESPONSE"
else
    echo "   ❌ Chat endpoint: FAILED"
fi
echo ""

echo "========================================"
echo "✅ Diagnostics complete!"
echo ""
echo "📱 On your Android device:"
echo "   1. Make sure WiFi is connected to same network"
echo "   2. Reload the app (shake device → Reload)"
echo "   3. Check logs in Metro bundler terminal"
echo "   4. Try sending a message in the app"
echo ""
echo "🔧 If still offline:"
echo "   • Check if phone and Mac on same WiFi"
echo "   • Disable VPN if active"
echo "   • Check Mac firewall settings"
echo "   • Verify IP in ChatbotService.ts: $IP"
