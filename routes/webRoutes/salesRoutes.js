// import express from 'express';
// const router = express.Router();

// // Import sales controller functions
// import salesController from '../../controllers/salesController.js';
// import inPutsController from '../../controllers/inPutsController.js';

// // Routes for the market
// router.get('/listings', salesController.getMarketListings); // Fetch available biofortified crop listings
// router.post('/group', salesController.groupFarmersByCrop); // Group farmers by crop type
// router.post('/offer', salesController.placeOffer); // Place an offer on a crop
// router.get('/transactions/:userId', salesController.getTransactionHistory); // Get transaction history for a buyer

// // Routes for Product CRUD operations
// router.post('/products', salesController.createProduct); // Create a new product
// router.get('/products', salesController.getAllProducts); // Get all products
// router.get('/products/:id', salesController.getProductById); // Get a product by ID
// router.put('/products/:id', salesController.updateProduct); // Update a product by ID
// router.delete('/products/:id', salesController.deleteProduct); // Delete a product by ID

// // Routes for Transaction CRUD operations
// router.post('/transactions', salesController.createTransaction); // Create a new transaction
// router.get('/transactions', salesController.getAllTransactions); // Get all transactions
// router.get('/transactions/:id', salesController.getTransactionById); // Get a transaction by ID
// router.put('/transactions/:id', salesController.updateTransaction); // Update a transaction by ID
// router.delete('/transactions/:id', salesController.deleteTransaction); // Delete a transaction by ID

// //Routes for Farm Inputs CRUD operations
// router.post('/inputs', inPutsController.createFarmInput); // Create a new farm input
// router.get('/inputs', inPutsController.getAllFarmInputs); // Get all farm inputs
// router.get('/inputs/:id', inPutsController.getFarmInputById); // Get a farm input by ID
// router.put('/inputs/:id', inPutsController.updateFarmInput); // Update a farm input by ID

// //=========SERVICE ROUTES===============
// // src/routes/services.routes.js
// import serviceController from '../../controllers/serviceController.js';
// import authMiddleware from '../../middleware/authMiddleware.js';

// router.get('/providers', serviceController.getAllServiceProviders);
// router.get('/provider/:id',serviceController.getServiceProvider);

// // Protected routes (require authentication)
// router.use(authMiddleware.protect);

// // Service provider management
// // router.post('/create', authMiddleware.restrictTo('admin', 'expert'), serviceController.createServiceProvider);
// router.post('/provider', serviceController.createServiceProvider);
// // router.put('/provider/:id', authMiddleware.restrictTo('admin', 'expert'), serviceController.updateServiceProvider);
// router.put('/provider/:id',  serviceController.updateServiceProvider);
// // router.delete('/provider/:id', authMiddleware.restrictTo('admin'), serviceController.deleteServiceProvider);
// router.delete('/provider/:id', serviceController.deleteServiceProvider);

// // Service offerings management
// // router.post('/:serviceProviderId/offerings', authMiddleware.restrictTo('admin', 'expert'), serviceController.addServiceOffering);
// router.post('/:serviceProviderId/offerings', serviceController.addServiceOffering);
// // router.put('/offerings/:offeringId', authMiddleware.restrictTo('admin', 'expert'), serviceController.updateServiceOffering);
// router.put('/offerings/:offeringId', serviceController.updateServiceOffering);





// //=====================SERVICE BOOKING ROUTES========
// // src/routes/serviceTransactions.routes.ts
// // Create transaction
// // router.post('/', createTransaction);

// // // Get farmer transactions
// // router.get('/farmer/:farmerId', getFarmerTransactions);
// // // Update transaction status
// // router.patch('/:transactionId/status', updateTransactionStatus);
// // // Process payment
// // router.post('/:transactionId/pay', processPayment);



// import serviceTransactionController from '../../controllers/serviceTransactionController.js';
// router.use(authMiddleware.protect);

// // Book a service
// router.post('/book',serviceTransactionController.bookService);

// // Get provider's bookings (for provider dashboard)
// router.get('/provider/:providerId/bookings', 
//   authMiddleware.restrictTo('admin', 'expert'), 
//   serviceTransactionController.getProviderBookings);




// export default router;


import express from 'express';
const router = express.Router();

import salesController from '../../controllers/salesController.js';
import inPutsController from '../../controllers/inPutsController.js';
import serviceTransactionController from '../../controllers/serviceTransactionController.js';
// Auth middleware
import authMiddleware from '../../middleware/authMiddleware.js';


// --- Market Routes ---
router.get('/listings', salesController.getMarketListings);
router.post('/group', salesController.groupFarmersByCrop);
router.post('/offer', salesController.placeOffer);
router.get('/transactions/:userId', salesController.getTransactionHistory);

// --- Product CRUD Routes ---
router.post('/products', salesController.createProduct);
router.get('/products', salesController.getAllProducts);
router.get('/products/:id', salesController.getProductById);
router.put('/products/:id', salesController.updateProduct);
router.delete('/products/:id', salesController.deleteProduct);

// --- Transaction CRUD Routes ---
router.post('/transactions', salesController.createTransaction);
router.get('/transactions', salesController.getAllTransactions);
router.get('/transactions/:id', salesController.getTransactionById);
router.put('/transactions/:id', salesController.updateTransaction);
router.delete('/transactions/:id', salesController.deleteTransaction);

// --- Farm Inputs CRUD Routes ---
router.post('/inputs', inPutsController.createFarmInput);
router.get('/inputs', inPutsController.getAllFarmInputs);
router.get('/inputs/:id', inPutsController.getFarmInputById);
router.put('/inputs/:id', inPutsController.updateFarmInput);

//---Transaction Routes---
// --- Protected Booking Routes ---
router.use(authMiddleware.protect);

// Book a service
router.post('/book', serviceTransactionController.bookService);

// Provider view: Bookings list
router.get('/provider/:providerId/bookings',
  authMiddleware.restrictTo('admin', 'expert'),
  serviceTransactionController.getProviderBookings
);

export default router;
