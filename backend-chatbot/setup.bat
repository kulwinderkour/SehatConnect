@echo off
REM Backend Setup Script for SehatConnect Chatbot (Windows)
REM This script automates the backend server setup process

echo ========================================
echo SehatConnect AI Chatbot Backend Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python 3.8+ and try again.
    exit /b 1
)

echo Python found
python --version
echo.

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo.
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt

REM Download dataset
echo.
echo Downloading medical dataset from Kaggle...
python -c "import kagglehub; import os; import shutil; path = kagglehub.dataset_download('niyarrbarman/symptom2disease'); dataset_file = os.path.join(path, 'symptom2disease.csv'); target_path = 'symptom2disease.csv'; shutil.copy(dataset_file, target_path) if os.path.exists(dataset_file) else print('Dataset not found')"

REM Check if dataset exists
if exist "symptom2disease.csv" (
    echo Dataset ready!
) else (
    echo Dataset not found. You may need to download it manually.
    echo Download from: https://www.kaggle.com/datasets/niyarrbarman/symptom2disease
)

echo.
echo ========================================
echo Setup complete!
echo.
echo To start the server:
echo   1. Activate virtual environment: venv\Scripts\activate
echo   2. Run the server: python chat_api.py
echo.
echo Server will be available at: http://localhost:8000
echo API documentation: http://localhost:8000/docs
echo ========================================
pause
