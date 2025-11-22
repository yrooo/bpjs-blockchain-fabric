import { Router, Request, Response } from 'express';
import { blockchainService } from '../fabric/blockchain.service';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('CardsRoute');

// Issue a new BPJS card
router.post('/issue', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      cardID,
      patientID,
      patientName,
      nik,
      dateOfBirth,
      gender,
      address,
      cardType,
      issueDate,
      expiryDate
    } = req.body;

    // Validate required fields
    if (!cardID || !patientID || !patientName || !nik) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Call blockchain
    await blockchainService.invoke('IssueCard', [
      cardID,
      patientID,
      patientName,
      nik,
      dateOfBirth || '',
      gender || '',
      address || '',
      cardType || 'PBI',
      issueDate || new Date().toISOString().split('T')[0],
      expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    ]);

    res.status(201).json({
      success: true,
      message: 'BPJS card issued successfully',
      cardID
    });

  } catch (error: any) {
    logger.error('Error issuing card:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify a card
router.get('/verify/:cardID', async (req: Request, res: Response) => {
  try {
    const { cardID } = req.params;

    const result = await blockchainService.query('VerifyCard', [cardID]);

    res.json({
      success: true,
      card: result
    });

  } catch (error: any) {
    logger.error('Error verifying card:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get card details
router.get('/:cardID', async (req: Request, res: Response) => {
  try {
    const { cardID } = req.params;

    const result = await blockchainService.query('VerifyCard', [cardID]);

    res.json({
      success: true,
      card: result
    });

  } catch (error: any) {
    logger.error('Error getting card:', error);
    res.status(404).json({ error: 'Card not found' });
  }
});

// Update card status
router.put('/:cardID/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { cardID } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    await blockchainService.invoke('UpdateCardStatus', [
      cardID,
      status,
      reason || 'Status updated via API'
    ]);

    res.json({
      success: true,
      message: 'Card status updated successfully'
    });

  } catch (error: any) {
    logger.error('Error updating card status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
