import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, getClient } from '../../config/database.js';
import { registerProduce } from '../Produce Products and Inputs/produceController.js';

const createFarmer = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { name, contact, password, farmDetails, location, produce } = req.body;

    // Ensure produces is an array, default to empty array if missing or invalid
    const farmerProduce = Array.isArray(produce) ? produce : [];

    // Validate required fields
    if (!name || !contact || !password) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'Missing required fields: name, contact, password' 
      });
    }

    // Check if the farmer already exists
    const existingFarmer = await client.query(
      'SELECT id FROM farmers WHERE contact = $1',
      [contact]
    );

    if (existingFarmer.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'Farmer with this contact already exists' 
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the farmer record using SQL
    const farmerResult = await client.query(
      `INSERT INTO farmers (name, contact, password, farm_details, location, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id, name, contact, farm_details as "farmDetails", location, created_at`,
      [name, contact, hashedPassword, farmDetails, location]
    );

    const farmer = farmerResult.rows[0];
    const farmerId = farmer.id;

    // Process the produces selected by the farmer
    let createdProduces = [];
    for (let prod of farmerProduce) {
      try {
        // Create produce using the registerProduce function
        const produceData = {
          farmerId: farmerId,
          type: prod.type,
          quantity: prod.quantity || 0,
          harvestDate: prod.harvestDate || new Date().toISOString(),
          isBiofortified: prod.isBiofortified || false
        };

        // Since we're in a transaction, we need to handle this differently
        // We'll create the produce directly in the same transaction
        const produceResult = await client.query(
          `INSERT INTO produce (farmer_id, type, quantity, harvest_date, is_biofortified, status, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
           RETURNING id, type, quantity, harvest_date as "harvestDate", is_biofortified as "isBiofortified", status`,
          [
            farmerId,
            prod.type,
            prod.quantity || 0,
            prod.harvestDate || new Date().toISOString(),
            prod.isBiofortified || false,
            'HARVESTED'
          ]
        );

        createdProduces.push(produceResult.rows[0]);
      } catch (err) {
        console.error(`Error processing produce ${prod.type}:`, err);
        // Continue processing other produces even if one fails
      }
    }

    await client.query('COMMIT');

    // Generate JWT for the newly created farmer
    const token = jwt.sign(
      { id: farmer.id, role: 'farmer' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Send token and farmer data in the response
    res.status(201).json({
      success: true,
      message: 'Farmer created successfully',
      token,
      farmer: {
        id: farmer.id,
        name: farmer.name,
        contact: farmer.contact,
        farmDetails: farmer.farmDetails,
        location: farmer.location,
        produce: createdProduces,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error details:', err);
    res.status(500).json({ 
      message: 'Error creating farmer',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

const getFarmerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get farmer details
    const farmerResult = await query(
      `SELECT id, name, contact, farm_details as "farmDetails", location, created_at 
       FROM farmers 
       WHERE id = $1`,
      [id]
    );

    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Farmer not found' 
      });
    }

    const farmer = farmerResult.rows[0];

    // Get farmer's produces
    const producesResult = await query(
      `SELECT id, type, quantity, harvest_date as "harvestDate", 
              is_biofortified as "isBiofortified", status, created_at
       FROM produce 
       WHERE farmer_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    farmer.produce = producesResult.rows;

    res.status(200).json({
      success: true,
      farmer
    });
  } catch (err) {
    console.error('Error details:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching farmer data',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const updateFarmer = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { name, contact, farmDetails, location, produce } = req.body;

    // Check if farmer exists
    const farmerCheck = await client.query(
      'SELECT id FROM farmers WHERE id = $1',
      [id]
    );

    if (farmerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: 'Farmer not found' 
      });
    }

    // Check if new contact already exists (for other farmers)
    if (contact) {
      const contactCheck = await client.query(
        'SELECT id FROM farmers WHERE contact = $1 AND id != $2',
        [contact, id]
      );

      if (contactCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: 'Contact number already used by another farmer' 
        });
      }
    }

    // Update the farmer's details using SQL
    const updatedFarmerResult = await client.query(
      `UPDATE farmers 
       SET name = COALESCE($1, name), 
           contact = COALESCE($2, contact), 
           farm_details = COALESCE($3, farm_details), 
           location = COALESCE($4, location),
           updated_at = NOW() 
       WHERE id = $5 
       RETURNING id, name, contact, farm_details as "farmDetails", location, updated_at`,
      [name, contact, farmDetails, location, id]
    );

    const updatedFarmer = updatedFarmerResult.rows[0];

    // Handle produces update if provided
    if (produce && Array.isArray(produce)) {
      // First, remove existing produces for this farmer
      await client.query(
        'UPDATE produce SET farmer_id = NULL WHERE farmer_id = $1',
        [id]
      );

      // Add new produces
      for (let prod of produce) {
        if (prod.id) {
          // Update existing produce
          await client.query(
            `UPDATE produce 
             SET farmer_id = $1, type = $2, quantity = $3, updated_at = NOW() 
             WHERE id = $4`,
            [id, prod.type, prod.quantity || 0, prod.id]
          );
        } else {
          // Create new produce
          await client.query(
            `INSERT INTO produce (farmer_id, type, quantity, harvest_date, is_biofortified, status, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
              id,
              prod.type,
              prod.quantity || 0,
              prod.harvestDate || new Date().toISOString(),
              prod.isBiofortified || false,
              'HARVESTED'
            ]
          );
        }
      }
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Farmer updated successfully',
      updatedFarmer
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error details:', err);
    res.status(400).json({ 
      message: 'Error updating farmer',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

// Additional useful functions

const getAllFarmers = async (req, res) => {
  try {
    const farmersResult = await query(
      `SELECT id, name, contact, location, created_at 
       FROM farmers 
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      farmers: farmersResult.rows,
      count: farmersResult.rows.length
    });
  } catch (err) {
    console.error('Error fetching farmers:', err);
    res.status(500).json({ 
      message: 'Error fetching farmers',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const deleteFarmer = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Check if farmer exists
    const farmerCheck = await client.query(
      'SELECT id FROM farmers WHERE id = $1',
      [id]
    );

    if (farmerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: 'Farmer not found' 
      });
    }

    // Delete farmer (produces will be handled by ON DELETE SET NULL constraint)
    await client.query(
      'DELETE FROM farmers WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Farmer deleted successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting farmer:', err);
    res.status(500).json({ 
      message: 'Error deleting farmer',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

export default { 
  createFarmer, 
  getFarmerById, 
  updateFarmer, 
  getAllFarmers, 
  deleteFarmer 
};