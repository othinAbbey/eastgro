// Import dependencies
import { query, getClient } from '../../config/database.js';

const createFarmInput = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const inputData = req.body;

    // Handle bulk creation (array of inputs)
    if (Array.isArray(inputData)) {
      // Validate all items in the array
      const validationErrors = [];
      const validInputs = inputData.filter(input => {
        const { name, type, quantity, unit, price } = input;
        if (!name || !type || !quantity || !unit || price === undefined) {
          validationErrors.push({ 
            input, 
            error: "Missing required fields" 
          });
          return false;
        }
        return true;
      });

      if (validationErrors.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: "Some inputs had validation errors",
          errors: validationErrors,
          validInputsCount: validInputs.length
        });
      }

      // Create all valid inputs
      let createdCount = 0;
      const createdInputs = [];

      for (const input of validInputs) {
        try {
          const result = await client.query(
            `INSERT INTO farm_inputs (name, type, quantity, unit, price, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW()) 
             RETURNING id, name, type, quantity, unit, price, created_at`,
            [
              input.name,
              input.type,
              Number(input.quantity),
              input.unit,
              Number(input.price)
            ]
          );
          createdCount++;
          createdInputs.push(result.rows[0]);
        } catch (error) {
          // Skip duplicates and continue with others
          if (error.code === '23505') { // Unique constraint violation
            console.log(`Skipping duplicate input: ${input.name}`);
            continue;
          }
          throw error;
        }
      }

      await client.query('COMMIT');

      return res.status(201).json({
        success: true,
        message: "Bulk creation successful",
        createdCount: createdCount,
        skippedCount: validInputs.length - createdCount,
        inputs: createdInputs
      });
    }

    // Handle single input creation (object)
    const { name, type, quantity, unit, price } = inputData;
    
    // Validate single input
    if (!name || !type || !quantity || !unit || price === undefined) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields",
        required: ["name", "type", "quantity", "unit", "price"]
      });
    }

    const farmInputResult = await client.query(
      `INSERT INTO farm_inputs (name, type, quantity, unit, price, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id, name, type, quantity, unit, price, created_at`,
      [
        name, 
        type, 
        Number(quantity), 
        unit,
        Number(price)
      ]
    );

    const farmInput = farmInputResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: "Farm input created successfully",
      input: farmInput
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Creation error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to create farm input(s)",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const getAllFarmInputs = async (req, res) => {
  try {
    const farmInputsResult = await query(
      `SELECT id, name, type, quantity, unit, price, created_at 
       FROM farm_inputs 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      inputs: farmInputsResult.rows,
      count: farmInputsResult.rows.length
    });
  } catch (error) {
    console.error("Error fetching farm inputs:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch farm inputs",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getFarmInputById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const farmInputResult = await query(
      `SELECT id, name, type, quantity, unit, price, created_at 
       FROM farm_inputs 
       WHERE id = $1`,
      [id]
    );

    if (farmInputResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Farm input not found" 
      });
    }

    const farmInput = farmInputResult.rows[0];

    res.json({
      success: true,
      input: farmInput
    });
  } catch (error) {
    console.error("Error fetching farm input:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch farm input",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateFarmInput = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { name, type, quantity, unit, price } = req.body;

    // Check if farm input exists
    const inputCheck = await client.query(
      'SELECT id FROM farm_inputs WHERE id = $1',
      [id]
    );

    if (inputCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: "Farm input not found" 
      });
    }

    // Update farm input using SQL
    const updateResult = await client.query(
      `UPDATE farm_inputs 
       SET name = COALESCE($1, name), 
           type = COALESCE($2, type), 
           quantity = COALESCE($3, quantity), 
           unit = COALESCE($4, unit),
           price = COALESCE($5, price),
           updated_at = NOW() 
       WHERE id = $6 
       RETURNING id, name, type, quantity, unit, price, updated_at`,
      [name, type, quantity, unit, price, id]
    );

    const updatedInput = updateResult.rows[0];

    await client.query('COMMIT');

    res.json({
      success: true,
      message: "Farm input updated successfully",
      input: updatedInput
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating farm input:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update farm input",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const deleteFarmInput = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Check if farm input exists
    const inputCheck = await client.query(
      'SELECT id FROM farm_inputs WHERE id = $1',
      [id]
    );

    if (inputCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: "Farm input not found" 
      });
    }

    // Delete farm input using SQL
    await client.query(
      'DELETE FROM farm_inputs WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: "Farm input deleted successfully"
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error deleting farm input:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete farm input",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Additional useful functions

const getFarmInputsByType = async (req, res) => {
  try {
    const { type } = req.params;

    const farmInputsResult = await query(
      `SELECT id, name, type, quantity, unit, price, created_at 
       FROM farm_inputs 
       WHERE type = $1 
       ORDER BY created_at DESC`,
      [type]
    );

    res.json({
      success: true,
      inputs: farmInputsResult.rows,
      count: farmInputsResult.rows.length,
      type: type
    });
  } catch (error) {
    console.error("Error fetching farm inputs by type:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch farm inputs by type",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const searchFarmInputs = async (req, res) => {
  try {
    const { query: searchQuery } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ 
        success: false,
        error: "Search query is required" 
      });
    }

    const farmInputsResult = await query(
      `SELECT id, name, type, quantity, unit, price, created_at 
       FROM farm_inputs 
       WHERE name ILIKE $1 OR type ILIKE $1 
       ORDER BY created_at DESC`,
      [`%${searchQuery}%`]
    );

    res.json({
      success: true,
      inputs: farmInputsResult.rows,
      count: farmInputsResult.rows.length,
      searchQuery: searchQuery
    });
  } catch (error) {
    console.error("Error searching farm inputs:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to search farm inputs",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  createFarmInput,
  getAllFarmInputs,
  getFarmInputById,
  updateFarmInput,
  deleteFarmInput,
  getFarmInputsByType,
  searchFarmInputs
};