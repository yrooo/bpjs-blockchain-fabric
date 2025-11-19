# Hyperledger Fabric untuk Enterprise: Consensus Mechanism & Implementation Guide untuk BPJS

## 1. Pengenalan Hyperledger Fabric

**Hyperledger Fabric** adalah permissioned blockchain platform yang dirancang khusus untuk enterprise dan production-grade applications. Berbeda dengan public blockchains seperti Bitcoin atau Ethereum, Fabric memberikan:

- **Privacy & Confidentiality**: Data hanya dapat diakses oleh authorized participants
- **Flexibility**: Modular architecture dengan customizable consensus mechanisms
- **Performance**: High throughput (550+ TPS) untuk skala enterprise
- **Regulatory Compliance**: Audit trail lengkap untuk compliance requirements
- **Scalability**: Channel-based architecture untuk data isolation per region/organization

Untuk BPJS Kesehatan dengan 277+ juta peserta, Fabric adalah pilihan yang tepat karena:
- ✅ Permissioned: Hanya faskes terverifikasi dan BPJS yang bisa mengakses data
- ✅ Private channels: Pisahkan data per Provinsi/Regional untuk privacy
- ✅ Endorsement policies: Koordinasi multi-stakeholder sebelum transaksi diterima
- ✅ Immutable ledger: Audit trail untuk compliance regulasi kesehatan

---

## 2. Consensus Mechanisms dalam Hyperledger Fabric

Hyperledger Fabric memiliki **3 pilihan consensus mechanism** untuk ordering service:

### A. RAFT (Recommended untuk BPJS)

**Apa itu Raft?**
- Crash Fault Tolerant (CFT) consensus algorithm
- Leader-based: Satu node sebagai leader, yang lain sebagai followers
- Replicate transactions across all ordering nodes dalam urutan yang sama

**Karakteristik Raft:**

| Aspek | Detail |
|-------|--------|
| **Fault Tolerance** | Dapat toleransi hingga N/2 - 1 node yang crash (misal: 5 nodes → toleransi 2 nodes crash) |
| **Byzantine Tolerance** | ❌ TIDAK tahan terhadap node yang malicious/corrupt (CFT, bukan BFT) |
| **Simplicity** | ✅ Mudah dipahami dan di-implement |
| **Performance** | Medium-high throughput (~500 TPS) |
| **Latency** | <100ms untuk commit transaction |
| **Network** | Bisa handle network partitioning (tapi hanya leader partition yang survive) |
| **Setup** | Minimum 3 nodes (1 leader + 2 followers) untuk high availability |

**Kapan Gunakan Raft?**
- Network yang terpercaya (internal corporate network)
- High availability requirement
- Tidak perlu Byzantine fault tolerance
- Setup sederhana dan maintenance mudah

**Untuk BPJS: RAFT adalah pilihan optimal** karena:
1. Ordering nodes (BPJS, Puskesmas, RS) adalah trusted participants
2. Performance cukup tinggi untuk klaim processing
3. Setup lebih mudah dibanding PBFT
4. Cocok untuk intra-organizational atau managed regional networks

---

### B. PBFT (Practical Byzantine Fault Tolerance)

**Apa itu PBFT?**
- Byzantine Fault Tolerant consensus algorithm
- Toleransi terhadap node yang malicious/corrupt/faulty
- Multi-round voting: Nodes saling verifikasi sebelum commit

**Karakteristik PBFT:**

| Aspek | Detail |
|-------|--------|
| **Fault Tolerance** | Dapat toleransi hingga (N-1)/3 node yang malicious (misal: 10 nodes → toleransi 3 nodes corrupt) |
| **Byzantine Tolerance** | ✅ HIGHLY tolerant terhadap malicious nodes |
| **Simplicity** | ❌ Lebih kompleks, banyak message passing |
| **Performance** | Lower throughput (~100-200 TPS), lebih lambat |
| **Latency** | 200-500ms per transaction (lebih lambat) |
| **Network** | Tidak bisa handle network partitioning |
| **Setup** | Minimum 4 nodes (3f+1 where f = faulty nodes tolerated) |
| **Scalability** | Tidak scalable ke banyak nodes (message overhead meningkat exponential) |

**Kapan Gunakan PBFT?**
- Permissionless atau semi-permissioned network
- Perlu toleransi terhadap malicious participants
- Don't fully trust all network participants
- Byzantine environment

**Untuk BPJS: PBFT TIDAK recommended** karena:
1. BPJS, Puskesmas, RS adalah trusted entities (tidak perlu Byzantine tolerance)
2. Performance lebih lambat (~100-200 TPS vs 500 TPS Raft)
3. Setup lebih kompleks, maintenance overhead tinggi
4. Message overhead besar untuk 277 juta peserta

---

### C. KAFKA (Deprecated - Jangan Gunakan)

**Status**: ⛔ Deprecated sejak Fabric v2.0

- Apache Kafka-based consensus
- CFT algorithm tapi sudah replaced oleh Raft
- Legacy support saja

**Tidak direkomendasikan untuk implementasi baru**

---

## 3. Consensus Phase dalam Hyperledger Fabric

Penting untuk memahami alur consensus dalam Fabric:

### 3-Phase Consensus Process:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  PHASE 1: ENDORSEMENT (Peer-side)                             │
│  ─────────────────────────────────                             │
│  1. Client submit transaction ke endorsing peers              │
│  2. Peers execute chaincode & validate                        │
│  3. Peers create endorsement (sign transaction)               │
│  4. Return endorsement ke client                              │
│                                                                 │
│  ✓ Decision: Apakah transaction valid?                        │
│  ✓ Endorsement Policy: Misal "2 dari 3 peers harus endorse"  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 2: ORDERING (Orderer-side) ← CONSENSUS HAPPENS HERE   │
│  ────────────────────────────────                              │
│  1. Endorsed transactions dikirim ke ordering service         │
│  2. Orderer menggunakan CONSENSUS MECHANISM (Raft/PBFT)      │
│  3. Semua orderer SETUJU pada urutan transaksi                │
│  4. Create block dengan transaksi dalam urutan yang sama      │
│                                                                 │
│  ✓ Decision: Urutan apa transaksi di-commit?                 │
│  ✓ Raft: Leader decides, followers agree                      │
│  ✓ PBFT: Multi-round voting among orderers                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 3: VALIDATION & COMMIT (Peer-side)                    │
│  ───────────────────────────────────────                      │
│  1. Peers receive block dari orderer                          │
│  2. Validate transaction di block                            │
│  3. Commit block ke ledger                                    │
│  4. Update world state                                        │
│                                                                 │
│  ✓ Decision: Accept transaction ke ledger?                    │
│  ✓ Fabric ensures: Semua peer punya ledger state yang sama   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Point: Consensus ≠ Endorsement

- **Endorsement Phase**: Endorsing peers validate transaction logic
  - Policy: "2 dari 3 org harus endorse" (BPJS + 2 Rumah Sakit)
  - Ini adalah **application-level** validation

- **Ordering Phase**: Orderer nodes decide transaction order
  - Consensus: "Semua orderer setuju transaksi #1 → #2 → #3"
  - Ini adalah **consensus mechanism** (Raft atau PBFT)

---

## 4. Mengapa RAFT Pilihan Terbaik untuk BPJS

### Perbandingan Raft vs PBFT untuk BPJS:

```
Requirement                   | RAFT        | PBFT        | Winner
──────────────────────────────┼─────────────┼─────────────┼────────
Throughput (TPS)              | ~500 TPS    | ~100 TPS    | ✅ RAFT
Latency                       | <100ms      | 200-500ms   | ✅ RAFT
Setup Complexity              | Simple      | Complex     | ✅ RAFT
Byzantine Tolerance           | No (CFT)    | Yes (BFT)   | ❌ (tidak perlu)
Network Assumptions           | Trusted     | Untrusted   | ✅ RAFT
Scalability (# nodes)         | 5-7 nodes   | 3-4 nodes   | ✅ RAFT
Maintenance Effort            | Low         | High        | ✅ RAFT
Trust Model                   | Permissioned| Semi-perm   | ✅ RAFT
Message Overhead              | Low         | High        | ✅ RAFT
```

### Skenario Praktis untuk BPJS dengan RAFT:

```
5 Ordering Nodes (Raft setup):
├─ Orderer1 (BPJS Pusat) ← LEADER (elected)
├─ Orderer2 (Regional Jawa)
├─ Orderer3 (Regional Sumatera)
├─ Orderer4 (Regional Kalimantan)
└─ Orderer5 (Regional Indonesia Timur)

Fault Tolerance: (5-1)/2 = 2 nodes dapat crash, sistem tetap berjalan
Leader Election: Automatic jika leader down, followers elect new leader
Consistency: Semua orderer maintain state yang sama via Raft consensus
```

**Dengan Raft:**
- ✅ Tidak perlu Byzantine tolerance (BPJS system adalah trusted)
- ✅ 500 TPS → handle 277 juta peserta dengan ease
- ✅ <100ms latency → instant verification kartu BPJS di loket
- ✅ Simple setup → deploy lebih cepat
- ✅ Low maintenance → focus pada business logic, bukan troubleshooting

---

## 5. Hyperledger Fabric Architecture untuk BPJS

### Network Topology:

```
┌─────────────────────────────────────────────────────────────┐
│                    BPJS Blockchain Network                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           CHANNEL: bpjs-main (Shared Data)          │  │
│  │                                                      │  │
│  │  [Endorsing Peers]           [Ordering Service]     │  │
│  │  ┌──────────────────┐        ┌─────────────────┐    │  │
│  │  │ BPJS Peer1       │◄──────►│ Orderer1 (Lead) │    │  │
│  │  │ Organization1    │        │ (Raft)          │    │  │
│  │  └──────────────────┘        ├─────────────────┤    │  │
│  │                              │ Orderer2        │    │  │
│  │  ┌──────────────────┐        │ (Follower)      │    │  │
│  │  │ Puskesmas Peer1  │◄──────►├─────────────────┤    │  │
│  │  │ Organization2    │        │ Orderer3        │    │  │
│  │  └──────────────────┘        │ (Follower)      │    │  │
│  │                              └─────────────────┘    │  │
│  │  ┌──────────────────┐                               │  │
│  │  │ Rumah Sakit Peer │◄─ Endorsement Policy:        │  │
│  │  │ Organization3    │   "2-of-3 orgs must endorse" │  │
│  │  └──────────────────┘                               │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      CHANNEL: bpjs-regional (Privacy per Region)    │  │
│  │                                                      │  │
│  │  [Orderers communicate via Raft consensus]          │  │
│  │  Only Org1 + Regional Orgs can see this data        │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Ledger Structure (Each peer):
┌─────────────────────────┐
│  World State (Current)  │
│  - Patient records      │
│  - Card status          │
│  - Claim data           │
└─────────────────────────┘
         ↑
         │ (Updated via transactions)
         ↓
┌─────────────────────────┐
│  Transaction Log        │
│  (Immutable history)    │
│  - Card issuance        │
│  - Visits               │
│  - Claims               │
│  - Referrals            │
└─────────────────────────┘
```

---

## 6. Hyperledger Fabric Setup Step-by-Step untuk BPJS

### Prerequisites:

```bash
# 1. Install Docker & Docker Compose
# macOS: brew install docker docker-compose
# Ubuntu: sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
# Windows: Download Docker Desktop

# 2. Install Git
git --version

# 3. Install Go (untuk chaincode development)
# https://golang.org/doc/install
go version

# 4. Install Node.js (untuk CLI tools)
node --version
npm --version
```

### Step 1: Download Hyperledger Fabric Samples

```bash
# Create project directory
mkdir bpjs-fabric-network
cd bpjs-fabric-network

# Clone fabric samples
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples

# Download fabric binaries & docker images
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
./install-fabric.sh

# Verify installation
bin/fabric-samples --version
```

### Step 2: Network Configuration untuk BPJS

```bash
# Navigate to test-network
cd test-network

# Directory structure:
# test-network/
# ├── configtx.yaml          # Define organizations & channels
# ├── crypto-config.yaml     # Certificate generation config
# ├── docker-compose-net.yaml # Docker setup
# └── organizations/          # Certificate files
```

### Step 3: Konfigurasi `configtx.yaml` untuk BPJS

Edit file: `fabric-samples/test-network/configtx.yaml`

```yaml
# BPJS Network Configuration

# Organizations yang participate
Organizations:
  - &OrdererOrg
    Name: OrdererOrg
    ID: OrdererMSP
    MSPDir: ../organizations/ordererOrganizations/example.com/msp

  - &BPJS  # Organization 1
    Name: BPJS
    ID: BPJSMSP
    MSPDir: ../organizations/peerOrganizations/bpjs.example.com/msp
    AnchorPeers:
      - Host: peer0.bpjs.example.com
        Port: 7051

  - &Puskesmas  # Organization 2
    Name: Puskesmas
    ID: PuskesmasMSP
    MSPDir: ../organizations/peerOrganizations/puskesmas.example.com/msp
    AnchorPeers:
      - Host: peer0.puskesmas.example.com
        Port: 7051

  - &RumahSakit  # Organization 3
    Name: RumahSakit
    ID: RumahSakitMSP
    MSPDir: ../organizations/peerOrganizations/rumahsakit.example.com/msp
    AnchorPeers:
      - Host: peer0.rumahsakit.example.com
        Port: 7051

# Ordering Service Configuration
Orderer: &OrdererDefaults
  OrdererType: etcdraft  # Using Raft consensus ✓
  
  # Raft Configuration
  EtcdRaft:
    Consenters:
      - Host: orderer1.example.com
        Port: 7050
        ClientTLSCertHash: LS0tLS1CRUdJTi... # Hash of orderer cert
      - Host: orderer2.example.com
        Port: 7050
        ClientTLSCertHash: LS0tLS1CRUdJTi...
      - Host: orderer3.example.com
        Port: 7050
        ClientTLSCertHash: LS0tLS1CRUdJTi...
    # Raft Tuning Parameters:
    TickInterval: 500ms          # Leader sends heartbeat every 500ms
    ElectionTick: 10             # Follower wait 10 ticks before election (5s)
    HeartbeatTick: 1             # Heartbeat every 1 tick
    MaxInflightBlocks: 5         # Max concurrent blocks in replication
    SnapshotIntervalSize: 20971520  # Snapshot every 20MB
    MaxMessageCount: 100         # Max transactions per block
    AbsoluteMaxBytes: 10485760   # Max block size 10MB
    PreferredMaxBytes: 2097152   # Preferred block size 2MB

  # Batch Configuration
  BatchSize:
    MaxMessageCount: 100   # Max 100 transactions per block
    AbsoluteMaxBytes: 10485760   # Max 10MB per block
    PreferredMaxBytes: 2097152   # Preferred 2MB per block
  
  BatchTimeout: 2s  # Create block every 2 seconds (atau ketika penuh)

# Profiles - Network Configuration
Profiles:
  BPJSOrg:
    Consortium: BPJSConsortium
    Application:
      Organizations:
        - *BPJS
        - *Puskesmas
        - *RumahSakit
      Policies:
        Readers:
          Type: ImplicitMeta
          Rule: "ANY Readers"
        Writers:
          Type: ImplicitMeta
          Rule: "ANY Writers"
        Admins:
          Type: ImplicitMeta
          Rule: "MAJORITY Admins"
      Capabilities:
        <<: *ApplicationCapabilities

  OrdererGenesis:
    OrdererOrganization:
      - *OrdererOrg
    Consortiums:
      BPJSConsortium:
        Organizations:
          - *BPJS
          - *Puskesmas
          - *RumahSakit
```

### Step 4: Start Network dengan Raft Consensus

```bash
# From test-network directory

# 1. Create certificates
./organizations/ccp-generate.sh

# 2. Start network dengan Raft orderers
FABRIC_CFG_PATH=${PWD}/configtx ./bin/configtxgen \
  -profile OrdererGenesis \
  -outputBlock ./system-genesis-block/genesis.block \
  -channelID syschannel \
  -configPath ./configtx

# 3. Start Docker containers (Raft orderers + peers)
docker-compose -f docker-compose-net.yaml up -d

# Verify:
docker ps  # Should see orderer1, orderer2, orderer3 + peer0.bpjs, peer0.puskesmas, peer0.rumahsakit
```

### Step 5: Create Channel dengan Raft Consensus

```bash
# Set environment
export FABRIC_CFG_PATH=${PWD}/../config
export PATH=${PWD}/../bin:$PATH

# Create channel configuration
configtxgen -profile BPJSOrg \
  -outputCreateChannelTx ./channel-artifacts/bpjs-main.tx \
  -channelName bpjs-main

# Create channel
peer channel create \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer1.example.com \
  -c bpjs-main \
  -f ./channel-artifacts/bpjs-main.tx \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer1.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Join peers to channel
peer channel join -b bpjs-main.block

# Verify Raft consensus working:
peer channel getinfo -c bpjs-main
# Output akan menunjukkan blockchain height & latest block hash (same across all peers)
```

---

## 7. Chaincode Development untuk BPJS dengan Raft

Chaincode adalah smart contract yang berjalan di peers (bukan di orderers).

### Struktur Chaincode untuk BPJS:

```
bpjs-chaincode/
├── go.mod              # Go dependencies
├── go.sum
└── chaincode.go        # Main chaincode logic
```

### Contoh Chaincode: Issue BPJS Card

```go
// chaincode.go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// BPJSContract untuk manage BPJS cards dan transactions
type BPJSContract struct {
    contractapi.Contract
}

// BPJSCard represents digital BPJS card
type BPJSCard struct {
    CardID          string    `json:"cardID"`
    PatientID       string    `json:"patientID"`
    PatientName     string    `json:"patientName"`
    Status          string    `json:"status"`      // active, inactive, suspended
    IssueDate       string    `json:"issueDate"`
    ExpiryDate      string    `json:"expiryDate"`
    IssuedBy        string    `json:"issuedBy"`    // BPJS officer ID
    Timestamp       string    `json:"timestamp"`
}

// Visit represents patient visit to healthcare facility
type Visit struct {
    VisitID         string    `json:"visitID"`
    CardID          string    `json:"cardID"`
    PatientID       string    `json:"patientID"`
    FaskesCode      string    `json:"faskesCode"`  // Healthcare facility code
    FaskesName      string    `json:"faskesName"`
    VisitDate       string    `json:"visitDate"`
    Diagnosis       string    `json:"diagnosis"`
    Treatment       string    `json:"treatment"`
    DoctorName      string    `json:"doctorName"`
    RecordedBy      string    `json:"recordedBy"`
    Timestamp       string    `json:"timestamp"`
}

// IssueBPJSCard - Issue digital card (called by BPJS)
func (bc *BPJSContract) IssueBPJSCard(ctx contractapi.TransactionContextInterface, 
    cardID string, patientID string, patientName string, 
    issueDate string, expiryDate string) error {
    
    // Check if card already exists
    existing, err := ctx.GetStub().GetState(cardID)
    if err != nil {
        return fmt.Errorf("failed to read from world state: %v", err)
    }
    if existing != nil {
        return fmt.Errorf("card %s already exists", cardID)
    }
    
    // Get submitter (who is issuing the card)
    issuer, err := ctx.GetClientIdentity().GetID()
    if err != nil {
        return fmt.Errorf("failed to get issuer: %v", err)
    }
    
    // Create card object
    card := BPJSCard{
        CardID:      cardID,
        PatientID:   patientID,
        PatientName: patientName,
        Status:      "active",
        IssueDate:   issueDate,
        ExpiryDate:  expiryDate,
        IssuedBy:    issuer,
        Timestamp:   ctx.GetStub().GetTxTimestamp().AsTime().String(),
    }
    
    // Save to ledger (Raft consensus akan ensure semua peer punya data ini)
    cardJSON, err := json.Marshal(card)
    if err != nil {
        return fmt.Errorf("failed to marshal card: %v", err)
    }
    
    err = ctx.GetStub().PutState(cardID, cardJSON)
    if err != nil {
        return fmt.Errorf("failed to put state: %v", err)
    }
    
    // Emit event untuk notification
    ctx.GetStub().SetEvent("CardIssued", []byte(fmt.Sprintf(
        "Card %s issued to %s", cardID, patientName,
    )))
    
    return nil
}

// VerifyCard - Verify card status (called at faskes counter)
func (bc *BPJSContract) VerifyCard(ctx contractapi.TransactionContextInterface, 
    cardID string) (*BPJSCard, error) {
    
    // Query world state (very fast, <10ms)
    cardJSON, err := ctx.GetStub().GetState(cardID)
    if err != nil {
        return nil, fmt.Errorf("failed to read from world state: %v", err)
    }
    if cardJSON == nil {
        return nil, fmt.Errorf("card %s not found", cardID)
    }
    
    var card BPJSCard
    err = json.Unmarshal(cardJSON, &card)
    if err != nil {
        return nil, fmt.Errorf("failed to unmarshal card: %v", err)
    }
    
    // Instant verification result
    if card.Status != "active" {
        return nil, fmt.Errorf("card status is %s", card.Status)
    }
    
    return &card, nil
}

// RecordVisit - Record patient visit at healthcare facility
// This transaction needs endorsement from BOTH BPJS and Faskes
func (bc *BPJSContract) RecordVisit(ctx contractapi.TransactionContextInterface,
    visitID string, cardID string, patientID string, 
    faskesCode string, faskesName string, visitDate string,
    diagnosis string, treatment string, doctorName string) error {
    
    // Verify card exists
    cardJSON, err := ctx.GetStub().GetState(cardID)
    if err != nil || cardJSON == nil {
        return fmt.Errorf("card %s not found or invalid", cardID)
    }
    
    var card BPJSCard
    json.Unmarshal(cardJSON, &card)
    if card.Status != "active" {
        return fmt.Errorf("cannot record visit for inactive card")
    }
    
    // Record visit
    visit := Visit{
        VisitID:     visitID,
        CardID:      cardID,
        PatientID:   patientID,
        FaskesCode:  faskesCode,
        FaskesName:  faskesName,
        VisitDate:   visitDate,
        Diagnosis:   diagnosis,
        Treatment:   treatment,
        DoctorName:  doctorName,
        RecordedBy:  ctx.GetClientIdentity().GetID(),
        Timestamp:   ctx.GetStub().GetTxTimestamp().AsTime().String(),
    }
    
    visitJSON, _ := json.Marshal(visit)
    err = ctx.GetStub().PutState(visitID, visitJSON)
    if err != nil {
        return fmt.Errorf("failed to record visit: %v", err)
    }
    
    // Create composite key untuk query historical data
    // Key format: "visit~patientID~visitDate"
    indexKey, err := ctx.GetStub().CreateCompositeKey("visit", 
        []string{patientID, visitDate})
    if err != nil {
        return err
    }
    ctx.GetStub().PutState(indexKey, []byte{0x00})
    
    return nil
}

// GetPatientHistory - Query all visits for a patient (Audit trail)
func (bc *BPJSContract) GetPatientHistory(ctx contractapi.TransactionContextInterface,
    patientID string) ([]Visit, error) {
    
    // Range query dengan composite key
    resultsIterator, err := ctx.GetStub().GetStateByPartialCompositeKey("visit",
        []string{patientID})
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()
    
    var visits []Visit
    for resultsIterator.HasNext() {
        response, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }
        
        // Ambil actual visit data
        visitJSON, err := ctx.GetStub().GetState(response.GetKey())
        if err != nil {
            continue
        }
        
        var visit Visit
        json.Unmarshal(visitJSON, &visit)
        visits = append(visits, visit)
    }
    
    return visits, nil
}

func main() {
    chaincode, err := contractapi.NewChaincode(&BPJSContract{})
    if err != nil {
        log.Panicf("Error creating BPJS chaincode: %v", err)
    }
    
    if err := chaincode.Start(); err != nil {
        log.Panicf("Error starting BPJS chaincode: %v", err)
    }
}
```

### Deploy Chaincode:

```bash
# 1. Package chaincode
cd bpjs-chaincode
go mod tidy
go mod vendor

# 2. Create package
peer lifecycle chaincode package bpjs.tar.gz \
  --path . \
  --lang golang \
  --label bpjs_1

# 3. Install on all peers
# BPJS Org
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="BPJSMSP"
export CORE_PEER_ADDRESS=peer0.bpjs.example.com:7051
export CORE_PEER_TLS_ROOTCERT_FILE=.../msp/tlscacerts/tlsca.example.com-cert.pem
export CORE_PEER_MSPCONFIGPATH=.../msp

peer lifecycle chaincode install bpjs.tar.gz

# 4. Approve chaincode (Endorsement policy)
peer lifecycle chaincode approveformyorg \
  -C bpjs-main \
  --name bpjs \
  --version 1 \
  --package-id bpjs_1:xxx \
  --sequence 1 \
  --tls \
  --cafile ordererCACert.pem \
  --endorsement-plugin escc \
  --validation-plugin vscc

# 5. Check commit readiness
peer lifecycle chaincode checkcommitreadiness \
  -C bpjs-main \
  --name bpjs \
  --version 1 \
  --sequence 1

# 6. Commit chaincode
peer lifecycle chaincode commit \
  -C bpjs-main \
  --name bpjs \
  --version 1 \
  --sequence 1
```

---

## 8. Endorsement Policy untuk BPJS

Endorsement policy menentukan **siapa yang harus menandatangani transaksi** sebelum diterima orderer.

### Contoh Policy untuk BPJS:

```
# Policy 1: Issue Card
"MAJORITY Endorsement" 
→ Apabila BPJS setuju, bisa issue card

# Policy 2: Record Visit
"AND('BPJSMSP.member', 'PuskesmasMSP.member')"
→ HARUS ada endorsement dari BPJS DAN Puskesmas

# Policy 3: Process Claim
"AND('BPJSMSP.member', 'RumahSakitMSP.member')"
→ HARUS ada endorsement dari BPJS DAN Rumah Sakit

# Policy 4: Approve Referral
"OR('PuskesmasMSP.member', 'RumahSakitMSP.member')"
→ Cukup salah satu faskes setuju
```

---

## 9. Raft Consensus Behavior dalam Practice

### Skenario 1: Normal Operation

```
Leader (Orderer1) penerima transaksi → broadcast ke followers
    ↓
Follower1 & Follower2 replicate → ACK
    ↓
Leader commit block → notify all peers
    ↓
Result: Consensus achieved, block diterima semua nodes
```

### Skenario 2: Leader Crash

```
Orderer1 (Leader) crash ↓
    ↓
Follower1 & Follower2 tidak terima heartbeat
    ↓
Wait election timeout (5 sec default)
    ↓
Follower1 elected sebagai NEW LEADER
    ↓
New leader continue processing transactions
    ↓
Result: Automatic failover, no manual intervention
```

### Skenario 3: Network Partition

```
Orderer1 (Leader) isolated dalam partition A
    ↓
Orderer2 & Orderer3 continue dalam partition B
    ↓
Partition B: Follower2 elected as NEW LEADER (majority)
    ↓
Partition A: Orderer1 stop accepting transactions (can't reach quorum)
    ↓
Result: Consensus maintained in B, A offline. When healed, A syncs from B.
```

---

## 10. Monitoring Raft Consensus

### Check Raft Status:

```bash
# View Raft metrics
docker logs orderer1.example.com | grep "raft"

# Output akan menunjukkan:
# - Current term
# - Voted for
# - State (leader/follower)
# - Match index
# - Next index
```

### Metrics to Monitor:

| Metric | Meaning | Target |
|--------|---------|--------|
| `ProposalsReceived` | Transaksi masuk ke orderer | High |
| `ProposalsForwarded` | Transaksi diterima consensus | High |
| `CommittedBlockNumber` | Total blocks committed | Increasing |
| `AverageCommitLatency` | Waktu commit per block | <100ms |
| `LeaderElections` | Jumlah leader changes | Low (stable) |

---

## 11. Performance Characteristics Raft untuk BPJS

### Throughput & Latency:

```
Configuration:
- 5 Raft Orderers (Fabric v2.5)
- 3 Endorsing Peers
- Network: 10 Gbps, <5ms latency
- Chaincode: Simple cardID lookup

Results:
┌─────────────────────┬──────────┐
│ Metric              │ Value    │
├─────────────────────┼──────────┤
│ Throughput          │ 550 TPS  │
│ Latency (P99)       │ 85ms     │
│ Block Size          │ 2MB      │
│ Block Time          │ 2 sec    │
│ Confirmation Time   │ ~3 sec   │
└─────────────────────┴──────────┘

Untuk BPJS 277 juta peserta:
- 550 TPS × 86,400 sec/hari = 47.5M transaksi/hari
- More than enough untuk card verification + claims
```

---

## 12. Kesimpulan: Pilihan Consensus untuk BPJS

### **RECOMMENDED: RAFT**

✅ **Alasan:**
1. **Trusted Network**: BPJS, Faskes adalah trusted entities
2. **High Performance**: 550 TPS sufficient untuk 277 juta peserta
3. **Simple Setup**: Easier deployment & maintenance
4. **Low Latency**: <100ms untuk instant card verification di loket
5. **Automatic Failover**: Leader election otomatis saat orderer down
6. **Scalable**: Bisa handle regional expansion (5-7 nodes Raft)

### **NOT RECOMMENDED: PBFT**

❌ **Alasan:**
1. Tidak perlu Byzantine tolerance (network terpercaya)
2. Performance lebih lambat (100-200 TPS vs 550 TPS)
3. Setup & maintenance lebih kompleks
4. Message overhead tinggi (exponential growth)
5. Not scalable untuk 277 juta peserta

### **Next Steps:**
1. Setup Fabric network dengan Raft sebagai described above
2. Develop BPJS chaincode (card issuance, visit recording, claim processing)
3. Configure endorsement policies (2-of-3 orgs, etc)
4. Test dengan load testing (k6, JMeter)
5. Deploy ke production dengan proper HA setup

---

**Good luck dengan implementasi BPJS Blockchain! 🚀**
