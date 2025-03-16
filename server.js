// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const farmerRoutes = require('./routes/farmerRoutes');
// const productRoutes = require('./routes/productRoutes');
// const reportRoutes = require('./routes/reportRoutes');

// const app = express();
// app.use(bodyParser.json());
// app.use(cors());

// // Use Routes
// app.use('/api/farmers', farmerRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/reports', reportRoutes);

// // Start the server
// const PORT = 3000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import farmerRoutes from './routes/farmerRoutes.js';
import produceRoutes from './routes/produceRoutes.js';
import transporterRoutes from './routes/transportRoutes.js';
import facilityRoutes from './routes/facilityRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import qrCodeRoutes from './routes/qrCodeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import celoCropRegisterRoutes from './routes/celoCropRegisterRoutes.js';
import cropRegisterRoutes from './routes/cropRegisterRoutes.js';
import salesRoutes from './routes/salesRoutes.js'

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/farmers', farmerRoutes);
app.use('/produce', produceRoutes);
app.use('/transporters', transporterRoutes);
app.use('/facility', facilityRoutes);
app.use('/shipments', shipmentRoutes);
app.use('/customers', customerRoutes);
app.use('/qrcodes', qrCodeRoutes);
app.use('/auth', authRoutes);
app.use('/celoblockchain', celoCropRegisterRoutes);
app.use('/crops', cropRegisterRoutes,)
app.use('/sales', salesRoutes)

// //sales routes
// app.get('/listings', salesController.getMarketListings); // Fetch available biofortified crop listings
// app.post('/group', salesController.groupFarmersByCrop); // Group farmers by crop type
// app.post('/offer', salesController.placeOffer); // Place an offer on a crop
// app.get('/transactions/:userId', salesController.getTransactionHistory); // Get transaction history for a buyer
// app.post('/products', salesController.createProduct); // Create a new product
// app.get('/products', salesController.getAllProducts); // Get all products
// app.get('/products/:id', salesController.getProductById); // Get a product by ID
// app.put('/products/:id', salesController.updateProduct); // Update a product by ID
// app.delete('/products/:id', salesController.deleteProduct); // Delete a product by ID
// app.post('/transactions', salesController.createTransaction); // Create a new transaction
// app.get('/transactions', salesController.getAllTransactions); // Get all transactions
// app.get('/transactions/:id', salesController.getTransactionById); // Get a transaction by ID
// app.put('/transactions/:id', salesController.updateTransaction); // Update a transaction by ID
// app.delete('/transactions/:id', salesController.deleteTransaction); // Delete a transaction by ID


app.get('/', (req, res) => {
  res.send('Food Traceability API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)    
});