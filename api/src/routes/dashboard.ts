import { Router, Request, Response } from 'express';
import { blockchainService } from '../fabric/blockchain.service';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('DashboardRoute');

// Get all cards
router.get('/cards', async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all cards from blockchain...');
    const result = await blockchainService.query('GetAllCards', []);
    
    res.json({
      success: true,
      cards: Array.isArray(result) ? result : [],
      count: Array.isArray(result) ? result.length : 0
    });
  } catch (error: any) {
    logger.error('Error fetching cards:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all visits
router.get('/visits', async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all visits from blockchain...');
    const result = await blockchainService.query('GetAllVisits', []);
    
    res.json({
      success: true,
      visits: Array.isArray(result) ? result : [],
      count: Array.isArray(result) ? result.length : 0
    });
  } catch (error: any) {
    logger.error('Error fetching visits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all claims
router.get('/claims', async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all claims from blockchain...');
    const result = await blockchainService.query('GetAllClaims', []);
    
    res.json({
      success: true,
      claims: Array.isArray(result) ? result : [],
      count: Array.isArray(result) ? result.length : 0
    });
  } catch (error: any) {
    logger.error('Error fetching claims:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all audit logs
router.get('/audit-logs', async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching audit logs from blockchain...');
    const result = await blockchainService.query('GetAllAuditLogs', []);
    
    res.json({
      success: true,
      logs: Array.isArray(result) ? result : [],
      count: Array.isArray(result) ? result.length : 0
    });
  } catch (error: any) {
    logger.error('Error fetching audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get blockchain statistics
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching blockchain statistics...');
    
    // Fetch all data in parallel
    const [cards, visits, claims] = await Promise.all([
      blockchainService.query('GetAllCards', []).catch(() => []),
      blockchainService.query('GetAllVisits', []).catch(() => []),
      blockchainService.query('GetAllClaims', []).catch(() => [])
    ]);

    const stats = {
      totalCards: Array.isArray(cards) ? cards.length : 0,
      totalVisits: Array.isArray(visits) ? visits.length : 0,
      totalClaims: Array.isArray(claims) ? claims.length : 0,
      activeCards: Array.isArray(cards) ? cards.filter((c: any) => c.status === 'active').length : 0,
      pendingClaims: Array.isArray(claims) ? claims.filter((c: any) => c.status === 'submitted').length : 0,
      approvedClaims: Array.isArray(claims) ? claims.filter((c: any) => c.status === 'approved').length : 0,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search by patient ID
router.get('/patient/:patientID', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientID } = req.params;
    logger.info(`Fetching all data for patient: ${patientID}`);
    
    // Fetch patient data in parallel
    const [visits, claims] = await Promise.all([
      blockchainService.query('GetPatientVisits', [patientID]).catch(() => []),
      blockchainService.query('GetPatientClaims', [patientID]).catch(() => [])
    ]);

    res.json({
      success: true,
      patientID,
      visits: Array.isArray(visits) ? visits : [],
      claims: Array.isArray(claims) ? claims : [],
      totalVisits: Array.isArray(visits) ? visits.length : 0,
      totalClaims: Array.isArray(claims) ? claims.length : 0
    });
  } catch (error: any) {
    logger.error('Error fetching patient data:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
