import express from 'express';
import { generateQRCode, traceProduct } from '../controllers/qrcodeController.js';
const router = express.Router();

router.post('/generate', generateQRCode);
router.get('/trace/:id', traceProduct);

export default router;