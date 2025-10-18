// // controllers/CostController.js
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
// const addCustomCost = async (req, res)=> {
//     try {
//       const { farmPlanId, category, label, amount } = req.body;

//       const cost = await prisma.investmentCost.create({
//         data: {
//           farmPlanId,
//           stage: category,
//           label,
//           amount,
//         },
//       });

//       res.status(201).json(cost);
//     } catch (err) {
//       res.status(500).json({ message: 'Failed to add cost', error: err });
//     }
//   }

// export {
//     addCustomCost,
//   };

// controllers/CostController.js
import { query, getClient } from '../../config/database.js';

const addCustomCost = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { farmPlanId, category, label, amount } = req.body;

    // Validate required fields
    if (!farmPlanId || !category || !label || !amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'Missing required fields: farmPlanId, category, label, amount' 
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

    // Create cost record using SQL
    const costResult = await client.query(
      `INSERT INTO investment_costs (farm_plan_id, stage, label, amount, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, farm_plan_id as "farmPlanId", stage, label, amount, created_at`,
      [farmPlanId, category, label, parseFloat(amount)]
    );

    const cost = costResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Cost added successfully',
      cost
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding cost:', err);
    res.status(500).json({ 
      message: 'Failed to add cost',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

// Get costs by farm plan
const getCostsByFarmPlan = async (req, res) => {
  try {
    const { farmPlanId } = req.params;

    const costsResult = await query(
      `SELECT id, farm_plan_id as "farmPlanId", stage, label, amount, created_at 
       FROM investment_costs 
       WHERE farm_plan_id = $1 
       ORDER BY created_at DESC`,
      [farmPlanId]
    );

    res.status(200).json({
      success: true,
      costs: costsResult.rows,
      count: costsResult.rows.length
    });
  } catch (err) {
    console.error('Error fetching costs:', err);
    res.status(500).json({ 
      message: 'Failed to fetch costs',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update cost
const updateCost = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { category, label, amount } = req.body;

    // Check if cost exists
    const costCheck = await client.query(
      'SELECT id FROM investment_costs WHERE id = $1',
      [id]
    );

    if (costCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: 'Cost not found' 
      });
    }

    // Update cost using SQL
    const updateResult = await client.query(
      `UPDATE investment_costs 
       SET stage = $1, label = $2, amount = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING id, farm_plan_id as "farmPlanId", stage, label, amount, updated_at`,
      [category, label, parseFloat(amount), id]
    );

    await client.query('COMMIT');

    const updatedCost = updateResult.rows[0];

    res.status(200).json({
      success: true,
      message: 'Cost updated successfully',
      cost: updatedCost
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating cost:', err);
    res.status(500).json({ 
      message: 'Failed to update cost',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

// Delete cost
const deleteCost = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Check if cost exists
    const costCheck = await client.query(
      'SELECT id FROM investment_costs WHERE id = $1',
      [id]
    );

    if (costCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: 'Cost not found' 
      });
    }

    // Delete cost using SQL
    await client.query(
      'DELETE FROM investment_costs WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Cost deleted successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting cost:', err);
    res.status(500).json({ 
      message: 'Failed to delete cost',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

export {
  addCustomCost,
  getCostsByFarmPlan,
  updateCost,
  deleteCost
};