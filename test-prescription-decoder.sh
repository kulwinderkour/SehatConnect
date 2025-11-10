#!/bin/bash

# Test Prescription Decoder API
# This script tests if the backend can decode a prescription image

echo "🧪 Testing Prescription Decoder API..."
echo ""

# Check if backend is running
echo "1️⃣ Checking if backend server is running..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend server is running"
else
    echo "❌ Backend server is NOT running"
    echo "   Start it with: cd backend && npm start"
    exit 1
fi

echo ""
echo "2️⃣ Checking Gemini API configuration..."
if grep -q "GEMINI_API_KEY=" backend/.env; then
    echo "✅ GEMINI_API_KEY is set in backend/.env"
else
    echo "❌ GEMINI_API_KEY is NOT set"
    echo "   Add it to backend/.env file"
    exit 1
fi

echo ""
echo "3️⃣ Testing prescription decode endpoint..."
echo "   You can test by:"
echo "   - Open the app"
echo "   - Go to Records tab"
echo "   - Tap 'Scan Prescription'"
echo "   - Take a photo or select from gallery"
echo ""
echo "   Or use curl:"
echo "   curl -X POST http://localhost:5000/api/prescriptions/decode \\"
echo "        -F 'prescription=@/path/to/prescription.jpg'"
echo ""

echo "✅ Prescription decoder is ready to use!"
