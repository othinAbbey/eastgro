import express from 'express';
import { createTransporter, getTransporters } from '../controllers/transportController.js';
const router = express.Router();

router.post('/', createTransporter);
router.get('/', getTransporters);

export default router;