import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import farmerRoutes from './routes/webRoutes/Farmers and Groups/farmerRoutes.js';
import produceRoutes from './routes/webRoutes/Produce Products and Inputs/produceRoutes.js';
import transporterRoutes from './routes/webRoutes/Services Management/transportRoutes.js';
import facilityRoutes from './routes/webRoutes/Services Management/facilityRoutes.js';
import shipmentRoutes from './routes/webRoutes/Services Management/shipmentRoutes.js';
import customerRoutes from './routes/webRoutes/Customer Management/customerRoutes.js';
import qrCodeRoutes from './routes/webRoutes/SMS and USSD/qrCodeRoutes.js';
import authRoutes from './routes/webRoutes/authRoutes.js';
import celoCropRegisterRoutes from './routes/webRoutes/SMS and USSD/celoCropRegisterRoutes.js';
import cropRegisterRoutes from './routes/webRoutes/Crop Management/cropRegisterRoutes.js';
import salesRoutes from './routes/webRoutes/Sales and Purchases/salesRoutes.js';
import groupRoutes from './routes/webRoutes/Farmers and Groups/groupRoutes.js';
import serviceRoutes from './routes/webRoutes/Services Management/serviceRoutes.js';
import cropRoutes from './routes/webRoutes/Farm Management/cropRoutes.js';
import farmActivityRoutes from './routes/webRoutes/Farm Management/farmActivityRoutes.js';
import costRoutes from './routes/webRoutes/Farm Management/costRoutes.js';
import farmPlanRoutes from './routes/webRoutes/Farm Management/farmPlanRoutes.js';
import recordRoutes from './routes/webRoutes/Farm Management/recordRoutes.js';
//Import USSD routes
import ussdRoutes from './routes/ussdRoutes/cropManagementRoutesUSSD.js';
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
app.use('/services', serviceRoutes)
app.use('/groups', groupRoutes)
app.use('/ussd', ussdRoutes);
app.use('/crops', cropRoutes);
app.use('/farm', farmPlanRoutes);
// app.use('/services', serviceRoutes);


app.get('/', (req, res) => {
  res.send('Food Traceability API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)    
});