#!/bin/bash

# Stop and cleanup BPJS Blockchain Network

echo "========================================="
echo "Stopping BPJS Blockchain Network"
echo "========================================="

cd ../network

# Stop all containers
echo "Stopping Docker containers..."
docker-compose down --volumes --remove-orphans

# Remove generated artifacts
echo "Cleaning up generated files..."
rm -rf crypto-config
rm -rf channel-artifacts/*
rm -rf system-genesis-block/*

# Remove chaincode images
echo "Removing chaincode Docker images..."
docker rmi $(docker images | grep "dev-peer" | awk '{print $3}') 2>/dev/null || true

# Prune unused volumes
echo "Pruning Docker volumes..."
docker volume prune -f

echo ""
echo "========================================="
echo "Network stopped and cleaned up!"
echo "========================================="
