import express from 'express';
import { submitProblem, getAllProblems } from '../../../controllers/Services Management/problemController.js';

const router = express.Router();

// Submit a problem
router.post('/submit', submitProblem);

// Get all problems
router.get('/', getAllProblems);

export default router;
