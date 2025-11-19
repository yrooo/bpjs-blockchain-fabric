# Frontend Components Reference

Quick reference guide for all React components in the test dashboard.

## Component Overview

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| App | `App.jsx` | Main dashboard with tab navigation | ✅ Complete |
| NetworkStatus | `NetworkStatus.jsx` | Network monitoring | ✅ Complete |
| CardTest | `CardTest.jsx` | BPJS card operations | ✅ Complete |
| VisitTest | `VisitTest.jsx` | Patient visit management | ✅ Complete |
| ClaimTest | `ClaimTest.jsx` | Insurance claim processing | ✅ Complete |
| ChaincodeTest | `ChaincodeTest.jsx` | Direct chaincode invocation | ✅ Complete |
| DebugConsole | `DebugConsole.jsx` | Log viewer and analysis | ✅ Complete |

---

## App.jsx

**Location:** `src/App.jsx`

### Purpose
Main application container with tab navigation system and centralized logging.

### Features
- 6-tab navigation system
- Centralized log management
- State management for logs
- Dynamic component rendering
- Responsive layout

### State Management
```javascript
const [activeTab, setActiveTab] = useState('network')
const [logs, setLogs] = useState([])
```

### Tabs
1. `network` - Network Status
2. `card` - Card Test
3. `visit` - Visit Test
4. `claim` - Claim Test
5. `chaincode` - Chaincode Test
6. `debug` - Debug Console

### Functions
- `addLog(type, message, data)` - Add entry to log
- `clearLogs()` - Clear all logs

---

## NetworkStatus.jsx

**Location:** `src/components/NetworkStatus.jsx`

### Purpose
Monitor blockchain network health and display component status.

### Features
- Connection status checking
- Network component display (peers, orderers, channels)
- Organization information cards
- System information display
- Refresh functionality

### Simulated Data
- 6 peers (2 per organization)
- 5 ordering nodes
- 1 channel (bpjschannel)
- 3 organizations

### API Calls
- `GET /api/network/status` (simulated)

### Components Displayed

#### Connection Status
- API Connection (Online/Offline)
- Blockchain Connection (Online/Offline)

#### Network Components
- Peers: 6 (BPJS: 2, RS: 2, Puskesmas: 2)
- Orderers: 5 (Raft consensus)
- Channels: 1

#### Organization Cards
1. **BPJS** - National Insurance Authority
2. **Rumah Sakit** - Hospital Network
3. **Puskesmas** - Community Clinics

---

## CardTest.jsx

**Location:** `src/components/CardTest.jsx`

### Purpose
Test BPJS card issuance and verification operations.

### Features
- Issue new BPJS cards
- Verify existing cards
- Generate sample data
- QR code display area
- Form validation

### Form Fields (10)
1. Card ID
2. Patient ID
3. Patient Name
4. NIK (National ID)
5. Date of Birth
6. Gender
7. Address
8. Card Type (PBI/Non-PBI)
9. Issue Date
10. Expiry Date

### Operations

#### Issue Card
```javascript
POST /api/card/issue
{
  cardID, patientID, patientName, nik,
  dateOfBirth, gender, address, cardType,
  issueDate, expiryDate
}
```

#### Verify Card
```javascript
GET /api/card/verify/:cardID
```

### Sample Data Generator
Generates realistic test data with Indonesian names and addresses.

---

## VisitTest.jsx

**Location:** `src/components/VisitTest.jsx`

### Purpose
Test patient visit recording and history retrieval.

### Features
- Record patient visits
- Retrieve patient history
- Facility type selection
- Diagnosis and treatment input
- Sample data generation

### Form Fields (14)
1. Visit ID
2. Card ID
3. Patient ID
4. Patient Name
5. Faskes Code
6. Faskes Name
7. Faskes Type (rumahsakit/puskesmas/klinik)
8. Visit Date
9. Visit Type (outpatient/inpatient/emergency)
10. Diagnosis
11. Treatment
12. Doctor Name
13. Doctor ID
14. Notes

### Operations

#### Record Visit
```javascript
POST /api/visit/record
{
  visitID, cardID, patientID, patientName,
  faskesCode, faskesName, faskesType,
  visitDate, visitType, diagnosis, treatment,
  doctorName, doctorID, notes
}
```

#### Get Patient History
```javascript
GET /api/visit/history/:patientID
```

### Visit Types
- `outpatient` - Rawat Jalan
- `inpatient` - Rawat Inap
- `emergency` - Emergency

---

## ClaimTest.jsx

**Location:** `src/components/ClaimTest.jsx`

### Purpose
Test insurance claim submission and processing workflow.

### Features
- Submit new claims
- Process claims (approve/reject)
- Get claim history
- Indonesian Rupiah amounts
- Claim type selection

### Form Fields (13)
1. Claim ID
2. Patient ID
3. Patient Name
4. Card ID
5. Visit ID
6. Faskes Code
7. Faskes Name
8. Claim Type (rawat-jalan/rawat-inap/emergency)
9. Service Date
10. Diagnosis
11. Treatment
12. Total Amount (IDR)
13. Claim Amount (IDR)

### Operations

#### Submit Claim
```javascript
POST /api/claim/submit
{
  claimID, patientID, patientName, cardID,
  visitID, faskesCode, faskesName, claimType,
  serviceDate, diagnosis, treatment,
  totalAmount, claimAmount
}
```

#### Process Claim
```javascript
POST /api/claim/process
{
  claimID, status: 'approved'|'rejected',
  reviewNotes
}
```

#### Get Patient Claims
```javascript
GET /api/claim/history/:patientID
```

### Claim Types
- `rawat-jalan` - Outpatient treatment
- `rawat-inap` - Inpatient treatment
- `emergency` - Emergency care

### Claim Status Flow
1. `submitted` - Initial submission
2. `approved` - Approved for payment (70% chance)
3. `rejected` - Rejected (30% chance)
4. `paid` - Payment completed

---

## ChaincodeTest.jsx

**Location:** `src/components/ChaincodeTest.jsx`

### Purpose
Test blockchain chaincode functions directly with custom arguments.

### Features
- Function selector (11 functions)
- Function descriptions
- Required arguments display
- JSON argument editor
- Example data loader
- Invoke vs Query operations
- Transaction result display

### Available Functions

#### 1. IssueCard
**Description:** Issue a new BPJS card  
**Args:** cardID, patientID, patientName, nik, dateOfBirth, gender, address, cardType, issueDate, expiryDate

#### 2. VerifyCard
**Description:** Verify a BPJS card  
**Args:** cardID

#### 3. UpdateCardStatus
**Description:** Update card status  
**Args:** cardID, newStatus, reason

#### 4. RecordVisit
**Description:** Record a patient visit  
**Args:** visitID, cardID, patientID, patientName, faskesCode, faskesName, faskesType, visitDate, visitType, diagnosis, treatment, doctorName, doctorID, notes

#### 5. GetPatientVisits
**Description:** Get all visits for a patient  
**Args:** patientID

#### 6. CreateReferral
**Description:** Create a referral  
**Args:** referralID, patientID, patientName, cardID, fromFaskesCode, fromFaskesName, toFaskesCode, toFaskesName, referralReason, diagnosis, referringDoctor, referralDate, validUntil, notes

#### 7. UpdateReferralStatus
**Description:** Update referral status  
**Args:** referralID, newStatus, acceptedBy, notes

#### 8. SubmitClaim
**Description:** Submit an insurance claim  
**Args:** claimID, patientID, patientName, cardID, visitID, faskesCode, faskesName, claimType, serviceDate, diagnosis, treatment, totalAmount, claimAmount

#### 9. ProcessClaim
**Description:** Process a claim (approve/reject)  
**Args:** claimID, newStatus, reviewNotes

#### 10. GetPatientClaims
**Description:** Get all claims for a patient  
**Args:** patientID

#### 11. QueryAuditLogs
**Description:** Query audit logs  
**Args:** startKey, endKey

### Operations

#### Invoke (Write)
Submits a transaction to the blockchain. Creates/updates data.

#### Query (Read)
Reads data from the blockchain. No state changes.

### Example Usage
```javascript
// Select function: IssueCard
// Click "Load Example Args"
// Arguments populated:
["CARD001", "P001", "John Doe", "1234567890123456", ...]

// Click "Invoke" or "Query"
```

---

## DebugConsole.jsx

**Location:** `src/components/DebugConsole.jsx`

### Purpose
Display and analyze all logs from operations across all components.

### Features
- Real-time log display
- Filter by type (all/success/error/warning/info)
- Expandable log details
- Copy individual logs
- Download all logs as JSON
- Statistics dashboard
- Auto-scroll toggle

### Log Structure
```javascript
{
  timestamp: "2024-01-01T12:00:00.000Z",
  type: "success|error|warning|info",
  message: "Operation description",
  data: { /* optional additional data */ }
}
```

### Log Types

#### Success (Green)
Successful operations, confirmations

#### Error (Red)
Failed operations, exceptions

#### Warning (Yellow)
Non-critical issues, alerts

#### Info (Blue)
General information, queries

### Features

#### Statistics Dashboard
- Success count
- Error count
- Warning count
- Info count

#### Filtering
- View all logs
- Filter by specific type
- Count display for each type

#### Log Actions
- **Show/Hide Data** - Expand/collapse JSON data
- **Copy** - Copy log to clipboard
- **Download** - Export all logs as JSON file

#### Auto-Scroll
Toggle automatic scrolling to latest logs

### Usage
```javascript
// In any component
addLog('success', 'Card issued successfully', {
  cardID: 'CARD001',
  timestamp: new Date()
})

// In Debug Console
// - Filter by "success"
// - Click "Show Data" to see details
// - Click "Copy" to copy log
// - Click "Download Logs" to export
```

---

## Common Patterns

### Adding Logs
All components receive `addLog` as a prop:
```javascript
function ComponentName({ addLog }) {
  const handleOperation = async () => {
    addLog('info', 'Starting operation...')
    
    try {
      // ... operation code
      addLog('success', 'Operation completed!', { result })
    } catch (error) {
      addLog('error', 'Operation failed', error.message)
    }
  }
}
```

### Simulated API Calls
All components use simulated delays:
```javascript
// Simulate API call
await new Promise(resolve => setTimeout(resolve, 2000))

// Return mock data
const response = {
  success: true,
  data: { /* mock data */ }
}
```

### Sample Data Generation
All form components include sample data generators:
```javascript
const generateSampleData = () => {
  setFormData({
    id: 'ID' + Date.now(),
    name: 'Sample Name',
    // ... other fields
  })
  addLog('info', 'Sample data generated')
}
```

### Status Badges
Consistent status badge styling:
```javascript
<span className="status-badge" data-status="active">
  ACTIVE
</span>
```

Status colors:
- `active` / `approved` / `paid` - Green
- `rejected` / `suspended` - Red
- `submitted` / `pending` - Yellow
- `completed` / `info` - Blue

---

## Styling Reference

### Main Theme
- **Background:** `#1a1a2e` (dark blue)
- **Surface:** `#16213e` (lighter blue)
- **Accent:** `#e94560` (red)
- **Success:** `#00ff88` (green)
- **Info:** `#00d4ff` (cyan)

### Component Classes

#### Container
```css
.component-container {
  background: gradient;
  border-radius: 12px;
  padding: 2rem;
}
```

#### Section
```css
.section {
  background: #16213e;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
```

#### Form Group
```css
.form-group {
  margin-bottom: 1.5rem;
}
```

#### Button
```css
.btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}
```

#### Status Badge
```css
.status-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
}
```

---

## Testing Checklist

### For Each Component:
- [ ] Component loads without errors
- [ ] All form fields render correctly
- [ ] Sample data generator works
- [ ] Primary action button works
- [ ] Result display shows data
- [ ] Logs are added to Debug Console
- [ ] Styling is consistent
- [ ] Responsive on mobile

### Integration Testing:
- [ ] Tab switching works smoothly
- [ ] Logs persist across tab changes
- [ ] Multiple operations can be performed
- [ ] Debug Console shows all logs
- [ ] Filters work correctly
- [ ] Download logs function works

---

## Maintenance Notes

### Adding New Components:
1. Create component file in `src/components/`
2. Import in `App.jsx`
3. Add tab to navigation
4. Ensure `addLog` prop is passed
5. Follow existing patterns for consistency
6. Update this reference document

### Modifying Existing Components:
1. Test thoroughly in development
2. Check responsive design
3. Verify logging still works
4. Update documentation if needed

### Common Issues:
- **Logs not showing:** Check `addLog` is called correctly
- **Styling broken:** Check CSS class names
- **Component not rendering:** Check import in App.jsx
- **Data not persisting:** Expected - data is in-memory only

---

## File Structure Summary

```
frontend-web/src/
├── App.jsx                      # Main app (262 lines)
├── App.css                      # Styling (415 lines)
└── components/
    ├── NetworkStatus.jsx        # Network monitoring (155 lines)
    ├── CardTest.jsx            # Card operations (235 lines)
    ├── VisitTest.jsx           # Visit recording (295 lines)
    ├── ClaimTest.jsx           # Claim processing (310 lines)
    ├── ChaincodeTest.jsx       # Direct chaincode (280 lines)
    └── DebugConsole.jsx        # Log viewer (265 lines)

Total: ~2,217 lines of React code
```

---

## API Endpoints (Simulated)

All endpoints are currently simulated. Future implementation will connect to actual backend.

### Network
- `GET /api/network/status`

### Card
- `POST /api/card/issue`
- `GET /api/card/verify/:cardID`

### Visit
- `POST /api/visit/record`
- `GET /api/visit/history/:patientID`

### Claim
- `POST /api/claim/submit`
- `POST /api/claim/process`
- `GET /api/claim/history/:patientID`

### Chaincode
- `POST /api/chaincode/invoke`
- `POST /api/chaincode/query`

---

**Last Updated:** December 2024  
**Status:** All components complete and functional  
**Next Steps:** Connect to real API backend
