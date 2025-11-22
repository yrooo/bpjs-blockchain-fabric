import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from '../utils/logger';

const execAsync = promisify(exec);
const logger = createLogger('BlockchainService');

// Environment variables
const CLI_CONTAINER = process.env.CLI_CONTAINER || 'cli';
const CHANNEL_NAME = process.env.CHANNEL_NAME || 'bpjschannel';
const CHAINCODE_NAME = process.env.CHAINCODE_NAME || 'bpjs';
const ORDERER_ADDRESS = process.env.ORDERER_ADDRESS || 'orderer1.bpjs-network.com:7050';
const PEER_BPJS_ADDRESS = process.env.PEER_BPJS_ADDRESS || 'bpjs-blockchain-fabric-peer0.bpjs.bpjs-network.com-1:7051';
const PEER_RUMAHSAKIT_ADDRESS = process.env.PEER_RUMAHSAKIT_ADDRESS || 'bpjs-blockchain-fabric-peer0.rumahsakit.bpjs-network.com-1:9051';

// This service uses Docker exec to interact with the blockchain
// This is a practical approach when the Fabric SDK has connection issues

export class BlockchainService {
  
  // Execute a chaincode invoke transaction
  async invoke(functionName: string, args: string[]): Promise<any> {
    try {
      const argsJson = JSON.stringify({ Args: [functionName, ...args] });
      // Escape double quotes for Windows/PowerShell
      const escapedJson = argsJson.replace(/"/g, '\\"');
      
      const command = `docker exec ${CLI_CONTAINER} peer chaincode invoke ` +
        `-o ${ORDERER_ADDRESS} ` +
        `-C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} ` +
        `-c "${escapedJson}" ` +
        `--peerAddresses ${PEER_BPJS_ADDRESS} ` +
        `--peerAddresses ${PEER_RUMAHSAKIT_ADDRESS} ` +
        `--waitForEvent`;

      logger.info(`Invoking: ${functionName} with args: ${JSON.stringify(args)}`);
      logger.debug(`Command: ${command}`);

      const { stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('INFO')) {
        logger.warn('Stderr:', stderr);
      }

      logger.info(`✅ Transaction successful: ${functionName}`);
      return { success: true, message: 'Transaction submitted successfully' };

    } catch (error: any) {
      logger.error(`Failed to invoke ${functionName}:`, error.message);
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  // Execute a chaincode query transaction
  async query(functionName: string, args: string[]): Promise<any> {
    try {
      const argsJson = JSON.stringify({ Args: [functionName, ...args] });
      // Escape double quotes for Windows/PowerShell
      const escapedJson = argsJson.replace(/"/g, '\\"');
      
      const command = `docker exec ${CLI_CONTAINER} peer chaincode query ` +
        `-C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} ` +
        `-c "${escapedJson}"`;

      logger.info(`Querying: ${functionName} with args: ${JSON.stringify(args)}`);
      logger.debug(`Command: ${command}`);

      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('INFO')) {
        logger.warn('Stderr:', stderr);
      }

      // Parse the JSON response
      const result = JSON.parse(stdout.trim());
      logger.info(`✅ Query successful: ${functionName}`);
      
      return result;

    } catch (error: any) {
      logger.error(`Failed to query ${functionName}:`, error.message);
      throw new Error(`Blockchain query failed: ${error.message}`);
    }
  }
  
  // Check blockchain connection
  async checkConnection(): Promise<boolean> {
    try {
      logger.info('🔍 Checking blockchain connection...');
      
      const command = `docker exec ${CLI_CONTAINER} peer lifecycle chaincode querycommitted -C ${CHANNEL_NAME}`;
      const { stdout } = await execAsync(command);
      
      if (stdout.includes(CHAINCODE_NAME)) {
        logger.info('✅ Blockchain connection successful');
        logger.info(`📦 Chaincode: ${CHAINCODE_NAME}`);
        logger.info(`📺 Channel: ${CHANNEL_NAME}`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      logger.error('❌ Blockchain connection failed:', error.message);
      return false;
    }
  }
}

export const blockchainService = new BlockchainService();
