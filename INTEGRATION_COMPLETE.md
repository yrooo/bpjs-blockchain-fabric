# 🚀 Complete Integration Guide - Frontend ↔️ API ↔️ Blockchain

## ✅ What We've Done

### 1. **Created API Service Layer** (`frontend-web/src/services/api.js`)
   - Centralized API communication
   - Methods for all blockchain operations:
     - `issueCard()`, `verifyCard()`
     - `recordVisit()`, `getPatientVisits()`
     - `submitClaim()`, `processClaim()`, `getPatientClaims()`
     - `getNetworkStatus()`

### 2. **Updated All Frontend Components**
   - ✅ `CardTest.jsx` - Now issues & verifies cards on real blockchain
   - ✅ `VisitTest.jsx` - Records visits & fetches patient history from blockchain
   - ✅ `ClaimTest.jsx` - Submits & processes claims on blockchain
   - ✅ `NetworkStatus.jsx` - Checks real API/blockchain connection

### 3. **Configured CORS & Proxy**
   - API accepts requests from `http://localhost:5173`
   - Vite proxy forwards `/api/*` to backend
   - Health check endpoint at `/health`

### 4. **Environment Variables**
   - Frontend: `.env` with `VITE_API_URL=http://localhost:3001/api`
   - Backend: `.env` with blockchain connection details

## 🎯 How to Start Everything

### Option 1: Use PowerShell Script (Easiest)
```powershell
cd D:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric
.\start-system.ps1
```

This will open 2 PowerShell windows:
- Window 1: API Server (port 3001)
- Window 2: Frontend (port 5173)

### Option 2: Manual Start

**Terminal 1 - Start API Server:**
```powershell
cd D:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\api
npm run start:dev
```

**Terminal 2 - Start Frontend:**
```powershell
cd D:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\frontend-web
npm run dev
```

## 📊 System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌──────────────────────┐
│   Frontend      │         │   API Server    │         │   Blockchain         │
│   (React)       │ ──────> │   (Express)     │ ──────> │   (Hyperledger)      │
│   Port 5173     │  HTTP   │   Port 3001     │  Docker │   Docker Containers  │
└─────────────────┘         └─────────────────┘  Exec   └──────────────────────┘
                                                   │
                                                   ├─> cli container
                                                   ├─> peer0.bpjs
                                                   ├─> peer0.rumahsakit
                                                   └─> orderer1
```

## 🧪 Testing the Integration

### 1. Check Network Status
1. Open http://localhost:5173
2. Go to "🌐 Network Status" tab
3. You should see:
   - ✅ API Server: Connected
   - ✅ Blockchain Network: Running
   - Active Peers: 2/2
   - Ordering Nodes: 1/1

### 2. Issue a BPJS Card
1. Go to "💳 Card Test" tab
2. Click "🎲 Generate Sample Data"
3. Click "✅ Issue Card"
4. Wait 2-3 seconds
5. Result will show blockchain transaction details

### 3. Verify the Card
1. After issuing, click "🔍 Verify Card"
2. The card data will be fetched from blockchain
3. Check the debug console (bottom of page) for logs

### 4. Record a Visit
1. Go to "🏥 Visit Test" tab
2. Generate sample data
3. Use the same `cardID` from the issued card
4. Click "📝 Record Visit"
5. Visit will be recorded on blockchain

### 5. Submit a Claim
1. Go to "💰 Claim Test" tab
2. Use the same `cardID` and `visitID`
3. Click "💰 Submit Claim"
4. Then click "✅ Process Claim" to approve it

## 🔍 Debugging

### Check API Health
```powershell
curl http://localhost:3001/health
```

### Check Docker Containers
```powershell
docker ps
```
Should show: `cli`, `peer0.bpjs`, `peer0.rumahsakit`, `orderer1`

### View API Logs
API terminal will show:
```
[Main] 🚀 API Server running on http://localhost:3001
[Fabric] ✅ Successfully connected to blockchain network
[CardsRoute] POST /api/cards/issue
[CardsRoute] GET /api/cards/verify/CARD123
```

### View Blockchain Logs
```powershell
docker logs cli
docker logs peer0.bpjs.bpjs-network.com-1
```

## 📝 API Endpoints

### Cards
- `POST /api/cards/issue` - Issue new BPJS card
- `GET /api/cards/verify/:cardID` - Verify card
- `GET /api/cards/:cardID` - Get card details
- `PUT /api/cards/:cardID/status` - Update card status

### Visits
- `POST /api/visits` - Record patient visit
- `GET /api/visits/patient/:patientID` - Get patient visit history

### Claims
- `POST /api/claims` - Submit insurance claim
- `PUT /api/claims/:claimID/process` - Process (approve/reject) claim
- `GET /api/claims/patient/:patientID` - Get patient claims

### Health
- `GET /health` - Check API server status

## 🎉 What's Working Now

✅ Frontend connects to real API  
✅ API connects to blockchain via Docker  
✅ All CRUD operations work on blockchain  
✅ Data persists across all peers  
✅ Real-time transaction logging  
✅ Error handling and logging  
✅ CORS configured properly  

## 🔥 Next Steps (Optional Enhancements)

1. **Add Authentication**
   - JWT tokens
   - Role-based access (BPJS, Hospital, Clinic)

2. **Real-time Updates**
   - WebSocket for blockchain events
   - Auto-refresh on new transactions

3. **Advanced Features**
   - Bulk operations
   - Export to PDF/Excel
   - Analytics dashboard
   - QR code scanning

4. **Production Deployment**
   - Docker Compose for all services
   - Nginx reverse proxy
   - SSL certificates
   - Database backup

## 🆘 Troubleshooting

### "Network Error" in Frontend
- Check if API is running: `curl http://localhost:3001/health`
- Check CORS in `api/src/main.ts`

### "Failed to connect to blockchain"
- Check Docker containers: `docker ps`
- Restart blockchain: `docker-compose restart`

### TypeScript Errors
- Rebuild API: `cd api && npm run build`
- Check for missing dependencies: `npm install`

## 📚 Files Modified

### Frontend
- ✅ `src/services/api.js` (NEW)
- ✅ `src/components/CardTest.jsx`
- ✅ `src/components/VisitTest.jsx`
- ✅ `src/components/ClaimTest.jsx`
- ✅ `src/components/NetworkStatus.jsx`
- ✅ `.env` (NEW)
- ✅ `vite.config.js`

### Backend
- ✅ `src/main.ts` (CORS updated)
- ✅ `src/routes/*.ts` (All route files fixed)
- ✅ `src/fabric/connection.ts`
- ✅ `src/fabric/blockchain.service.ts`
- ✅ `.env`

### Scripts
- ✅ `start-system.ps1` (NEW)

---

**System is now fully integrated and ready to use!** 🎉
