#!/usr/bin/env bash
# deploy-chaincode-custom.sh - Customized for your running network
# Deploys BPJS chaincode to your Fabric network

set -euo pipefail

# === CONFIGURED FOR YOUR NETWORK ===
CHAINCODE_NAME="bpjs"
CHAINCODE_LABEL="bpjs_1"
CHAINCODE_VERSION="1.0"
CHAINCODE_PATH="/opt/gopath/src/github.com/chaincode"
LOCAL_CHAINCODE_SRC="../chaincode"
CHANNEL_NAME="bpjschannel"
SEQUENCE=1
LANGUAGE="golang"

# Your peer containers from docker ps
PEER_BPJS="bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1"
PEER_RS="bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1"
ORDERER="orderer1.bpjs-network.com"
CLI="cli"

PKG_FILE="${CHAINCODE_LABEL}.tar.gz"

echo "=========================================="
echo "BPJS Chaincode Deployment Script"
echo "=========================================="
echo "Chaincode: ${CHAINCODE_NAME}"
echo "Label: ${CHAINCODE_LABEL}"
echo "Version: ${CHAINCODE_VERSION}"
echo "Channel: ${CHANNEL_NAME}"
echo ""
echo "Peers:"
echo "  - ${PEER_BPJS}"
echo "  - ${PEER_RS}"
echo "Orderer: ${ORDERER}"
echo "=========================================="
echo ""

# Check if containers are running
echo "Step 1: Checking containers..."
for CONTAINER in ${PEER_BPJS} ${PEER_RS} ${ORDERER} ${CLI}; do
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        echo "  ✓ ${CONTAINER} is running"
    else
        echo "  ✗ ERROR: ${CONTAINER} is not running!"
        exit 1
    fi
done
echo ""

# Use CLI container for all operations (recommended approach)
echo "Step 2: Copying chaincode to CLI container..."
docker exec ${CLI} mkdir -p ${CHAINCODE_PATH}
docker cp ${LOCAL_CHAINCODE_SRC}/. ${CLI}:${CHAINCODE_PATH}/
echo "  ✓ Chaincode copied"
echo ""

# Package chaincode
echo "Step 3: Packaging chaincode..."
docker exec ${CLI} peer lifecycle chaincode package /tmp/${PKG_FILE} \
    --path ${CHAINCODE_PATH} \
    --lang ${LANGUAGE} \
    --label ${CHAINCODE_LABEL}
echo "  ✓ Chaincode packaged: /tmp/${PKG_FILE}"
echo ""

# Install on BPJS peer
echo "Step 4: Installing chaincode on BPJS peer..."
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP \
    -e CORE_PEER_ADDRESS=${PEER_BPJS}:7051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp \
    ${CLI} peer lifecycle chaincode install /tmp/${PKG_FILE}
echo "  ✓ Installed on BPJS peer"
echo ""

# Install on Rumah Sakit peer
echo "Step 5: Installing chaincode on Rumah Sakit peer..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=${PEER_RS}:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    ${CLI} peer lifecycle chaincode install /tmp/${PKG_FILE}
echo "  ✓ Installed on Rumah Sakit peer"
echo ""

# Query installed to get package ID
echo "Step 6: Querying installed chaincode to get Package ID..."
PACKAGE_ID=$(docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP \
    -e CORE_PEER_ADDRESS=${PEER_BPJS}:7051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp \
    ${CLI} peer lifecycle chaincode queryinstalled 2>&1 | \
    grep "${CHAINCODE_LABEL}" | \
    sed -n 's/^Package ID: \([^,]*\), Label:.*/\1/p' | \
    head -n1)

if [ -z "$PACKAGE_ID" ]; then
    echo "  ✗ ERROR: Could not determine Package ID"
    echo "  Run manually: docker exec ${CLI} peer lifecycle chaincode queryinstalled"
    exit 1
fi

echo "  ✓ Package ID: ${PACKAGE_ID}"
echo ""

# Approve for BPJS org
echo "Step 7: Approving chaincode for BPJS organization..."
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP \
    -e CORE_PEER_ADDRESS=${PEER_BPJS}:7051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp \
    ${CLI} peer lifecycle chaincode approveformyorg \
    -o ${ORDERER}:7050 \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version ${CHAINCODE_VERSION} \
    --package-id ${PACKAGE_ID} \
    --sequence ${SEQUENCE} \
    --tls false
echo "  ✓ Approved for BPJS"
echo ""

# Approve for Rumah Sakit org
echo "Step 8: Approving chaincode for Rumah Sakit organization..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=${PEER_RS}:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    ${CLI} peer lifecycle chaincode approveformyorg \
    -o ${ORDERER}:7050 \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version ${CHAINCODE_VERSION} \
    --package-id ${PACKAGE_ID} \
    --sequence ${SEQUENCE} \
    --tls false
echo "  ✓ Approved for Rumah Sakit"
echo ""

# Check commit readiness
echo "Step 9: Checking commit readiness..."
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP \
    -e CORE_PEER_ADDRESS=${PEER_BPJS}:7051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp \
    ${CLI} peer lifecycle chaincode checkcommitreadiness \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version ${CHAINCODE_VERSION} \
    --sequence ${SEQUENCE} \
    --output json
echo ""

# Commit chaincode definition
echo "Step 10: Committing chaincode definition to channel..."
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP \
    -e CORE_PEER_ADDRESS=${PEER_BPJS}:7051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp \
    ${CLI} peer lifecycle chaincode commit \
    -o ${ORDERER}:7050 \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version ${CHAINCODE_VERSION} \
    --sequence ${SEQUENCE} \
    --peerAddresses ${PEER_BPJS}:7051 \
    --peerAddresses ${PEER_RS}:9051 \
    --tls false
echo "  ✓ Chaincode committed"
echo ""

# Query committed
echo "Step 11: Querying committed chaincode..."
docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP \
    -e CORE_PEER_ADDRESS=${PEER_BPJS}:7051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp \
    ${CLI} peer lifecycle chaincode querycommitted \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME}
echo ""

echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Test with: ./test-chaincode.sh"
echo "2. Or manually invoke functions (see below)"
echo ""
echo "Example test commands:"
echo ""
echo "# Issue a card:"
echo "docker exec -e CORE_PEER_LOCALMSPID=BPJSMSP \\"
echo "  -e CORE_PEER_ADDRESS=${PEER_BPJS}:7051 \\"
echo "  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp \\"
echo "  ${CLI} peer chaincode invoke \\"
echo "  -o ${ORDERER}:7050 \\"
echo "  -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \\"
echo "  -c '{\"Args\":[\"IssueCard\",\"CARD001\",\"P001\",\"Budi Santoso\",\"1234567890123456\",\"1990-01-01\",\"Male\",\"Jakarta\",\"PBI\",\"2024-01-01\",\"2025-01-01\"]}'"
echo ""
echo "# Verify card from different peer:"
echo "docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \\"
echo "  -e CORE_PEER_ADDRESS=${PEER_RS}:9051 \\"
echo "  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \\"
echo "  ${CLI} peer chaincode query \\"
echo "  -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \\"
echo "  -c '{\"Args\":[\"VerifyCard\",\"CARD001\"]}'"
echo ""

exit 0
