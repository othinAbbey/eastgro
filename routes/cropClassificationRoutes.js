// Description: This file contains the routes for crop classification.
import express from 'express';
import { classifyCrop } from '../models/cropClassification.js';
const router = express.Router();

router.post('/classify-crop', async (req, res) => {
  const { imageBuffer } = req.body;
  const predictions = await classifyCrop(imageBuffer);
  res.json(predictions);
});

export default router;