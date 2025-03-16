// // Express Routes
// import express from 'express';
// const router = express.Router();
// // Import market controller functions
// // import { getMarketListings, groupFarmersByCrop, placeO

// import salesController from '../controllers/salesController.js';

// // Routes for the market
// router.get('/listings', salesController.getMarketListings);
// router.post('/group', salesController.groupFarmersByCrop);
// router.post('/offer', salesController.placeOffer);
// router.get('/transactions/:userId', salesController.getTransactionHistory);

// export default router;

import express from 'express';
const router = express.Router();

// Import sales controller functions
import salesController from '../controllers/salesController.js';

// Routes for the market
router.get('/listings', salesController.getMarketListings); // Fetch available biofortified crop listings
router.post('/group', salesController.groupFarmersByCrop); // Group farmers by crop type
router.post('/offer', salesController.placeOffer); // Place an offer on a crop
router.get('/transactions/:userId', salesController.getTransactionHistory); // Get transaction history for a buyer

// Routes for Product CRUD operations
router.post('/products', salesController.createProduct); // Create a new product
router.get('/products', salesController.getAllProducts); // Get all products
router.get('/products/:id', salesController.getProductById); // Get a product by ID
router.put('/products/:id', salesController.updateProduct); // Update a product by ID
router.delete('/products/:id', salesController.deleteProduct); // Delete a product by ID

// Routes for Transaction CRUD operations
router.post('/transactions', salesController.createTransaction); // Create a new transaction
router.get('/transactions', salesController.getAllTransactions); // Get all transactions
router.get('/transactions/:id', salesController.getTransactionById); // Get a transaction by ID
router.put('/transactions/:id', salesController.updateTransaction); // Update a transaction by ID
router.delete('/transactions/:id', salesController.deleteTransaction); // Delete a transaction by ID


export default router;