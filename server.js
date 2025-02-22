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
import produceRoutes from './routes/productRoutes.js';
import transporterRoutes from './routes/transportRoutes.js';
import facilityRoutes from './routes/facilityRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import qrCodeRoutes from './routes/qrCodeRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/farmers', farmerRoutes);
app.use('/produce', produceRoutes);
app.use('/transporters', transporterRoutes);
app.use('/facilities', facilityRoutes);
app.use('/shipments', shipmentRoutes);
app.use('/customers', customerRoutes);
app.use('/qrcodes', qrCodeRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Food Traceability API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)    
});