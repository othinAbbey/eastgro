// routes/ussdRoutes.js
import express from 'express';
import USSDController from '../../controllers/SMS and USSD/ussdController.js';

const router = express.Router();

// USSD Route
router.post('/ussd', USSDController);

export default router;