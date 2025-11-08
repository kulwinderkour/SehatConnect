#!/bin/bash
# Automatically get your local IP address for backend development
# This script helps team members quickly find their IP without manual lookup

echo "🔍 Finding your local IP address..."
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    echo "✅ Your Mac's IP address: $IP"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
    echo "✅ Your Linux IP address: $IP"
else
    # Windows (Git Bash)
    IP=$(ipconfig | grep "IPv4" | head -1 | awk '{print $NF}')
    echo "✅ Your Windows IP address: $IP"
fi

echo ""
echo "📝 Update your .env file with:"
echo "BACKEND_IP=$IP"
echo ""
echo "💡 Or update ChatbotService.ts line 22:"
echo "const BACKEND_IP = '$IP';"
echo ""
echo "🚀 Then run: cd backend-chatbot && python3 chat_api.py"
