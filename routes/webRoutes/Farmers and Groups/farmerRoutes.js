// const express = require('express');
// const { registerFarmer, getAllFarmers } = require('../controllers/farmerController');

// const router = express.Router();

// // Register a new farmer
// router.post('/register', registerFarmer);

// // Get all farmers
// router.get('/', getAllFarmers);

// module.exports = router;


// import express from 'express';
// import { createFarmer, getFarmers } from '../controllers/farmerController.js';
// const router = express.Router();

// router.post('/', createFarmer);
// router.get('/', getFarmers);

// export default router;


import express from 'express';
import farmerController from '../../../controllers/Farmers and Groups/farmerController.js';
import roleMiddleware from '../../../middleware/roleMiddleware.js';
const router = express.Router();

// Create a new farmer (admin or authorized role)
router.post('/register', farmerController.createFarmer);

// Get farmer details by ID (only the farmer or authorized roles can access)
router.get('/farmer/:id', roleMiddleware(['farmer']), farmerController.getFarmerById);

// Update farmer details
router.put('farmer/:id', roleMiddleware(['farmer']), farmerController.updateFarmer);

export default router;