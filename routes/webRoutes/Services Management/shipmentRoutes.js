import express from 'express';
import { createShipment, getShipments ,getShipment} from '../../../controllers/Services Management/shipmentController.js';
const router = express.Router();

router.post('/', createShipment);
router.get('/', getShipments);
//Truck Order
router.get('/order',getShipment)

export default router;