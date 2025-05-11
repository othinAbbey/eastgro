import express from 'express';
import groupController from '../../../controllers/Farmers and Groups/groupController.js';

const router = express.Router();

router.post('/assign', groupController.assignFarmerToGroup);
router.get('/list', groupController.getGroupedFarmers);
router.get('/sort',groupController.getFarmersByCriteria)

export default router;
