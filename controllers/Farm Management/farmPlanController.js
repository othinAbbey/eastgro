// controllers/FarmPlanController.js
import { query, getClient } from "../../config/database.js";
import { calculateCostsForPlan } from '../../utils/costCalculation.js';

// Helper function to calculate yield based on factors
const calculateEstimatedYield = (baseYield, soilType, rainfall, fertilizerType) => {
  let yieldFactor = 1;

  // Factor for soil type (loamy = best, sandy = worst)
  const soilFactors = {
    "Loamy": 1.2,
    "Clay": 1.0,
    "Sandy": 0.8
  };
  yieldFactor *= soilFactors[soilType] || 1;  // Default to 1 if not found

  // Factor for rainfall (low = poor, high = excellent)
  const rainfallFactors = {
    "Low": 0.8,
    "Average": 1.0,
    "High": 1.2
  };
  yieldFactor *= rainfallFactors[rainfall] || 1;  // Default to 1 if not found

  // Factor for fertilizer type (basic = lower, advanced = higher)
  const fertilizerFactors = {
    "Basic": 1.0,
    "Organic": 1.1,   // Organic fertilizers are considered slightly better
    "Advanced": 1.2   // Synthetic/Advanced fertilizers are better
  };
  yieldFactor *= fertilizerFactors[fertilizerType] || 1;  // Default to 1 if not found

  // Calculate the adjusted yield per acre
  const adjustedYield = baseYield * yieldFactor;
  return adjustedYield;
};

// Fetch cost templates for a specific crop
const getTemplate = async (cropId) => {
  const result = await query(
    'SELECT type, stage, description, amount FROM cost_templates WHERE crop_id = $1',
    [cropId]
  );
  return result.rows;
};

const getCosts = async (req, res) => {
  try {
    const cropId = req.params.cropId;
    const costs = await getTemplate(cropId);
    const totalCosts = costs.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    
    res.json({ 
      success: true,
      totalCosts, 
      costs 
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Failed to fetch costs', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const getGroupedCosts = async (req, res) => {
  try {
    const cropId = req.params.cropId;
    const costs = await getTemplate(cropId);
    
    const groupedCosts = costs.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = 0;
      }
      acc[item.type] += parseFloat(item.amount || 0);
      return acc;
    }, {});

    res.json({
      success: true,
      groupedCosts
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Failed to group costs', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const createFarmPlan = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const {
      name,
      farmerId,
      CropVarietyId,
      plantingDate,
      gardenSizeInAcres,
      soilType,
      rainfall,
      fertilizerType,
      costs = [] // Allow for custom costs to be added
    } = req.body;

    // Validate required fields
    if (!name || !farmerId || !CropVarietyId || !plantingDate || !gardenSizeInAcres) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: "Missing required fields: name, farmerId, CropVarietyId, plantingDate, gardenSizeInAcres" 
      });
    }

    // Step 1: Fetch crop variety details
    const cropVarietyResult = await client.query(
      `SELECT cv.id, cv.name, cv.yield_per_acre, cv.estimated_yield_per_acre, cv.market_price_per_kg, 
              c.id as crop_id, c.name as crop_name
       FROM crop_varieties cv
       JOIN crops c ON cv.crop_id = c.id
       WHERE cv.id = $1`,
      [CropVarietyId]
    );

    if (cropVarietyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Crop variety not found" });
    }

    const cropVariety = cropVarietyResult.rows[0];

    // Step 2: Check if farmer exists
    const farmerResult = await client.query(
      'SELECT id FROM farmers WHERE id = $1',
      [farmerId]
    );

    if (farmerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Farmer not found" });
    }

    // Step 3: Calculate dynamic costs based on crop
    const { 
      ONE_TIME: oneTimeCosts, 
      SEASONAL: seasonalCosts, 
      INVESTMENTCOSTS: investmentCosts 
    } = await calculateCostsForPlan(CropVarietyId);

    // Step 4: Calculate yield and financials
    const baseYieldPerAcre = cropVariety.estimated_yield_per_acre || cropVariety.yield_per_acre || 1000;
    const adjustedYield = calculateEstimatedYield(
      baseYieldPerAcre, 
      soilType, 
      rainfall, 
      fertilizerType
    );
    
    const marketPricePerKg = cropVariety.market_price_per_kg || 2.5;
    const estimatedRevenue = adjustedYield * gardenSizeInAcres * marketPricePerKg;
    
    // Combine dynamic and custom costs
    const allCosts = [
      ...oneTimeCosts,
      ...seasonalCosts,
      ...investmentCosts,
      ...costs
    ];

    const totalCosts = allCosts.reduce((sum, cost) => sum + (cost.amount || 0), 0);
    const estimatedProfit = estimatedRevenue - totalCosts;
    const totalEstimatedYield = adjustedYield * gardenSizeInAcres;

    // Step 5: Create farm plan
    const farmPlanResult = await client.query(
      `INSERT INTO farm_plans (name, farmer_id, variety_id, planting_date, garden_size, soil_type, 
                              rainfall, fertilizer_type, estimated_yield, estimated_revenue, 
                              estimated_profit, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) 
       RETURNING id, name, farmer_id as "farmerId", variety_id as "varietyId", planting_date as "plantingDate", 
                garden_size as "gardenSize", soil_type as "soilType", rainfall, fertilizer_type as "fertilizerType",
                estimated_yield as "estimatedYield", estimated_revenue as "estimatedRevenue", 
                estimated_profit as "estimatedProfit", created_at as "createdAt"`,
      [name, farmerId, CropVarietyId, plantingDate, gardenSizeInAcres, soilType, rainfall, 
       fertilizerType, totalEstimatedYield, estimatedRevenue, estimatedProfit]
    );

    const farmPlan = farmPlanResult.rows[0];
    const farmPlanId = farmPlan.id;

    // Step 6: Create cost records
    for (const cost of allCosts) {
      await client.query(
        `INSERT INTO farm_plan_costs (farm_plan_id, type, stage, description, amount, is_custom, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [farmPlanId, cost.type, cost.stage, cost.description, cost.amount, cost.isCustom || false]
      );
    }

    await client.query('COMMIT');

    // Step 7: Fetch complete farm plan with relations
    const completeFarmPlan = await getCompleteFarmPlan(farmPlanId, client);

    res.status(201).json({
      success: true,
      message: "Farm plan created successfully",
      farmPlan: completeFarmPlan
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error creating farm plan:", err);
    res.status(500).json({ 
      message: "Failed to create farm plan", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

// Helper function to get complete farm plan with relations
const getCompleteFarmPlan = async (farmPlanId, client = null) => {
  const queryFn = client ? client.query : query;

  const farmPlanResult = await queryFn(
    `SELECT fp.*, f.name as farmer_name, f.contact as farmer_contact,
            cv.name as variety_name, cv.description as variety_description,
            c.name as crop_name
     FROM farm_plans fp
     LEFT JOIN farmers f ON fp.farmer_id = f.id
     LEFT JOIN crop_varieties cv ON fp.variety_id = cv.id
     LEFT JOIN crops c ON cv.crop_id = c.id
     WHERE fp.id = $1`,
    [farmPlanId]
  );

  if (farmPlanResult.rows.length === 0) return null;

  const farmPlan = farmPlanResult.rows[0];

  // Get costs
  const costsResult = await queryFn(
    'SELECT id, type, stage, description, amount, is_custom as "isCustom", created_at FROM farm_plan_costs WHERE farm_plan_id = $1',
    [farmPlanId]
  );

  farmPlan.costs = costsResult.rows;

  return farmPlan;
};

const getFarmPlansByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
    console.log("Fetching farm plans for farmer ID:", farmerId);

    // Check if farmer exists
    const farmerCheck = await query(
      'SELECT id FROM farmers WHERE id = $1',
      [farmerId]
    );

    if (farmerCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: "Farmer not found" 
      });
    }

    const plansResult = await query(
      `SELECT fp.*, cv.name as variety_name, cv.description as variety_description,
              c.name as crop_name, c.description as crop_description
       FROM farm_plans fp
       LEFT JOIN crop_varieties cv ON fp.variety_id = cv.id
       LEFT JOIN crops c ON cv.crop_id = c.id
       WHERE fp.farmer_id = $1
       ORDER BY fp.created_at DESC`,
      [farmerId]
    );

    // Get costs for each plan
    const plansWithCosts = await Promise.all(
      plansResult.rows.map(async (plan) => {
        const costsResult = await query(
          'SELECT id, type, stage, description, amount, is_custom as "isCustom" FROM farm_plan_costs WHERE farm_plan_id = $1',
          [plan.id]
        );
        
        return {
          ...plan,
          costs: costsResult.rows
        };
      })
    );

    res.json({
      success: true,
      plans: plansWithCosts,
      count: plansWithCosts.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Failed to fetch farm plans', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export {
  createFarmPlan,
  getFarmPlansByFarmer,
  getCosts,
  getGroupedCosts
};