@echo off
echo ========================================
echo   SAEDS Frontend Server Startup
echo ========================================
echo.

cd /d "e:\saeds website\frontend"

echo Checking environment...
if not exist ".env.local" (
    echo [WARNING] .env.local file not found!
    echo Using default configuration...
    echo.
)

echo Starting frontend server on port 3000...
echo.
echo [INFO] Press Ctrl+C to stop the server
echo [INFO] Browser will open automatically
echo.

npm start
