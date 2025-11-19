# BPJS Blockchain Project: Full Implementation Guide (Hyperledger Fabric Edition)

## 1. Executive Summary

**BPJS Blockchain** adalah solusi digital berbasis Hyperledger Fabric yang mengintegrasikan kartu BPJS digital, riwayat pelayanan kesehatan, pengelolaan rujukan, dan proses klaim otomatis untuk efisiensi dan audit diseluruh fasilitas kesehatan Indonesia.

---

## 2. System Overview
- **Permissioned Blockchain**: Hyperledger Fabric, multi-org (BPJS, Rumah Sakit, Puskesmas)
- **Consensus**: Raft ordering service (high throughput, HA, trusted parties)
- **Transactions**: Semua histori/klaim/rujukan/medis otomatis tercatat on-chain
- **Privacy Channels**: Channels terpisah untuk regional/data privasi
- **Endorsement Policy**: Multi-org approval untuk claim, visit, rujukan
- **Frontend**: React/React Native web/mobile & admin dashboard
- **API**: Node.js/NestJS dengan Fabric SDK
- **Authentication**: x.509 Cert, RBAC, MFA untuk admin/faskes

---

## 3. Major Features
- **Digital BPJS Card**: QR/barcode, status real-time, issue/disable/replace
- **On-chain Medical/Claim History**: Semua kunjungan, rujukan, klaim tercatat
- **Automation & Smart Contracts**: Process visits, claims, referrals, on-chain
- **Analytics Dashboard**: Untuk BPJS, faskes, admin, fraud detection, queue
- **Audit Trail, Compliance, Data Encryption, RBAC**

---

## 4. Database & Storing Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| Blockchain On-chain | Hyperledger Fabric Ledger | Store all immutable transactions (card issuance, claims, referrals, visits) |
| World State DB | CouchDB (by Fabric Peers) | KV Store for latest state (e.g. valid/active cards, patient info, last claim status etc) |
| Off-chain Document | IPFS or S3/MinIO | Store heavy files (scan, PDF, surat rujukan, image, audit logs) |
| Relational Analytics | PostgreSQL/MongoDB | Store aggregated analytics, logs, fast reporting, cache |

---

## 5. Step-by-Step Hyperledger Fabric Implementation

### A. Preparation
1. **Install Docker, Docker Compose, Go, Node.js, Hyperledger Fabric Binaries**
2. **Clone Fabric Samples**, generate cert/CA for your Organizations
3. **Configure configtx.yaml, crypto-config.yaml** for orgs/orderers/peers/channels
4. **Set up Raft ordering service** in your config files

### B. Network Bootstrapping
1. Create necessary organizations (BPJS, RS, Puskesmas)
2. Generate x.509 certs for all nodes (orderer, peers)
3. Start network using docker-compose
4. Create main and regional channels (bpjs-main, bpjs-jawa, bpjs-sumatera...)
5. Join all peers to relevant channels

### C. Chaincode/Smart Contract Development

**Design Smart Contract Modules:**
- `BPJSCardContract`: Issue/replace/suspend BPJS card (digital)
- `PatientVisitContract`: Record patient visits with detail, verify card
- `ReferralContract`: Create/track/approve rujukan berjenjang
- `MedicalRecordContract`: Store on-chain hashes, encrypt links to off-chain storage
- `ClaimContract`: Auto-process claim submissions, status, approve/reject workflows
- `AuditContract`: Generate immutable audit logs

**Structure:**
- Each contract as Go file (e.g. `bpjs_card.go`, `visit.go`, `referral.go`, `claim.go`)
- Compose main chaincode merger (single smart contract deployment for maintainability)

**Typical Methods:**
```go
func IssueCard(ctx, cardID, patientID, patientName, issueDate, expiryDate) error
func RecordVisit(ctx, visitID, cardID, patientID, faskesCode, diagnosis, treatment, visitDate) error
func CreateReferral(ctx, referralID, patientID, fromFaskes, toFaskes, reason, doctorName, referralDate) error
func SubmitClaim(ctx, claimID, patientID, faskesCode, amount, details) error
func ApproveClaim(ctx, claimID, status, remarks) error
func GetPatientHistory(ctx, patientID) []Visit
func AuditAction(ctx, action, actorID, desc, timestamp) error
```

**Deploy Chaincode:**
- Package, install, approve, and commit your chaincode for each org
- Set endorsement policy (AND('BPJS.member','RS.member')) for sensitive transaction (claim)

### D. Integrate API + Web/Mobile
- Connect backend API (Node.js or Python w/ Fabric SDK) to chaincode
- Build frontend with public/private endpoints, scan QR for card validation
- Integrate with SATUSEHAT/MobileJKN via REST

### E. Off-chain Storage Integration
- On-chain: Save only hash/links of files (medical images, scans)
- Store physical files in IPFS/S3 with encrypted access
- Chaincode can validate file authenticity by matching hashes

### F. Security
- TLS/SSL for all peer/orderer communication
- x.509 cert RBAC: Only authorized node/org can act
- Endorsement policy: Multi-signature needed for sensitive ops
- Periodic chaincode audit and monitoring

### G. Monitoring & Compliance
- Setup Prometheus + Grafana for chain/peer/orderer monitoring
- Use blockchain explorer to visualize transactions, blocks, events
- Enable audit logging on-chain and off-chain for all actions
- Regular penetration test, disaster recovery planning

---

## 6. Example User Stories (BPJS Context)

- **Pasien:** "Saya scan BPJS card digital via QR code di loket RS. Petugas langsung tahu status aktif, riwayat visit, dan rujukan saya."
- **Petugas RS:** "Saya input data tindakan, langsung tercatat di blockchain, otomatis muncul klaim pending di dashboard BPJS."
- **BPJS Admin:** "Saya lihat dashboard, real-time claim dari seluruh rumah sakit dan status approval, serta audit trail."
- **Kemenkes/Regulator:** "Audit trail visit, rujukan, dan klaim selalu tersedia on-chain/off-chain secara compliance."

---

## 7. Testing & Deployment
- End-to-end test flow: card issuance → visit → rujukan → klaim → audit → dashboard reporting
- Stress/load test with k6/JMeter
- Deploy multi-region nodes for high availability
- Configure alerts, backup, weekly review for upgrade security patches

---

## 8. Future Roadmap
- Telemedicine/E-referral integration
- Distributed analytics + fraud detection via smart contract + off-chain ML
- Scale onboarding to thousands of faskes
- Research token-based incentives (health rewards)

---

## 9. Resources
- Hyperledger Fabric official docs: https://hyperledger-fabric.readthedocs.io/en/release-2.5
- SATUSEHAT API docs: https://satusehat.kemkes.go.id
- Example chaincode: https://github.com/hyperledger/fabric-samples/tree/main/chaincode
- BPJS Kesehatan digitalization references


---

Dokumentasi ini adalah guideline komprehensif untuk mulai, implementasi, hingga scaling project BPJS Blockchain dengan Hyperledger Fabric di konteks enterprise Indonesia.