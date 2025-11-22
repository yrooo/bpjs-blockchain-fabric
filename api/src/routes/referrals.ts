import { Router, Request, Response } from 'express';
import { blockchainService } from '../fabric/blockchain.service';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('ReferralsRoute');

// Create a new referral
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      referralID,
      patientID,
      patientName,
      cardID,
      fromFaskesCode,
      fromFaskesName,
      toFaskesCode,
      toFaskesName,
      referralReason,
      diagnosis,
      referringDoctor,
      referralDate,
      validUntil,
      notes
    } = req.body;

    if (!referralID || !patientID || !cardID) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    await blockchainService.invoke('CreateReferral', [
      referralID,
      patientID,
      patientName || '',
      cardID,
      fromFaskesCode || '',
      fromFaskesName || '',
      toFaskesCode || '',
      toFaskesName || '',
      referralReason || '',
      diagnosis || '',
      referringDoctor || '',
      referralDate || new Date().toISOString().split('T')[0],
      validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      referralID
    });

  } catch (error: any) {
    logger.error('Error creating referral:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update referral status
router.put('/:referralID/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { referralID } = req.params;
    const { status, acceptedBy, notes } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    await blockchainService.invoke('UpdateReferralStatus', [
      referralID,
      status,
      acceptedBy || '',
      notes || ''
    ]);

    res.json({
      success: true,
      message: 'Referral status updated successfully'
    });

  } catch (error: any) {
    logger.error('Error updating referral:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
