import { Router } from 'express';
const router = Router();
import { createFarmPlan, getFarmPlansByFarmer, getCosts,getGroupedCosts} from '../../../controllers/Farm Management/farmPlanController.js';

router.post('/plan', createFarmPlan);
router.get('/farmer/:farmerId', getFarmPlansByFarmer);
router.get('/plan/cost/:cropId', getCosts);
router.get('/plan/cost/grouped/:cropId', getGroupedCosts);


export default router;
