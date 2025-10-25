import { query, getClient } from '../../config/database.js';

const registerProduce = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { farmerId, type, quantity, harvestDate, qualityReport } = req.body;

    // Validate required fields
    if (!type || !quantity || !harvestDate) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: type, quantity, harvestDate' 
      });
    }

    // If farmerId is provided, check if farmer exists
    if (farmerId) {
      const farmerResult = await client.query(
        'SELECT id FROM farmers WHERE id = $1',
        [farmerId]
      );

      if (farmerResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          success: false,
          error: 'Farmer not found' 
        });
      }
    }

    // Create produce record using SQL
    const produceResult = await client.query(
      `INSERT INTO produce (farmer_id, type, quantity, harvest_date, quality_report, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING id, farmer_id as "farmerId", type, quantity, harvest_date as "harvestDate", 
                quality_report as "qualityReport", status, created_at`,
      [
        farmerId || null,
        type,
        parseInt(quantity),
        harvestDate,
        qualityReport || null,
        'HARVESTED'
      ]
    );

    const produce = produceResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Produce created successfully',
      produce
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating produce:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create produce',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const getProduce = async (req, res) => {
  try {
    const produceResult = await query(
      `SELECT p.id, p.farmer_id as "farmerId", p.type, p.quantity, p.harvest_date as "harvestDate", 
              p.quality_report as "qualityReport", p.status, p.created_at,
              f.name as "farmerName", f.contact as "farmerContact", f.location as "farmerLocation"
       FROM produce p
       LEFT JOIN farmers f ON p.farmer_id = f.id
       ORDER BY p.created_at DESC`
    );

    res.json({
      success: true,
      produce: produceResult.rows,
      count: produceResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching produce:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch produce',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a list of the ids and name of the produce from the produce table
// This is used to populate the dropdown list in the frontend
const getProduceList = async (req, res) => {
  try {
    const produceResult = await query(
      `SELECT DISTINCT id, type 
       FROM produce 
       ORDER BY type ASC`
    );

    res.json({
      success: true,
      produce: produceResult.rows,
      count: produceResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching produce list:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch produce list',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Additional useful functions

const getProduceById = async (req, res) => {
  try {
    const { id } = req.params;

    const produceResult = await query(
      `SELECT p.id, p.farmer_id as "farmerId", p.type, p.quantity, p.harvest_date as "harvestDate", 
              p.quality_report as "qualityReport", p.status, p.created_at,
              f.name as "farmerName", f.contact as "farmerContact", f.location as "farmerLocation"
       FROM produce p
       LEFT JOIN farmers f ON p.farmer_id = f.id
       WHERE p.id = $1`,
      [id]
    );

    if (produceResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Produce not found' 
      });
    }

    const produce = produceResult.rows[0];

    res.json({
      success: true,
      produce
    });
  } catch (error) {
    console.error('Error fetching produce by ID:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch produce',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateProduce = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { type, quantity, harvestDate, qualityReport, status } = req.body;

    // Check if produce exists
    const produceCheck = await client.query(
      'SELECT id FROM produce WHERE id = $1',
      [id]
    );

    if (produceCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Produce not found' 
      });
    }

    // Update produce using SQL
    const updateResult = await client.query(
      `UPDATE produce 
       SET type = COALESCE($1, type), 
           quantity = COALESCE($2, quantity), 
           harvest_date = COALESCE($3, harvest_date), 
           quality_report = COALESCE($4, quality_report),
           status = COALESCE($5, status),
           updated_at = NOW() 
       WHERE id = $6 
       RETURNING id, farmer_id as "farmerId", type, quantity, harvest_date as "harvestDate", 
                quality_report as "qualityReport", status, updated_at`,
      [type, quantity, harvestDate, qualityReport, status, id]
    );

    const updatedProduce = updateResult.rows[0];

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Produce updated successfully',
      produce: updatedProduce
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating produce:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update produce',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const deleteProduce = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Check if produce exists
    const produceCheck = await client.query(
      'SELECT id FROM produce WHERE id = $1',
      [id]
    );

    if (produceCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Produce not found' 
      });
    }

    // Delete produce using SQL
    await client.query(
      'DELETE FROM produce WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Produce deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting produce:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete produce',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const getProduceByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Check if farmer exists
    const farmerCheck = await query(
      'SELECT id FROM farmers WHERE id = $1',
      [farmerId]
    );

    if (farmerCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Farmer not found' 
      });
    }

    const produceResult = await query(
      `SELECT id, type, quantity, harvest_date as "harvestDate", 
              quality_report as "qualityReport", status, created_at
       FROM produce 
       WHERE farmer_id = $1 
       ORDER BY created_at DESC`,
      [farmerId]
    );

    res.json({
      success: true,
      produce: produceResult.rows,
      count: produceResult.rows.length,
      farmerId: farmerId
    });
  } catch (error) {
    console.error('Error fetching produce by farmer:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch produce by farmer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getProduceByType = async (req, res) => {
  try {
    const { type } = req.params;

    const produceResult = await query(
      `SELECT p.id, p.farmer_id as "farmerId", p.type, p.quantity, p.harvest_date as "harvestDate", 
              p.quality_report as "qualityReport", p.status, p.created_at,
              f.name as "farmerName", f.contact as "farmerContact"
       FROM produce p
       LEFT JOIN farmers f ON p.farmer_id = f.id
       WHERE p.type = $1 
       ORDER BY p.created_at DESC`,
      [type]
    );

    res.json({
      success: true,
      produce: produceResult.rows,
      count: produceResult.rows.length,
      type: type
    });
  } catch (error) {
    console.error('Error fetching produce by type:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch produce by type',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export { 
  registerProduce, 
  getProduce, 
  getProduceList,
  getProduceById,
  updateProduce,
  deleteProduce,
  getProduceByFarmer,
  getProduceByType
};


// import { getClient } from '../../config/database.js';

// const registerProduce = async (req, res) => {
//   const client = await getClient();
  
//   try {
//     await client.query('BEGIN');

//     const { farmerId, type, quantity, harvestDate, qualityReport } = req.body;

//     // Validate required fields
//     if (!type || !quantity || !harvestDate) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ 
//         success: false,
//         error: 'Missing required fields: type, quantity, harvestDate' 
//       });
//     }

//     // If farmerId is provided, check if farmer exists
//     if (farmerId) {
//       const farmerResult = await client.query(
//         'SELECT id FROM farmers WHERE id = $1',
//         [farmerId]
//       );

//       if (farmerResult.rows.length === 0) {
//         await client.query('ROLLBACK');
//         return res.status(404).json({ 
//           success: false,
//           error: 'Farmer not found' 
//         });
//       }
//     }

//     // Create produce record using SQL
//     const produceResult = await client.query(
//       `INSERT INTO produce (farmer_id, type, quantity, harvest_date, quality_report, status, created_at) 
//        VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
//        RETURNING id, farmer_id as "farmerId", type, quantity, harvest_date as "harvestDate", 
//                 quality_report as "qualityReport", status, created_at`,
//       [
//         farmerId || null,
//         type,
//         parseInt(quantity),
//         harvestDate,
//         qualityReport || null,
//         'HARVESTED'
//       ]
//     );

//     const produce = produceResult.rows[0];

//     await client.query('COMMIT');

//     res.status(201).json({
//       success: true,
//       message: 'Produce created successfully',
//       produce
//     });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Error creating produce:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to create produce',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   } finally {
//     client.release();
//   }
// };

// const getProduce = async (req, res) => {
//   const client = await getClient();
//   try {
//     const produceResult = await client.query(
//       `SELECT p.id, p.farmer_id as "farmerId", p.type, p.quantity, p.harvest_date as "harvestDate", 
//               p.quality_report as "qualityReport", p.status, p.created_at,
//               f.name as "farmerName", f.contact as "farmerContact", f.location as "farmerLocation"
//        FROM produce p
//        LEFT JOIN farmers f ON p.farmer_id = f.id
//        ORDER BY p.created_at DESC`
//     );

//     res.json({
//       success: true,
//       produce: produceResult.rows,
//       count: produceResult.rows.length
//     });
//   } catch (error) {
//     console.error('Error fetching produce:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch produce',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   } finally {
//     client.release();
//   }
// };

// // Get a list of the ids and name of the produce from the produce table
// const getProduceList = async (req, res) => {
//   const client = await getClient();
//   try {
//     const produceResult = await client.query(
//       `SELECT DISTINCT id, type 
//        FROM produce 
//        ORDER BY type ASC`
//     );

//     res.json({
//       success: true,
//       produce: produceResult.rows,
//       count: produceResult.rows.length
//     });
//   } catch (error) {
//     console.error('Error fetching produce list:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch produce list',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   } finally {
//     client.release();
//   }
// };

// // Get produce by ID
// const getProduceById = async (req, res) => {
//   const client = await getClient();
//   try {
//     const { id } = req.params;

//     const produceResult = await client.query(
//       `SELECT p.id, p.farmer_id as "farmerId", p.type, p.quantity, p.harvest_date as "harvestDate", 
//               p.quality_report as "qualityReport", p.status, p.created_at,
//               f.name as "farmerName", f.contact as "farmerContact", f.location as "farmerLocation"
//        FROM produce p
//        LEFT JOIN farmers f ON p.farmer_id = f.id
//        WHERE p.id = $1`,
//       [id]
//     );

//     if (produceResult.rows.length === 0) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Produce not found' 
//       });
//     }

//     const produce = produceResult.rows[0];

//     res.json({
//       success: true,
//       produce
//     });
//   } catch (error) {
//     console.error('Error fetching produce by ID:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch produce',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   } finally {
//     client.release();
//   }
// };

// const updateProduce = async (req, res) => {
//   const client = await getClient();
  
//   try {
//     await client.query('BEGIN');

//     const { id } = req.params;
//     const { type, quantity, harvestDate, qualityReport, status } = req.body;

//     // Check if produce exists
//     const produceCheck = await client.query(
//       'SELECT id FROM produce WHERE id = $1',
//       [id]
//     );

//     if (produceCheck.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ 
//         success: false,
//         error: 'Produce not found' 
//       });
//     }

//     // Update produce using SQL
//     const updateResult = await client.query(
//       `UPDATE produce 
//        SET type = COALESCE($1, type), 
//            quantity = COALESCE($2, quantity), 
//            harvest_date = COALESCE($3, harvest_date), 
//            quality_report = COALESCE($4, quality_report),
//            status = COALESCE($5, status),
//            updated_at = NOW() 
//        WHERE id = $6 
//        RETURNING id, farmer_id as "farmerId", type, quantity, harvest_date as "harvestDate", 
//                 quality_report as "qualityReport", status, updated_at`,
//       [type, quantity, harvestDate, qualityReport, status, id]
//     );

//     const updatedProduce = updateResult.rows[0];

//     await client.query('COMMIT');

//     res.json({
//       success: true,
//       message: 'Produce updated successfully',
//       produce: updatedProduce
//     });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Error updating produce:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to update produce',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   } finally {
//     client.release();
//   }
// };

// const deleteProduce = async (req, res) => {
//   const client = await getClient();
  
//   try {
//     await client.query('BEGIN');

//     const { id } = req.params;

//     // Check if produce exists
//     const produceCheck = await client.query(
//       'SELECT id FROM produce WHERE id = $1',
//       [id]
//     );

//     if (produceCheck.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ 
//         success: false,
//         error: 'Produce not found' 
//       });
//     }

//     // Delete produce using SQL
//     await client.query(
//       'DELETE FROM produce WHERE id = $1',
//       [id]
//     );

//     await client.query('COMMIT');

//     res.json({
//       success: true,
//       message: 'Produce deleted successfully'
//     });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Error deleting produce:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to delete produce',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   } finally {
//     client.release();
//   }
// };

// const getProduceByFarmer = async (req, res) => {
//   const client = await getClient();
//   try {
//     const { farmerId } = req.params;

//     // Check if farmer exists
//     const farmerCheck = await client.query(
//       'SELECT id FROM farmers WHERE id = $1',
//       [farmerId]
//     );

//     if (farmerCheck.rows.length === 0) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Farmer not found' 
//       });
//     }

//     const produceResult = await client.query(
//       `SELECT id, type, quantity, harvest_date as "harvestDate", 
//               quality_report as "qualityReport", status, created_at
//        FROM produce 
//        WHERE farmer_id = $1 
//        ORDER BY created_at DESC`,
//       [farmerId]
//     );

//     res.json({
//       success: true,
//       produce: produceResult.rows,
//       count: produceResult.rows.length,
//       farmerId: farmerId
//     });
//   } catch (error) {
//     console.error('Error fetching produce by farmer:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch produce by farmer',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   } finally {
//     client.release();
//   }
// };

// const getProduceByType = async (req, res) => {
//   const client = await getClient();
//   try {
//     const { type } = req.params;

//     const produceResult = await client.query(
//       `SELECT p.id, p.farmer_id as "farmerId", p.type, p.quantity, p.harvest_date as "harvestDate", 
//               p.quality_report as "qualityReport", p.status, p.created_at,
//               f.name as "farmerName", f.contact as "farmerContact"
//        FROM produce p
//        LEFT JOIN farmers f ON p.farmer_id = f.id
//        WHERE p.type = $1 
//        ORDER BY p.created_at DESC`,
//       [type]
//     );

//     res.json({
//       success: true,
//       produce: produceResult.rows,
//       count: produceResult.rows.length,
//       type: type
//     });
//   } catch (error) {
//     console.error('Error fetching produce by type:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch produce by type',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   } finally {
//     client.release();
//   }
// };

// export { 
//   registerProduce, 
//   getProduce, 
//   getProduceList,
//   getProduceById,
//   updateProduce,
//   deleteProduce,
//   getProduceByFarmer,
//   getProduceByType
// };