// routes/ussdRoutes.js
import express from 'express';
import USSDController from '../../controllers/ussdController.js';

const router = express.Router();

// USSD Route
router.post('/ussd', USSDController);

export default router;