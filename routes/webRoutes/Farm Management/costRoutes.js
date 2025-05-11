import { Router } from 'express';
const router = Router();
import { addCustomCost } from '../../../controllers/Farm Management/costController.js';

router.post('/', addCustomCost);

export default router;
