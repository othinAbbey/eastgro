import express from 'express';
import { registerCrop, getAllCrops, getCropById, updateCrop, deleteCrop } from '../controllers/cropRegisterController.js';

const router = express.Router();

// Route to register a new crop
router.post('/register', registerCrop);

// Route to get all crops
router.get('/all', getAllCrops);

// Route to get a specific crop by ID
router.get('/:id', getCropById);

// Route to update crop details
router.put('/update/:id', updateCrop);

// Route to delete a crop
router.delete('/crops/:id', deleteCrop);

export default router;