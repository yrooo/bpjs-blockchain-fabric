# SIMPLE GUIDE: Connect Frontend from Other PC
## THIS LAPTOP = Blockchain + API + Nginx
## OTHER PC = Frontend Only

---

## STEP 1: On THIS Laptop (Run as Administrator)

### A. Add Firewall Rule
```powershell
New-NetFirewallRule -DisplayName "BPJS API Port 80" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
```

### B. Start Nginx
```powershell
cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric

docker run -d --name bpjs-nginx -v ${PWD}/nginx.conf:/etc/nginx/nginx.conf:ro -p 80:80 --restart unless-stopped nginx:alpine
```

### C. Start API
```powershell
cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\api
npm run dev
```

### D. Test Locally
```powershell
curl http://192.168.1.7/health
curl http://192.168.1.7/api/dashboard/stats
```

---

## STEP 2: On YOUR OTHER PC

### A. Clone/Pull the Repo
```bash
git clone <your-repo> bpjs-frontend
cd bpjs-frontend/frontend-web
```

### B. Create .env.local File
Create `frontend-web/.env.local`:
```env
VITE_API_URL=http://192.168.1.7/api
```

### C. Install & Run
```bash
npm install
npm run dev
```

### D. Test Connection
Open browser: `http://localhost:5173`

---

## ARCHITECTURE

```
OTHER PC                    THIS LAPTOP (192.168.1.7)
+------------------+       +---------------------------+
| Frontend :5173   |       | Nginx :80                 |
|       |          |       |   |                       |
|       v          |  →    |   v                       |
| http://192.168   |       | API :3001                 |
|   .1.7/api       |       |   |                       |
|                  |       |   v                       |
|                  |       | Docker Blockchain Network |
+------------------+       +---------------------------+
```

---

## QUICK TEST

### From Other PC:
```bash
# Test 1: Ping
ping 192.168.1.7

# Test 2: Access API
curl http://192.168.1.7/health

# Test 3: Get blockchain data
curl http://192.168.1.7/api/cards
```

---

## TROUBLESHOOTING

### Can't connect from other PC?
1. Check firewall rule exists (run as Admin):
   ```powershell
   Get-NetFirewallRule -DisplayName "BPJS API Port 80"
   ```

2. Verify nginx is running:
   ```powershell
   docker ps | Select-String nginx
   ```

3. Test API locally first:
   ```powershell
   curl http://localhost:3001/health
   ```

4. Check both PCs on same network:
   ```powershell
   # On other PC
   ping 192.168.1.7
   ```

### CORS errors?
Already handled by nginx! CORS is set to allow all origins.

### Port 80 already in use?
Stop IIS or other web server:
```powershell
iisreset /stop
```

---

## WHAT YOU GET

✅ Clean URL: `http://192.168.1.7/api` (no port number!)
✅ CORS handled automatically
✅ Easy to add HTTPS later
✅ Frontend on other PC connects seamlessly
