# Quick Start - Deploy and Test Chaincode

## Your Network Status ✅

Based on your `docker ps`, you have:
- ✅ **BPJS Peer**: `bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1` (port 7051)
- ✅ **Rumah Sakit Peer**: `bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1` (port 9051)
- ✅ **Orderer**: `orderer1.bpjs-network.com` (port 7050)
- ✅ **CLI Tool**: `cli`

## Step 1: Deploy Chaincode (PowerShell)

```powershell
# Navigate to scripts directory
cd D:\Yroo\Codin\healthkathon\bpjs-blockchain-fabric\scripts

# Convert script to Unix format (if needed)
# Install dos2unix via WSL or use notepad++ to convert line endings

# Run deployment from WSL (recommended for bash scripts)
wsl bash ./deploy-chaincode-custom.sh

# OR run manually step-by-step (see manual commands below)
```

## Step 2: Test Peer Communication

After deployment completes, test the network:

```powershell
# From WSL
wsl bash ./test-chaincode.sh
```

## Manual Deployment (PowerShell Commands)

If you prefer PowerShell instead of bash:

### 1. Copy chaincode to CLI container
```powershell
docker exec cli mkdir -p /opt/gopath/src/github.com/chaincode
docker cp ..\chaincode\. cli:/opt/gopath/src/github.com/chaincode/
```

### 2. Package chaincode
```powershell
docker exec cli peer lifecycle chaincode package /tmp/bpjs_1.tar.gz --path /opt/gopath/src/github.com/chaincode --lang golang --label bpjs_1
```

### 3. Install on BPJS peer
```powershell
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp `
  cli peer lifecycle chaincode install /tmp/bpjs_1.tar.gz
```

### 4. Install on Rumah Sakit peer
```powershell
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp `
  cli peer lifecycle chaincode install /tmp/bpjs_1.tar.gz
```

### 5. Get package ID
```powershell
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp `
  cli peer lifecycle chaincode queryinstalled
```

Copy the Package ID from output (looks like `bpjs_1:abc123def456...`)

### 6. Approve for BPJS org
```powershell
# Replace <PACKAGE_ID> with actual package ID from step 5
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp `
  cli peer lifecycle chaincode approveformyorg `
  -o orderer1.bpjs-network.com:7050 `
  --channelID bpjschannel `
  --name bpjs `
  --version 1.0 `
  --package-id <PACKAGE_ID> `
  --sequence 1 `
  --tls false
```

### 7. Approve for Rumah Sakit org
```powershell
# Replace <PACKAGE_ID> with actual package ID
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp `
  cli peer lifecycle chaincode approveformyorg `
  -o orderer1.bpjs-network.com:7050 `
  --channelID bpjschannel `
  --name bpjs `
  --version 1.0 `
  --package-id <PACKAGE_ID> `
  --sequence 1 `
  --tls false
```

### 8. Check commit readiness
```powershell
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp `
  cli peer lifecycle chaincode checkcommitreadiness `
  --channelID bpjschannel `
  --name bpjs `
  --version 1.0 `
  --sequence 1 `
  --output json
```

Should show both orgs approved.

### 9. Commit chaincode
```powershell
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp `
  cli peer lifecycle chaincode commit `
  -o orderer1.bpjs-network.com:7050 `
  --channelID bpjschannel `
  --name bpjs `
  --version 1.0 `
  --sequence 1 `
  --peerAddresses bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 `
  --peerAddresses bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 `
  --tls false
```

### 10. Verify deployment
```powershell
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp `
  cli peer lifecycle chaincode querycommitted --channelID bpjschannel --name bpjs
```

## Quick Test (PowerShell)

### Test 1: Issue a card from BPJS peer
```powershell
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp `
  cli peer chaincode invoke `
  -o orderer1.bpjs-network.com:7050 `
  -C bpjschannel -n bpjs `
  -c '{\"Args\":[\"IssueCard\",\"CARD001\",\"P001\",\"Budi Santoso\",\"1234567890123456\",\"1990-01-01\",\"Male\",\"Jakarta\",\"PBI\",\"2024-01-01\",\"2025-01-01\"]}' `
  --waitForEvent
```

### Test 2: Verify from Rumah Sakit peer (tests peer communication!)
```powershell
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp `
  cli peer chaincode query `
  -C bpjschannel -n bpjs `
  -c '{\"Args\":[\"VerifyCard\",\"CARD001\"]}'
```

If you see the card data returned, **peer-to-peer communication is working!** 🎉

### Test 3: Record visit from RS peer
```powershell
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp `
  cli peer chaincode invoke `
  -o orderer1.bpjs-network.com:7050 `
  -C bpjschannel -n bpjs `
  -c '{\"Args\":[\"RecordVisit\",\"VISIT001\",\"CARD001\",\"P001\",\"Budi\",\"RS001\",\"RS Siloam\",\"rumahsakit\",\"2024-01-15\",\"outpatient\",\"Flu\",\"Medicine\",\"Dr. Smith\",\"DOC001\",\"Checkup\"]}' `
  --waitForEvent
```

### Test 4: Submit claim
```powershell
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp `
  cli peer chaincode invoke `
  -o orderer1.bpjs-network.com:7050 `
  -C bpjschannel -n bpjs `
  -c '{\"Args\":[\"SubmitClaim\",\"CLAIM001\",\"P001\",\"Budi\",\"CARD001\",\"VISIT001\",\"RS001\",\"RS Siloam\",\"rawat-jalan\",\"2024-01-15\",\"Flu\",\"Consultation\",\"500000\",\"450000\"]}' `
  --waitForEvent
```

### Test 5: Process claim from BPJS peer
```powershell
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP `
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 `
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp `
  cli peer chaincode invoke `
  -o orderer1.bpjs-network.com:7050 `
  -C bpjschannel -n bpjs `
  -c '{\"Args\":[\"ProcessClaim\",\"CLAIM001\",\"approved\",\"Verified\"]}' `
  --waitForEvent
```

## Troubleshooting

### Error: "chaincode not found"
- Check if chaincode is deployed: `docker exec cli peer lifecycle chaincode querycommitted --channelID bpjschannel --name bpjs`

### Error: "connection refused"
- Check containers are running: `docker ps`
- Check container logs: `docker logs cli` or `docker logs <peer-name>`

### Error: "access denied" or "identity not valid"
- Check MSP paths are correct for your network setup
- Verify crypto materials exist in CLI container: `docker exec cli ls /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/`

### Error: Package ID not found
- Run `docker exec cli peer lifecycle chaincode queryinstalled` and copy exact Package ID
- Make sure to install on both peers before approving

## Next Steps

After successful deployment:

1. ✅ Connect API backend to blockchain
2. ✅ Update frontend to call real API
3. ✅ Test complete end-to-end flow
4. ✅ Add more test data and scenarios

## Files Created

- `scripts/deploy-chaincode-custom.sh` - Automated deployment script (bash)
- `scripts/test-chaincode.sh` - Automated test script (bash)
- This file - Manual PowerShell commands

Choose whichever method works best for you!
