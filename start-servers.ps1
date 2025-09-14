# WiFi Dashboard Server Startup Script
Write-Host "Starting WiFi Dashboard Servers..." -ForegroundColor Green

# Start Backend Server
Write-Host "`nStarting NestJS Backend Server (Port 5500)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'nestjs-backend'; npm run start:dev" -WindowStyle Normal

# Wait for backend to start
Write-Host "`nWaiting 5 seconds for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend Server  
Write-Host "`nStarting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm run dev" -WindowStyle Normal

Write-Host "`nBoth servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5500" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")