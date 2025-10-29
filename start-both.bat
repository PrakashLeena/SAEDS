@echo off
echo ========================================
echo   SAEDS Full Stack Startup
echo ========================================
echo.
echo Starting backend and frontend servers...
echo.

cd /d "e:\saeds website"

echo [1/2] Starting backend server...
start "SAEDS Backend" cmd /k "cd /d "e:\saeds website\backend" && npm start"

timeout /t 3 /nobreak > nul

echo [2/2] Starting frontend server...
start "SAEDS Frontend" cmd /k "cd /d "e:\saeds website\frontend" && npm start"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two terminal windows have been opened:
echo   1. Backend (port 5000)
echo   2. Frontend (port 3000)
echo.
echo Wait for both to finish starting...
echo Frontend will open in your browser automatically.
echo.
echo To stop servers: Close the terminal windows or press Ctrl+C in each
echo.
pause
