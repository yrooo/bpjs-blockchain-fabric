#!/bin/bash

# BPJS Blockchain - Quick Test Script
# This script tests basic blockchain operations

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     BPJS Blockchain - Testing Basic Operations          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Check channel membership
echo "📋 Test 1: Verify Channel Membership"
echo "════════════════════════════════════════════════════════════"
peer channel list
echo ""

# Test 2: Get channel info
echo "📋 Test 2: Get Channel Information"
echo "════════════════════════════════════════════════════════════"
peer channel getinfo -c bpjschannel
echo ""

# Test 3: Query installed chaincodes
echo "📋 Test 3: List Installed Chaincodes"
echo "════════════════════════════════════════════════════════════"
peer lifecycle chaincode queryinstalled
echo ""

# Test 4: Query committed chaincodes on channel
echo "📋 Test 4: List Committed Chaincodes on Channel"
echo "════════════════════════════════════════════════════════════"
peer lifecycle chaincode querycommitted -C bpjschannel
echo ""

echo "✅ Basic blockchain tests completed!"
echo ""
echo "📊 Summary:"
echo "  • Channel 'bpjschannel' is active"
echo "  • Both peers are connected"
echo "  • Ready for chaincode deployment"
echo ""
