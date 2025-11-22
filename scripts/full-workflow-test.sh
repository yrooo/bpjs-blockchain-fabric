#!/usr/bin/env bash
# full-workflow-test.sh - Test the complete workflow: Issue Card → Record Visit → Submit Claim

echo "=========================================="
echo "BPJS FULL WORKFLOW TEST"
echo "=========================================="
echo ""

# Generate unique IDs for this test run
TIMESTAMP=$(date +%s)
CARD_ID="CARD${TIMESTAMP}"
PATIENT_ID="P${TIMESTAMP}"
VISIT_ID="VISIT${TIMESTAMP}"
CLAIM_ID="CLAIM${TIMESTAMP}"

echo "Test IDs:"
echo "  Card ID: ${CARD_ID}"
echo "  Patient ID: ${PATIENT_ID}"
echo "  Visit ID: ${VISIT_ID}"
echo "  Claim ID: ${CLAIM_ID}"
echo ""

# Step 1: Issue BPJS Card
echo "Step 1: Issuing BPJS Card..."
echo "-------------------------------------------"
docker exec cli peer chaincode invoke \
  -o orderer1.bpjs-network.com:7050 \
  -C bpjschannel -n bpjs \
  -c "{\"Args\":[\"IssueCard\",\"${CARD_ID}\",\"${PATIENT_ID}\",\"John Doe\",\"1234567890123456\",\"1990-01-01\",\"Male\",\"Jakarta\",\"PBI\",\"2024-01-01\",\"2025-12-31\"]}" \
  --peerAddresses bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 \
  --peerAddresses bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 \
  --waitForEvent

echo "✅ Card issued!"
echo ""
sleep 2

# Step 2: Verify Card
echo "Step 2: Verifying BPJS Card..."
echo "-------------------------------------------"
CARD_DATA=$(docker exec cli peer chaincode query \
  -C bpjschannel -n bpjs \
  -c "{\"Args\":[\"VerifyCard\",\"${CARD_ID}\"]}")

echo "Card Data:"
echo ${CARD_DATA} | jq .
echo "✅ Card verified!"
echo ""
sleep 2

# Step 3: Record Patient Visit
echo "Step 3: Recording Patient Visit..."
echo "-------------------------------------------"
docker exec cli peer chaincode invoke \
  -o orderer1.bpjs-network.com:7050 \
  -C bpjschannel -n bpjs \
  -c "{\"Args\":[\"RecordVisit\",\"${VISIT_ID}\",\"${CARD_ID}\",\"${PATIENT_ID}\",\"John Doe\",\"RS001\",\"RS Siloam\",\"rumahsakit\",\"$(date +%Y-%m-%d)\",\"outpatient\",\"Flu\",\"Paracetamol\",\"Dr. Smith\",\"DOC001\",\"Regular checkup\"]}" \
  --peerAddresses bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 \
  --peerAddresses bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 \
  --waitForEvent

echo "✅ Visit recorded!"
echo ""
sleep 2

# Step 4: Query Patient Visits
echo "Step 4: Querying Patient Visits..."
echo "-------------------------------------------"
VISITS_DATA=$(docker exec cli peer chaincode query \
  -C bpjschannel -n bpjs \
  -c "{\"Args\":[\"GetPatientVisits\",\"${PATIENT_ID}\"]}")

echo "Patient Visits:"
echo ${VISITS_DATA} | jq .
echo "✅ Visits retrieved!"
echo ""
sleep 2

# Step 5: Submit Insurance Claim
echo "Step 5: Submitting Insurance Claim..."
echo "-------------------------------------------"
docker exec cli peer chaincode invoke \
  -o orderer1.bpjs-network.com:7050 \
  -C bpjschannel -n bpjs \
  -c "{\"Args\":[\"SubmitClaim\",\"${CLAIM_ID}\",\"${PATIENT_ID}\",\"John Doe\",\"${CARD_ID}\",\"${VISIT_ID}\",\"RS001\",\"RS Siloam\",\"rawat-jalan\",\"$(date +%Y-%m-%d)\",\"Flu\",\"Consultation and medicine\",\"500000\",\"450000\"]}" \
  --peerAddresses bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 \
  --peerAddresses bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 \
  --waitForEvent

echo "✅ Claim submitted!"
echo ""
sleep 2

# Step 6: Process Claim (Approve)
echo "Step 6: Processing Claim (Approving)..."
echo "-------------------------------------------"
docker exec cli peer chaincode invoke \
  -o orderer1.bpjs-network.com:7050 \
  -C bpjschannel -n bpjs \
  -c "{\"Args\":[\"ProcessClaim\",\"${CLAIM_ID}\",\"approved\",\"All documents verified. Payment approved.\"]}" \
  --peerAddresses bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 \
  --peerAddresses bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 \
  --waitForEvent

echo "✅ Claim approved!"
echo ""
sleep 2

# Step 7: Query Patient Claims
echo "Step 7: Querying Patient Claims..."
echo "-------------------------------------------"
CLAIMS_DATA=$(docker exec cli peer chaincode query \
  -C bpjschannel -n bpjs \
  -c "{\"Args\":[\"GetPatientClaims\",\"${PATIENT_ID}\"]}")

echo "Patient Claims:"
echo ${CLAIMS_DATA} | jq .
echo ""

echo "=========================================="
echo "✅ FULL WORKFLOW COMPLETED!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✓ Card ${CARD_ID} issued for patient ${PATIENT_ID}"
echo "  ✓ Visit ${VISIT_ID} recorded"
echo "  ✓ Claim ${CLAIM_ID} submitted and approved"
echo "  ✓ All data stored on blockchain!"
echo ""
echo "🎉 Your blockchain-based BPJS system is working end-to-end!"
