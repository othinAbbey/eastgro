// const express = require('express');
// const { getAllProducts, addProduct } = require('../controllers/productController');

// const router = express.Router();

// // Get all products
// router.get('/', getAllProducts);

// // Add a new product
// router.post('/add', addProduct);

// module.exports = router;

import express from 'express';
// import produceController from '../../controllers/Sales and Purchases/produceController.js';
import {createProduce,getProduce,getProduceList} from '../../../controllers/Produce Products and Inputs/produceController.js';
const router = express.Router();

router.post('/', createProduce);
router.get('/', getProduce);
router.get('/list', getProduceList);

export default router;