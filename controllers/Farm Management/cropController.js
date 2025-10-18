

import { query, getClient } from '../../config/database.js';

const createCrop = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { name, description, agronomy, inputs, pests, diseases, CropVariety, yieldPotential, kgPerAcre, yieldPerAcre } = req.body;

    // Validate required fields
    if (!name) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Crop name is required" });
    }

    // Check if crop already exists
    const existingCrop = await client.query(
      'SELECT id FROM crops WHERE name = $1',
      [name]
    );

    if (existingCrop.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Crop already exists" });
    }

    // Create main crop record
    const cropResult = await client.query(
      `INSERT INTO crops (name, description, created_at) 
       VALUES ($1, $2, NOW()) 
       RETURNING id, name, description, created_at`,
      [name, description]
    );

    const crop = cropResult.rows[0];
    const cropId = crop.id;

    // Create agronomy records
    if (agronomy && agronomy.length > 0) {
      for (const item of agronomy) {
        await client.query(
          'INSERT INTO agronomy (crop_id, content, created_at) VALUES ($1, $2, NOW())',
          [cropId, item.content]
        );
      }
    }

    // Create input records
    if (inputs && inputs.length > 0) {
      for (const input of inputs) {
        await client.query(
          'INSERT INTO crop_inputs (crop_id, name, type, description, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [cropId, input.name, input.type, input.description]
        );
      }
    }

    // Create pest records
    if (pests && pests.length > 0) {
      for (const pest of pests) {
        await client.query(
          'INSERT INTO pests (crop_id, name, description, control, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [cropId, pest.name, pest.description, pest.control]
        );
      }
    }

    // Create disease records
    if (diseases && diseases.length > 0) {
      for (const disease of diseases) {
        await client.query(
          'INSERT INTO diseases (crop_id, name, description, treatment, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [cropId, disease.name, disease.description, disease.treatment]
        );
      }
    }

    // Create crop variety records
    if (CropVariety && CropVariety.length > 0) {
      for (const variety of CropVariety) {
        await client.query(
          `INSERT INTO crop_varieties (crop_id, name, description, days_to_maturity, yield_potential, kg_per_acre, yield_per_acre, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [cropId, variety.name, variety.description, variety.daysToMaturity, variety.yieldPotential, variety.kgPerAcre, variety.yieldPerAcre]
        );
      }
    }

    await client.query('COMMIT');

    // Fetch the complete crop with all relations
    const completeCrop = await getCompleteCropById(cropId, client);

    res.status(201).json({
      success: true,
      message: "Crop created successfully",
      crop: completeCrop
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating crop:", error);
    res.status(500).json({ 
      message: "Something went wrong", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  } finally {
    client.release();
  }
};

// Helper function to get complete crop data
const getCompleteCropById = async (cropId, client = null) => {
  const queryFn = client ? client.query : query;
  
  const cropResult = await queryFn(
    'SELECT id, name, description, created_at FROM crops WHERE id = $1',
    [cropId]
  );

  if (cropResult.rows.length === 0) return null;

  const crop = cropResult.rows[0];

  // Get all related data
  const [agronomy, inputs, pests, diseases, varieties] = await Promise.all([
    queryFn('SELECT id, content, created_at FROM agronomy WHERE crop_id = $1', [cropId]),
    queryFn('SELECT id, name, type, description, created_at FROM crop_inputs WHERE crop_id = $1', [cropId]),
    queryFn('SELECT id, name, description, control, created_at FROM pests WHERE crop_id = $1', [cropId]),
    queryFn('SELECT id, name, description, treatment, created_at FROM diseases WHERE crop_id = $1', [cropId]),
    queryFn('SELECT id, name, description, days_to_maturity as "daysToMaturity", yield_potential as "yieldPotential", kg_per_acre as "kgPerAcre", yield_per_acre as "yieldPerAcre", created_at FROM crop_varieties WHERE crop_id = $1', [cropId])
  ]);

  return {
    ...crop,
    agronomy: agronomy.rows,
    inputs: inputs.rows,
    pests: pests.rows,
    diseases: diseases.rows,
    CropVariety: varieties.rows
  };
};

// Get all crops (list only basic info)
const getAllCrops = async (req, res) => {
  try {
    const cropsResult = await query(
      'SELECT id, name, description, created_at FROM crops ORDER BY name'
    );

    res.json({
      success: true,
      crops: cropsResult.rows,
      count: cropsResult.rows.length
    });
  } catch (error) {
    console.error("Error fetching crops:", error);
    res.status(500).json({ 
      message: "Something went wrong", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Get one crop with full nested data
const getCropById = async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await getCompleteCropById(id);

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.json({
      success: true,
      crop
    });
  } catch (error) {
    console.error("Error fetching crop:", error);
    res.status(500).json({ 
      message: "Something went wrong", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Update a crop (basic fields only)
const updateCrop = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { name, description } = req.body;

    // Check if crop exists
    const cropCheck = await client.query(
      'SELECT id FROM crops WHERE id = $1',
      [id]
    );

    if (cropCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Crop not found" });
    }

    // Check if new name already exists (excluding current crop)
    if (name) {
      const nameCheck = await client.query(
        'SELECT id FROM crops WHERE name = $1 AND id != $2',
        [name, id]
      );

      if (nameCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: "Crop name already exists" });
      }
    }

    // Update crop
    const updateResult = await client.query(
      `UPDATE crops 
       SET name = COALESCE($1, name), description = COALESCE($2, description), updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, name, description, updated_at`,
      [name, description, id]
    );

    await client.query('COMMIT');

    const updatedCrop = updateResult.rows[0];

    res.json({
      success: true,
      message: "Crop updated successfully",
      crop: updatedCrop
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating crop:", error);
    res.status(500).json({ 
      message: "Something went wrong", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  } finally {
    client.release();
  }
};

// Delete a crop (and cascade delete related data)
const deleteCrop = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Check if crop exists
    const cropCheck = await client.query(
      'SELECT id FROM crops WHERE id = $1',
      [id]
    );

    if (cropCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Crop not found" });
    }

    // Delete related records first (due to foreign key constraints)
    await client.query('DELETE FROM agronomy WHERE crop_id = $1', [id]);
    await client.query('DELETE FROM crop_inputs WHERE crop_id = $1', [id]);
    await client.query('DELETE FROM pests WHERE crop_id = $1', [id]);
    await client.query('DELETE FROM diseases WHERE crop_id = $1', [id]);
    await client.query('DELETE FROM crop_varieties WHERE crop_id = $1', [id]);

    // Delete main crop record
    await client.query('DELETE FROM crops WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.json({ 
      success: true,
      message: "Crop deleted successfully" 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error deleting crop:", error);
    res.status(500).json({ 
      message: "Something went wrong", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  } finally {
    client.release();
  }
};

const getVarietyAttributes = async (req, res) => {
  try {
    const { varietyId } = req.params;
    
    const varietyResult = await query(
      `SELECT id, name, description, days_to_maturity as "daysToMaturity", yield_potential as "yieldPotential", 
              kg_per_acre as "kgPerAcre", yield_per_acre as "yieldPerAcre", created_at 
       FROM crop_varieties 
       WHERE id = $1`,
      [varietyId]
    );

    if (varietyResult.rows.length === 0) {
      return res.status(404).json({ message: "Crop variety not found" });
    }

    const variety = varietyResult.rows[0];

    // If you have additional attributes table, query it here
    const attributesResult = await query(
      'SELECT id, name, value FROM variety_attributes WHERE variety_id = $1',
      [varietyId]
    );

    variety.attributes = attributesResult.rows;

    res.json({
      success: true,
      variety
    });
  } catch (err) {
    console.error("Error fetching variety attributes:", err);
    res.status(500).json({ 
      message: "Failed to fetch variety attributes", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

export {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  getVarietyAttributes,
};