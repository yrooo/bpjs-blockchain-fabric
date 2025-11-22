# Network Host Setup Guide
**Host Laptop IP:** `192.168.1.7`

## 🎯 Overview
This laptop will host:
- Hyperledger Fabric blockchain network (orderer + peers)
- Backend API (Node.js/Express on port 3001)
- Docker containers for all blockchain components

Your development PC will:
- Run the frontend (Vite dev server)
- Connect to this laptop's API via network

---

## 📋 Prerequisites on This Laptop

### 1. Install Required Software
- ✅ Docker Desktop
- ✅ Node.js (v16+)
- ✅ Git

### 2. Windows Firewall Configuration
Open PowerShell **as Administrator** and run:

```powershell
# Allow API port
New-NetFirewallRule -DisplayName "BPJS API" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow

# Allow Docker ports (if needed for direct peer access)
New-NetFirewallRule -DisplayName "Fabric Orderer" -Direction Inbound -LocalPort 7050 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Fabric BPJS Peer" -Direction Inbound -LocalPort 7051 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Fabric Hospital Peer" -Direction Inbound -LocalPort 9051 -Protocol TCP -Action Allow
```

### 3. Verify Docker Network Mode
Make sure Docker Desktop is set to **"Expose daemon on tcp://localhost:2375 without TLS"** is OFF (keep it secure).

---

## 🚀 Starting the Network & API

### Step 1: Start Blockchain Network
```powershell
cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric

# Start the network
docker-compose -f docker-compose-light.yml up -d

# Verify all containers are running
docker ps
```

You should see:
- `orderer1.bpjs-network.com`
- `peer0.bpjs.bpjs-network.com`
- `peer0.rumahsakit.bpjs-network.com`

### Step 2: Deploy Chaincode (if not already deployed)
```powershell
# Start CLI container
docker-compose -f docker-compose-cli.yml up -d

# Check if chaincode is already installed
docker exec cli peer chaincode list --installed
```

### Step 3: Start API Server
```powershell
cd api

# Install dependencies (first time only)
npm install

# Start the API in production mode
npm start

# OR use development mode with auto-reload
npm run dev
```

API will be available at:
- Local: `http://localhost:3001`
- Network: `http://192.168.1.7:3001`

### Step 4: Test API Accessibility
From this laptop, test:
```powershell
curl http://localhost:3001/api/health
curl http://192.168.1.7:3001/api/health
```

---

## 💻 Development PC Setup

### On Your Other PC:

#### 1. Clone Frontend Only
```bash
git clone <your-repo> bpjs-frontend
cd bpjs-frontend/frontend-web
```

#### 2. Update Frontend Configuration
Edit `frontend-web/src/services/api.js` or wherever API URL is defined:

```javascript
// Change from
const API_BASE_URL = 'http://localhost:3001';

// To
const API_BASE_URL = 'http://192.168.1.7:3001';
```

#### 3. Install & Run Frontend
```bash
npm install
npm run dev
```

Frontend will run on `http://localhost:5173` on your dev PC.

---

## 🔧 Important Configuration Changes

### Update API CORS Settings
The API needs to allow requests from your dev PC. Update `api/.env`:

```env
# Allow your dev PC to access the API
CORS_ORIGIN=http://192.168.1.7:5173,http://localhost:5173
```

Or for development, allow all origins:
```env
CORS_ORIGIN=*
```

---

## 🧪 Testing the Setup

### From Your Development PC:

1. **Test API Connection:**
   ```bash
   curl http://192.168.1.7:3001/api/health
   ```

2. **Test Blockchain Query:**
   ```bash
   curl http://192.168.1.7:3001/api/cards
   ```

3. **Open Frontend:**
   - Navigate to `http://localhost:5173`
   - Frontend should connect to `192.168.1.7:3001`

---

## 📊 Monitoring on Host Laptop

### Check Docker Containers
```powershell
docker ps
docker stats
docker logs -f <container-name>
```

### Check API Logs
```powershell
cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\api
Get-Content logs\combined.log -Wait -Tail 50
```

### Monitor Network Connections
```powershell
netstat -an | Select-String "3001"
```

---

## 🛑 Stopping the System

```powershell
# Stop API (Ctrl+C in the terminal running it)

# Stop blockchain network
cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric
docker-compose -f docker-compose-light.yml down
docker-compose -f docker-compose-cli.yml down
```

---

## 🔒 Security Notes

1. **This setup is for DEVELOPMENT only**
2. Both PCs should be on the same trusted local network
3. Don't expose port 3001 to the internet
4. For production, use proper TLS/SSL certificates
5. Change JWT_SECRET in production

---

## 🐛 Troubleshooting

### Can't Connect from Dev PC?
1. Check Windows Firewall rules are active
2. Verify both PCs are on same network
3. Ping test: `ping 192.168.1.7`
4. Check if API is running: `netstat -an | Select-String "3001"`

### API Can't Connect to Blockchain?
1. Verify Docker containers are running: `docker ps`
2. Check Docker network: `docker network ls`
3. Test peer connection from CLI container

### CORS Errors in Browser?
1. Update CORS_ORIGIN in `api/.env`
2. Restart API server

---

## 📱 Mobile Development (Future)
If you want to test mobile app on physical device:
- Use same setup
- Mobile device must be on same WiFi network
- Access API via `http://192.168.1.7:3001`
