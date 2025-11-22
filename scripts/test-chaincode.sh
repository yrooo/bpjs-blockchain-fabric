#!/usr/bin/env bash
# test-chaincode.sh - Test BPJS chaincode functions and peer communication

set -euo pipefail

# Configuration
CHAINCODE_NAME="bpjs"
CHANNEL_NAME="bpjschannel"
PEER_BPJS="bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1"
PEER_RS="bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1"
ORDERER="orderer1.bpjs-network.com"
CLI="cli"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================="
echo "BPJS Chaincode Test Script"
echo "=========================================="
echo ""

# Test 1: Issue a card from BPJS peer
echo -e "${BLUE}Test 1: Issue BPJS Card from BPJS Peer${NC}"
echo "Issuing card CARD001 for patient P001..."
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP \
    -e CORE_PEER_ADDRESS=${PEER_BPJS}:7051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp \
    ${CLI} peer chaincode invoke \
    -o ${ORDERER}:7050 \
    -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    -c '{"Args":["IssueCard","CARD001","P001","Budi Santoso","1234567890123456","1990-01-01","Male","Jakarta Selatan","PBI","2024-01-01","2025-01-01"]}' \
    --peerAddresses ${PEER_BPJS}:7051 \
    --peerAddresses ${PEER_RS}:9051 \
    --waitForEvent

echo -e "${GREEN}✓ Card issued${NC}"
echo ""
sleep 2

# Test 2: Verify card from different peer (RS peer)
echo -e "${BLUE}Test 2: Verify Card from Rumah Sakit Peer (Cross-peer query)${NC}"
echo "Querying CARD001 from different peer..."
VERIFY_RESULT=$(docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=${PEER_RS}:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    ${CLI} peer chaincode query \
    -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    -c '{"Args":["VerifyCard","CARD001"]}')

echo "Result: ${VERIFY_RESULT}"
echo -e "${GREEN}✓ Card verified from different peer - Peer communication working!${NC}"
echo ""
sleep 2

# Test 3: Record visit from RS peer
echo -e "${BLUE}Test 3: Record Patient Visit from Rumah Sakit Peer${NC}"
echo "Recording visit VISIT001..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=${PEER_RS}:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    ${CLI} peer chaincode invoke \
    -o ${ORDERER}:7050 \
    -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    -c '{"Args":["RecordVisit","VISIT001","CARD001","P001","Budi Santoso","RS001","RS Siloam Jakarta","rumahsakit","2024-01-15","outpatient","Influenza","Paracetamol and rest","Dr. Ahmad","DOC001","Regular checkup"]}' \
    --peerAddresses ${PEER_BPJS}:7051 \
    --peerAddresses ${PEER_RS}:9051 \
    --waitForEvent

echo -e "${GREEN}✓ Visit recorded${NC}"
echo ""
sleep 2

# Test 4: Query visits from BPJS peer
echo -e "${BLUE}Test 4: Query Patient Visits from BPJS Peer (Cross-peer query)${NC}"
echo "Querying visits for patient P001..."
VISITS_RESULT=$(docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP \
    -e CORE_PEER_ADDRESS=${PEER_BPJS}:7051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp \
    ${CLI} peer chaincode query \
    -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    -c '{"Args":["GetPatientVisits","P001"]}')

echo "Result: ${VISITS_RESULT}"
echo -e "${GREEN}✓ Visits queried from different peer${NC}"
echo ""
sleep 2

# Test 5: Submit claim from RS peer
echo -e "${BLUE}Test 5: Submit Insurance Claim from Rumah Sakit Peer${NC}"
echo "Submitting claim CLAIM001..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=${PEER_RS}:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    ${CLI} peer chaincode invoke \
    -o ${ORDERER}:7050 \
    -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    -c '{"Args":["SubmitClaim","CLAIM001","P001","Budi Santoso","CARD001","VISIT001","RS001","RS Siloam Jakarta","rawat-jalan","2024-01-15","Influenza","Consultation and medicine","500000","450000"]}' \
    --peerAddresses ${PEER_BPJS}:7051 \
    --peerAddresses ${PEER_RS}:9051 \
    --waitForEvent

echo -e "${GREEN}✓ Claim submitted${NC}"
echo ""
sleep 2

# Test 6: Process claim from BPJS peer
echo -e "${BLUE}Test 6: Process Claim from BPJS Peer (Approve)${NC}"
echo "Processing claim CLAIM001..."
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP \
    -e CORE_PEER_ADDRESS=${PEER_BPJS}:7051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp \
    ${CLI} peer chaincode invoke \
    -o ${ORDERER}:7050 \
    -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    -c '{"Args":["ProcessClaim","CLAIM001","approved","All documents verified. Payment scheduled."]}' \
    --peerAddresses ${PEER_BPJS}:7051 \
    --peerAddresses ${PEER_RS}:9051 \
    --waitForEvent

echo -e "${GREEN}✓ Claim approved${NC}"
echo ""
sleep 2

# Test 7: Query claims from RS peer
echo -e "${BLUE}Test 7: Query Patient Claims from Rumah Sakit Peer${NC}"
echo "Querying claims for patient P001..."
CLAIMS_RESULT=$(docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=${PEER_RS}:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    ${CLI} peer chaincode query \
    -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    -c '{"Args":["GetPatientClaims","P001"]}')

echo "Result: ${CLAIMS_RESULT}"
echo -e "${GREEN}✓ Claims queried${NC}"
echo ""
sleep 2

# Test 8: Create referral from RS peer
echo -e "${BLUE}Test 8: Create Referral from Rumah Sakit Peer${NC}"
echo "Creating referral REF001..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=${PEER_RS}:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    ${CLI} peer chaincode invoke \
    -o ${ORDERER}:7050 \
    -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    -c '{"Args":["CreateReferral","REF001","P001","Budi Santoso","CARD001","PKM001","Puskesmas Kelapa Gading","RS001","RS Siloam Jakarta","Specialist consultation needed","Complex respiratory condition","Dr. Siti","2024-01-15","2024-02-15","Urgent referral for pulmonologist"]}' \
    --peerAddresses ${PEER_BPJS}:7051 \
    --peerAddresses ${PEER_RS}:9051 \
    --waitForEvent

echo -e "${GREEN}✓ Referral created${NC}"
echo ""
sleep 2

# Test 9: Update referral status
echo -e "${BLUE}Test 9: Update Referral Status${NC}"
echo "Accepting referral REF001..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=${PEER_RS}:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    ${CLI} peer chaincode invoke \
    -o ${ORDERER}:7050 \
    -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    -c '{"Args":["UpdateReferralStatus","REF001","accepted","Dr. Wong","Patient scheduled for consultation tomorrow"]}' \
    --peerAddresses ${PEER_BPJS}:7051 \
    --peerAddresses ${PEER_RS}:9051 \
    --waitForEvent

echo -e "${GREEN}✓ Referral accepted${NC}"
echo ""
sleep 2

# Test 10: Query audit logs
echo -e "${BLUE}Test 10: Query Audit Logs${NC}"
echo "Querying audit logs..."
AUDIT_RESULT=$(docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP \
    -e CORE_PEER_ADDRESS=${PEER_BPJS}:7051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp \
    ${CLI} peer chaincode query \
    -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    -c '{"Args":["QueryAuditLogs","AUDIT_0","AUDIT_999999999999999"]}')

echo "Audit logs found: $(echo ${AUDIT_RESULT} | grep -o 'LogID' | wc -l) entries"
echo -e "${GREEN}✓ Audit logs queried${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✓ Card issuance working"
echo "  ✓ Cross-peer queries working (BPJS ↔ Rumah Sakit)"
echo "  ✓ Visit recording working"
echo "  ✓ Claim submission and processing working"
echo "  ✓ Referral system working"
echo "  ✓ Audit trail working"
echo ""
echo "🎉 Your blockchain network is fully operational!"
echo "    Peers are communicating correctly."
echo ""

exit 0
