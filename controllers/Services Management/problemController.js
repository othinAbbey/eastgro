// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// // Submit a report
// const submitReport = async (req, res) => {
//   const { problem_type, description, urgency, farmerId } = req.body;
//   try {
//     const report = await prisma.report.create({
//       data: { problem_type, description, urgency, farmerId },
//     });
//     res.status(201).json({ message: 'Report submitted successfully!', report });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Get all reports
// const getAllReports = async (req, res) => {
//   try {
//     const reports = await prisma.report.findMany();
//     res.status(200).json(reports);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// // Submit a Problem Report (detailed)
// const submitProblem = async (req, res) => {
//   const { farmtype, Crop, Disease, Pest, farmerId } = req.body;

//   if (!farmerId || !Crop || !Pest) {
//     return res.status(400).json({ error: "Please provide all required fields." });
//   }

//   try {
//     const problem = await prisma.problem.create({
//       data: {
//         farmtype,
//         Crop,
//         Disease,
//         Pest,
//         farmerId,
//       },
//     });

//     res.status(201).json({
//       message: 'Problem report submitted successfully!',
//       problem,
//     });
//   } catch (error) {
//     console.error('Submit Problem Error:', error.message);
//     res.status(400).json({ error: error.message });
//   }
// };

// // Get all submitted problems
// const getAllProblems = async (req, res) => {
//   try {
//     const problems = await prisma.problem.findMany({
//       include: {
//         farmer: true,
//         progress: true,
//       },
//     });

//     res.status(200).json(problems);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export { submitProblem, getAllProblems };

// // export { submitReport, getAllReports };


// Use the same connection function from previous conversions
const createConnection = async () => {
  // Your existing connection code here
};

// Helper function to generate ID
function generateId() {
  return 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateProblemId() {
  return 'problem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateProgressId() {
  return 'progress_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Submit a report
const submitReport = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { problem_type, description, urgency, farmerId } = req.body;

    // Validate required fields
    if (!problem_type || !farmerId) {
      return res.status(400).json({ error: 'Problem type and farmer ID are required' });
    }

    const reportId = generateId();
    
    await db.execute(
      'INSERT INTO reports (id, problem_type, description, urgency, farmerId) VALUES (?, ?, ?, ?, ?)',
      [reportId, problem_type, description, urgency || 'MEDIUM', farmerId]
    );

    // Get the created report
    const [reports] = await db.execute(
      'SELECT * FROM reports WHERE id = ?',
      [reportId]
    );

    res.status(201).json({ 
      message: 'Report submitted successfully!', 
      report: reports[0] 
    });
  } catch (error) {
    console.error('Submit report error:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid farmer ID' });
    }
    
    res.status(400).json({ error: error.message });
  }
};

// Get all reports
const getAllReports = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    
    const [reports] = await db.execute(
      `SELECT r.*, u.name as farmerName, u.contact as farmerContact 
       FROM reports r 
       LEFT JOIN users u ON r.farmerId = u.id 
       ORDER BY r.createdAt DESC`
    );

    res.status(200).json(reports);
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit a Problem Report (detailed)
const submitProblem = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { farmtype, Crop, Disease, Pest, farmerId } = req.body;

    if (!farmerId || !Crop || !Pest) {
      return res.status(400).json({ error: "Please provide all required fields." });
    }

    // Verify farmer exists and is actually a farmer
    const [farmers] = await db.execute(
      'SELECT id, userRole FROM users WHERE id = ? AND userRole = ?',
      [farmerId, 'FARMER']
    );

    if (farmers.length === 0) {
      return res.status(400).json({ error: "Invalid farmer ID or user is not a farmer" });
    }

    const problemId = generateProblemId();
    
    await db.execute(
      'INSERT INTO problems (id, farmtype, Crop, Disease, Pest, farmerId) VALUES (?, ?, ?, ?, ?, ?)',
      [problemId, farmtype, Crop, Disease, Pest, farmerId]
    );

    // Create initial progress entry
    const progressId = generateProgressId();
    await db.execute(
      'INSERT INTO problem_progress (id, problemId, status, notes) VALUES (?, ?, ?, ?)',
      [progressId, problemId, 'PENDING', 'Problem reported and awaiting review']
    );

    // Get the created problem with farmer details
    const [problems] = await db.execute(
      `SELECT p.*, u.name as farmerName, u.contact as farmerContact 
       FROM problems p 
       LEFT JOIN users u ON p.farmerId = u.id 
       WHERE p.id = ?`,
      [problemId]
    );

    res.status(201).json({
      message: 'Problem report submitted successfully!',
      problem: problems[0]
    });
  } catch (error) {
    console.error('Submit Problem Error:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid farmer ID' });
    }
    
    res.status(400).json({ error: error.message });
  }
};

// Get all submitted problems
const getAllProblems = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    
    const [problems] = await db.execute(
      `SELECT p.*, 
              u.name as farmerName, 
              u.contact as farmerContact,
              u.location as farmerLocation,
              pp.status as currentStatus,
              pp.notes as latestNotes,
              pp.createdAt as statusUpdateDate
       FROM problems p 
       LEFT JOIN users u ON p.farmerId = u.id 
       LEFT JOIN problem_progress pp ON p.id = pp.problemId 
       WHERE pp.id = (
         SELECT id FROM problem_progress 
         WHERE problemId = p.id 
         ORDER BY createdAt DESC 
         LIMIT 1
       )
       ORDER BY p.createdAt DESC`
    );

    res.status(200).json(problems);
  } catch (error) {
    console.error('Get all problems error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get problems with full progress history
const getProblemsWithFullProgress = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    
    // First get all problems
    const [problems] = await db.execute(
      `SELECT p.*, u.name as farmerName, u.contact as farmerContact 
       FROM problems p 
       LEFT JOIN users u ON p.farmerId = u.id 
       ORDER BY p.createdAt DESC`
    );

    // Then get progress for each problem
    const problemsWithProgress = await Promise.all(
      problems.map(async (problem) => {
        const [progress] = await db.execute(
          'SELECT * FROM problem_progress WHERE problemId = ? ORDER BY createdAt DESC',
          [problem.id]
        );
        
        return {
          ...problem,
          progress: progress
        };
      })
    );

    res.status(200).json(problemsWithProgress);
  } catch (error) {
    console.error('Get problems with progress error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update problem status
const updateProblemStatus = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { problemId } = req.params;
    const { status, notes, assignedTo } = req.body;

    // Validate problem exists
    const [problems] = await db.execute(
      'SELECT id FROM problems WHERE id = ?',
      [problemId]
    );

    if (problems.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Create new progress entry
    const progressId = generateProgressId();
    await db.execute(
      'INSERT INTO problem_progress (id, problemId, status, notes, assignedTo) VALUES (?, ?, ?, ?, ?)',
      [progressId, problemId, status, notes, assignedTo]
    );

    // Update problem status
    await db.execute(
      'UPDATE problems SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [status, problemId]
    );

    // Get updated problem with progress
    const [updatedProblems] = await db.execute(
      `SELECT p.*, u.name as farmerName, u.contact as farmerContact 
       FROM problems p 
       LEFT JOIN users u ON p.farmerId = u.id 
       WHERE p.id = ?`,
      [problemId]
    );

    const [progressHistory] = await db.execute(
      'SELECT * FROM problem_progress WHERE problemId = ? ORDER BY createdAt DESC',
      [problemId]
    );

    res.status(200).json({
      message: 'Problem status updated successfully',
      problem: updatedProblems[0],
      progress: progressHistory
    });
  } catch (error) {
    console.error('Update problem status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get reports by farmer ID
const getReportsByFarmer = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { farmerId } = req.params;

    const [reports] = await db.execute(
      'SELECT * FROM reports WHERE farmerId = ? ORDER BY createdAt DESC',
      [farmerId]
    );

    res.status(200).json(reports);
  } catch (error) {
    console.error('Get reports by farmer error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get problems by farmer ID
const getProblemsByFarmer = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { farmerId } = req.params;

    const [problems] = await db.execute(
      `SELECT p.*, pp.status as currentStatus, pp.notes as latestNotes
       FROM problems p 
       LEFT JOIN problem_progress pp ON p.id = pp.problemId 
       WHERE p.farmerId = ? 
       AND pp.id = (
         SELECT id FROM problem_progress 
         WHERE problemId = p.id 
         ORDER BY createdAt DESC 
         LIMIT 1
       )
       ORDER BY p.createdAt DESC`,
      [farmerId]
    );

    res.status(200).json(problems);
  } catch (error) {
    console.error('Get problems by farmer error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get report by ID
const getReportById = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    const [reports] = await db.execute(
      `SELECT r.*, u.name as farmerName, u.contact as farmerContact 
       FROM reports r 
       LEFT JOIN users u ON r.farmerId = u.id 
       WHERE r.id = ?`,
      [id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json(reports[0]);
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get problem by ID with full progress history
const getProblemById = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    const [problems] = await db.execute(
      `SELECT p.*, u.name as farmerName, u.contact as farmerContact 
       FROM problems p 
       LEFT JOIN users u ON p.farmerId = u.id 
       WHERE p.id = ?`,
      [id]
    );

    if (problems.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const [progress] = await db.execute(
      `SELECT pp.*, u.name as assignedToName 
       FROM problem_progress pp 
       LEFT JOIN users u ON pp.assignedTo = u.id 
       WHERE pp.problemId = ? 
       ORDER BY pp.createdAt DESC`,
      [id]
    );

    const problemWithProgress = {
      ...problems[0],
      progress: progress
    };

    res.status(200).json(problemWithProgress);
  } catch (error) {
    console.error('Get problem by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  submitReport,
  getAllReports,
  submitProblem,
  getAllProblems,
  getProblemsWithFullProgress,
  updateProblemStatus,
  getReportsByFarmer,
  getProblemsByFarmer,
  getReportById,
  getProblemById
};