const prisma = require('../utils/prismaClient');

// Submit a report
const submitReport = async (req, res) => {
  const { problem_type, description, urgency, farmerId } = req.body;
  try {
    const report = await prisma.report.create({
      data: { problem_type, description, urgency, farmerId },
    });
    res.status(201).json({ message: 'Report submitted successfully!', report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all reports
const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { submitReport, getAllReports };