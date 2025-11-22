# Quick Setup Script for Remote API Connection
# Run this on THIS LAPTOP to prepare for remote connection

Write-Host "BPJS Remote API Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Get this laptop's IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.1.*"}).IPAddress
Write-Host "This laptop's IP: $ip" -ForegroundColor Cyan
Write-Host ""

# Step 1: Configure Firewall
Write-Host "Step 1: Configuring Windows Firewall..." -ForegroundColor Yellow
Write-Host "WARNING: Please run this script as Administrator!" -ForegroundColor Red
Write-Host ""

try {
    New-NetFirewallRule -DisplayName "Fabric Orderer" -Direction Inbound -LocalPort 7050 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "Fabric BPJS Peer" -Direction Inbound -LocalPort 7051 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "Fabric Hospital Peer" -Direction Inbound -LocalPort 9051 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue
    Write-Host "[OK] Firewall rules added successfully" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Failed to add firewall rules. Run as Administrator!" -ForegroundColor Red
}
Write-Host ""

# Step 2: Check blockchain status
Write-Host "Step 2: Checking blockchain containers..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}" | Select-String -Pattern "peer|orderer"
if ($containers) {
    Write-Host "[OK] Blockchain containers running:" -ForegroundColor Green
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String -Pattern "peer|orderer"
} else {
    Write-Host "[FAIL] No blockchain containers running!" -ForegroundColor Red
    Write-Host "   Start them with: docker-compose -f docker-compose-light.yml up -d" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Create package for other PC
Write-Host "Step 3: Creating package for remote PC..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipName = "BPJS-Remote-API-$timestamp.zip"

# Remove old zip if exists
if (Test-Path $zipName) {
    Remove-Item $zipName
}

# Create zip with necessary files
$filesToZip = @(
    "api",
    "crypto-config", 
    "channel-artifacts",
    "REMOTE_API_SETUP.md"
)

Write-Host "   Packaging files..." -ForegroundColor Cyan
Compress-Archive -Path $filesToZip -DestinationPath $zipName -Force

if (Test-Path $zipName) {
    Write-Host "[OK] Package created: $zipName" -ForegroundColor Green
    Write-Host "   Size: $([math]::Round((Get-Item $zipName).Length / 1MB, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "[FAIL] Failed to create package" -ForegroundColor Red
}
Write-Host ""

# Step 4: Show instructions
Write-Host "================================" -ForegroundColor Green
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "ON THIS LAPTOP:" -ForegroundColor Yellow
Write-Host "  1. Keep blockchain running:" -ForegroundColor White
Write-Host "     docker-compose -f docker-compose-light.yml up -d" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Transfer $zipName to your other PC" -ForegroundColor White
Write-Host "     (via USB drive, network share, or cloud)" -ForegroundColor Cyan
Write-Host ""
Write-Host "ON YOUR OTHER PC:" -ForegroundColor Yellow
Write-Host "  1. Extract $zipName" -ForegroundColor White
Write-Host ""
Write-Host "  2. Edit api\.env and update:" -ForegroundColor White
Write-Host "     CONNECTION_MODE=remote" -ForegroundColor Cyan
Write-Host "     PEER_BPJS_ADDRESS=$ip:7051" -ForegroundColor Cyan
Write-Host "     PEER_RUMAHSAKIT_ADDRESS=$ip:9051" -ForegroundColor Cyan
Write-Host "     ORDERER_ADDRESS=$ip:7050" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Test connectivity:" -ForegroundColor White
Write-Host "     ping $ip" -ForegroundColor Cyan
Write-Host "     Test-NetConnection -ComputerName $ip -Port 7051" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. Install and run API:" -ForegroundColor White
Write-Host "     cd api" -ForegroundColor Cyan
Write-Host "     npm install" -ForegroundColor Cyan
Write-Host "     npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  5. Run frontend:" -ForegroundColor White
Write-Host "     cd frontend-web" -ForegroundColor Cyan
Write-Host "     npm install" -ForegroundColor Cyan
Write-Host "     npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Setup complete! Read REMOTE_API_SETUP.md for details" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
