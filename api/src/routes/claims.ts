import { Router, Request, Response } from 'express';
import { blockchainService } from '../fabric/blockchain.service';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('ClaimsRoute');

// Submit a new claim
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      claimID,
      patientID,
      patientName,
      cardID,
      visitID,
      faskesCode,
      faskesName,
      claimType,
      serviceDate,
      diagnosis,
      treatment,
      totalAmount,
      claimAmount
    } = req.body;

    if (!claimID || !patientID || !cardID || !visitID) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    await blockchainService.invoke('SubmitClaim', [
      claimID,
      patientID,
      patientName || '',
      cardID,
      visitID,
      faskesCode || '',
      faskesName || '',
      claimType || 'rawat-jalan',
      serviceDate || new Date().toISOString().split('T')[0],
      diagnosis || '',
      treatment || '',
      totalAmount?.toString() || '0',
      claimAmount?.toString() || '0'
    ]);

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      claimID
    });

  } catch (error: any) {
    logger.error('Error submitting claim:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process a claim (approve/reject)
router.put('/:claimID/process', async (req: Request, res: Response): Promise<void> => {
  try {
    const { claimID } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    await blockchainService.invoke('ProcessClaim', [
      claimID,
      status,
      notes || ''
    ]);

    res.json({
      success: true,
      message: `Claim ${status} successfully`
    });

  } catch (error: any) {
    logger.error('Error processing claim:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get claims for a patient
router.get('/patient/:patientID', async (req: Request, res: Response) => {
  try {
    const { patientID } = req.params;

    const result = await blockchainService.query('GetPatientClaims', [patientID]);

    res.json({
      success: true,
      claims: Array.isArray(result) ? result : []
    });

  } catch (error: any) {
    logger.error('Error getting claims:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
