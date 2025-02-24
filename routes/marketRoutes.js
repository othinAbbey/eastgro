// Express Routes
import express from 'express';
const router = express.Router();
// Import market controller functions
import { getMarketListings, groupFarmersByCrop, placeOffer, getTransactionHistory } from '../controllers/marketController.js';
router.get('/market/listings', getMarketListings);
router.post('/market/group', groupFarmersByCrop);
router.post('/market/offer', placeOffer);
router.get('/market/transactions/:userId', getTransactionHistory);

export default router;