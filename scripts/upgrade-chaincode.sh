#!/bin/bash

# Upgrade BPJS Chaincode to v1.2 with GetAll functions

echo "========================================="
echo "Upgrading BPJS Chaincode to v1.2"
echo "========================================="

set -e

CHAINCODE_NAME="bpjs"
CHANNEL_NAME="bpjschannel"
VERSION="1.2"
SEQUENCE=3

echo "📦 Packaging chaincode v${VERSION}..."
docker exec cli peer lifecycle chaincode package ${CHAINCODE_NAME}_${VERSION}.tar.gz \
    --path /opt/gopath/src/github.com/chaincode/ \
    --lang golang \
    --label ${CHAINCODE_NAME}_${VERSION}

echo "✅ Chaincode packaged"

echo ""
echo "📤 Installing on peer0.bpjs..."
docker exec cli peer lifecycle chaincode install ${CHAINCODE_NAME}_${VERSION}.tar.gz

echo ""
echo "📤 Installing on peer0.rumahsakit..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=peer0.rumahsakit.bpjs-network.com:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/peers/peer0.rumahsakit.bpjs-network.com/tls/ca.crt \
    cli peer lifecycle chaincode install ${CHAINCODE_NAME}_${VERSION}.tar.gz

echo ""
echo "🔍 Getting package ID..."
PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | grep ${CHAINCODE_NAME}_${VERSION} | sed 's/Package ID: //' | sed 's/, Label.*//')
echo "Package ID: $PACKAGE_ID"

echo ""
echo "✅ Approving chaincode for BPJS..."
docker exec cli peer lifecycle chaincode approveformyorg \
    -o orderer1.bpjs-network.com:7050 \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $VERSION \
    --package-id $PACKAGE_ID \
    --sequence $SEQUENCE

echo ""
echo "✅ Approving chaincode for RumahSakit..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=peer0.rumahsakit.bpjs-network.com:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/peers/peer0.rumahsakit.bpjs-network.com/tls/ca.crt \
    cli peer lifecycle chaincode approveformyorg \
    -o orderer1.bpjs-network.com:7050 \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $VERSION \
    --package-id $PACKAGE_ID \
    --sequence $SEQUENCE

echo ""
echo "🔍 Checking commit readiness..."
docker exec cli peer lifecycle chaincode checkcommitreadiness \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $VERSION \
    --sequence $SEQUENCE

echo ""
echo "🚀 Committing chaincode to channel..."
docker exec cli peer lifecycle chaincode commit \
    -o orderer1.bpjs-network.com:7050 \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $VERSION \
    --sequence $SEQUENCE \
    --peerAddresses peer0.bpjs.bpjs-network.com:7051 \
    --peerAddresses peer0.rumahsakit.bpjs-network.com:9051

echo ""
echo "✅ Verifying deployment..."
docker exec cli peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME

echo ""
echo "========================================="
echo "✅ Chaincode v${VERSION} Deployed Successfully!"
echo "========================================="
echo ""
echo "New functions available:"
echo "  - GetAllCards"
echo "  - GetAllVisits"
echo "  - GetAllClaims"
echo "  - GetAllReferrals"
echo "  - GetAllAuditLogs"
echo ""
echo "Test with:"
echo "docker exec cli peer chaincode query -C bpjschannel -n bpjs -c '{\"Args\":[\"GetAllCards\"]}'"
