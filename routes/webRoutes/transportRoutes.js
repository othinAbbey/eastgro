import express from 'express';
import { createTransporter, getTransporters,getTransporter} from '../../controllers/transportController.js';
const router = express.Router();

router.post('/', createTransporter);
router.get('/', getTransporters);
router.get('/transport', getTransporter)

export default router;