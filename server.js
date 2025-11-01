import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
 // Import rate limiting middleware
import farmerRoutes from './routes/webRoutes/Farmers and Groups/farmerRoutes.js';
import produceRoutes from './routes/webRoutes/Produce Products and Inputs/produceRoutes.js';
import transporterRoutes from './routes/webRoutes/Services Management/transportRoutes.js';
import facilityRoutes from './routes/webRoutes/Services Management/facilityRoutes.js';
import shipmentRoutes from './routes/webRoutes/Services Management/shipmentRoutes.js';
import customerRoutes from './routes/webRoutes/Customer Management/customerRoutes.js';
import qrCodeRoutes from './routes/webRoutes/SMS and USSD/qrCodeRoutes.js';
// import authRoutes from './routes/webRoutes/authRoutes.js';
import celoCropRegisterRoutes from './routes/webRoutes/SMS and USSD/celoCropRegisterRoutes.js';
import cropRegisterRoutes from './routes/webRoutes/Crop Management/cropRegisterRoutes.js';
import salesRoutes from './routes/webRoutes/Sales and Purchases/salesRoutes.js';
import groupRoutes from './routes/webRoutes/Farmers and Groups/groupRoutes.js';
import serviceRoutes from './routes/webRoutes/Services Management/serviceRoutes.js';
import problemRoutes from './routes/webRoutes/Services Management/problemRoutes.js';

import cropRoutes from './routes/webRoutes/Farm Management/cropRoutes.js';
import farmActivityRoutes from './routes/webRoutes/Farm Management/farmActivityRoutes.js';
import costRoutes from './routes/webRoutes/Farm Management/costRoutes.js';
import farmPlanRoutes from './routes/webRoutes/Farm Management/farmPlanRoutes.js';
import recordRoutes from './routes/webRoutes/Farm Management/recordRoutes.js';
//Import USSD routes
import ussdRoutes from './routes/ussdRoutes/cropManagementRoutesUSSD.js';
import userRoutes from './routes/webRoutes/Users/userRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';

//Investment routes
import investmentRoutes from './routes/webRoutes/Investment Route/investmentRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
// Middleware to parse JSON bodies
// This will throw an error if the JSON is malformed
// app.use(express.json({
//   strict: true,
//   verify: (req, res, buf, encoding) => {
//     if (buf.length === 0) return;
//     try {
//       JSON.parse(buf.toString(encoding));
//     } catch (e) {
//       throw new Error('Invalid JSON');
//     }
//   }
// }));

// // Add a global error handler to catch that "Invalid JSON"
// app.use((err, req, res, next) => {
//   if (err.message === 'Invalid JSON') {
//     return res.status(400).json({ error: 'Malformed JSON in request body' });
//   }
//   next(err);
// });

app.use(cookieParser());
// app.use(cors());
// app.use(cors({
//   origin: 'https://eastgro.onrender.com', // Replace with the actual origin of your frontend
//   credentials: true, // Allow sending cookies or credentials
// }));
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin); // Reflect request origin
  },
  credentials: true,
}));

app.use('/farmers', farmerRoutes);
app.use('/produce', produceRoutes);
app.use('/transporters', transporterRoutes);
app.use('/facility', facilityRoutes);
app.use('/shipments', shipmentRoutes);
app.use('/customers', customerRoutes);
app.use('/qrcodes', qrCodeRoutes);
// app.use('/auth', authRoutes);
app.use('/celoblockchain', celoCropRegisterRoutes);
app.use('/crops', cropRegisterRoutes,)
app.use('/sales', salesRoutes)
app.use('/services', serviceRoutes)
app.use('/groups', groupRoutes)
app.use('/ussd', ussdRoutes);
app.use('/crops', cropRoutes);
app.use('/farm', farmPlanRoutes);
app.use('/user', userRoutes);
app.use('/investments', investmentRoutes);
// app.use('/services', serviceRoutes);
app.use('/problems', problemRoutes);
app.get('/', (req, res) => {
  res.send('Food Traceability API is running');
});

// Use the weather routes
app.use('/weather', weatherRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)    
    // console.log(`Server running on https://eastgro.onrender.com:${PORT}`)    
});

