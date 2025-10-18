// // services/CostCalculationService.js
// import { PrismaClient, CostType } from '@prisma/client';

// const prisma = new PrismaClient();

// const getCostTemplatesByCrop = async (cropId) => {
//   return await prisma.costTemplate.findMany({
//     where: { cropId },
//     orderBy: { type: 'asc' }
//   });
// };

// const calculateCostsForPlan = async (cropVarietyId) => {
//   // Get crop variety with its crop
//   const variety = await prisma.cropVariety.findUnique({
//     where: { id: cropVarietyId },
//     include: { crop: true }
//   });

//   if (!variety) {
//     throw new Error('Crop variety not found');
//   }

//   // Get all cost templates for this crop
//   const templates = await getCostTemplatesByCrop(variety.crop.id);

//   // Group by cost type
//   const costsByType = {
//     [CostType.ONE_TIME]: [],
//     [CostType.SEASONAL]: [],
//     [CostType.INVESTMENTCOSTS]: []
//   };

//   templates.forEach(template => {
//     costsByType[template.type].push({
//       type: template.type,
//       stage: template.stage,
//       category: template.category,
//       description: template.description,
//       amount: template.amount,
//       isCustom: false
//     });
//   });

//   return costsByType;
// };

// export  { calculateCostsForPlan };

import pool from '../config/database.js';

// Cost type constants (matching your Prisma enum)
const CostType = {
  ONE_TIME: 'ONE_TIME',
  SEASONAL: 'SEASONAL',
  INVESTMENTCOSTS: 'INVESTMENTCOSTS'
};

// Stage constants (matching your Prisma enum)
const Stage = {
  LAND_PREPARATION: 'LAND_PREPARATION',
  PLANTING: 'PLANTING',
  MANAGEMENT: 'MANAGEMENT',
  HARVEST: 'HARVEST',
  POST_HARVEST: 'POST_HARVEST',
  MARKETING: 'MARKETING'
};

/**
 * Get cost templates by crop ID
 * @param {number} cropId - Crop ID
 * @returns {Promise<Array>} Array of cost templates
 */
const getCostTemplatesByCrop = async (cropId) => {
  try {
    const result = await pool.query(
      `SELECT id, type, stage, description, amount, is_required, created_at
       FROM cost_templates 
       WHERE crop_id = $1 
       ORDER BY type ASC, stage ASC`,
      [cropId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting cost templates by crop:', error);
    throw new Error('Failed to fetch cost templates');
  }
};

/**
 * Get cost templates by crop variety ID
 * @param {number} varietyId - Crop variety ID
 * @returns {Promise<Array>} Array of cost templates
 */
const getCostTemplatesByVariety = async (varietyId) => {
  try {
    const result = await pool.query(
      `SELECT ct.* 
       FROM cost_templates ct
       JOIN crop_varieties cv ON ct.crop_id = cv.crop_id
       WHERE cv.id = $1 
       ORDER BY ct.type ASC, ct.stage ASC`,
      [varietyId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting cost templates by variety:', error);
    throw new Error('Failed to fetch cost templates for variety');
  }
};

/**
 * Calculate costs for a farm plan based on crop variety
 * @param {number} cropVarietyId - Crop variety ID
 * @returns {Promise<Object>} Costs grouped by type
 */
const calculateCostsForPlan = async (cropVarietyId) => {
  try {
    // Get crop variety with its crop information
    const varietyResult = await pool.query(
      `SELECT cv.*, c.name as crop_name, c.description as crop_description
       FROM crop_varieties cv
       JOIN crops c ON cv.crop_id = c.id
       WHERE cv.id = $1`,
      [cropVarietyId]
    );

    if (varietyResult.rows.length === 0) {
      throw new Error('Crop variety not found');
    }

    const variety = varietyResult.rows[0];

    // Get all cost templates for this crop
    const templates = await getCostTemplatesByCrop(variety.crop_id);

    // Group by cost type
    const costsByType = {
      [CostType.ONE_TIME]: [],
      [CostType.SEASONAL]: [],
      [CostType.INVESTMENTCOSTS]: []
    };

    templates.forEach(template => {
      if (costsByType[template.type]) {
        costsByType[template.type].push({
          id: template.id,
          type: template.type,
          stage: template.stage,
          description: template.description,
          amount: parseFloat(template.amount),
          isRequired: template.is_required,
          isCustom: false,
          category: getCostCategory(template.type, template.stage)
        });
      }
    });

    // Calculate totals for each type
    const totals = {};
    Object.keys(costsByType).forEach(type => {
      totals[type] = costsByType[type].reduce((sum, cost) => sum + cost.amount, 0);
    });

    return {
      variety: {
        id: variety.id,
        name: variety.name,
        cropName: variety.crop_name,
        description: variety.description,
        daysToMaturity: variety.days_to_maturity,
        yieldPotential: variety.yield_potential
      },
      costsByType,
      totals,
      grandTotal: Object.values(totals).reduce((sum, total) => sum + total, 0)
    };
  } catch (error) {
    console.error('Error calculating costs for plan:', error);
    throw new Error('Failed to calculate costs for farm plan');
  }
};

/**
 * Calculate costs with custom overrides
 * @param {number} cropVarietyId - Crop variety ID
 * @param {Array} customCosts - Array of custom costs to override templates
 * @returns {Promise<Object>} Costs with custom overrides
 */
const calculateCostsWithCustomizations = async (cropVarietyId, customCosts = []) => {
  try {
    const baseCalculation = await calculateCostsForPlan(cropVarietyId);
    
    // Apply custom cost overrides
    const customizedCosts = { ...baseCalculation.costsByType };
    
    customCosts.forEach(customCost => {
      const { templateId, customAmount, customDescription } = customCost;
      
      // Find the template in the appropriate cost type array
      Object.keys(customizedCosts).forEach(type => {
        const costIndex = customizedCosts[type].findIndex(cost => cost.id === templateId);
        if (costIndex !== -1) {
          customizedCosts[type][costIndex] = {
            ...customizedCosts[type][costIndex],
            amount: customAmount,
            description: customDescription || customizedCosts[type][costIndex].description,
            isCustom: true
          };
        }
      });
    });

    // Recalculate totals
    const totals = {};
    Object.keys(customizedCosts).forEach(type => {
      totals[type] = customizedCosts[type].reduce((sum, cost) => sum + cost.amount, 0);
    });

    return {
      ...baseCalculation,
      costsByType: customizedCosts,
      totals,
      grandTotal: Object.values(totals).reduce((sum, total) => sum + total, 0),
      hasCustomizations: customCosts.length > 0
    };
  } catch (error) {
    console.error('Error calculating costs with customizations:', error);
    throw new Error('Failed to calculate customized costs');
  }
};

/**
 * Get cost breakdown by stage
 * @param {number} cropVarietyId - Crop variety ID
 * @returns {Promise<Object>} Costs grouped by stage
 */
const getCostBreakdownByStage = async (cropVarietyId) => {
  try {
    const templates = await getCostTemplatesByVariety(cropVarietyId);
    
    const costsByStage = {};
    
    // Initialize all stages
    Object.values(Stage).forEach(stage => {
      costsByStage[stage] = {
        oneTime: 0,
        seasonal: 0,
        investment: 0,
        total: 0
      };
    });

    // Calculate costs per stage
    templates.forEach(template => {
      if (costsByStage[template.stage]) {
        const amount = parseFloat(template.amount);
        
        switch (template.type) {
          case CostType.ONE_TIME:
            costsByStage[template.stage].oneTime += amount;
            break;
          case CostType.SEASONAL:
            costsByStage[template.stage].seasonal += amount;
            break;
          case CostType.INVESTMENTCOSTS:
            costsByStage[template.stage].investment += amount;
            break;
        }
        
        costsByStage[template.stage].total += amount;
      }
    });

    return costsByStage;
  } catch (error) {
    console.error('Error getting cost breakdown by stage:', error);
    throw new Error('Failed to calculate cost breakdown by stage');
  }
};

/**
 * Create custom cost template
 * @param {Object} costData - Cost template data
 * @returns {Promise<Object>} Created cost template
 */
const createCustomCostTemplate = async (costData) => {
  try {
    const { cropId, type, stage, description, amount, isRequired = true } = costData;
    
    const result = await pool.query(
      `INSERT INTO cost_templates 
       (crop_id, type, stage, description, amount, is_required) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [cropId, type, stage, description, amount, isRequired]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating custom cost template:', error);
    throw new Error('Failed to create custom cost template');
  }
};

/**
 * Update cost template
 * @param {number} templateId - Template ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated cost template
 */
const updateCostTemplate = async (templateId, updateData) => {
  try {
    const { type, stage, description, amount, isRequired } = updateData;
    
    const setClause = [];
    const values = [];
    let paramCount = 1;

    if (type !== undefined) {
      setClause.push(`type = $${paramCount}`);
      values.push(type);
      paramCount++;
    }
    if (stage !== undefined) {
      setClause.push(`stage = $${paramCount}`);
      values.push(stage);
      paramCount++;
    }
    if (description !== undefined) {
      setClause.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (amount !== undefined) {
      setClause.push(`amount = $${paramCount}`);
      values.push(amount);
      paramCount++;
    }
    if (isRequired !== undefined) {
      setClause.push(`is_required = $${paramCount}`);
      values.push(isRequired);
      paramCount++;
    }

    if (setClause.length === 0) {
      throw new Error('No fields to update');
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    
    values.push(templateId);

    const result = await pool.query(
      `UPDATE cost_templates 
       SET ${setClause.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Cost template not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating cost template:', error);
    throw new Error('Failed to update cost template');
  }
};

/**
 * Delete cost template
 * @param {number} templateId - Template ID
 * @returns {Promise<boolean>} Success status
 */
const deleteCostTemplate = async (templateId) => {
  try {
    const result = await pool.query(
      'DELETE FROM cost_templates WHERE id = $1 RETURNING id',
      [templateId]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting cost template:', error);
    throw new Error('Failed to delete cost template');
  }
};

/**
 * Helper function to categorize costs
 * @param {string} type - Cost type
 * @param {string} stage - Cost stage
 * @returns {string} Cost category
 */
const getCostCategory = (type, stage) => {
  const categories = {
    [CostType.ONE_TIME]: {
      [Stage.LAND_PREPARATION]: 'Land Preparation',
      [Stage.PLANTING]: 'Planting Setup',
      [Stage.MARKETING]: 'Marketing Setup'
    },
    [CostType.SEASONAL]: {
      [Stage.MANAGEMENT]: 'Seasonal Management',
      [Stage.HARVEST]: 'Harvest Operations'
    },
    [CostType.INVESTMENTCOSTS]: {
      [Stage.LAND_PREPARATION]: 'Infrastructure',
      [Stage.POST_HARVEST]: 'Processing Equipment'
    }
  };

  return categories[type]?.[stage] || 'General';
};

/**
 * Get cost analysis report
 * @param {number} cropVarietyId - Crop variety ID
 * @returns {Promise<Object>} Cost analysis report
 */
const getCostAnalysisReport = async (cropVarietyId) => {
  try {
    const [costsByType, costsByStage, baseCalculation] = await Promise.all([
      calculateCostsForPlan(cropVarietyId),
      getCostBreakdownByStage(cropVarietyId),
      getCostTemplatesByVariety(cropVarietyId)
    ]);

    // Calculate percentages
    const totalCost = baseCalculation.reduce((sum, cost) => sum + parseFloat(cost.amount), 0);
    const typePercentages = {};
    const stagePercentages = {};

    Object.keys(costsByType.totals).forEach(type => {
      typePercentages[type] = totalCost > 0 ? (costsByType.totals[type] / totalCost) * 100 : 0;
    });

    Object.keys(costsByStage).forEach(stage => {
      stagePercentages[stage] = totalCost > 0 ? (costsByStage[stage].total / totalCost) * 100 : 0;
    });

    return {
      summary: {
        totalCost,
        numberOfCostItems: baseCalculation.length,
        highestCostType: Object.keys(costsByType.totals).reduce((a, b) => 
          costsByType.totals[a] > costsByType.totals[b] ? a : b
        ),
        highestCostStage: Object.keys(costsByStage).reduce((a, b) => 
          costsByStage[a].total > costsByStage[b].total ? a : b
        )
      },
      costsByType: {
        ...costsByType,
        percentages: typePercentages
      },
      costsByStage: {
        ...costsByStage,
        percentages: stagePercentages
      },
      recommendations: generateCostRecommendations(costsByType, costsByStage)
    };
  } catch (error) {
    console.error('Error generating cost analysis report:', error);
    throw new Error('Failed to generate cost analysis report');
  }
};

/**
 * Generate cost optimization recommendations
 * @param {Object} costsByType - Costs grouped by type
 * @param {Object} costsByStage - Costs grouped by stage
 * @returns {Array} Array of recommendations
 */
const generateCostRecommendations = (costsByType, costsByStage) => {
  const recommendations = [];

  // Analyze cost distribution
  const totalCost = Object.values(costsByType.totals).reduce((sum, total) => sum + total, 0);
  
  if (costsByType.totals[CostType.INVESTMENTCOSTS] / totalCost > 0.4) {
    recommendations.push({
      type: 'HIGH_INVESTMENT',
      message: 'Investment costs are high. Consider phased investment approach.',
      priority: 'HIGH'
    });
  }

  if (costsByStage[Stage.MANAGEMENT]?.total / totalCost > 0.3) {
    recommendations.push({
      type: 'HIGH_MANAGEMENT_COSTS',
      message: 'Management costs are significant. Explore efficiency improvements.',
      priority: 'MEDIUM'
    });
  }

  if (costsByType.totals[CostType.ONE_TIME] / totalCost < 0.2) {
    recommendations.push({
      type: 'LOW_SETUP_COSTS',
      message: 'Setup costs are relatively low. Good foundation for profitability.',
      priority: 'LOW'
    });
  }

  return recommendations;
};

export {
  CostType,
  Stage,
  getCostTemplatesByCrop,
  getCostTemplatesByVariety,
  calculateCostsForPlan,
  calculateCostsWithCustomizations,
  getCostBreakdownByStage,
  createCustomCostTemplate,
  updateCostTemplate,
  deleteCostTemplate,
  getCostAnalysisReport
};