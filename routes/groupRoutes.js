import express from 'express';
import { assignFarmerToGroup, getGroupedFarmers } from './controllers/groupController.js';

const router = express.Router();

router.post('/group/assign', assignFarmerToGroup);
router.get('/group/list', getGroupedFarmers);

export default router;
