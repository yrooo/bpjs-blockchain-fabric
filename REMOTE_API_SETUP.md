# Remote API Connection Setup
## Connect API from Other PC to Blockchain on This Laptop

---

## 🎯 Architecture

**This Laptop (192.168.1.7):**
- Hyperledger Fabric Network (Orderer + Peers)
- Ports exposed: 7050 (orderer), 7051 (BPJS peer), 9051 (Hospital peer)

**Your Other PC:**
- Node.js API
- Frontend Web App
- Connects to blockchain on 192.168.1.7

---

## 🔧 Step 1: Configure Firewall on This Laptop

**Run as Administrator:**

```powershell
# Allow orderer port
New-NetFirewallRule -DisplayName "Fabric Orderer" -Direction Inbound -LocalPort 7050 -Protocol TCP -Action Allow

# Allow BPJS peer port
New-NetFirewallRule -DisplayName "Fabric BPJS Peer" -Direction Inbound -LocalPort 7051 -Protocol TCP -Action Allow

# Allow Hospital peer port
New-NetFirewallRule -DisplayName "Fabric Hospital Peer" -Direction Inbound -LocalPort 9051 -Protocol TCP -Action Allow

# Allow CLI access (optional, for debugging)
New-NetFirewallRule -DisplayName "Docker Remote" -Direction Inbound -LocalPort 2375 -Protocol TCP -Action Allow
```

---

## 📦 Step 2: Copy Required Files to Your Other PC

From this laptop, copy these folders to your other PC:

```powershell
# Create a package to transfer
$files = @(
    "d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\api",
    "d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\crypto-config",
    "d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\channel-artifacts"
)

# You can zip these and transfer via USB/network share
Compress-Archive -Path $files -DestinationPath "d:\BPJS-Remote-API.zip"
```

**Transfer:**
- Copy `BPJS-Remote-API.zip` to your other PC
- Extract to a folder like `C:\BPJS-API\`

---

## ⚙️ Step 3: Update .env on Your Other PC

On your other PC, edit `api\.env`:

```env
PORT=3001
NODE_ENV=development

# Fabric Network Configuration
CHANNEL_NAME=bpjschannel
CHAINCODE_NAME=bpjs
CHAINCODE_VERSION=1.1

# REMOTE CONNECTION MODE - Connect to blockchain on 192.168.1.7
CONNECTION_MODE=remote

# Peer Addresses (point to this laptop's IP)
PEER_BPJS_ADDRESS=192.168.1.7:7051
PEER_RUMAHSAKIT_ADDRESS=192.168.1.7:9051
ORDERER_ADDRESS=192.168.1.7:7050

# Organizations
BPJS_MSP_ID=BPJSMSP
RUMAHSAKIT_MSP_ID=RumahSakitMSP

# Path to crypto materials (local on other PC)
CRYPTO_PATH=../crypto-config
CHANNEL_ARTIFACTS_PATH=../channel-artifacts

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h

# CORS - Allow your frontend
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

---

## 🔌 Step 4: Update Connection Code

The API needs to use SDK mode instead of Docker exec. Update `api/src/fabric/blockchain.service.ts`:

Add this method at the top:

```typescript
private getConnectionMode(): 'docker' | 'remote' {
  return (process.env.CONNECTION_MODE as 'docker' | 'remote') || 'docker';
}
```

Then update methods to check connection mode and use appropriate peer addresses from environment variables.

---

## 🧪 Step 5: Test Connection from Other PC

On your other PC:

```bash
# 1. Test network connectivity
ping 192.168.1.7

# 2. Test peer ports
Test-NetConnection -ComputerName 192.168.1.7 -Port 7050
Test-NetConnection -ComputerName 192.168.1.7 -Port 7051
Test-NetConnection -ComputerName 192.168.1.7 -Port 9051

# 3. Install API dependencies
cd api
npm install

# 4. Start API
npm run dev

# 5. Test API
curl http://localhost:3001/health
curl http://localhost:3001/api/cards
```

---

## 🚀 Step 6: Run Everything

### On This Laptop:
```powershell
# Keep blockchain running
cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric
docker-compose -f docker-compose-light.yml up -d

# Verify all peers are running
docker ps
```

### On Your Other PC:
```bash
# Terminal 1: API
cd api
npm run dev

# Terminal 2: Frontend
cd frontend-web
npm run dev
```

---

## 📊 Architecture Diagram

```
Your Other PC                         This Laptop (192.168.1.7)
+-----------------+                   +-------------------------+
|                 |                   |                         |
|  Frontend :5173 |                   |  Orderer     :7050      |
|       |         |                   |       |                 |
|       v         |    HTTP Calls     |       v                 |
|   API :3001 ----+------------------>|  Peer BPJS   :7051      |
|                 |  (blockchain ops) |       |                 |
|                 |                   |  Peer Hospital :9051    |
+-----------------+                   +-------------------------+
```

---

## ⚠️ Important Notes

1. **Both PCs must be on same network** (192.168.1.x)
2. **Crypto materials must match** - copy exact files from this laptop
3. **Connection mode is 'remote'** - API uses network calls, not docker exec
4. **Keep this laptop running** - it hosts the blockchain
5. **TLS is disabled** - For development only

---

## 🐛 Troubleshooting

### Can't connect to peers?
```bash
# Test from other PC
telnet 192.168.1.7 7051
# Should connect. If not, check firewall.
```

### "UNAVAILABLE: DNS resolution failed"?
- Use IP addresses (192.168.1.7) not hostnames
- Update peer addresses in .env

### "Error: connect ECONNREFUSED"?
- Verify peers are running: `docker ps`
- Check firewall rules are active
- Test port connectivity

### "Chaincode not found"?
- Make sure chaincode is deployed on this laptop
- Check chaincode version matches in .env

---

## 🔐 For Production

Later, you should:
1. Enable TLS on peers
2. Copy TLS certificates to other PC
3. Update connection profiles with TLS settings
4. Use proper network DNS/hostnames
5. Secure the ports with VPN

---

## 💡 Alternative: SSH Tunnel (Advanced)

If firewall issues persist, use SSH tunnel:

```bash
# On other PC, create tunnels to this laptop
ssh -L 7050:localhost:7050 user@192.168.1.7
ssh -L 7051:localhost:7051 user@192.168.1.7
ssh -L 9051:localhost:9051 user@192.168.1.7

# Then use localhost in .env
PEER_BPJS_ADDRESS=localhost:7051
```
