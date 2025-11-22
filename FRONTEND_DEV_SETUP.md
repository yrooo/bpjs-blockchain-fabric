# Frontend Development PC Setup

## 🎯 Quick Start Guide for Your Development PC

### Prerequisites
- Node.js 16+
- Git
- Network access to host laptop (192.168.1.7)

---

## 📥 Setup Steps

### 1. Clone the Repository
```bash
git clone <your-repo-url> bpjs-frontend
cd bpjs-frontend/frontend-web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env.local` file in `frontend-web/`:

```env
VITE_API_URL=http://192.168.1.7:3001
```

### 4. Verify API Connection
Test the API endpoint:
```bash
curl http://192.168.1.7:3001/api/health
```

You should get a response like:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### 5. Start Development Server
```bash
npm run dev
```

The frontend will be available at:
- `http://localhost:5173`

---

## 🔧 Configuration Details

### API Connection
The frontend is configured to connect to: `http://192.168.1.7:3001`

If the host laptop IP changes, update:
1. `.env.local` file
2. Restart dev server

### Network Requirements
- Both PCs must be on the same WiFi/LAN network
- Host laptop must have blockchain network and API running
- Firewall on host laptop must allow port 3001

---

## 🧪 Testing

### 1. Check Network Connectivity
```bash
# Ping the host laptop
ping 192.168.1.7

# Test API health endpoint
curl http://192.168.1.7:3001/api/health
```

### 2. Test Frontend Features
1. Open `http://localhost:5173` in browser
2. Navigate through the dashboard
3. Test blockchain queries (cards, claims, etc.)
4. Check browser console for errors

---

## 🐛 Troubleshooting

### Can't Connect to API?
**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solutions:**
1. Verify host laptop is running API:
   - On host: `netstat -an | findstr 3001`
2. Check firewall on host laptop
3. Verify both PCs are on same network
4. Try accessing in browser: `http://192.168.1.7:3001/api/health`

### CORS Errors?
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Ask host laptop admin to update `api/.env`:
  ```env
  CORS_ORIGIN=*
  ```
- Or add your dev PC IP explicitly

### Slow API Responses?
**Cause:** Blockchain queries can be slow

**Solutions:**
1. Check host laptop Docker containers are running
2. Monitor network latency: `ping -t 192.168.1.7`
3. Check API logs on host laptop

---

## 🏗️ Development Workflow

### Typical Development Session

1. **Start Host Laptop Services** (on host):
   ```powershell
   # Terminal 1: Start blockchain
   docker-compose -f docker-compose-light.yml up -d
   
   # Terminal 2: Start API
   cd api
   npm run dev
   ```

2. **Start Frontend** (on dev PC):
   ```bash
   npm run dev
   ```

3. **Develop & Test**
   - Make frontend changes
   - Hot reload will update automatically
   - API calls go to host laptop

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

---

## 📱 Mobile Testing (Optional)

To test on physical mobile device:

1. Connect mobile to same WiFi network
2. Get your dev PC IP: `ipconfig`
3. Access frontend via: `http://<your-dev-pc-ip>:5173`
4. API will still connect to `192.168.1.7:3001`

---

## 🔄 Syncing with Host Laptop

### Getting Latest Backend Changes
If backend API is updated:
1. Pull latest changes: `git pull`
2. Host laptop admin restarts API
3. Frontend automatically uses updated API

### Testing Backend Changes Locally
Not recommended since blockchain needs Docker. Always use host laptop for backend/blockchain.

---

## 💡 Tips

1. **Keep Host Laptop Running:** Don't shut down host laptop during development
2. **Use Browser DevTools:** Monitor network tab for API calls
3. **Hot Reload:** Changes to `.jsx` files reload instantly
4. **API Logs:** Ask host laptop admin to check logs if issues occur
5. **Git Workflow:** Only commit frontend changes from dev PC

---

## 📞 When You Need Help

Contact host laptop admin if:
- API is not responding
- CORS errors persist
- Need to restart blockchain network
- Need to check API logs
- Firewall issues

Check yourself:
- Network connectivity (ping)
- Browser console errors
- Frontend code syntax
