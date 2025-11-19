# BPJS Blockchain Project - Complete Implementation Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Prerequisites](#prerequisites)
4. [Installation & Setup](#installation--setup)
5. [Network Configuration](#network-configuration)
6. [Chaincode (Smart Contracts)](#chaincode-smart-contracts)
7. [API Backend](#api-backend)
8. [Frontend Applications](#frontend-applications)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### What is This Project?

The **BPJS Blockchain System** is a comprehensive blockchain-based solution for Indonesia's national health insurance (BPJS Kesehatan) that serves over 277 million participants. It digitizes and secures healthcare transactions including:

- **Digital BPJS Cards** - QR-code based instant verification
- **Patient Visit Records** - Immutable medical history across facilities
- **Referral Management** - Multi-tier healthcare coordination
- **Claims Processing** - Automated insurance claim workflows
- **Audit & Compliance** - Complete transparency for regulators

### Why Hyperledger Fabric?

We chose Hyperledger Fabric because:

✅ **Permissioned Network** - Only verified healthcare facilities can participate  
✅ **High Performance** - 550 TPS with Raft consensus, <100ms latency  
✅ **Privacy** - Channel-based data isolation per region/organization  
✅ **Enterprise-Ready** - Production-grade security and scalability  
✅ **Multi-Organization** - BPJS, Hospitals, Clinics as separate orgs with different roles  

### Key Technologies

| Layer | Technology |
|-------|------------|
| Blockchain Platform | Hyperledger Fabric 2.5+ |
| Consensus Mechanism | Raft (5 ordering nodes) |
| Smart Contracts | Go (Golang) |
| State Database | CouchDB |
| Backend API | Node.js + Express + Fabric SDK |
| Frontend Web | React.js |
| Frontend Mobile | React Native |
| Authentication | JWT + x.509 Certificates |
| Containerization | Docker & Docker Compose |

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BPJS Blockchain System                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  Web Dashboard │  │  Mobile App    │  │  Admin Portal  │   │
│  │   (React)      │  │ (React Native) │  │   (React)      │   │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘   │
│           │                    │                    │            │
│           └────────────────────┼────────────────────┘            │
│                                │                                 │
│                    ┌───────────▼────────────┐                   │
│                    │   REST API Server      │                   │
│                    │   (Node.js + Express)  │                   │
│                    │   Fabric SDK           │                   │
│                    └───────────┬────────────┘                   │
│                                │                                 │
│     ┌──────────────────────────┼──────────────────────────┐    │
│     │        Hyperledger Fabric Blockchain Network        │    │
│     │                                                      │    │
│     │  ┌────────────────────────────────────────────┐    │    │
│     │  │      Ordering Service (Raft Consensus)     │    │    │
│     │  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐  │    │    │
│     │  │  │Order1 │ │Order2 │ │Order3 │ │Order4 │  │    │    │
│     │  │  │Leader │ │Follow │ │Follow │ │Follow │  │    │    │
│     │  │  └───────┘ └───────┘ └───────┘ └───────┘  │    │    │
│     │  └────────────────────────────────────────────┘    │    │
│     │                                                      │    │
│     │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│     │  │   BPJS   │  │  Rumah   │  │ Puskesmas│         │    │
│     │  │   Org    │  │  Sakit   │  │   Org    │         │    │
│     │  │          │  │   Org    │  │          │         │    │
│     │  │ Peer0,1  │  │ Peer0,1  │  │ Peer0,1  │         │    │
│     │  │ CouchDB  │  │ CouchDB  │  │ CouchDB  │         │    │
│     │  └──────────┘  └──────────┘  └──────────┘         │    │
│     │                                                      │    │
│     │  ┌────────────────────────────────────────────┐    │    │
│     │  │      Smart Contracts (Chaincode - Go)      │    │    │
│     │  │  • Card Management                         │    │    │
│     │  │  • Visit Recording                         │    │    │
│     │  │  • Referral System                         │    │    │
│     │  │  • Claims Processing                       │    │    │
│     │  │  • Audit Logging                           │    │    │
│     │  └────────────────────────────────────────────┘    │    │
│     │                                                      │    │
│     └──────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Organizations & Roles

| Organization | Role | Peers | Users |
|-------------|------|-------|-------|
| **BPJS** | National health insurance authority | 2 | Admin, Reviewer, Officer |
| **Rumah Sakit** | Hospitals (secondary/tertiary care) | 2 | Doctor, Staff, Admin |
| **Puskesmas** | Community health clinics (primary care) | 2 | Doctor, Staff, Admin |
| **Orderer** | Consensus & ordering service | 5 | System |

### Consensus: Raft Algorithm

We use **Raft** consensus for the ordering service:

- **5 Ordering Nodes** (1 Leader + 4 Followers)
- **Fault Tolerance**: Can survive 2 node failures
- **Performance**: 550 TPS, <100ms latency
- **Automatic Failover**: New leader elected if current leader crashes

---

## 🔧 Prerequisites

### Required Software

Before starting, ensure you have:

1. **Operating System**
   - Linux (Ubuntu 20.04+ recommended)
   - macOS (10.15+)
   - Windows 10/11 with WSL2

2. **Docker & Docker Compose**
   ```bash
   # Check versions
   docker --version   # Should be 20.10+
   docker-compose --version  # Should be 1.29+
   ```

3. **Node.js & npm**
   ```bash
   node --version  # Should be 18.x or 20.x
   npm --version   # Should be 9.x+
   ```

4. **Go Programming Language**
   ```bash
   go version  # Should be 1.20+
   ```

5. **Git**
   ```bash
   git --version
   ```

6. **Hyperledger Fabric Binaries**
   ```bash
   # Install using official script
   curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh | bash -s -- 2.5.0 1.5.5
   
   # Add to PATH
   export PATH=$PATH:$PWD/bin
   ```

### Hardware Requirements

**Minimum:**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 20 GB

**Recommended:**
- CPU: 8 cores
- RAM: 16 GB
- Storage: 50 GB SSD

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
cd d:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric
```

### Step 2: Verify Fabric Binaries

```bash
# Check if fabric binaries are accessible
cryptogen version
configtxgen --version
peer version
orderer version
```

### Step 3: Start the Blockchain Network

```bash
cd scripts

# Make scripts executable (Linux/Mac)
chmod +x start-network.sh
chmod +x deploy-chaincode.sh
chmod +x stop-network.sh

# Start the network
./start-network.sh
```

This will:
1. Generate crypto materials (certificates) for all organizations
2. Create genesis block for ordering service
3. Start 5 ordering nodes (Raft consensus)
4. Start 6 peer nodes (2 per org)
5. Start 6 CouchDB instances (state database)
6. Create channel `bpjs-main`
7. Join all peers to the channel

**Expected Output:**
```
[SUCCESS] BPJS Blockchain Network is UP and RUNNING!
```

### Step 4: Deploy Chaincode (Smart Contracts)

```bash
# Deploy chaincode to all peers
./deploy-chaincode.sh
```

This will:
1. Package the Go chaincode
2. Install on all peers
3. Approve chaincode for each organization
4. Commit chaincode to the channel

**Expected Output:**
```
[SUCCESS] Chaincode deployment completed!
```

### Step 5: Verify Network Status

```bash
# Check running containers
docker ps

# You should see:
# - 5 orderers (orderer1-5.bpjs-network.com)
# - 6 peers (peer0-1 for each org)
# - 6 couchdb instances
# - 1 cli container
```

### Step 6: Test Chaincode

```bash
# Issue a test BPJS card
docker exec cli peer chaincode invoke \
  -o orderer1.bpjs-network.com:7050 \
  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/bpjs-network.com/orderers/orderer1.bpjs-network.com/msp/tlscacerts/tlsca.bpjs-network.com-cert.pem \
  -C bpjs-main \
  -n bpjs \
  --peerAddresses peer0.bpjs.bpjs-network.com:7051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/peers/peer0.bpjs.bpjs-network.com/tls/ca.crt \
  -c '{"function":"IssueCard","Args":["CARD001","P001","John Doe","1234567890","1990-01-01","Male","Jakarta","PBI","2024-01-01","2025-01-01"]}'

# Query the card
docker exec cli peer chaincode query \
  -C bpjs-main \
  -n bpjs \
  -c '{"function":"VerifyCard","Args":["CARD001"]}'
```

### Step 7: Start API Backend

```bash
cd ../api

# Install dependencies
npm install

# Start development server
npm run start:dev
```

API will be running on: **http://localhost:3000**

---

## 📦 Network Configuration

### Organizations

The network consists of 3 organizations:

#### 1. BPJS Organization
- **MSP ID**: BPJSMSP
- **Domain**: bpjs.bpjs-network.com
- **Peers**: peer0:7051, peer1:8051
- **Anchor Peer**: peer0
- **Database**: CouchDB (ports 5984, 6984)

#### 2. Rumah Sakit Organization
- **MSP ID**: RumahSakitMSP
- **Domain**: rumahsakit.bpjs-network.com
- **Peers**: peer0:9051, peer1:10051
- **Anchor Peer**: peer0
- **Database**: CouchDB (ports 7984, 8984)

#### 3. Puskesmas Organization
- **MSP ID**: PuskesmasMSP
- **Domain**: puskesmas.bpjs-network.com
- **Peers**: peer0:11051, peer1:12051
- **Anchor Peer**: peer0
- **Database**: CouchDB (ports 9984, 10984)

### Ordering Service (Raft)

- **5 Ordering Nodes**
- **Ports**: 7050-7054
- **Consensus**: etcdraft
- **Batch Size**: Max 100 transactions per block
- **Block Timeout**: 2 seconds
- **Fault Tolerance**: 2 nodes can fail

### Channels

| Channel | Organizations | Purpose |
|---------|--------------|---------|
| bpjs-main | BPJS, RumahSakit, Puskesmas | Main channel for shared data |
| bpjs-regional-* | Subset of orgs | Regional privacy channels (future) |

---

## 🔐 Chaincode (Smart Contracts)

### Available Functions

#### Card Management

```go
IssueCard(cardID, patientID, patientName, nik, dob, gender, address, cardType, issueDate, expiryDate)
VerifyCard(cardID) -> BPJSCard
UpdateCardStatus(cardID, newStatus, reason)
```

#### Visit Recording

```go
RecordVisit(visitID, cardID, patientID, patientName, faskesCode, faskesName, faskesType, visitDate, visitType, diagnosis, treatment, doctorName, doctorID, notes)
GetPatientVisits(patientID) -> []Visit
```

#### Referral Management

```go
CreateReferral(referralID, patientID, patientName, cardID, fromFaskesCode, fromFaskesName, toFaskesCode, toFaskesName, reason, diagnosis, referringDoctor, referralDate, validUntil, notes)
UpdateReferralStatus(referralID, newStatus, acceptedBy, notes)
```

#### Claims Processing

```go
SubmitClaim(claimID, patientID, patientName, cardID, visitID, faskesCode, faskesName, claimType, serviceDate, diagnosis, treatment, totalAmount, claimAmount)
ProcessClaim(claimID, newStatus, reviewNotes)
GetPatientClaims(patientID) -> []Claim
```

#### Audit Logging

```go
QueryAuditLogs(startKey, endKey) -> []AuditLog
```

### Endorsement Policies

| Function | Policy | Description |
|----------|--------|-------------|
| IssueCard | MAJORITY('BPJSMSP') | Only BPJS can issue cards |
| RecordVisit | AND('BPJSMSP', 'PuskesmasMSP' OR 'RumahSakitMSP') | BPJS + Healthcare facility |
| SubmitClaim | AND('BPJSMSP', 'RumahSakitMSP') | BPJS + Hospital |
| ProcessClaim | MAJORITY('BPJSMSP') | BPJS approval required |

---

## 🔌 API Backend

### Endpoints

#### Cards
```
POST   /api/cards/issue          - Issue new BPJS card
GET    /api/cards/:cardID         - Get card details
PUT    /api/cards/:cardID/status  - Update card status
GET    /api/cards/verify/:cardID  - Verify card (QR scan)
```

#### Visits
```
POST   /api/visits                - Record patient visit
GET    /api/visits/patient/:id    - Get patient visit history
GET    /api/visits/:visitID       - Get visit details
```

#### Referrals
```
POST   /api/referrals             - Create referral
GET    /api/referrals/:id         - Get referral details
PUT    /api/referrals/:id/status  - Update referral status
GET    /api/referrals/patient/:id - Get patient referrals
```

#### Claims
```
POST   /api/claims                - Submit claim
GET    /api/claims/:claimID       - Get claim details
PUT    /api/claims/:claimID/process - Process claim
GET    /api/claims/patient/:id    - Get patient claims
GET    /api/claims/faskes/:code   - Get facility claims
```

#### Audit
```
GET    /api/audit/logs            - Query audit logs
GET    /api/audit/entity/:id      - Get entity audit trail
```

---

## 🧪 Testing

### Unit Tests

```bash
cd api
npm test
```

### Integration Tests

```bash
npm run test:e2e
```

### Load Testing

```bash
cd scripts
./load-test.sh
```

---

## 📊 Monitoring

### View Blockchain Explorer

Access at: http://localhost:8080

### Check Logs

```bash
# View peer logs
docker logs peer0.bpjs.bpjs-network.com

# View orderer logs
docker logs orderer1.bpjs-network.com

# View API logs
cd api && npm run logs
```

---

## 🛠️ Troubleshooting

### Network Won't Start

```bash
# Clean up and restart
cd scripts
./stop-network.sh
./start-network.sh
```

### Chaincode Deployment Fails

```bash
# Rebuild chaincode
cd chaincode
go mod tidy
go mod vendor
cd ../scripts
./deploy-chaincode.sh
```

### Docker Issues

```bash
# Reset Docker
docker system prune -a --volumes
docker-compose down --volumes --remove-orphans
```

---

## 📞 Support

For issues and questions:
- **Documentation**: See README.md
- **Issues**: Create GitHub issue
- **Email**: support@bpjs-blockchain.id

---

**Made with ❤️ for Indonesian Healthcare Digital Transformation**
