// // Import dependencies
// import express from 'express';
// import { PrismaClient } from '@prisma/client';
// import { recordTransactionOnBlockchain } from '../utils/blockchain.js';

// const router = express.Router();
// const prisma = new PrismaClient();

// // Market Controller Functions

// // Fetch available biofortified crop listings
// const getMarketListings = async (req, res) => {
//   try {
//     const listings = await prisma.produce.findMany({
//       where: { status: 'HARVESTED' },
//       include: { farmer: true },
//     });
//     res.json(listings);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Group farmers growing the same biofortified crops for aggregation
// const groupFarmersByCrop = async (req, res) => {
//   try {
//     const { cropType } = req.body;
//     const groupedFarmers = await prisma.produce.findMany({
//       where: { type: cropType },
//       include: { farmer: true },
//     });
//     res.json({ cropType, groupedFarmers });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Allow buyers to place offers on crops, recording transaction on blockchain
// const placeOffer = async (req, res) => {
//   try {
//     const { produceId, buyerId, offerPrice } = req.body;
//     const transaction = await prisma.transaction.create({
//       data: {
//         produceId,
//         buyerId,
//         offerPrice,
//         status: 'PENDING',
//       },
//     });
//     // Record the offer on the blockchain for traceability
//     await recordTransactionOnBlockchain(transaction);
//     res.status(201).json(transaction);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Retrieve a buyer's transaction history
// const getTransactionHistory = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const transactions = await prisma.transaction.findMany({
//       where: { buyerId: userId },
//       include: {
//         produce: { include: { farmer: true } },
//       },
//     });
//     res.json(transactions);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export {
//   getMarketListings,
//   groupFarmersByCrop,
//   placeOffer,
//   getTransactionHistory,
// };

// Import dependencies
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { recordTransactionOnBlockchain } from '../utils/blockchain.js';

const router = express.Router();
const prisma = new PrismaClient();

// Market Controller Functions

/**
 * Fetch available biofortified crop listings
 * @route GET /market/listings
 */
export const getMarketListings = async (req, res) => {
  try {
    const listings = await prisma.produce.findMany({
      where: { status: 'HARVESTED' },
      include: { farmer: true },
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Group farmers growing the same biofortified crops for aggregation
 * @route POST /market/group
 * @param {string} cropType - Type of crop to group farmers by
 */
export const groupFarmersByCrop = async (req, res) => {
  try {
    const { cropType } = req.body;
    const groupedFarmers = await prisma.produce.findMany({
      where: { type: cropType },
      include: { farmer: true },
    });
    res.json({ cropType, groupedFarmers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Allow buyers to place offers on crops, recording transaction on blockchain
 * @route POST /market/offer
 * @param {string} produceId - ID of the produce
 * @param {string} buyerId - ID of the buyer
 * @param {number} offerPrice - Offer price for the produce
 */
export const placeOffer = async (req, res) => {
  try {
    const { produceId, buyerId, offerPrice } = req.body;
    const transaction = await prisma.transaction.create({
      data: {
        produceId,
        buyerId,
        offerPrice,
        status: 'PENDING',
      },
    });
    // Record the offer on the blockchain for traceability
    await recordTransactionOnBlockchain(transaction);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieve a buyer's transaction history
 * @route GET /market/transactions/:userId
 * @param {string} userId - ID of the buyer
 */
export const getTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await prisma.transaction.findMany({
      where: { buyerId: userId },
      include: {
        produce: { include: { farmer: true } },
      },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Express Routes
router.get('/market/listings', getMarketListings);
router.post('/market/group', groupFarmersByCrop);
router.post('/market/offer', placeOffer);
router.get('/market/transactions/:userId', getTransactionHistory);

export default router;
