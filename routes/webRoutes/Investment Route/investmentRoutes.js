import express from 'express';
import {
  getUserInvestments,
  getInvestmentById,
  createInvestment,
  addFunds,
  requestPayout,
  recordSale,
  getInvestmentAnalytics,
  getInvestmentTransactions,
  getInvestmentSales,
  closeInvestment,
  getAllInvestments,
  updateInvestmentStatus,
} from '../../../controllers/Traders/investment.js';

import { authenticateUser } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser );

// User investment routes
router.get('/', getUserInvestments);
router.get('/analytics', getInvestmentAnalytics);
router.get('/:id', getInvestmentById);
router.get('/:id/transactions', getInvestmentTransactions);
router.get('/:id/sales', getInvestmentSales);
router.post('/', createInvestment);
router.post('/:id/add-funds', addFunds);
router.post('/:id/request-payout', requestPayout);
router.post('/:id/sales', recordSale);
router.patch('/:id/close', closeInvestment);

// Admin routes
router.get('/admin/all', getAllInvestments);
router.patch('/admin/:id/status', updateInvestmentStatus);
router.patch('/admin/payouts/:payoutId/process', requestPayout);

export default router;