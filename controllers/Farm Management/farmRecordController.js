// controllers/FarmRecordController.js
import { query, getClient } from "../../config/database.js";

const addRecord = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { farmPlanId, type, note, image } = req.body;

    // Validate required fields
    if (!farmPlanId || !type) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'Missing required fields: farmPlanId and type are required' 
      });
    }

    // Check if farm plan exists
    const farmPlanCheck = await client.query(
      'SELECT id FROM farm_plans WHERE id = $1',
      [farmPlanId]
    );

    if (farmPlanCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: 'Farm plan not found' 
      });
    }

    // Create farm record using SQL
    const recordResult = await client.query(
      `INSERT INTO farm_records (farm_plan_id, type, note, image, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, farm_plan_id as "farmPlanId", type, note, image, created_at`,
      [farmPlanId, type, note, image]
    );

    const record = recordResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Farm record added successfully',
      record
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding farm record:', err);
    res.status(500).json({ 
      message: 'Failed to add farm record',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

const getRecords = async (req, res) => {
  try {
    const { farmPlanId } = req.params;

    // Validate farmPlanId
    if (!farmPlanId) {
      return res.status(400).json({ 
        message: 'Farm plan ID is required' 
      });
    }

    // Check if farm plan exists
    const farmPlanCheck = await query(
      'SELECT id FROM farm_plans WHERE id = $1',
      [farmPlanId]
    );

    if (farmPlanCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Farm plan not found' 
      });
    }

    const recordsResult = await query(
      `SELECT id, farm_plan_id as "farmPlanId", type, note, image, created_at 
       FROM farm_records 
       WHERE farm_plan_id = $1 
       ORDER BY created_at DESC`,
      [farmPlanId]
    );

    res.json({
      success: true,
      records: recordsResult.rows,
      count: recordsResult.rows.length
    });
  } catch (err) {
    console.error('Error fetching farm records:', err);
    res.status(500).json({ 
      message: 'Failed to fetch records',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Additional useful functions

const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const recordResult = await query(
      `SELECT fr.id, fr.farm_plan_id as "farmPlanId", fr.type, fr.note, fr.image, fr.created_at,
              fp.name as "farmPlanName"
       FROM farm_records fr
       LEFT JOIN farm_plans fp ON fr.farm_plan_id = fp.id
       WHERE fr.id = $1`,
      [id]
    );

    if (recordResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Farm record not found' 
      });
    }

    const record = recordResult.rows[0];

    res.json({
      success: true,
      record
    });
  } catch (err) {
    console.error('Error fetching farm record:', err);
    res.status(500).json({ 
      message: 'Failed to fetch record',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const updateRecord = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { type, note, image } = req.body;

    // Check if record exists
    const recordCheck = await client.query(
      'SELECT id FROM farm_records WHERE id = $1',
      [id]
    );

    if (recordCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: 'Farm record not found' 
      });
    }

    // Update record using SQL
    const updateResult = await client.query(
      `UPDATE farm_records 
       SET type = COALESCE($1, type), 
           note = COALESCE($2, note), 
           image = COALESCE($3, image),
           updated_at = NOW() 
       WHERE id = $4 
       RETURNING id, farm_plan_id as "farmPlanId", type, note, image, updated_at`,
      [type, note, image, id]
    );

    await client.query('COMMIT');

    const updatedRecord = updateResult.rows[0];

    res.json({
      success: true,
      message: 'Farm record updated successfully',
      record: updatedRecord
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating farm record:', err);
    res.status(500).json({ 
      message: 'Failed to update record',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

const deleteRecord = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Check if record exists
    const recordCheck = await client.query(
      'SELECT id FROM farm_records WHERE id = $1',
      [id]
    );

    if (recordCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: 'Farm record not found' 
      });
    }

    // Delete record using SQL
    await client.query(
      'DELETE FROM farm_records WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Farm record deleted successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting farm record:', err);
    res.status(500).json({ 
      message: 'Failed to delete record',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

const getRecordsByType = async (req, res) => {
  try {
    const { farmPlanId, type } = req.params;

    // Validate parameters
    if (!farmPlanId || !type) {
      return res.status(400).json({ 
        message: 'Farm plan ID and type are required' 
      });
    }

    const recordsResult = await query(
      `SELECT id, farm_plan_id as "farmPlanId", type, note, image, created_at 
       FROM farm_records 
       WHERE farm_plan_id = $1 AND type = $2 
       ORDER BY created_at DESC`,
      [farmPlanId, type]
    );

    res.json({
      success: true,
      records: recordsResult.rows,
      count: recordsResult.rows.length,
      type: type
    });
  } catch (err) {
    console.error('Error fetching farm records by type:', err);
    res.status(500).json({ 
      message: 'Failed to fetch records by type',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export {
  addRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getRecordsByType
};