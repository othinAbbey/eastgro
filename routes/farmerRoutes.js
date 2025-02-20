// routes/farmerRoutes.js
const express = require('express');
const { getAllFarmers, getFarmerById, createFarmer } = require('../controllers/farmerController');

const router = express.Router();

router.get('/', getAllFarmers);
router.get('/:id', getFarmerById);
router.post('/', createFarmer);

module.exports = router;
