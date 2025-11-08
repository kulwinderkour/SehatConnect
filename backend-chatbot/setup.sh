#!/bin/bash

# Backend Setup Script for SehatConnect Chatbot
# This script automates the backend server setup process

echo "🚀 SehatConnect AI Chatbot Backend Setup"
echo "=========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Download dataset
echo ""
echo "📊 Downloading medical dataset from Kaggle..."
python3 << END
import kagglehub
import os
import shutil

try:
    print("📦 Downloading dataset...")
    path = kagglehub.dataset_download("niyarrbarman/symptom2disease")
    
    dataset_file = os.path.join(path, "symptom2disease.csv")
    target_path = "symptom2disease.csv"
    
    if os.path.exists(dataset_file):
        shutil.copy(dataset_file, target_path)
        print(f"✅ Dataset downloaded successfully!")
    else:
        print("⚠️ Dataset file not found. Please download manually.")
except Exception as e:
    print(f"⚠️ Error downloading dataset: {e}")
    print("Please download manually from: https://www.kaggle.com/datasets/niyarrbarman/symptom2disease")
END

# Check if dataset exists
if [ -f "symptom2disease.csv" ]; then
    echo "✅ Dataset ready!"
else
    echo "⚠️ Dataset not found. You may need to download it manually."
fi

echo ""
echo "=========================================="
echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Run the server: python chat_api.py"
echo ""
echo "Server will be available at: http://localhost:8000"
echo "API documentation: http://localhost:8000/docs"
echo "=========================================="
