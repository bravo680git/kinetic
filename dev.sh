#!/bin/bash

# Add Go bin to PATH if not already there
export PATH="$(go env GOPATH)/bin:$PATH"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Kinetic Development Environment   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════╝${NC}"
echo ""

# Check if backend dependencies are available
if ! command -v air &> /dev/null; then
    echo -e "${RED}✗ 'air' not found${NC}"
    echo -e "${YELLOW}  Install with: go install github.com/cosmtrek/air@latest${NC}"
    exit 1
fi
echo -e "${GREEN}✓ air found${NC}"

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}✗ 'pnpm' not found${NC}"
    echo -e "${YELLOW}  Install with: npm install -g pnpm${NC}"
    exit 1
fi
echo -e "${GREEN}✓ pnpm found${NC}"

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠ Frontend dependencies not installed${NC}"
    echo -e "${YELLOW}  Installing...${NC}"
    cd frontend && pnpm install && cd ..
fi
echo -e "${GREEN}✓ Frontend dependencies ready${NC}"

echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${BLUE}Stopping dev servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Dev environment stopped${NC}"
}

trap cleanup EXIT INT

# Start backend
echo -e "${BLUE}▶ Starting backend...${NC}"
cd backend
air &
BACKEND_PID=$!
cd ..

if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}✗ Failed to start backend${NC}"
    exit 1
fi

# Start frontend
echo -e "${BLUE}▶ Starting frontend...${NC}"
cd frontend
pnpm dev &
FRONTEND_PID=$!
cd ..

if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}✗ Failed to start frontend${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Backend running  -> http://localhost:8080${NC}"
echo -e "${GREEN}✓ Frontend running -> http://localhost:5173${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
