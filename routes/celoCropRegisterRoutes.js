// // const { registerCrop } = require('./blockchain');

// import express from 'express';
// import { registerCrop } from '../models/celoCropRegister.js';
// const router = express.Router();

// router.post('/register-crop', async (req, res) => {
//   const { farmerId, cropDetails } = req.body;
//   const result = await registerCrop(farmerId, cropDetails);
//   res.json(result);
// });
//  export default router;

// routes/CropRoutes.js

import express from 'express';
import { celoCropRegistration } from '../controllers/celoController.js';

const router = express.Router();

router.post('/register-crop', celoCropRegistration);

export default router;
