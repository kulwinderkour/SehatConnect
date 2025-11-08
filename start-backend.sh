#!/bin/bash
# Start Sehat AI Backend Server
# This script activates the virtual environment and starts the backend

echo "🚀 Starting Sehat AI Backend Server..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend-chatbot"

# Use virtual environment Python
/Users/abhishekswami/Developer/SIH2/SehatConnet/.venv/bin/python chat_api.py
