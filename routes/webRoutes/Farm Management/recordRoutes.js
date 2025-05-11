import { Router } from 'express';
const router = Router();
import { addRecord, getRecords } from '../../../controllers/Farm Management/farmRecordController.js';

router.post('/', addRecord);
router.get('/:farmPlanId', getRecords);

export default router;
