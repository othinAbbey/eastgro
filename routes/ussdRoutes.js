import express from 'express';
import { ussdHandler } from './controllers/ussdController.js';

const router = express.Router();

router.post('/ussd', ussdHandler);

export default router;
