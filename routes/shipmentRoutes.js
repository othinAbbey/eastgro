import express from 'express';
import { createShipment, getShipments } from '../controllers/shipmentController.js';
const router = express.Router();

router.post('/', createShipment);
router.get('/', getShipments);

export default router;