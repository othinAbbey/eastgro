import express from 'express';
import { createFacility, getFacilities } from '../controllers/facilityController.js';
const router = express.Router();

router.post('/', createFacility);
router.get('/', getFacilities);

export default router;