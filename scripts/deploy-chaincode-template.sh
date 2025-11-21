#!/usr/bin/env bash
# deploy-chaincode-template.sh
# Template to package, install, approve and commit a Go chaincode using peer CLI inside peer containers.
# Edit the variables below to match your environment (peer container names, MSP, channel name).

set -euo pipefail

# === EDIT THESE VARIABLES BEFORE RUNNING ===
CHAINCODE_NAME="bpjs"
CHAINCODE_LABEL="bpjs_1"
CHAINCODE_VERSION="1.0"
CHAINCODE_PATH="/opt/chaincode"   # path inside container where chaincode will be copied (container path)
LOCAL_CHAINCODE_SRC="../chaincode" # path relative to this script on host
CHANNEL_NAME="bpjschannel"         # channel name
SEQUENCE=1
LANGUAGE="golang"

# Provide space-separated peer container names in order. Example:
# PEER_CONTAINERS=("peer0.bpjs.health.id" "peer0.rumahsakit.health.id" "peer0.puskesmas.health.id")
PEER_CONTAINERS=("peer0.bpjs.health.id")

# MSP info - edit per peer/org if needed
# For simple deployments using the peer CLI in each peer container, the container should have MSP/crypto configured.

# Temporary local package name
PKG_FILE="${CHAINCODE_LABEL}.tar.gz"

echo "Using chaincode name: ${CHAINCODE_NAME}, label: ${CHAINCODE_LABEL}, version: ${CHAINCODE_VERSION}"

# 1) Package chaincode inside the first peer container (we assume peer binary present there)
FIRST_PEER=${PEER_CONTAINERS[0]}

echo "Packaging chaincode using peer inside container: ${FIRST_PEER}"
# copy source into the container (so peer can access it)
# create destination path inside container
docker exec ${FIRST_PEER} mkdir -p ${CHAINCODE_PATH}
# copy source from host to container
docker cp ${LOCAL_CHAINCODE_SRC}/. ${FIRST_PEER}:${CHAINCODE_PATH}/

# run packaging command inside container
docker exec ${FIRST_PEER} peer lifecycle chaincode package /tmp/${PKG_FILE} --path ${CHAINCODE_PATH} --lang ${LANGUAGE} --label ${CHAINCODE_LABEL}

# copy package back to host
docker cp ${FIRST_PEER}:/tmp/${PKG_FILE} ./

# 2) Install package on each peer
for PEER in "${PEER_CONTAINERS[@]}"; do
  echo "Copying package to ${PEER} and installing..."
  docker cp ./${PKG_FILE} ${PEER}:/tmp/${PKG_FILE}
  docker exec ${PEER} peer lifecycle chaincode install /tmp/${PKG_FILE}
  echo "Installed on ${PEER}"
done

# 3) Get package ID from one peer
echo "Querying installed packages to obtain package ID..."
PKG_ID=$(docker exec ${FIRST_PEER} peer lifecycle chaincode queryinstalled | sed -n 's/^.*Package ID: \([^,]*\), Label: ${CHAINCODE_LABEL}.*/\1/p' | head -n1)

if [ -z "$PKG_ID" ]; then
  echo "ERROR: Could not determine package ID. Run 'docker exec ${FIRST_PEER} peer lifecycle chaincode queryinstalled' to inspect." >&2
  exit 1
fi

echo "Found package ID: $PKG_ID"

# 4) Approve chaincode definition for each org (run in each org's peer container)
for PEER in "${PEER_CONTAINERS[@]}"; do
  echo "Approving chaincode for org (using peer container ${PEER})..."
  docker exec ${PEER} peer lifecycle chaincode approveformyorg \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version ${CHAINCODE_VERSION} \
    --package-id ${PKG_ID} \
    --sequence ${SEQUENCE} \
    --init-required false \
    --tls false || true
done

# 5) Check commit readiness (from first peer)
echo "Checking commit readiness..."
docker exec ${FIRST_PEER} peer lifecycle chaincode checkcommitreadiness \
  --channelID ${CHANNEL_NAME} \
  --name ${CHAINCODE_NAME} \
  --version ${CHAINCODE_VERSION} \
  --sequence ${SEQUENCE} \
  --output json || true

# 6) Commit chaincode definition using one of the peers and specify the peer addresses for endorsement
# NOTE: If you have multiple orgs/peers, add their addresses and TLS info below.

# Example: For multiple peers, build --peerAddresses args
PEER_ADDR_ARGS=""
for PEER in "${PEER_CONTAINERS[@]}"; do
  # adjust ports if necessary; assumes default port inside container is correct
  PEER_ADDR_ARGS+=" --peerAddresses ${PEER}:7051"
done

# Commit
echo "Committing chaincode definition..."
docker exec ${FIRST_PEER} peer lifecycle chaincode commit \
  --channelID ${CHANNEL_NAME} \
  --name ${CHAINCODE_NAME} \
  --version ${CHAINCODE_VERSION} \
  --sequence ${SEQUENCE} \
  ${PEER_ADDR_ARGS} \
  --init-required false \
  --tls false || true

# 7) Query committed
echo "Querying committed chaincodes on channel ${CHANNEL_NAME}..."
docker exec ${FIRST_PEER} peer lifecycle chaincode querycommitted --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME}

echo "Done. If everything looks good, invoke a transaction to verify." 

echo "Cleanup local package file: ${PKG_FILE}"
rm -f ./${PKG_FILE}

# Reminder: you may need to set env vars like CORE_PEER_MSPCONFIGPATH inside the containers depending on how they are configured.

exit 0
