import { createLogger } from '../utils/logger';
import { blockchainService } from './blockchain.service';

const logger = createLogger('Fabric');

export async function connectToFabric(): Promise<void> {
  try {
    logger.info('🚀 Connecting to Hyperledger Fabric network...');
    logger.info(`📺 Channel: ${process.env.CHANNEL_NAME || 'bpjschannel'}`);
    logger.info(`📦 Chaincode: ${process.env.CHAINCODE_NAME || 'bpjs'}`);
    logger.info(`🐳 CLI Container: ${process.env.CLI_CONTAINER || 'cli'}`);
    
    // Check if blockchain is accessible
    const isConnected = await blockchainService.checkConnection();
    
    if (!isConnected) {
      throw new Error('Failed to connect to blockchain network');
    }
    
    logger.info('✅ Successfully connected to blockchain network');
    logger.info('🔗 Connection mode: Docker exec (via CLI container)');

  } catch (error: any) {
    logger.error('❌ Failed to connect to Fabric:', error.message);
    logger.error('💡 Make sure Docker containers are running: docker ps');
    throw error;
  }
}

export async function disconnect(): Promise<void> {
  logger.info('👋 Disconnecting from blockchain...');
}
