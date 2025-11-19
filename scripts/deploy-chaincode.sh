#!/bin/bash

# Chaincode Deployment Script for BPJS Blockchain

set -e

echo "========================================="
echo "BPJS Chaincode Deployment Script"
echo "========================================="

CHANNEL_NAME="bpjs-main"
CC_NAME="bpjs"
CC_VERSION="1.0"
CC_SEQUENCE=1
CC_SRC_PATH="../chaincode"

print_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Package chaincode
print_info "Packaging chaincode..."
cd ../chaincode
GO111MODULE=on go mod vendor
cd -

docker exec cli peer lifecycle chaincode package bpjs.tar.gz \
    --path /opt/gopath/src/github.com/chaincode \
    --lang golang \
    --label ${CC_NAME}_${CC_VERSION}

print_success "Chaincode packaged"

# Install on BPJS peers
print_info "Installing chaincode on BPJS peers..."
docker exec cli peer lifecycle chaincode install bpjs.tar.gz

docker exec -e CORE_PEER_ADDRESS=peer1.bpjs.bpjs-network.com:8051 \
    cli peer lifecycle chaincode install bpjs.tar.gz

# Install on RumahSakit peers
print_info "Installing chaincode on RumahSakit peers..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=peer0.rumahsakit.bpjs-network.com:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/peers/peer0.rumahsakit.bpjs-network.com/tls/ca.crt \
    cli peer lifecycle chaincode install bpjs.tar.gz

# Install on Puskesmas peers
print_info "Installing chaincode on Puskesmas peers..."
docker exec -e CORE_PEER_LOCALMSPID=PuskesmasMSP \
    -e CORE_PEER_ADDRESS=peer0.puskesmas.bpjs-network.com:11051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/puskesmas.bpjs-network.com/users/Admin@puskesmas.bpjs-network.com/msp \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/puskesmas.bpjs-network.com/peers/peer0.puskesmas.bpjs-network.com/tls/ca.crt \
    cli peer lifecycle chaincode install bpjs.tar.gz

print_success "Chaincode installed on all peers"

# Query installed chaincode to get package ID
print_info "Querying installed chaincode..."
PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | grep ${CC_NAME}_${CC_VERSION} | awk '{print $3}' | sed 's/,$//')

print_info "Package ID: $PACKAGE_ID"

# Approve chaincode for BPJS
print_info "Approving chaincode for BPJS..."
docker exec cli peer lifecycle chaincode approveformyorg \
    -o orderer1.bpjs-network.com:7050 \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/bpjs-network.com/orderers/orderer1.bpjs-network.com/msp/tlscacerts/tlsca.bpjs-network.com-cert.pem

# Approve for RumahSakit
print_info "Approving chaincode for RumahSakit..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=peer0.rumahsakit.bpjs-network.com:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/peers/peer0.rumahsakit.bpjs-network.com/tls/ca.crt \
    cli peer lifecycle chaincode approveformyorg \
    -o orderer1.bpjs-network.com:7050 \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/bpjs-network.com/orderers/orderer1.bpjs-network.com/msp/tlscacerts/tlsca.bpjs-network.com-cert.pem

# Approve for Puskesmas
print_info "Approving chaincode for Puskesmas..."
docker exec -e CORE_PEER_LOCALMSPID=PuskesmasMSP \
    -e CORE_PEER_ADDRESS=peer0.puskesmas.bpjs-network.com:11051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/puskesmas.bpjs-network.com/users/Admin@puskesmas.bpjs-network.com/msp \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/puskesmas.bpjs-network.com/peers/peer0.puskesmas.bpjs-network.com/tls/ca.crt \
    cli peer lifecycle chaincode approveformyorg \
    -o orderer1.bpjs-network.com:7050 \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/bpjs-network.com/orderers/orderer1.bpjs-network.com/msp/tlscacerts/tlsca.bpjs-network.com-cert.pem

print_success "Chaincode approved by all organizations"

# Check commit readiness
print_info "Checking commit readiness..."
docker exec cli peer lifecycle chaincode checkcommitreadiness \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/bpjs-network.com/orderers/orderer1.bpjs-network.com/msp/tlscacerts/tlsca.bpjs-network.com-cert.pem \
    --output json

# Commit chaincode
print_info "Committing chaincode..."
docker exec cli peer lifecycle chaincode commit \
    -o orderer1.bpjs-network.com:7050 \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/bpjs-network.com/orderers/orderer1.bpjs-network.com/msp/tlscacerts/tlsca.bpjs-network.com-cert.pem \
    --peerAddresses peer0.bpjs.bpjs-network.com:7051 \
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/peers/peer0.bpjs.bpjs-network.com/tls/ca.crt \
    --peerAddresses peer0.rumahsakit.bpjs-network.com:9051 \
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/peers/peer0.rumahsakit.bpjs-network.com/tls/ca.crt \
    --peerAddresses peer0.puskesmas.bpjs-network.com:11051 \
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/puskesmas.bpjs-network.com/peers/peer0.puskesmas.bpjs-network.com/tls/ca.crt

print_success "Chaincode committed successfully!"

# Query committed chaincode
print_info "Querying committed chaincode..."
docker exec cli peer lifecycle chaincode querycommitted \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME

echo ""
print_success "Chaincode deployment completed!"
echo ""
echo "Test the chaincode:"
echo "  docker exec cli peer chaincode invoke -o orderer1.bpjs-network.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/bpjs-network.com/orderers/orderer1.bpjs-network.com/msp/tlscacerts/tlsca.bpjs-network.com-cert.pem -C bpjs-main -n bpjs --peerAddresses peer0.bpjs.bpjs-network.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/peers/peer0.bpjs.bpjs-network.com/tls/ca.crt -c '{\"function\":\"IssueCard\",\"Args\":[\"CARD001\",\"P001\",\"John Doe\",\"1234567890\",\"1990-01-01\",\"Male\",\"Jakarta\",\"PBI\",\"2024-01-01\",\"2025-01-01\"]}'"
echo ""
