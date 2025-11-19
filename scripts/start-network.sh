#!/bin/bash

# BPJS Blockchain Network Startup Script
# This script initializes the Hyperledger Fabric network

set -e

echo "========================================="
echo "BPJS Blockchain Network - Startup Script"
echo "========================================="

# Set environment variables
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}

# Function to print colored output
print_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Clean up previous network
print_info "Cleaning up previous network..."
docker-compose down --volumes --remove-orphans
rm -rf crypto-config
rm -rf channel-artifacts/*
rm -rf system-genesis-block/*

# Generate crypto materials
print_info "Generating crypto materials..."
cryptogen generate --config=./crypto-config.yaml --output="crypto-config"

if [ $? -ne 0 ]; then
    print_error "Failed to generate crypto materials"
    exit 1
fi

print_success "Crypto materials generated"

# Create channel artifacts directory
mkdir -p channel-artifacts
mkdir -p system-genesis-block

# Generate genesis block
print_info "Generating genesis block..."
configtxgen -profile BPJSOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block

if [ $? -ne 0 ]; then
    print_error "Failed to generate genesis block"
    exit 1
fi

print_success "Genesis block created"

# Generate channel configuration transaction
print_info "Generating channel configuration..."
configtxgen -profile BPJSMainChannel -outputCreateChannelTx ./channel-artifacts/bpjs-main.tx -channelID bpjs-main

if [ $? -ne 0 ]; then
    print_error "Failed to generate channel configuration"
    exit 1
fi

print_success "Channel configuration created"

# Generate anchor peer updates for each organization
print_info "Generating anchor peer updates..."

configtxgen -profile BPJSMainChannel -outputAnchorPeersUpdate ./channel-artifacts/BPJSMSPanchors.tx -channelID bpjs-main -asOrg BPJS
configtxgen -profile BPJSMainChannel -outputAnchorPeersUpdate ./channel-artifacts/RumahSakitMSPanchors.tx -channelID bpjs-main -asOrg RumahSakit
configtxgen -profile BPJSMainChannel -outputAnchorPeersUpdate ./channel-artifacts/PuskesmasMSPanchors.tx -channelID bpjs-main -asOrg Puskesmas

print_success "Anchor peer updates created"

# Start the network
print_info "Starting Docker containers..."
docker-compose up -d

if [ $? -ne 0 ]; then
    print_error "Failed to start Docker containers"
    exit 1
fi

print_success "Docker containers started"

# Wait for containers to start
print_info "Waiting for containers to initialize..."
sleep 10

# Create channel
print_info "Creating channel 'bpjs-main'..."
docker exec cli peer channel create -o orderer1.bpjs-network.com:7050 -c bpjs-main -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/bpjs-main.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/bpjs-network.com/orderers/orderer1.bpjs-network.com/msp/tlscacerts/tlsca.bpjs-network.com-cert.pem

if [ $? -ne 0 ]; then
    print_error "Failed to create channel"
    exit 1
fi

print_success "Channel 'bpjs-main' created"

# Join BPJS peers to channel
print_info "Joining BPJS peers to channel..."
docker exec cli peer channel join -b bpjs-main.block

# Switch to peer1
docker exec -e CORE_PEER_ADDRESS=peer1.bpjs.bpjs-network.com:8051 cli peer channel join -b bpjs-main.block

# Join RumahSakit peers
print_info "Joining RumahSakit peers to channel..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=peer0.rumahsakit.bpjs-network.com:9051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/peers/peer0.rumahsakit.bpjs-network.com/tls/ca.crt \
    cli peer channel join -b bpjs-main.block

docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
    -e CORE_PEER_ADDRESS=peer1.rumahsakit.bpjs-network.com:10051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/peers/peer1.rumahsakit.bpjs-network.com/tls/ca.crt \
    cli peer channel join -b bpjs-main.block

# Join Puskesmas peers
print_info "Joining Puskesmas peers to channel..."
docker exec -e CORE_PEER_LOCALMSPID=PuskesmasMSP \
    -e CORE_PEER_ADDRESS=peer0.puskesmas.bpjs-network.com:11051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/puskesmas.bpjs-network.com/users/Admin@puskesmas.bpjs-network.com/msp \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/puskesmas.bpjs-network.com/peers/peer0.puskesmas.bpjs-network.com/tls/ca.crt \
    cli peer channel join -b bpjs-main.block

docker exec -e CORE_PEER_LOCALMSPID=PuskesmasMSP \
    -e CORE_PEER_ADDRESS=peer1.puskesmas.bpjs-network.com:12051 \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/puskesmas.bpjs-network.com/users/Admin@puskesmas.bpjs-network.com/msp \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/puskesmas.bpjs-network.com/peers/peer1.puskesmas.bpjs-network.com/tls/ca.crt \
    cli peer channel join -b bpjs-main.block

print_success "All peers joined to channel"

# Update anchor peers
print_info "Updating anchor peers..."
docker exec cli peer channel update -o orderer1.bpjs-network.com:7050 -c bpjs-main -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/BPJSMSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/bpjs-network.com/orderers/orderer1.bpjs-network.com/msp/tlscacerts/tlsca.bpjs-network.com-cert.pem

print_success "Anchor peers updated"

# Display network status
echo ""
echo "========================================="
echo "Network Status"
echo "========================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
print_success "BPJS Blockchain Network is UP and RUNNING!"
echo ""
echo "Next steps:"
echo "  1. Deploy chaincode: cd ../scripts && ./deploy-chaincode.sh"
echo "  2. Start API server: cd ../api && npm install && npm run start:dev"
echo "  3. Access blockchain explorer: http://localhost:8080"
echo ""
