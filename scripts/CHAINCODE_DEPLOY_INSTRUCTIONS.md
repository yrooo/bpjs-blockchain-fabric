Chaincode Deployment Instructions
=================================

This document shows step-by-step commands to package, install, approve and commit the Go chaincode included in `chaincode/` using the Fabric lifecycle (v2.x).

Important: these are manual commands you can run from your Linux Mint terminal. Use the template script `deploy-chaincode-template.sh` to automate many of the steps after editing container names.

Assumptions
-----------
- Your Fabric network is up and running (Docker containers are active).
- You have peer CLI available inside peer containers.
- Channel name is `bpjschannel` (edit if your network uses a different name).
- Chaincode source is in repo `chaincode/`, Go chaincode (Fabric Go chaincode). The examples use chaincode name `bpjs` and label `bpjs_1`.
- Replace container names, MSP names and paths to match your setup.

1) Inspect running containers

Run:

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"
```

Note the peer container names you will target (example names used below):
- `peer0.bpjs.health.id`
- `peer0.rumahsakit.health.id`
- `peer0.puskesmas.health.id`

2) Copy chaincode into a peer container and package

Choose one peer container to perform packaging (it must have `peer` binary). Example uses `peer0.bpjs.health.id`.

```bash
# from repo/scripts or repo root
# 1) create a folder inside the peer container for source
docker exec peer0.bpjs.health.id mkdir -p /opt/chaincode
# 2) copy chaincode source from host to container
docker cp ../chaincode/. peer0.bpjs.health.id:/opt/chaincode/
# 3) package chaincode inside container
docker exec peer0.bpjs.health.id peer lifecycle chaincode package /tmp/bpjs_1.tar.gz --path /opt/chaincode --lang golang --label bpjs_1
# 4) copy package back to host (optional)
docker cp peer0.bpjs.health.id:/tmp/bpjs_1.tar.gz ./
```

3) Install package on peers

For each peer container run:

```bash
# copy package to peer (if package on host)
docker cp ./bpjs_1.tar.gz peer0.bpjs.health.id:/tmp/
# install inside peer
docker exec peer0.bpjs.health.id peer lifecycle chaincode install /tmp/bpjs_1.tar.gz
```

Repeat for `peer0.rumahsakit.health.id`, `peer0.puskesmas.health.id`, etc.

4) Query installed packages to get package ID

On any peer container run:

```bash
docker exec peer0.bpjs.health.id peer lifecycle chaincode queryinstalled
```

Output example:

```
Installed Chaincodes:
Package ID: bpjs_1:2f3b... , Label: bpjs_1
```

Copy the Package ID (everything before the comma). You'll use it in `approveformyorg`.

5) Approve chaincode definition for each organization

Run per org/peer container (adjust CORE_PEER_MSPCONFIGPATH if your container requires explicit admin identity):

```bash
docker exec peer0.bpjs.health.id peer lifecycle chaincode approveformyorg \
  --orderer orderer.bpjs.health.id:7050 \
  --channelID bpjschannel \
  --name bpjs \
  --version 1.0 \
  --package-id <PACKAGE_ID> \
  --sequence 1 \
  --init-required false
```

Repeat for each org's peer container.

6) Check commit readiness

From one peer container:

```bash
docker exec peer0.bpjs.health.id peer lifecycle chaincode checkcommitreadiness \
  --channelID bpjschannel \
  --name bpjs \
  --version 1.0 \
  --sequence 1 \
  --output json
```

7) Commit chaincode definition

Use one peer to commit, specifying all peer addresses for endorsement. Example (adjust peer addresses and TLS flags as needed):

```bash
docker exec peer0.bpjs.health.id peer lifecycle chaincode commit \
  --orderer orderer.bpjs.health.id:7050 \
  --channelID bpjschannel \
  --name bpjs \
  --version 1.0 \
  --sequence 1 \
  --peerAddresses peer0.bpjs.health.id:7051 \
  --peerAddresses peer0.rumahsakit.health.id:9051 \
  --peerAddresses peer0.puskesmas.health.id:11051 \
  --init-required false
```

8) Query committed chaincodes

```bash
docker exec peer0.bpjs.health.id peer lifecycle chaincode querycommitted --channelID bpjschannel --name bpjs
```

9) Invoke/test a transaction

If your chaincode has an Init/Invoke entrypoint, run an invoke or query:

```bash
# Example query (adjust args to your chaincode)
docker exec peer0.bpjs.health.id peer chaincode query -C bpjschannel -n bpjs -c '{"Args":["GetPatientVisits","P001"]}'

# Example invoke (submit transaction) - may require init or endorsement
docker exec peer0.bpjs.health.id peer chaincode invoke -o orderer.bpjs.health.id:7050 -C bpjschannel -n bpjs -c '{"Args":["IssueCard","CARD001","P001","Budi"]}'
```

Notes & Troubleshooting
-----------------------
- If you use TLS, add TLS flags `--tls --cafile /path/to/orderer/ca.pem` and provide `--peerAddresses` with TLS root certs.
- If `peer` binary not found in a container, use `fabric-tools` image or place `peer` binary in container PATH.
- If `approveformyorg` fails due to identity, set `CORE_PEER_MSPCONFIGPATH` and use the admin MSP in the container when running the command.
- Use `docker logs <container>` to inspect errors.

Automating
----------
Edit `deploy-chaincode-template.sh` and set:
- `PEER_CONTAINERS` array to match your container names
- `CHANNEL_NAME`, `CHAINCODE_NAME`, `CHAINCODE_LABEL`, `CHAINCODE_PATH` as needed

Then run:

```bash
chmod +x deploy-chaincode-template.sh
./deploy-chaincode-template.sh
```

If you want, paste `docker ps` output here and I'll adapt the script to your exact container names and ports.