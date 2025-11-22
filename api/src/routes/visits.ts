import { Router, Request, Response } from 'express';
import { blockchainService } from '../fabric/blockchain.service';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('VisitsRoute');

// Record a new visit
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      visitID,
      cardID,
      patientID,
      patientName,
      faskesCode,
      faskesName,
      faskesType,
      visitDate,
      visitType,
      diagnosis,
      treatment,
      doctorName,
      doctorID,
      notes
    } = req.body;

    if (!visitID || !cardID || !patientID) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await blockchainService.invoke('RecordVisit', [
      visitID,
      cardID,
      patientID,
      patientName || '',
      faskesCode || '',
      faskesName || '',
      faskesType || 'rumahsakit',
      visitDate || new Date().toISOString().split('T')[0],
      visitType || 'outpatient',
      diagnosis || '',
      treatment || '',
      doctorName || '',
      doctorID || '',
      notes || ''
    ]);

    return res.status(201).json({
      success: true,
      message: 'Visit recorded successfully',
      visitID
    });

  } catch (error: any) {
    logger.error('Error recording visit:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get visits for a patient
router.get('/patient/:patientID', async (req: Request, res: Response) => {
  try {
    const { patientID } = req.params;

    const result = await blockchainService.query('GetPatientVisits', [patientID]);

    res.json({
      success: true,
      visits: Array.isArray(result) ? result : []
    });

  } catch (error: any) {
    logger.error('Error getting visits:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
