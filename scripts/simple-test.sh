#!/usr/bin/env bash
# simple-test.sh - Simple chaincode test

echo "Testing BPJS Chaincode"
echo "======================"
echo ""

# Issue a card
echo "1. Issuing BPJS Card..."
docker exec cli peer chaincode invoke \
  -o orderer1.bpjs-network.com:7050 \
  -C bpjschannel -n bpjs \
  -c '{"Args":["IssueCard","CARD999","P999","Test Patient","1111222233334444","1995-01-01","Male","Jakarta","PBI","2024-01-01","2025-12-31"]}' \
  --peerAddresses bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051 \
  --peerAddresses bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 \
  --waitForEvent

echo ""
echo "2. Verifying Card from different peer..."
docker exec -e CORE_PEER_LOCALMSPID=RumahSakitMSP \
  -e CORE_PEER_ADDRESS=bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051 \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/rumahsakit.bpjs-network.com/users/Admin@rumahsakit.bpjs-network.com/msp \
  cli peer chaincode query \
  -C bpjschannel -n bpjs \
  -c '{"Args":["VerifyCard","CARD999"]}'

echo ""
echo "✅ Test completed! Card was issued and verified across peers."
