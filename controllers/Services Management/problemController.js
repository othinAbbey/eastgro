import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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


// Submit a Problem Report (detailed)
const submitProblem = async (req, res) => {
  const { farmtype, Crop, Disease, Pest, farmerId } = req.body;

  if (!farmerId || !Crop || !Pest) {
    return res.status(400).json({ error: "Please provide all required fields." });
  }

  try {
    const problem = await prisma.problem.create({
      data: {
        farmtype,
        Crop,
        Disease,
        Pest,
        farmerId,
      },
    });

    res.status(201).json({
      message: 'Problem report submitted successfully!',
      problem,
    });
  } catch (error) {
    console.error('Submit Problem Error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// Get all submitted problems
const getAllProblems = async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      include: {
        farmer: true,
        progress: true,
      },
    });

    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { submitProblem, getAllProblems };

// export { submitReport, getAllReports };