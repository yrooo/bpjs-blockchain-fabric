# Quick Start Guide - BPJS Blockchain Frontend

## 🚀 Fastest Way to Test (Frontend Only)

This is perfect for your 8GB RAM Windows laptop!

### Step 1: Open PowerShell
Press `Win + X` and select "Windows PowerShell"

### Step 2: Navigate to Frontend Directory
```powershell
cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\frontend-web
```

### Step 3: Install Dependencies (First Time Only)
```powershell
npm install
```

This will take 2-3 minutes. You only need to do this once.

### Step 4: Start the Development Server
```powershell
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5: Open Your Browser
Open **Chrome** or **Edge** and go to:
```
http://localhost:5173
```

## 🎯 What You'll See

### The Dashboard
A dark-themed dashboard with 6 tabs:

1. **🌐 Network Status** - View blockchain network status
2. **💳 Card Test** - Issue and verify BPJS cards
3. **🏥 Visit Test** - Record patient visits
4. **💰 Claim Test** - Submit and process insurance claims
5. **📜 Chaincode Test** - Test blockchain functions directly
6. **🐛 Debug Console** - View all logs and operations

## 📝 Quick Test Flow

### Test 1: Issue a BPJS Card

1. Click on **"💳 Card Test"** tab
2. Click **"📝 Generate Sample Data"** button
3. Review the auto-filled data
4. Click **"💳 Issue New Card"** button
5. See success message and result!

### Test 2: Record a Patient Visit

1. Click on **"🏥 Visit Test"** tab
2. Click **"📝 Generate Sample Data"** button
3. Click **"📋 Record Visit"** button
4. Try **"📂 Get Patient History"** to see visit records

### Test 3: Submit an Insurance Claim

1. Click on **"💰 Claim Test"** tab
2. Click **"📝 Generate Sample Data"** button
3. Click **"💰 Submit Claim"** button
4. Use **"✅ Approve"** or **"❌ Reject"** to process the claim

### Test 4: View Debug Logs

1. Click on **"🐛 Debug Console"** tab
2. See all your operations logged
3. Filter by Success/Error/Warning/Info
4. Click **"Show Data"** on any log to see details
5. Click **"💾 Download Logs"** to save logs

## 🎨 Features You Can Try

### In Every Component:
- **Generate Sample Data** - Auto-fill forms with realistic test data
- **Clear Results** - JSON-formatted responses
- **Color-Coded Status** - Visual feedback for operations
- **Real-Time Logging** - All actions logged to Debug Console

### In Network Status:
- View connection status
- See network components (Orderers, Peers, Channels)
- Check organization info (BPJS, Rumah Sakit, Puskesmas)

### In Chaincode Test:
- Select any blockchain function
- See required arguments
- Load example data
- Choose between Invoke (write) or Query (read)

### In Debug Console:
- Filter logs by type
- Expand/collapse log details
- Copy individual logs
- Download all logs as JSON
- See statistics (success/error counts)
- Auto-scroll to latest logs

## ⚙️ Current Setup

**Important Notes:**
- ✅ Frontend is using **simulated API calls** (no blockchain needed!)
- ✅ All operations have 1-2 second delays to simulate real API
- ✅ Data is stored in browser memory (resets on refresh)
- ✅ Perfect for UI testing and development
- ✅ Uses only ~300-500MB RAM

## 🛠️ Useful Commands

### Start the server:
```powershell
npm run dev
```

### Stop the server:
Press `Ctrl + C` in PowerShell

### Restart after code changes:
The server auto-reloads! Just save your files and refresh the browser.

### Build for production:
```powershell
npm run build
```

### Preview production build:
```powershell
npm run preview
```

## 🎯 Testing Checklist

Try all these features to verify everything works:

### Network Status Tab
- [ ] Check connection status (should show "Connected")
- [ ] See 6 peers listed
- [ ] See 5 orderers listed
- [ ] See 3 organizations (BPJS, RS, Puskesmas)
- [ ] Click "🔄 Refresh Status" button

### Card Test Tab
- [ ] Click "Generate Sample Data"
- [ ] Issue a new card
- [ ] Copy the Card ID from result
- [ ] Paste into "Verify Card" field
- [ ] Verify the card
- [ ] See success message

### Visit Test Tab
- [ ] Generate sample visit data
- [ ] Record a visit
- [ ] Get patient history
- [ ] See multiple visits listed

### Claim Test Tab
- [ ] Generate sample claim data
- [ ] Submit a claim
- [ ] Copy the Claim ID
- [ ] Process the claim (approve/reject)
- [ ] Get patient claims history

### Chaincode Test Tab
- [ ] Select different functions from dropdown
- [ ] Read function descriptions
- [ ] Load example arguments
- [ ] Try "Invoke" button
- [ ] Try "Query" button
- [ ] See transaction IDs in results

### Debug Console Tab
- [ ] See all previous operations logged
- [ ] Filter by "Success" only
- [ ] Filter by "Error" only
- [ ] Click "Show Data" on a log entry
- [ ] Copy a log to clipboard
- [ ] Download all logs
- [ ] Click "Clear Logs"
- [ ] Toggle "Auto Scroll" checkbox

## 🌈 UI Tips

### Color Coding:
- **Green** = Success operations
- **Red** = Errors or rejections
- **Yellow** = Warnings
- **Blue** = Information and queries

### Status Badges:
- `ACTIVE` - Green badge
- `APPROVED` - Green badge
- `REJECTED` - Red badge
- `SUBMITTED` - Yellow badge
- `PAID` - Blue badge

### Form Tips:
- Required fields marked with (required)
- Date fields use format: YYYY-MM-DD
- Amounts are in Indonesian Rupiah (IDR)
- Sample data generators save time!

## 🚨 Troubleshooting

### Problem: npm install fails

**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules
Remove-Item -Recurse -Force node_modules

# Try again
npm install
```

### Problem: Port 5173 already in use

**Solution:**
```powershell
# Kill any process using port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force

# Or use a different port
npm run dev -- --port 3000
```

### Problem: Page not loading

**Solution:**
1. Check PowerShell - server should be running
2. Check URL: http://localhost:5173 (not https)
3. Try clearing browser cache (Ctrl + Shift + Delete)
4. Try incognito mode

### Problem: Changes not showing

**Solution:**
- Hard refresh: `Ctrl + Shift + R`
- Or clear cache and refresh
- Check if dev server is running

## 📱 Next Steps

### Want to connect to real blockchain?

1. See `TESTING_GUIDE_8GB.md` for Mode 2/3 instructions
2. You'll need Docker Desktop installed
3. Requires more RAM (2.5-5GB)

### Want to develop more features?

Key files to edit:
- `src/App.jsx` - Main dashboard and tab logic
- `src/components/*.jsx` - Individual component features
- `src/App.css` - Styling and themes

### Want to deploy?

```powershell
# Build production version
npm run build

# Output will be in 'dist' folder
# Deploy 'dist' to any static hosting (Vercel, Netlify, etc.)
```

## 🎉 You're All Set!

The frontend is now running with all test and debug components. Everything is simulated so you can test the UI without needing to run the heavy blockchain network.

**Memory Usage:** Only ~500MB total!

**Perfect for:**
- UI/UX development
- Component testing
- Demo presentations
- Learning blockchain concepts
- Frontend debugging

---

**Questions?** Check the full testing guide: `TESTING_GUIDE_8GB.md`

**Ready to test with real blockchain?** Follow Mode 2 in the testing guide.

**Enjoy testing! 🚀**
