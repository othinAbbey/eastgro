import express from 'express';
import { createTransporter, getTransporters,getTransporter} from '../../../controllers/Services Management/transportController.js';
const router = express.Router();

router.post('/', createTransporter);
router.get('/', getTransporters);
router.get('/transporter', getTransporter)

export default router;