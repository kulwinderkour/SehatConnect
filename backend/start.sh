#!/bin/bash

# SehatConnect Backend Quick Start Script
# This script starts MongoDB and the backend server

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║        🏥  STARTING SEHATCONNECT BACKEND  🏥           ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if MongoDB is running
echo "🔍 Checking MongoDB status..."
if brew services list | grep mongodb-community | grep started > /dev/null; then
    echo "✅ MongoDB is already running"
else
    echo "🚀 Starting MongoDB..."
    brew services start mongodb-community@7.0
    sleep 2
    echo "✅ MongoDB started successfully"
fi

echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Start the backend server
echo "🚀 Starting Backend Server..."
echo ""
node server.js
