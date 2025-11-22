# Start API Server and Frontend
Write-Host "🚀 Starting BPJS Blockchain System..." -ForegroundColor Green
Write-Host ""

# Start API Server
Write-Host "📡 Starting API Server on port 3001..." -ForegroundColor Cyan
$apiPath = "D:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\api"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$apiPath'; npm run start:dev"

# Wait a bit for API to start
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "🌐 Starting Frontend on port 5173..." -ForegroundColor Cyan
$frontendPath = "D:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\frontend-web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev"

Write-Host ""
Write-Host "✅ System starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 API Server: http://localhost:3001" -ForegroundColor Yellow
Write-Host "🌐 Frontend:   http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
