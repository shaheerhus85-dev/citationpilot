#!/bin/bash
# Quick start script for development (macOS/Linux)
# This script sets up and runs the entire SaaS platform locally

set -e

# Get script directory
cd "$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "========================================="
echo "  SEO Citation Builder - Quick Start"
echo "========================================="
echo ""

# Check Python
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERROR: Python 3 is not installed${NC}"
    echo "Please install Python 3.9+ from https://www.python.org/"
    exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version | cut -d' ' -f2) found${NC}"

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version | cut -d'v' -f2) found${NC}"

echo ""

# Backend Setup
echo "========================================="
echo "  BACKEND SETUP"
echo "========================================="
cd backend

echo ""
echo "Creating Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

echo ""
echo "Activating virtual environment..."
source venv/bin/activate

echo ""
echo "Installing Python dependencies..."
echo "This may take a few minutes..."
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

echo ""
echo "Installing Playwright browsers..."
python -m playwright install chromium
echo -e "${GREEN}✓ Playwright setup complete${NC}"

if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created (with defaults)${NC}"
fi

cd ..

# Frontend Setup
echo ""
echo "========================================="
echo "  FRONTEND SETUP"
echo "========================================="
cd frontend

echo ""
echo "Installing Node.js dependencies..."
echo "This may take a minute..."
if [ ! -d "node_modules" ]; then
    npm install --quiet
    echo -e "${GREEN}✓ npm packages installed${NC}"
else
    echo -e "${GREEN}✓ node_modules already exists${NC}"
fi

if [ ! -f ".env.local" ]; then
    echo ""
    echo "Creating .env.local file..."
    cp .env.example .env.local
    echo -e "${GREEN}✓ .env.local file created${NC}"
fi

cd ..

echo ""
echo "========================================="
echo "  SETUP COMPLETE!"
echo "========================================="
echo ""
echo "To start the development servers:"
echo ""
echo -e "${BLUE}Terminal 1 - Backend (API):${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python run.py"
echo ""
echo "  Then visit: ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${BLUE}Terminal 2 - Frontend (Web App):${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "  Then visit: ${GREEN}http://localhost:3000${NC}"
echo ""
echo "========================================="
echo ""
echo -e "${YELLOW}Starting servers now...${NC}"
echo ""

# Check if we're on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open -a Terminal backend_terminal.command 2>/dev/null || true
    open -a Terminal frontend_terminal.command 2>/dev/null || true
    echo -e "${GREEN}✓ Backend and Frontend windows started${NC}"
elif [[ "$OSTYPE" == "linux"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd backend && source venv/bin/activate && python run.py; exec bash" &
        gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash" &
        echo -e "${GREEN}✓ Backend and Frontend terminals started${NC}"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd backend && source venv/bin/activate && python run.py" &
        xterm -e "cd frontend && npm run dev" &
        echo -e "${GREEN}✓ Backend and Frontend terminals started${NC}"
    else
        echo -e "${YELLOW}Please run these commands in separate terminals:${NC}"
        echo "  cd backend && source venv/bin/activate && python run.py"
        echo "  cd frontend && npm run dev"
    fi
fi

echo ""
echo -e "${GREEN}Navigate to: http://localhost:3000${NC}"
echo -e "${GREEN}API Docs: http://localhost:8000/docs${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
