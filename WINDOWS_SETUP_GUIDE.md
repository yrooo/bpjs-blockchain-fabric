version: '3.7'

volumes:
  orderer.bpjs-network.com:
  peer0.bpjs.bpjs-network.com:
  peer0.rumahsakit.bpjs-network.com:
  peer0.puskesmas.bpjs-network.com:

networks:
  bpjs:
    name: bpjs-blockchain-network

services:
  # ===== SINGLE ORDERING NODE (For 8GB RAM) =====
  
  orderer.bpjs-network.com:
    container_name: orderer.bpjs-network.com
    image: hyperledger/fabric-orderer:2.5
    environment:
      - FABRIC_LOGGING_SPEC=INFO
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_LISTENPORT=7050
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      - ORDERER_GENERAL_TLS_ENABLED=false
      - ORDERER_GENERAL_BOOTSTRAPMETHOD=none
      - ORDERER_CHANNELPARTICIPATION_ENABLED=true
      - ORDERER_ADMIN_TLS_ENABLED=false
      - ORDERER_ADMIN_LISTENADDRESS=0.0.0.0:7053
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
      - ./organizations/ordererOrganizations/bpjs-network.com/orderers/orderer.bpjs-network.com/msp:/var/hyperledger/orderer/msp
      - orderer.bpjs-network.com:/var/hyperledger/production/orderer
    ports:
      - 7050:7050
      - 7053:7053
    networks:
      - bpjs

  # ===== BPJS PEER =====

  peer0.bpjs.bpjs-network.com:
    container_name: peer0.bpjs.bpjs-network.com
    image: hyperledger/fabric-peer:2.5
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=bpjs-blockchain-network
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_TLS_ENABLED=false
      - CORE_PEER_PROFILE_ENABLED=false
      - CORE_PEER_ID=peer0.bpjs.bpjs-network.com
      - CORE_PEER_ADDRESS=peer0.bpjs.bpjs-network.com:7051
      - CORE_PEER_LISTENADDRESS=0.0.0.0:7051
      - CORE_PEER_CHAINCODEADDRESS=peer0.bpjs.bpjs-network.com:7052
      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:7052
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.bpjs.bpjs-network.com:7051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.bpjs.bpjs-network.com:7051
      - CORE_PEER_LOCALMSPID=BPJSMSP
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb0:5984
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=admin
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=adminpw
    volumes:
      - /var/run/docker.sock:/host/var/run/docker.sock
      - ./organizations/peerOrganizations/bpjs.bpjs-network.com/peers/peer0.bpjs.bpjs-network.com/msp:/etc/hyperledger/fabric/msp
      - peer0.bpjs.bpjs-network.com:/var/hyperledger/production
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
    ports:
      - 7051:7051
    networks:
      - bpjs
    depends_on:
      - couchdb0

  # ===== RUMAH SAKIT PEER =====

  peer0.rumahsakit.bpjs-network.com:
    container_name: peer0.rumahsakit.bpjs-network.com
    image: hyperledger/fabric-peer:2.5
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=bpjs-blockchain-network
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_TLS_ENABLED=false
      - CORE_PEER_PROFILE_ENABLED=false
      - CORE_PEER_ID=peer0.rumahsakit.bpjs-network.com
      - CORE_PEER_ADDRESS=peer0.rumahsakit.bpjs-network.com:9051
      - CORE_PEER_LISTENADDRESS=0.0.0.0:9051
      - CORE_PEER_CHAINCODEADDRESS=peer0.rumahsakit.bpjs-network.com:9052
      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:9052
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.rumahsakit.bpjs-network.com:9051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.rumahsakit.bpjs-network.com:9051
      - CORE_PEER_LOCALMSPID=RumahSakitMSP
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb1:5984
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=admin
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=adminpw
    volumes:
      - /var/run/docker.sock:/host/var/run/docker.sock
      - ./organizations/peerOrganizations/rumahsakit.bpjs-network.com/peers/peer0.rumahsakit.bpjs-network.com/msp:/etc/hyperledger/fabric/msp
      - peer0.rumahsakit.bpjs-network.com:/var/hyperledger/production
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
    ports:
      - 9051:9051
    networks:
      - bpjs
    depends_on:
      - couchdb1

  # ===== PUSKESMAS PEER =====

  peer0.puskesmas.bpjs-network.com:
    container_name: peer0.puskesmas.bpjs-network.com
    image: hyperledger/fabric-peer:2.5
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=bpjs-blockchain-network
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_TLS_ENABLED=false
      - CORE_PEER_PROFILE_ENABLED=false
      - CORE_PEER_ID=peer0.puskesmas.bpjs-network.com
      - CORE_PEER_ADDRESS=peer0.puskesmas.bpjs-network.com:11051
      - CORE_PEER_LISTENADDRESS=0.0.0.0:11051
      - CORE_PEER_CHAINCODEADDRESS=peer0.puskesmas.bpjs-network.com:11052
      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:11052
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.puskesmas.bpjs-network.com:11051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.puskesmas.bpjs-network.com:11051
      - CORE_PEER_LOCALMSPID=PuskesmasMSP
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb2:5984
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=admin
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=adminpw
    volumes:
      - /var/run/docker.sock:/host/var/run/docker.sock
      - ./organizations/peerOrganizations/puskesmas.bpjs-network.com/peers/peer0.puskesmas.bpjs-network.com/msp:/etc/hyperledger/fabric/msp
      - peer0.puskesmas.bpjs-network.com:/var/hyperledger/production
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
    ports:
      - 11051:11051
    networks:
      - bpjs
    depends_on:
      - couchdb2

  # ===== COUCHDB INSTANCES =====

  couchdb0:
    container_name: couchdb0
    image: couchdb:3.3
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=adminpw
    ports:
      - 5984:5984
    networks:
      - bpjs

  couchdb1:
    container_name: couchdb1
    image: couchdb:3.3
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=adminpw
    ports:
      - 6984:5984
    networks:
      - bpjs

  couchdb2:
    container_name: couchdb2
    image: couchdb:3.3
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=adminpw
    ports:
      - 7984:5984
    networks:
      - bpjs

  # ===== CLI TOOL =====

  cli:
    container_name: cli
    image: hyperledger/fabric-tools:2.5
    tty: true
    stdin_open: true
    environment:
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer0.bpjs.bpjs-network.com:7051
      - CORE_PEER_LOCALMSPID=BPJSMSP
      - CORE_PEER_TLS_ENABLED=false
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bpjs.bpjs-network.com/users/Admin@bpjs.bpjs-network.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: /bin/bash
    volumes:
      - /var/run/:/host/var/run/
      - ../../chaincode/:/opt/gopath/src/github.com/chaincode
      - ./organizations:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
      - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    networks:
      - bpjs
