# Testing Guide for 8GB RAM Windows Laptop

This guide will help you test the BPJS Blockchain system on a Windows laptop with 8GB RAM.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Memory Optimization](#memory-optimization)
3. [Testing Modes](#testing-modes)
4. [Step-by-Step Testing](#step-by-step-testing)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Docker Desktop for Windows** (latest version)
- **WSL2** (Windows Subsystem for Linux 2)
- **Node.js** 18+ and npm
- **Git** for version control
- **VS Code** (recommended)

### Installation Steps

1. **Install WSL2**
```powershell
# Run in PowerShell as Administrator
wsl --install
wsl --set-default-version 2
```

2. **Install Docker Desktop**
- Download from [docker.com](https://www.docker.com/products/docker-desktop)
- Enable WSL2 integration during installation
- Ensure "Use WSL 2 based engine" is checked

3. **Configure Docker Memory Limits**
- Open Docker Desktop
- Go to Settings → Resources
- Set Memory to **4GB maximum** (leave 4GB for Windows)
- Set CPUs to **2-3 cores**
- Set Swap to **1GB**
- Click "Apply & Restart"

## Memory Optimization

### 1. Windows Memory Management

**Disable unnecessary services:**
```powershell
# Run as Administrator
# Disable Windows Search (saves ~200MB)
Stop-Service "WSearch" -Force
Set-Service "WSearch" -StartupType Disabled

# Disable Superfetch (saves ~100MB)
Stop-Service "SysMain" -Force
Set-Service "SysMain" -StartupType Disabled
```

**Close unnecessary applications:**
- Close Chrome/Edge (each tab uses 50-200MB)
- Close Discord, Slack, Teams
- Disable startup programs in Task Manager

### 2. Docker Optimization

Create `.env` file in project root:
```env
# Reduce container memory limits
ORDERER_GENERAL_MEMORY=256m
PEER_MEMORY=256m
COUCHDB_MEMORY=256m
CLI_MEMORY=128m
```

### 3. WSL2 Memory Configuration

Create/edit `%USERPROFILE%\.wslconfig`:
```ini
[wsl2]
memory=3GB
processors=2
swap=1GB
localhostForwarding=true
```

Restart WSL2:
```powershell
wsl --shutdown
```

## Testing Modes

We have 3 testing modes based on your available resources:

### Mode 1: Frontend Only (Recommended for 8GB RAM)
**Memory Usage:** ~500MB
- Test UI components with simulated API
- No blockchain required
- Perfect for frontend development

### Mode 2: Lightweight Network
**Memory Usage:** ~2.5GB
- Minimal Fabric network (1 orderer, 2 peers)
- Good for basic testing
- Requires careful memory management

### Mode 3: Full Network
**Memory Usage:** ~5GB
- Complete production setup
- All 5 orderers, 6 peers, 6 CouchDB
- Only for testing on high-end machines

## Step-by-Step Testing

### 🚀 Mode 1: Frontend Only Testing (RECOMMENDED)

This mode doesn't require running the blockchain at all!

**Step 1: Navigate to Frontend Directory**
```powershell
cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\frontend-web
```

**Step 2: Install Dependencies**
```powershell
npm install
```

**Step 3: Start Development Server**
```powershell
npm run dev
```

**Step 4: Open Browser**
- Open http://localhost:5173
- You'll see the Test & Debug Dashboard
- All components use simulated API calls

**What You Can Test:**
- ✅ Network Status monitoring (simulated)
- ✅ BPJS Card issuance and verification
- ✅ Patient visit recording
- ✅ Insurance claim processing
- ✅ Direct chaincode invocation interface
- ✅ Debug console with log filtering

**Benefits:**
- No Docker required
- Uses ~300MB RAM
- Instant hot reload
- Perfect for UI development
- No blockchain complexity

---

### 🔧 Mode 2: Lightweight Network Testing

Use this when you need to test actual blockchain functionality.

**Step 1: Create Lightweight Configuration**

Create `docker-compose-light.yml`:
```yaml
version: '3.7'

services:
  # Single Orderer
  orderer.bpjs.health.id:
    image: hyperledger/fabric-orderer:2.5
    environment:
      - ORDERER_GENERAL_LOGLEVEL=INFO
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_LISTENPORT=7050
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      - ORDERER_GENERAL_TLS_ENABLED=false
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    ports:
      - 7050:7050
    networks:
      - bpjs_network
    deploy:
      resources:
        limits:
          memory: 256M

  # BPJS Peer
  peer0.bpjs.health.id:
    image: hyperledger/fabric-peer:2.5
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=peer0.bpjs.health.id
      - CORE_PEER_ADDRESS=peer0.bpjs.health.id:7051
      - CORE_PEER_LOCALMSPID=BPJSMSP
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp
      - CORE_CHAINCODE_EXECUTETIMEOUT=300s
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
    ports:
      - 7051:7051
    networks:
      - bpjs_network
    deploy:
      resources:
        limits:
          memory: 256M

  # Hospital Peer
  peer0.rumahsakit.health.id:
    image: hyperledger/fabric-peer:2.5
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=peer0.rumahsakit.health.id
      - CORE_PEER_ADDRESS=peer0.rumahsakit.health.id:9051
      - CORE_PEER_LOCALMSPID=RumahSakitMSP
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
    ports:
      - 9051:9051
    networks:
      - bpjs_network
    deploy:
      resources:
        limits:
          memory: 256M

networks:
  bpjs_network:
    driver: bridge
```

**Step 2: Start Lightweight Network**
```powershell
# Monitor memory before starting
Get-Process | Sort-Object WS -Descending | Select-Object -First 10 Name, @{Name="Memory(MB)";Expression={[math]::Round($_.WS / 1MB, 2)}}

# Start network
docker-compose -f docker-compose-light.yml up -d

# Check status
docker ps
docker stats --no-stream
```

**Step 3: Deploy Chaincode (Simplified)**
```powershell
# Enter CLI container (if you have one)
docker exec -it cli bash

# Package chaincode (simplified process)
peer lifecycle chaincode package bpjs.tar.gz --path ../chaincode --lang golang --label bpjs_1

# Install on peers
peer lifecycle chaincode install bpjs.tar.gz

# Approve and commit (simplified for testing)
```

**Step 4: Monitor Resources**
```powershell
# Real-time monitoring
docker stats

# Expected memory usage:
# - Orderer: ~200MB
# - Peer 1: ~200MB
# - Peer 2: ~200MB
# - Total: ~600MB + overhead
```

---

### 🏢 Mode 3: Full Network Testing

⚠️ **Warning:** Only attempt this if you've closed ALL other applications!

**Step 1: Free Maximum Memory**
```powershell
# Close everything except PowerShell
# Check available memory
Get-CimInstance Win32_OperatingSystem | Select-Object FreePhysicalMemory, TotalVisibleMemorySize

# You need at least 5GB free
```

**Step 2: Start Services Gradually**
```powershell
# Start orderers only
docker-compose up -d orderer.bpjs.health.id orderer2.bpjs.health.id orderer3.bpjs.health.id

# Wait 30 seconds, check memory
docker stats --no-stream

# If OK, start peers one by one
docker-compose up -d peer0.bpjs.health.id
# Wait and check
docker stats --no-stream

docker-compose up -d peer1.bpjs.health.id
# Continue for each peer...
```

**Step 3: Monitor and Manage**
```powershell
# Watch for memory warnings
docker events --filter 'type=container' --filter 'event=oom'

# If running out of memory, stop CouchDB instances
docker-compose stop couchdb0 couchdb1 couchdb2
# Use LevelDB instead
```

## Memory Monitoring Commands

### PowerShell Commands
```powershell
# Total system memory
Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory

# Available memory
Get-CimInstance Win32_OperatingSystem | Select-Object @{Name="FreeMemory(GB)";Expression={[math]::Round($_.FreePhysicalMemory/1MB, 2)}}

# Docker memory usage
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}"

# WSL memory usage
wsl -d docker-desktop sh -c "free -h"
```

### Real-Time Monitoring
```powershell
# Create monitoring script: monitor-resources.ps1
while ($true) {
    Clear-Host
    Write-Host "=== System Resources ===" -ForegroundColor Cyan
    Write-Host ""
    
    $os = Get-CimInstance Win32_OperatingSystem
    $totalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
    $freeGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
    $usedGB = $totalGB - $freeGB
    $usedPercent = [math]::Round(($usedGB / $totalGB) * 100, 1)
    
    Write-Host "Total Memory: $totalGB GB"
    Write-Host "Used Memory:  $usedGB GB ($usedPercent%)"
    Write-Host "Free Memory:  $freeGB GB"
    Write-Host ""
    
    if ($usedPercent -gt 90) {
        Write-Host "⚠️  WARNING: Memory usage is critical!" -ForegroundColor Red
    } elseif ($usedPercent -gt 80) {
        Write-Host "⚠️  Warning: Memory usage is high" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Memory usage is OK" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "=== Docker Containers ===" -ForegroundColor Cyan
    docker stats --no-stream --format "table {{.Name}}`t{{.MemUsage}}"
    
    Start-Sleep -Seconds 5
}

# Run it:
# powershell -File monitor-resources.ps1
```

## Quick Testing Checklist

### Before Starting
- [ ] Close all browsers
- [ ] Close VS Code (if not needed)
- [ ] Close Discord/Slack/Teams
- [ ] Check Task Manager - aim for <4GB used
- [ ] Configure Docker memory limit to 4GB
- [ ] Configure WSL2 memory limit to 3GB

### During Testing (Mode 1 - Frontend Only)
- [ ] Run `npm run dev` in frontend-web directory
- [ ] Open http://localhost:5173
- [ ] Test Network Status tab
- [ ] Test Card Test tab - issue and verify cards
- [ ] Test Visit Test tab - record visits
- [ ] Test Claim Test tab - submit claims
- [ ] Test Chaincode Test tab - invoke functions
- [ ] Check Debug Console tab - view logs

### During Testing (Mode 2/3 - With Blockchain)
- [ ] Start Docker Desktop
- [ ] Run `docker-compose up -d` (or light version)
- [ ] Wait 60 seconds for network to stabilize
- [ ] Check `docker ps` - all containers running
- [ ] Check `docker stats` - memory within limits
- [ ] Test chaincode deployment
- [ ] Test API endpoints
- [ ] Monitor logs: `docker-compose logs -f`

## Troubleshooting

### Problem: Docker won't start containers

**Solution:**
```powershell
# Clean Docker system
docker system prune -a --volumes

# Restart Docker Desktop
# Try again with lightweight config
```

### Problem: Out of memory errors

**Solution:**
```powershell
# Stop all containers
docker-compose down

# Start only essential containers
docker-compose up -d orderer.bpjs.health.id peer0.bpjs.health.id

# Or switch to Mode 1 (Frontend Only)
```

### Problem: WSL2 using too much memory

**Solution:**
```powershell
# Shutdown WSL
wsl --shutdown

# Edit .wslconfig (reduce memory limit)
# Restart Docker Desktop
```

### Problem: Containers keep restarting

**Solution:**
```powershell
# Check logs
docker-compose logs --tail=50

# Usually indicates memory pressure
# Reduce number of containers or use Mode 1
```

### Problem: Frontend can't connect to API

**Solution:**
```powershell
# Check if API is running
curl http://localhost:3000/health

# Check frontend .env file
# API_URL should point to http://localhost:3000

# For Mode 1, ignore this - uses simulated API
```

### Problem: Chaincode deployment fails

**Solution:**
```powershell
# Check chaincode logs
docker logs dev-peer0.bpjs.health.id-bpjs_1-xxx

# Increase timeout in docker-compose.yml
# - CORE_CHAINCODE_EXECUTETIMEOUT=300s

# Try deploying to fewer peers
```

## Performance Tips

### 1. Use SSD if Available
- Move Docker data to SSD
- In Docker Desktop: Settings → Resources → Advanced → Disk image location

### 2. Disable Windows Defender Real-Time Protection (During Testing)
```powershell
# Temporarily disable (requires admin)
Set-MpPreference -DisableRealtimeMonitoring $true

# Re-enable after testing
Set-MpPreference -DisableRealtimeMonitoring $false
```

### 3. Use PowerShell Profile for Aliases
```powershell
# Add to PowerShell profile
# notepad $PROFILE

function Start-BPJSFrontend {
    cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\frontend-web
    npm run dev
}

function Start-BPJSLight {
    cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric
    docker-compose -f docker-compose-light.yml up -d
}

function Stop-BPJS {
    cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric
    docker-compose down
}

function Show-BPJSStatus {
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    docker stats --no-stream
}

# Usage:
# Start-BPJSFrontend
# Start-BPJSLight
# Stop-BPJS
# Show-BPJSStatus
```

### 4. Use Persistent Volumes (Faster Restarts)
```yaml
# In docker-compose.yml, add volumes
volumes:
  orderer.bpjs.health.id:
  peer0.bpjs.health.id:
  # etc...

# Then in services:
services:
  orderer.bpjs.health.id:
    volumes:
      - orderer.bpjs.health.id:/var/hyperledger/production
```

## Recommended Testing Workflow

For 8GB RAM Windows laptop, follow this workflow:

### Day 1-2: Frontend Development
```powershell
# Mode 1 only
cd frontend-web
npm install
npm run dev
# Develop and test UI components
# Memory usage: ~500MB
```

### Day 3-4: Integration Testing
```powershell
# Morning: Frontend with simulated API
Start-BPJSFrontend

# Afternoon: Lightweight blockchain testing
# Close frontend first
Stop-BPJS
Start-BPJSLight
# Test basic blockchain functions
# Memory usage: ~2.5GB
```

### Day 5: Full System Test
```powershell
# Early morning when system is fresh
# Close ALL other applications
# Restart computer
# Start full network (if necessary)
docker-compose up -d
# Test for 30-60 minutes
# Monitor memory continuously
```

## Expected Memory Usage Summary

| Mode | Components | Memory | Best For |
|------|-----------|---------|----------|
| **Mode 1: Frontend Only** | Vite dev server | ~500MB | UI development, component testing |
| **Mode 2: Lightweight** | 1 orderer + 2 peers | ~2.5GB | Basic blockchain testing, API dev |
| **Mode 3: Full Network** | 5 orderers + 6 peers + 6 CouchDB | ~5GB | Complete system testing |

## Additional Resources

### Useful Docker Commands
```powershell
# View all containers (including stopped)
docker ps -a

# Remove all stopped containers
docker container prune

# View container logs
docker logs <container-name> --tail 100 -f

# Execute command in running container
docker exec -it <container-name> bash

# View network info
docker network ls
docker network inspect bpjs_network

# Check volume usage
docker volume ls
docker system df
```

### Hyperledger Fabric Commands
```bash
# Inside CLI container
# Check peer version
peer version

# Query chaincode
peer chaincode query -C bpjschannel -n bpjs -c '{"Args":["VerifyCard","CARD001"]}'

# Invoke chaincode
peer chaincode invoke -o orderer.bpjs.health.id:7050 -C bpjschannel -n bpjs -c '{"Args":["IssueCard","CARD001","P001",...]}'

# Get channel info
peer channel getinfo -c bpjschannel

# List installed chaincodes
peer lifecycle chaincode queryinstalled
```

## Conclusion

For your 8GB RAM Windows laptop, **Mode 1 (Frontend Only)** is recommended for most development work. This allows you to:
- Develop and test UI components
- Debug frontend logic
- Perfect the user experience
- Use minimal resources

Only switch to Mode 2 or 3 when you specifically need to test blockchain integration, and do so when your system is fresh and other applications are closed.

---

**Need Help?**
- Check logs: `docker-compose logs -f`
- Monitor resources: `docker stats`
- Join Hyperledger Fabric community: https://discord.gg/hyperledger
