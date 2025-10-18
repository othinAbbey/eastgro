import { query, getClient } from '../config/database.js';

// Register a produce with optional farmerId
const registerProduce = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { farmerId, type, quantity, harvestDate, isBiofortified } = req.body;

    // Ensure required fields are provided
    if (!type || !quantity || !harvestDate) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Missing required fields: type, quantity, harvestDate' 
      });
    }

    // If a farmerId is provided, check if the farmer exists
    if (farmerId) {
      const farmerResult = await client.query(
        'SELECT id FROM farmers WHERE id = $1',
        [farmerId]
      );

      if (farmerResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Farmer not found' });
      }
    }

    // Create the produce record in the database using SQL
    const produceResult = await client.query(
      `INSERT INTO produce (farmer_id, type, quantity, harvest_date, is_biofortified, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING id, farmer_id as "farmerId", type, quantity, harvest_date as "harvestDate", 
                is_biofortified as "isBiofortified", status, created_at`,
      [
        farmerId || null,
        type,
        parseInt(quantity),
        harvestDate,
        isBiofortified || false,
        'HARVESTED'
      ]
    );

    const produce = produceResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({ 
      success: true,
      message: 'Produce registered successfully', 
      produce 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error registering produce:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Fetch all produces
const getAllProduces = async (req, res) => {
  try {
    const producesResult = await query(
      `SELECT p.id, p.farmer_id as "farmerId", p.type, p.quantity, p.harvest_date as "harvestDate", 
              p.is_biofortified as "isBiofortified", p.status, p.created_at,
              f.name as "farmerName", f.contact as "farmerContact"
       FROM produce p
       LEFT JOIN farmers f ON p.farmer_id = f.id
       ORDER BY p.created_at DESC`
    );

    res.status(200).json({
      success: true,
      produces: producesResult.rows,
      count: producesResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching produces:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Fetch a specific produce by ID
const getProduceById = async (req, res) => {
  const { id } = req.params;

  try {
    const produceResult = await query(
      `SELECT p.id, p.farmer_id as "farmerId", p.type, p.quantity, p.harvest_date as "harvestDate", 
              p.is_biofortified as "isBiofortified", p.status, p.created_at,
              f.name as "farmerName", f.contact as "farmerContact", f.location as "farmerLocation"
       FROM produce p
       LEFT JOIN farmers f ON p.farmer_id = f.id
       WHERE p.id = $1`,
      [id]
    );

    if (produceResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Produce not found' 
      });
    }

    const produce = produceResult.rows[0];

    res.json({
      success: true,
      produce
    });
  } catch (error) {
    console.error('Error fetching produce:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update an existing produce
const updateProduce = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { type, quantity, harvestDate, isBiofortified } = req.body;

    // Ensure required fields are provided
    if (!type || !quantity || !harvestDate) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Missing required fields: type, quantity, harvestDate' 
      });
    }

    // Check if produce exists
    const produceCheck = await client.query(
      'SELECT id FROM produce WHERE id = $1',
      [id]
    );

    if (produceCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        error: 'Produce not found' 
      });
    }

    // Update the produce in the database using SQL
    const produceResult = await client.query(
      `UPDATE produce 
       SET type = $1, quantity = $2, harvest_date = $3, is_biofortified = $4, updated_at = NOW() 
       WHERE id = $5 
       RETURNING id, farmer_id as "farmerId", type, quantity, harvest_date as "harvestDate", 
                is_biofortified as "isBiofortified", status, updated_at`,
      [type, parseInt(quantity), harvestDate, isBiofortified || false, id]
    );

    const produce = produceResult.rows[0];

    await client.query('COMMIT');

    res.status(200).json({ 
      success: true,
      message: 'Produce updated successfully', 
      produce 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating produce:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Delete a produce by ID
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
        error: 'Produce not found' 
      });
    }

    // Delete the produce from the database using SQL
    await client.query(
      'DELETE FROM produce WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.status(200).json({ 
      success: true,
      message: 'Produce deleted successfully' 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting produce:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Additional useful functions

// Get produces by farmer ID
const getProducesByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const producesResult = await query(
      `SELECT id, type, quantity, harvest_date as "harvestDate", 
              is_biofortified as "isBiofortified", status, created_at
       FROM produce 
       WHERE farmer_id = $1 
       ORDER BY created_at DESC`,
      [farmerId]
    );

    res.status(200).json({
      success: true,
      produces: producesResult.rows,
      count: producesResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching produces by farmer:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update produce status
const updateProduceStatus = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['HARVESTED', 'IN_TRANSIT', 'PROCESSED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: HARVESTED, IN_TRANSIT, PROCESSED, DELIVERED' 
      });
    }

    // Check if produce exists
    const produceCheck = await client.query(
      'SELECT id FROM produce WHERE id = $1',
      [id]
    );

    if (produceCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        error: 'Produce not found' 
      });
    }

    // Update the produce status
    const produceResult = await client.query(
      `UPDATE produce 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, type, quantity, status, updated_at`,
      [status, id]
    );

    const produce = produceResult.rows[0];

    await client.query('COMMIT');

    res.status(200).json({ 
      success: true,
      message: 'Produce status updated successfully', 
      produce 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating produce status:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

export { 
  registerProduce, 
  getAllProduces, 
  getProduceById, 
  updateProduce, 
  deleteProduce,
  getProducesByFarmer,
  updateProduceStatus
};