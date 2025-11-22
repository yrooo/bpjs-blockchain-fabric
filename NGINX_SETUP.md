# Nginx Reverse Proxy Setup Guide

## 🎯 Why Nginx?
- Single port (80) for API access
- Better CORS handling
- Load balancing ready
- Cleaner URLs: `http://192.168.1.7/api/` instead of `http://192.168.1.7:3001/api/`

---

## 📋 Installation Methods

### Option 1: Using Docker (RECOMMENDED)

#### 1. Create Docker Compose for Nginx
Already created! Just run:

```powershell
cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric

# Start nginx with docker
docker run -d \
  --name bpjs-nginx \
  --network host \
  -v ${PWD}/nginx.conf:/etc/nginx/nginx.conf:ro \
  -p 80:80 \
  --restart unless-stopped \
  nginx:alpine
```

#### 2. Verify Nginx is Running
```powershell
docker ps | Select-String nginx
```

#### 3. Test the Setup
```powershell
curl http://192.168.1.7/health
curl http://192.168.1.7/api/health
```

---

### Option 2: Install Nginx on Windows

#### 1. Download Nginx
Download from: http://nginx.org/en/download.html
- Get the Windows version (nginx-1.24.0.zip or latest)

#### 2. Extract to a Folder
```powershell
# Extract to C:\nginx
Expand-Archive nginx-*.zip C:\

# Copy our config
Copy-Item d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\nginx.conf C:\nginx\conf\nginx.conf
```

#### 3. Start Nginx
```powershell
cd C:\nginx
.\nginx.exe
```

#### 4. Test
```powershell
curl http://localhost/health
```

---

## 🚀 Complete Startup Sequence

### 1. Start Blockchain Network
```powershell
cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric
docker-compose -f docker-compose-light.yml up -d
```

### 2. Start API Server
```powershell
cd api
npm run dev
```

### 3. Start Nginx (Docker Method)
```powershell
docker run -d \
  --name bpjs-nginx \
  --network host \
  -v ${PWD}/nginx.conf:/etc/nginx/nginx.conf:ro \
  -p 80:80 \
  nginx:alpine
```

---

## 🔧 Update Frontend Configuration

### Your Other PC - Frontend Setup

Edit `frontend-web/.env.local`:
```env
# OLD - Direct port access
# VITE_API_URL=http://192.168.1.7:3001/api

# NEW - Through nginx (port 80)
VITE_API_URL=http://192.168.1.7/api
```

**No more port number needed!** 🎉

---

## 🧪 Testing

### From This Laptop:
```powershell
# Test nginx is running
curl http://localhost/health

# Test API through nginx
curl http://192.168.1.7/api/cards
curl http://192.168.1.7/api/dashboard/stats
```

### From Your Other PC:
```bash
# Test nginx connection
curl http://192.168.1.7/health

# Test API
curl http://192.168.1.7/api/health
```

---

## 🔥 Firewall Configuration

Update firewall to allow port 80 instead of 3001:

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "BPJS Nginx" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Optional: Remove old 3001 rule if you want
Remove-NetFirewallRule -DisplayName "BPJS API"
```

---

## 🛠️ Nginx Management

### Docker Method:
```powershell
# Stop nginx
docker stop bpjs-nginx

# Start nginx
docker start bpjs-nginx

# Restart nginx (after config changes)
docker restart bpjs-nginx

# View logs
docker logs -f bpjs-nginx

# Remove nginx
docker rm -f bpjs-nginx
```

### Windows Native Method:
```powershell
cd C:\nginx

# Start
.\nginx.exe

# Stop
.\nginx.exe -s stop

# Reload config
.\nginx.exe -s reload

# Test config
.\nginx.exe -t
```

---

## 📊 What Nginx Does

```
Your Dev PC                This Laptop
   |                            |
   |  http://192.168.1.7/api   |
   +-------------------------> Nginx (port 80)
                                 |
                                 +----> Node.js API (port 3001)
                                         |
                                         +----> Docker Blockchain Network
```

---

## 🔄 Updated Architecture

**Before (Direct Access):**
- Frontend → `192.168.1.7:3001` → API → Blockchain

**After (With Nginx):**
- Frontend → `192.168.1.7:80` → Nginx → `localhost:3001` → API → Blockchain

---

## 💡 Benefits

1. ✅ **Cleaner URLs** - No port numbers in frontend
2. ✅ **Better CORS** - Nginx handles it centrally
3. ✅ **Future-proof** - Easy to add SSL/HTTPS later
4. ✅ **Load Balancing** - Can add multiple API instances
5. ✅ **Standard Port** - Port 80 is standard HTTP

---

## 🐛 Troubleshooting

### Port 80 Already in Use?
```powershell
# Check what's using port 80
netstat -ano | findstr :80

# If IIS is running, stop it:
iisreset /stop
```

### Can't Access from Other PC?
```powershell
# Check nginx is listening
netstat -an | findstr :80

# Check firewall
Get-NetFirewallRule -DisplayName "BPJS Nginx"

# Test locally first
curl http://localhost/health
```

### Nginx Not Forwarding to API?
```powershell
# Check API is running on 3001
netstat -an | findstr :3001

# Check nginx logs
docker logs bpjs-nginx
```

---

## 🚀 Quick Start Script

Save this as `start-all.ps1`:

```powershell
# Start everything in order
Write-Host "Starting BPJS Blockchain System..." -ForegroundColor Green

# 1. Blockchain Network
Write-Host "1. Starting blockchain network..." -ForegroundColor Yellow
docker-compose -f docker-compose-light.yml up -d
Start-Sleep -Seconds 5

# 2. Nginx
Write-Host "2. Starting nginx..." -ForegroundColor Yellow
docker run -d --name bpjs-nginx --network host -v ${PWD}/nginx.conf:/etc/nginx/nginx.conf:ro -p 80:80 --restart unless-stopped nginx:alpine

# 3. API (manual - open new terminal)
Write-Host "3. Start API manually in new terminal:" -ForegroundColor Yellow
Write-Host "   cd api; npm run dev" -ForegroundColor Cyan

Write-Host "`nSystem ready!" -ForegroundColor Green
Write-Host "API accessible at: http://192.168.1.7/api" -ForegroundColor Cyan
```

Run: `.\start-all.ps1`

---

## 🎯 Next Steps

1. **Start nginx** using Docker method above
2. **Update frontend** `.env.local` to use `http://192.168.1.7/api`
3. **Configure firewall** for port 80
4. **Test from both PCs**
5. **Update your team** with new URL

No more port 3001 needed! 🎉
