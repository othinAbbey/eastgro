import express from 'express';
import { generateQRCode, traceProduct } from '../../../controllers/SMS and USSD/qrCodeController.js';
const router = express.Router();

router.post('/generate', generateQRCode);
router.get('/trace/:id', traceProduct);

export default router;