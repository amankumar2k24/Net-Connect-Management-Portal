@echo off
echo Starting WiFi Dashboard Servers...

echo.
echo Starting NestJS Backend Server (Port 5500)...
start "NestJS Backend Server" cmd /k "cd /d nestjs-backend && npm run start:dev"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5500
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul