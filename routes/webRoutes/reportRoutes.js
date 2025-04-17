const express = require('express');
const { submitReport, getAllReports } = require('../../controllers/reportController');

const router = express.Router();

// Submit a report
router.post('/submit', submitReport);

// Get all reports
router.get('/', getAllReports);

module.exports = router;