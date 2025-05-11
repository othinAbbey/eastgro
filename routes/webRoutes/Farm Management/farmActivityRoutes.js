import { Router } from 'express';
const router = Router();
import { addActivity, getActivities } from '../../../controllers/Farm Management/farmActivityController.js';

router.post('/', addActivity);
router.get('/:farmPlanId', getActivities);

export default router;
