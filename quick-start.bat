@echo off
REM Quick start script for development (Windows)
REM This script sets up and runs the entire SaaS platform locally

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo =========================================
echo  SEO Citation Builder - Quick Start
echo =========================================
echo.

REM Check Python
echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Python and Node.js found
echo.

REM Backend Setup
echo =========================================
echo  BACKEND SETUP
echo =========================================
cd backend

echo.
echo Creating Python virtual environment...
if not exist "venv" (
    python -m venv venv
    echo ✓ Virtual environment created
) else (
    echo ✓ Virtual environment already exists
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Installing Python dependencies...
echo This may take a few minutes...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo ✓ Python dependencies installed

echo.
echo Installing Playwright browsers...
python -m playwright install chromium
echo ✓ Playwright setup complete

if not exist ".env" (
    echo.
    echo Creating .env file...
    copy .env.example .env >nul
    echo ✓ .env file created (with defaults)
)

cd ..

REM Frontend Setup
echo.
echo =========================================
echo  FRONTEND SETUP
echo =========================================
cd frontend

echo.
echo Installing Node.js dependencies...
echo This may take a minute...
if not exist "node_modules" (
    call npm install --quiet
    if errorlevel 1 (
        echo ERROR: Failed to install Node.js dependencies
        pause
        exit /b 1
    )
    echo ✓ npm packages installed
) else (
    echo ✓ node_modules already exists
)

if not exist ".env.local" (
    echo.
    echo Creating .env.local file...
    copy .env.example .env.local >nul
    echo ✓ .env.local file created
)

cd ..

echo.
echo =========================================
echo  SETUP COMPLETE!
echo =========================================
echo.
echo To start the development servers:
echo.
echo Terminal 1 - Backend (API):
echo   cd backend
echo   venv\Scripts\activate.bat
echo   python run.py
echo.
echo   Then visit: http://localhost:8000/docs
echo.
echo Terminal 2 - Frontend (Web App):
echo   cd frontend
echo   npm run dev
echo.
echo   Then visit: http://localhost:3000
echo.
echo =========================================
echo.
echo Starting servers now...
echo.

REM Start backend in a new window
start "SEO Citation SaaS - Backend" cmd /k "cd backend && venv\Scripts\activate.bat && python run.py"
timeout /t 3 /nobreak

REM Start frontend in a new window
start "SEO Citation SaaS - Frontend" cmd /k "cd frontend && npm run dev"

echo ✓ Both servers started in new windows
echo.
echo Navigate to: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
pause

echo.
echo Setup Complete!
echo.
echo To start development:
echo.
echo 1. Backend (in terminal 1):
echo    cd backend
echo    venv\Scripts\activate.bat
echo    python run.py
echo.
echo 2. Frontend (in terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo Then open http://localhost:3000 in your browser
echo.
echo Happy coding! [Rocket]
