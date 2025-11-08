#!/bin/bash

# 🚀 Sehat Chatbot - Quick Start Script
# This script sets up and runs both backend and frontend

echo "════════════════════════════════════════════════════════"
echo "🩺 Sehat Medical Chatbot - Optimized Setup v2.0"
echo "════════════════════════════════════════════════════════"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Python
if ! command_exists python3; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check pip
if ! command_exists pip; then
    echo "❌ pip not found. Please install pip"
    exit 1
fi

echo "✅ pip found"

# Navigate to backend
echo ""
echo "📦 Setting up backend..."
cd backend-chatbot

# Install Python dependencies
echo "Installing Python packages..."
pip install fastapi uvicorn sentence-transformers pandas scikit-learn numpy kagglehub 2>&1 | grep -v "Requirement already satisfied" || true

echo ""
echo "🚀 Starting backend server..."
echo "   - First run will download dataset from Kaggle (~5MB)"
echo "   - Subsequent runs will use cached dataset (fast!)"
echo "   - Embeddings will be cached for instant restarts"
echo ""

# Start backend in background
python3 chat_api.py &
BACKEND_PID=$!

echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Check if backend is healthy
for i in {1..10}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    echo "   Waiting... ($i/10)"
    sleep 2
done

# Navigate back to root
cd ..

echo ""
echo "════════════════════════════════════════════════════════"
echo "🎉 Setup Complete!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📱 Next Steps:"
echo "   1. Open a new terminal"
echo "   2. Run: npm run android (or npm run ios)"
echo "   3. Open the Sehat chatbot in the app"
echo ""
echo "💡 Tips:"
echo "   - Dataset is cached - future startups are fast!"
echo "   - Backend logs are visible in this terminal"
echo "   - Press Ctrl+C to stop the backend"
echo ""
echo "🔍 Troubleshooting:"
echo "   - Android: Use http://10.0.2.2:8000"
echo "   - iOS: Use http://localhost:8000"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""

# Keep script running to show backend logs
wait $BACKEND_PID
