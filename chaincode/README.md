# BPJS Healthcare Chaincode

Go-based Hyperledger Fabric chaincode for managing Indonesia's BPJS (National Health Insurance) healthcare system on blockchain.

## Overview

This chaincode implements a complete healthcare management system with:
- **Digital BPJS Cards** - Issue, verify and manage patient cards
- **Visit Recording** - Record and track patient visits to healthcare facilities
- **Referral System** - Manage patient referrals between facilities
- **Claims Processing** - Submit and process insurance claims
- **Audit Trail** - Complete immutable audit logging

## Functions

### Card Management

#### IssueCard
Creates a new BPJS card for a patient.

**Parameters:**
- `cardID` (string) - Unique card identifier
- `patientID` (string) - Patient identifier
- `patientName` (string) - Patient full name
- `nik` (string) - National ID number (16 digits)
- `dateOfBirth` (string) - Format: YYYY-MM-DD
- `gender` (string) - Male/Female
- `address` (string) - Patient address
- `cardType` (string) - PBI or Non-PBI
- `issueDate` (string) - Format: YYYY-MM-DD
- `expiryDate` (string) - Format: YYYY-MM-DD

**Example:**
```bash
peer chaincode invoke -C bpjschannel -n bpjs -c '{"Args":["IssueCard","CARD001","P001","Budi Santoso","1234567890123456","1990-01-01","Male","Jakarta","PBI","2024-01-01","2025-01-01"]}'
```

#### VerifyCard
Verifies a BPJS card and returns card details if active.

**Parameters:**
- `cardID` (string) - Card ID to verify

**Example:**
```bash
peer chaincode query -C bpjschannel -n bpjs -c '{"Args":["VerifyCard","CARD001"]}'
```

#### UpdateCardStatus
Updates card status (suspend, reactivate, etc).

**Parameters:**
- `cardID` (string) - Card ID
- `newStatus` (string) - active/inactive/suspended
- `reason` (string) - Reason for status change

**Example:**
```bash
peer chaincode invoke -C bpjschannel -n bpjs -c '{"Args":["UpdateCardStatus","CARD001","suspended","Payment overdue"]}'
```

### Visit Recording

#### RecordVisit
Records a patient visit to a healthcare facility.

**Parameters:**
- `visitID` (string) - Unique visit identifier
- `cardID` (string) - Patient's BPJS card ID
- `patientID` (string) - Patient ID
- `patientName` (string) - Patient name
- `faskesCode` (string) - Healthcare facility code
- `faskesName` (string) - Facility name
- `faskesType` (string) - puskesmas/rumahsakit/klinik
- `visitDate` (string) - Format: YYYY-MM-DD
- `visitType` (string) - outpatient/inpatient/emergency
- `diagnosis` (string) - Medical diagnosis
- `treatment` (string) - Treatment provided
- `doctorName` (string) - Attending doctor
- `doctorID` (string) - Doctor identifier
- `notes` (string) - Additional notes

**Example:**
```bash
peer chaincode invoke -C bpjschannel -n bpjs -c '{"Args":["RecordVisit","VISIT001","CARD001","P001","Budi Santoso","RS001","RS Siloam","rumahsakit","2024-01-15","outpatient","Flu","Medicine prescribed","Dr. Smith","DOC001","Regular checkup"]}'
```

#### GetPatientVisits
Retrieves all visits for a patient.

**Parameters:**
- `patientID` (string) - Patient ID

**Example:**
```bash
peer chaincode query -C bpjschannel -n bpjs -c '{"Args":["GetPatientVisits","P001"]}'
```

### Referral Management

#### CreateReferral
Creates a referral from one facility to another.

**Parameters:**
- `referralID` (string) - Unique referral ID
- `patientID` (string) - Patient ID
- `patientName` (string) - Patient name
- `cardID` (string) - BPJS card ID
- `fromFaskesCode` (string) - Referring facility code
- `fromFaskesName` (string) - Referring facility name
- `toFaskesCode` (string) - Destination facility code
- `toFaskesName` (string) - Destination facility name
- `referralReason` (string) - Reason for referral
- `diagnosis` (string) - Current diagnosis
- `referringDoctor` (string) - Referring doctor
- `referralDate` (string) - Format: YYYY-MM-DD
- `validUntil` (string) - Format: YYYY-MM-DD
- `notes` (string) - Additional notes

**Example:**
```bash
peer chaincode invoke -C bpjschannel -n bpjs -c '{"Args":["CreateReferral","REF001","P001","Budi","CARD001","PKM001","Puskesmas Kelapa","RS001","RS Siloam","Need specialist","Complex case","Dr. Lee","2024-01-15","2024-02-15","Urgent"]}'
```

#### UpdateReferralStatus
Updates referral status.

**Parameters:**
- `referralID` (string) - Referral ID
- `newStatus` (string) - pending/accepted/completed/expired
- `acceptedBy` (string) - Staff/doctor accepting
- `notes` (string) - Status notes

**Example:**
```bash
peer chaincode invoke -C bpjschannel -n bpjs -c '{"Args":["UpdateReferralStatus","REF001","accepted","Dr. Wong","Patient scheduled"]}'
```

### Claims Processing

#### SubmitClaim
Submits an insurance claim.

**Parameters:**
- `claimID` (string) - Unique claim ID
- `patientID` (string) - Patient ID
- `patientName` (string) - Patient name
- `cardID` (string) - BPJS card ID
- `visitID` (string) - Related visit ID
- `faskesCode` (string) - Facility code
- `faskesName` (string) - Facility name
- `claimType` (string) - rawat-jalan/rawat-inap/emergency
- `serviceDate` (string) - Format: YYYY-MM-DD
- `diagnosis` (string) - Diagnosis
- `treatment` (string) - Treatment provided
- `totalAmount` (float64) - Total bill amount (IDR)
- `claimAmount` (float64) - Claimed amount (IDR)

**Example:**
```bash
peer chaincode invoke -C bpjschannel -n bpjs -c '{"Args":["SubmitClaim","CLAIM001","P001","Budi","CARD001","VISIT001","RS001","RS Siloam","rawat-jalan","2024-01-15","Flu","Consultation + medicine","500000","450000"]}'
```

#### ProcessClaim
Processes a claim (approve/reject).

**Parameters:**
- `claimID` (string) - Claim ID
- `newStatus` (string) - approved/rejected
- `reviewNotes` (string) - Review comments

**Example:**
```bash
peer chaincode invoke -C bpjschannel -n bpjs -c '{"Args":["ProcessClaim","CLAIM001","approved","All documents verified"]}'
```

#### GetPatientClaims
Retrieves all claims for a patient.

**Parameters:**
- `patientID` (string) - Patient ID

**Example:**
```bash
peer chaincode query -C bpjschannel -n bpjs -c '{"Args":["GetPatientClaims","P001"]}'
```

### Audit Functions

#### QueryAuditLogs
Queries audit logs within a range.

**Parameters:**
- `startKey` (string) - Start key for range
- `endKey` (string) - End key for range

**Example:**
```bash
peer chaincode query -C bpjschannel -n bpjs -c '{"Args":["QueryAuditLogs","AUDIT_0","AUDIT_999999999999999"]}'
```

## Data Structures

### BPJSCard
```go
type BPJSCard struct {
    CardID      string
    PatientID   string
    PatientName string
    NIK         string    // National ID
    DateOfBirth string
    Gender      string
    Address     string
    Status      string    // active/inactive/suspended
    CardType    string    // PBI/Non-PBI
    IssueDate   string
    ExpiryDate  string
    IssuedBy    string
    Timestamp   time.Time
}
```

### Visit
```go
type Visit struct {
    VisitID      string
    CardID       string
    PatientID    string
    PatientName  string
    FaskesCode   string
    FaskesName   string
    FaskesType   string    // puskesmas/rumahsakit
    VisitDate    string
    VisitType    string    // outpatient/inpatient/emergency
    Diagnosis    string
    Treatment    string
    DoctorName   string
    DoctorID     string
    Notes        string
    RecordedBy   string
    Timestamp    time.Time
}
```

### Referral
```go
type Referral struct {
    ReferralID      string
    PatientID       string
    PatientName     string
    CardID          string
    FromFaskesCode  string
    FromFaskesName  string
    ToFaskesCode    string
    ToFaskesName    string
    ReferralReason  string
    Diagnosis       string
    ReferringDoctor string
    ReferralDate    string
    ValidUntil      string
    Status          string    // pending/accepted/completed/expired
    AcceptedBy      string
    AcceptedDate    string
    Notes           string
    CreatedBy       string
    Timestamp       time.Time
}
```

### Claim
```go
type Claim struct {
    ClaimID       string
    PatientID     string
    PatientName   string
    CardID        string
    VisitID       string
    FaskesCode    string
    FaskesName    string
    ClaimType     string    // rawat-jalan/rawat-inap/emergency
    ServiceDate   string
    Diagnosis     string
    Treatment     string
    TotalAmount   float64
    ClaimAmount   float64
    Status        string    // submitted/reviewing/approved/rejected/paid
    SubmittedBy   string
    SubmitDate    string
    ReviewedBy    string
    ReviewDate    string
    ReviewNotes   string
    PaymentDate   string
    Timestamp     time.Time
}
```

## Development

### Prerequisites
- Go 1.20+
- Hyperledger Fabric 2.5+

### Build
```bash
cd chaincode
go mod tidy
go build
```

### Test
```bash
go test -v
```

### Package for Deployment
```bash
peer lifecycle chaincode package bpjs.tar.gz --path . --lang golang --label bpjs_1
```

## Deployment

See `scripts/CHAINCODE_DEPLOY_INSTRUCTIONS.md` for detailed deployment steps.

Quick deployment:
```bash
cd scripts
chmod +x deploy-chaincode-template.sh
./deploy-chaincode-template.sh
```

## Features

✅ **Immutable Records** - All healthcare data stored on blockchain  
✅ **Composite Keys** - Efficient querying by patientID  
✅ **Audit Trail** - Automatic logging of all operations  
✅ **Events** - Emit events for card issuance, claims, etc.  
✅ **Validation** - Card verification before operations  
✅ **Multi-Org Support** - Works with BPJS, Hospitals, Clinics  

## Security

- All transactions require valid client identity
- Card verification before recording visits/claims
- Patient ID matching enforced
- MSP-based organization identification
- Automatic audit logging of all actions

## License

This chaincode is part of the BPJS Blockchain Healthcare System project.
