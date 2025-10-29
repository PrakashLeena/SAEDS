@echo off
echo ========================================
echo   SAEDS Backend Server Startup
echo ========================================
echo.

cd /d "e:\saeds website\backend"

echo Checking environment...
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo Please copy .env.example to .env and configure it.
    pause
    exit /b 1
)

echo Starting backend server on port 5000...
echo.
echo [INFO] Press Ctrl+C to stop the server
echo.

npm start
