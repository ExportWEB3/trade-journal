import { Router } from 'express';
import {
  getAllTrades,
  getTradeById,
  createTrade,
  updateTrade,
  deleteTrade,
  getDashboardStats,
  addScreenshots,
  deleteScreenshot,
} from '../controllers/tradeController';
import { upload } from '../middleware/upload';

const router = Router();

// Dashboard stats
router.get('/stats', getDashboardStats);

// CRUD routes
router.get('/', getAllTrades);
router.get('/:id', getTradeById);
router.post('/', createTrade);
router.put('/:id', updateTrade);
router.delete('/:id', deleteTrade);

// Screenshot routes
router.post('/:id/screenshots', upload.array('screenshots', 10), addScreenshots);
router.delete('/:id/screenshots/:screenshotPath', deleteScreenshot);

export default router;
