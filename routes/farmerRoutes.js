const express = require('express');
const { registerFarmer, getAllFarmers } = require('../controllers/farmerController');

const router = express.Router();

// Register a new farmer
router.post('/register', registerFarmer);

// Get all farmers
router.get('/', getAllFarmers);

module.exports = router;