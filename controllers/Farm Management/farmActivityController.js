// controllers/FarmActivityController.js
import { query, getClient } from '../../config/database.js';

const addActivity = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { farmPlanId, title, description, scheduledDate } = req.body;

    // Validate required fields
    if (!farmPlanId || !title) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: "Missing required fields: farmPlanId and title are required" 
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
        message: "Farm plan not found" 
      });
    }

    // Create activity record using SQL
    const activityResult = await client.query(
      `INSERT INTO farm_activities (farm_plan_id, title, description, scheduled_date, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, farm_plan_id as "farmPlanId", title, description, scheduled_date as "scheduledDate", created_at`,
      [farmPlanId, title, description, scheduledDate]
    );

    const activity = activityResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: "Activity added successfully",
      activity
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error adding activity:", err);
    res.status(500).json({ 
      message: "Failed to add activity",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

const getActivities = async (req, res) => {
  try {
    const { farmPlanId } = req.params;

    // Validate farmPlanId
    if (!farmPlanId) {
      return res.status(400).json({ 
        message: "Farm plan ID is required" 
      });
    }

    const activitiesResult = await query(
      `SELECT id, farm_plan_id as "farmPlanId", title, description, 
              scheduled_date as "scheduledDate", created_at 
       FROM farm_activities 
       WHERE farm_plan_id = $1 
       ORDER BY scheduled_date DESC, created_at DESC`,
      [farmPlanId]
    );

    res.json({
      success: true,
      activities: activitiesResult.rows,
      count: activitiesResult.rows.length
    });
  } catch (err) {
    console.error("Error fetching activities:", err);
    res.status(500).json({ 
      message: "Failed to fetch activities",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Additional useful functions

const updateActivity = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { title, description, scheduledDate } = req.body;

    // Check if activity exists
    const activityCheck = await client.query(
      'SELECT id FROM farm_activities WHERE id = $1',
      [id]
    );

    if (activityCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: "Activity not found" 
      });
    }

    // Update activity using SQL
    const updateResult = await client.query(
      `UPDATE farm_activities 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           scheduled_date = COALESCE($3, scheduled_date),
           updated_at = NOW() 
       WHERE id = $4 
       RETURNING id, farm_plan_id as "farmPlanId", title, description, scheduled_date as "scheduledDate", updated_at`,
      [title, description, scheduledDate, id]
    );

    await client.query('COMMIT');

    const updatedActivity = updateResult.rows[0];

    res.json({
      success: true,
      message: "Activity updated successfully",
      activity: updatedActivity
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating activity:", err);
    res.status(500).json({ 
      message: "Failed to update activity",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

const deleteActivity = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Check if activity exists
    const activityCheck = await client.query(
      'SELECT id FROM farm_activities WHERE id = $1',
      [id]
    );

    if (activityCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: "Activity not found" 
      });
    }

    // Delete activity using SQL
    await client.query(
      'DELETE FROM farm_activities WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: "Activity deleted successfully"
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error deleting activity:", err);
    res.status(500).json({ 
      message: "Failed to delete activity",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activityResult = await query(
      `SELECT fa.id, fa.farm_plan_id as "farmPlanId", fa.title, fa.description, 
              fa.scheduled_date as "scheduledDate", fa.created_at,
              fp.name as "farmPlanName"
       FROM farm_activities fa
       LEFT JOIN farm_plans fp ON fa.farm_plan_id = fp.id
       WHERE fa.id = $1`,
      [id]
    );

    if (activityResult.rows.length === 0) {
      return res.status(404).json({ 
        message: "Activity not found" 
      });
    }

    const activity = activityResult.rows[0];

    res.json({
      success: true,
      activity
    });
  } catch (err) {
    console.error("Error fetching activity:", err);
    res.status(500).json({ 
      message: "Failed to fetch activity",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export {
  addActivity,
  getActivities,
  updateActivity,
  deleteActivity,
  getActivityById
};