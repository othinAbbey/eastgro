import express from 'express';
import {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  getVarietyAttributes
} from '../../../controllers/Farm Management/cropController.js';

const router = express.Router();

router.post('/crops/create', createCrop);
router.get('/crops', getAllCrops);
router.get('/crops/:id', getCropById);
router.put('/crops/:id', updateCrop);
router.delete('/crops/:id', deleteCrop);
router.get('/variety/:varietyId', getVarietyAttributes);


export default router;
