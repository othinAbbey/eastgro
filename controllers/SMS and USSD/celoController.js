

// import { registerCrop } from '../../models/celoCropRegister.js';

// const celoCropRegistration = async (req, res) => {
//   try {
//     const { farmerId, cropDetails } = req.body;
//     const result = await registerCrop(farmerId, cropDetails);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to register crop', message: error.message });
//   }
// };

// export {celoCropRegistration}


// Use the same connection function from previous conversions
const createConnection = async () => {
  // Your existing connection code here
};

// Helper function to generate ID
function generateId(prefix) {
  return `${prefix}_` + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Mock Celo blockchain interaction (replace with actual Celo integration)
const mockRegisterCropOnCelo = async (farmerId, cropDetails) => {
  // This is a mock function - replace with actual Celo blockchain interaction
  console.log('Mock: Registering crop on Celo blockchain...');
  
  // Simulate blockchain transaction
  return {
    transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
    status: 'CONFIRMED',
    blockNumber: Math.floor(Math.random() * 1000000),
    gasUsed: Math.floor(Math.random() * 100000)
  };
};

// Celo Crop Registration
const celoCropRegistration = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { farmerId, cropDetails } = req.body;

    // Validate required fields
    if (!farmerId || !cropDetails) {
      return res.status(400).json({ 
        error: 'Farmer ID and crop details are required' 
      });
    }

    // Validate farmer exists and is actually a farmer
    const [farmers] = await db.execute(
      'SELECT id, userRole FROM users WHERE id = ? AND userRole = ?',
      [farmerId, 'FARMER']
    );

    if (farmers.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid farmer ID or user is not a farmer' 
      });
    }

    // Validate crop details structure
    if (!cropDetails.cropType || !cropDetails.plantingDate || !cropDetails.area) {
      return res.status(400).json({ 
        error: 'Crop type, planting date, and area are required in crop details' 
      });
    }

    // Start transaction for registration
    await db.execute('START TRANSACTION');

    try {
      // Register on Celo blockchain (mock implementation)
      const celoResult = await mockRegisterCropOnCelo(farmerId, cropDetails);

      const registrationId = generateId('celocrop');
      
      // Create Celo crop registration record
      await db.execute(
        `INSERT INTO celo_crop_registrations 
         (id, farmerId, cropDetails, celoTransactionHash, blockchainStatus, confirmedAt) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          registrationId,
          farmerId,
          JSON.stringify(cropDetails),
          celoResult.transactionHash,
          celoResult.status,
          celoResult.status === 'CONFIRMED' ? new Date() : null
        ]
      );

      // Create crop details record for easier querying
      const cropDetailsId = generateId('cropdetail');
      await db.execute(
        `INSERT INTO crop_details 
         (id, celoRegistrationId, cropType, variety, plantingDate, expectedHarvestDate, 
          area, location, soilType, irrigationMethod, estimatedYield, organicCertified) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cropDetailsId,
          registrationId,
          cropDetails.cropType,
          cropDetails.variety || null,
          new Date(cropDetails.plantingDate),
          cropDetails.expectedHarvestDate ? new Date(cropDetails.expectedHarvestDate) : null,
          cropDetails.area,
          cropDetails.location || null,
          cropDetails.soilType || null,
          cropDetails.irrigationMethod || null,
          cropDetails.estimatedYield || null,
          cropDetails.organicCertified || false
        ]
      );

      // Create initial growth tracking entry
      const growthTrackingId = generateId('growth');
      await db.execute(
        `INSERT INTO crop_growth_tracking 
         (id, celoRegistrationId, growthStage, observationDate, healthStatus, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          growthTrackingId,
          registrationId,
          'PLANTING',
          new Date(cropDetails.plantingDate),
          'GOOD',
          'Initial crop registration and planting'
        ]
      );

      await db.execute('COMMIT');

      // Get complete registration details
      const [registrations] = await db.execute(
        `SELECT ccr.*, 
                cd.cropType, cd.variety, cd.plantingDate, cd.expectedHarvestDate,
                cd.area, cd.location, cd.estimatedYield,
                u.name as farmerName, u.contact as farmerContact
         FROM celo_crop_registrations ccr
         LEFT JOIN crop_details cd ON ccr.id = cd.celoRegistrationId
         LEFT JOIN users u ON ccr.farmerId = u.id
         WHERE ccr.id = ?`,
        [registrationId]
      );

      const registration = {
        ...registrations[0],
        cropDetails: registrations[0].cropDetails ? JSON.parse(registrations[0].cropDetails) : null
      };

      res.status(201).json({
        message: 'Crop registered successfully on Celo blockchain',
        registration: registration,
        blockchainTransaction: {
          hash: celoResult.transactionHash,
          status: celoResult.status,
          blockNumber: celoResult.blockNumber
        }
      });

    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Celo crop registration error:', error);
    res.status(500).json({ 
      error: 'Failed to register crop', 
      message: error.message 
    });
  }
};

// Get crop registrations by farmer
const getCropsByFarmer = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { farmerId } = req.params;

    const [registrations] = await db.execute(
      `SELECT ccr.*, 
              cd.cropType, cd.variety, cd.plantingDate, cd.expectedHarvestDate,
              cd.area, cd.location, cd.estimatedYield, cd.organicCertified,
              (SELECT growthStage FROM crop_growth_tracking 
               WHERE celoRegistrationId = ccr.id 
               ORDER BY observationDate DESC LIMIT 1) as currentGrowthStage,
              (SELECT healthStatus FROM crop_growth_tracking 
               WHERE celoRegistrationId = ccr.id 
               ORDER BY observationDate DESC LIMIT 1) as currentHealthStatus
       FROM celo_crop_registrations ccr
       LEFT JOIN crop_details cd ON ccr.id = cd.celoRegistrationId
       WHERE ccr.farmerId = ?
       ORDER BY cd.plantingDate DESC`,
      [farmerId]
    );

    const registrationsWithParsedData = registrations.map(reg => ({
      ...reg,
      cropDetails: reg.cropDetails ? JSON.parse(reg.cropDetails) : null
    }));

    res.json(registrationsWithParsedData);
  } catch (error) {
    console.error('Get crops by farmer error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get crop registration by ID
const getCropRegistrationById = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    const [registrations] = await db.execute(
      `SELECT ccr.*, 
              cd.cropType, cd.variety, cd.plantingDate, cd.expectedHarvestDate,
              cd.area, cd.location, cd.soilType, cd.irrigationMethod, 
              cd.estimatedYield, cd.organicCertified,
              u.name as farmerName, u.contact as farmerContact, u.location as farmerLocation
       FROM celo_crop_registrations ccr
       LEFT JOIN crop_details cd ON ccr.id = cd.celoRegistrationId
       LEFT JOIN users u ON ccr.farmerId = u.id
       WHERE ccr.id = ?`,
      [id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({ error: 'Crop registration not found' });
    }

    const registration = registrations[0];

    // Get growth tracking history
    const [growthTracking] = await db.execute(
      `SELECT * FROM crop_growth_tracking 
       WHERE celoRegistrationId = ? 
       ORDER BY observationDate ASC`,
      [id]
    );

    // Get harvest records if any
    const [harvestRecords] = await db.execute(
      `SELECT * FROM crop_harvest_records 
       WHERE celoRegistrationId = ? 
       ORDER BY harvestDate DESC`,
      [id]
    );

    const completeRegistration = {
      ...registration,
      cropDetails: registration.cropDetails ? JSON.parse(registration.cropDetails) : null,
      growthTracking: growthTracking,
      harvestRecords: harvestRecords
    };

    res.json(completeRegistration);
  } catch (error) {
    console.error('Get crop registration by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add growth tracking entry
const addGrowthTracking = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;
    const { growthStage, observationDate, height, healthStatus, notes, images } = req.body;

    // Validate required fields
    if (!growthStage || !observationDate) {
      return res.status(400).json({ error: 'Growth stage and observation date are required' });
    }

    // Check if crop registration exists
    const [existingRegistrations] = await db.execute(
      'SELECT id FROM celo_crop_registrations WHERE id = ?',
      [id]
    );

    if (existingRegistrations.length === 0) {
      return res.status(404).json({ error: 'Crop registration not found' });
    }

    const trackingId = generateId('growth');
    
    await db.execute(
      `INSERT INTO crop_growth_tracking 
       (id, celoRegistrationId, growthStage, observationDate, height, healthStatus, notes, images) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trackingId,
        id,
        growthStage,
        new Date(observationDate),
        height || null,
        healthStatus || 'GOOD',
        notes || null,
        images ? JSON.stringify(images) : null
      ]
    );

    // Get created tracking entry
    const [trackingEntries] = await db.execute(
      'SELECT * FROM crop_growth_tracking WHERE id = ?',
      [trackingId]
    );

    const trackingEntry = {
      ...trackingEntries[0],
      images: trackingEntries[0].images ? JSON.parse(trackingEntries[0].images) : null
    };

    res.status(201).json(trackingEntry);

  } catch (error) {
    console.error('Add growth tracking error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Record harvest
const recordHarvest = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;
    const { harvestDate, actualYield, qualityGrade, storageLocation, pricePerKg } = req.body;

    // Validate required fields
    if (!harvestDate || !actualYield) {
      return res.status(400).json({ error: 'Harvest date and actual yield are required' });
    }

    // Check if crop registration exists
    const [existingRegistrations] = await db.execute(
      'SELECT id FROM celo_crop_registrations WHERE id = ?',
      [id]
    );

    if (existingRegistrations.length === 0) {
      return res.status(404).json({ error: 'Crop registration not found' });
    }

    const harvestId = generateId('harvest');
    const totalValue = pricePerKg ? actualYield * pricePerKg : null;
    
    await db.execute(
      `INSERT INTO crop_harvest_records 
       (id, celoRegistrationId, harvestDate, actualYield, qualityGrade, storageLocation, pricePerKg, totalValue) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        harvestId,
        id,
        new Date(harvestDate),
        actualYield,
        qualityGrade || 'GRADE_A',
        storageLocation || null,
        pricePerKg || null,
        totalValue
      ]
    );

    // Get created harvest record
    const [harvestRecords] = await db.execute(
      'SELECT * FROM crop_harvest_records WHERE id = ?',
      [harvestId]
    );

    res.status(201).json(harvestRecords[0]);

  } catch (error) {
    console.error('Record harvest error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get crop statistics
const getCropStatistics = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { farmerId } = req.params;

    const [stats] = await db.execute(
      `SELECT 
          COUNT(*) as totalCrops,
          SUM(cd.area) as totalArea,
          AVG(cd.estimatedYield) as avgEstimatedYield,
          COUNT(chr.id) as harvestedCrops,
          SUM(chr.actualYield) as totalHarvestedYield,
          AVG(chr.pricePerKg) as avgPricePerKg
       FROM celo_crop_registrations ccr
       LEFT JOIN crop_details cd ON ccr.id = cd.celoRegistrationId
       LEFT JOIN crop_harvest_records chr ON ccr.id = chr.celoRegistrationId
       WHERE ccr.farmerId = ?`,
      [farmerId]
    );

    const [cropTypes] = await db.execute(
      `SELECT 
          cd.cropType,
          COUNT(*) as count,
          SUM(cd.area) as totalArea
       FROM celo_crop_registrations ccr
       LEFT JOIN crop_details cd ON ccr.id = cd.celoRegistrationId
       WHERE ccr.farmerId = ?
       GROUP BY cd.cropType`,
      [farmerId]
    );

    res.json({
      overview: stats[0],
      cropTypes: cropTypes
    });

  } catch (error) {
    console.error('Get crop statistics error:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  celoCropRegistration,
  getCropsByFarmer,
  getCropRegistrationById,
  addGrowthTracking,
  recordHarvest,
  getCropStatistics
};
