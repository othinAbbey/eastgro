
// controllers/FarmPlanController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import {calculateCostsForPlan} from "../../utils/costCalculation.js"
import { BaseWrapperForGoverning } from "@celo/contractkit/lib/wrappers/BaseWrapperForGoverning.js";

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

  //Fetch the cost templates for a specific crop variety
// const  getTemplate = async function(req, res){
//   const costs=  await prisma.costTemplate.findMany({
//   where: {cropId},
//   select: {
//     type: true,
//     stage: true,
//     // category: true,
//     description: true,
//     amount: true
//         },
//   // orderBy: { type: 'asc' } // Order by type (ONE_TIME, SEASONAL, INVESTMENTCOSTS)
// }
// return costs;
// }) 
// const cropId = req.params.cropId
// }



// const getCosts =async function(req, res) {
//   try {
// const cropId= req.params.cropId;
// console.log("Fetching farm plans for crop ID:", cropId);

// const totalCosts = costs.reduce((sum, item)=>sum + parseFloat(item.amount || 0),0); // Ensure amount is a number
// console.log(totalCosts);
// res.status(400).json(totalCosts);
// } catch(err){
//   console.error(err);
//   res.status(500).json({ message: 'Failed to fetch farm plans', error: err });
// }
// }

// const getgroupCosts =async function(req,res){
//   try {
//   const groupedCosts = costs.reduce((acc, item) => {
 
//     if (!acc[item.type]) {
//       acc[item.type] = 0; // Initialize if this type doesn't exist
//     }
//     acc[item.type] += item.amount; // Add the cost to the correct type group
//     res.status(200).json(groupedCosts);
//    }, {})
//     return acc;
    
//   }catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch farm plans', error: err }); 
//   } 
// };
// Fetch cost templates for a specific crop
const getTemplate = async (cropId) => {
  return await prisma.costTemplate.findMany({
    where: { cropId },
    select: {
      type: true,
      stage: true,
      description: true,
      amount: true
    }
  });
};

const getCosts = async (req, res) => {
  try {
    const cropId = req.params.cropId;
    const costs = await getTemplate(cropId);
    const totalCosts = costs.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    res.json({ totalCosts, costs });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch costs', error: err });
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
      acc[item.type] += item.amount;
      return acc;
    }, {});

    res.json(groupedCosts);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to group costs', error: err });
  }
};


// const createFarmPlan = async (req, res) => {
//   try {
//     const {
//       name,
//       cropId,
//       CropVarietyId,
//       farmerId,
//       plantingDate,
//       gardenSizeInAcres,
//       soilType,
//       rainfall,
//       fertilizerType,
//       oneTimeCosts = [],
//       seasonalCosts = [],
//       investmentCosts = [],
//     } = req.body;

// // Step 1: Fetch crop variety details
// if (!CropVarietyId) {
//     console.error("❌ Missing cropVarietyId in request body");
//     return res.status(400).json({ error: "Missing cropVarietyId" });
//   }
  
//   const cropVariety = await prisma.cropVariety.findUnique({
//     where: { id: req.body.CropVarietyId },
//     include: { crop: true }
//   });
  
//   if (!cropVariety) {
//     return res.status(404).json({ error: "Crop variety not found" });
//   }
  
//   const baseYieldPerAcre = cropVariety.estimatedYieldPerAcre || 1000; // fallback
//   const adjustedYield = calculateEstimatedYield(baseYieldPerAcre, soilType, rainfall, fertilizerType);
//   const estimatedRevenue = adjustedYield * (cropVariety.marketPricePerKg || 2.5);
  
//     // Calculate total costs
//     const totalCosts = [...oneTimeCosts, ...seasonalCosts, ...investmentCosts]
//       .reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);

//     const estimatedProfit = estimatedRevenue - totalCosts;

//     // Step 3: Create farm plan
//     const farmPlan = await prisma.farmPlan.create({
//       data: {
//         name,
//         plantingDate: new Date(plantingDate),
//         gardenSize: gardenSizeInAcres,
//         estimatedYield: adjustedYield * gardenSizeInAcres,  // Total yield for all acres
//         estimatedRevenue,
//         estimatedProfit,
//         farmer: { connect: { id: farmerId } },
//         variety: { connect: { id: CropVarietyId } },
//         costs: {
//           create: [...oneTimeCosts, ...seasonalCosts, ...investmentCosts],
//         },
//       },
//       include: {
//         farmer: true,
//         variety: { include: { crop: true } },
//         costs: true
//       }
//     });

//     res.status(201).json(farmPlan);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to create farm plan", error: err });
//   }
// };

const createFarmPlan = async (req, res) => {
  try {
    const {
      name,
      farmerId,
      CropVarietyId,
      plantingDate,
      gardenSizeInAcres,
      soilType,
      rainfall,
      fertilizerType,
      // stage,
      costs = [] // Allow for custom costs to be added
    } = req.body;

    // Step 1: Fetch crop variety details
    const cropVariety = await prisma.cropVariety.findUnique({
      where: { id: CropVarietyId },
      include: { crop: true }
    });

    if (!cropVariety) {
      return res.status(404).json({ error: "Crop variety not found" });
    }

    // Step 2: Calculate dynamic costs based on crop
    const { 
      ONE_TIME: oneTimeCosts, 
      SEASONAL: seasonalCosts, 
      INVESTMENTCOSTS: investmentCosts 
    } = await calculateCostsForPlan(CropVarietyId);

    // Step 3: Calculate yield and financials
    const baseYieldPerAcre = cropVariety.estimatedYieldPerAcre || 1000;
    const adjustedYield = calculateEstimatedYield(
      baseYieldPerAcre, 
      soilType, 
      rainfall, 
      fertilizerType
    );
    
    const estimatedRevenue = adjustedYield * (cropVariety.marketPricePerKg || 2.5);
    
    // Combine dynamic and custom costs
    const allCosts = [
      ...oneTimeCosts,
      ...seasonalCosts,
      ...investmentCosts,
      ...costs
    ];

    const totalCosts = allCosts.reduce((sum, cost) => sum + (cost.amount || 0), 0);
    const estimatedProfit = estimatedRevenue - totalCosts;

    // Step 4: Create farm plan
    const farmPlan = await prisma.farmPlan.create({
      data: {
        name,
        plantingDate: new Date(plantingDate),
        gardenSize: gardenSizeInAcres,
        estimatedYield: adjustedYield * gardenSizeInAcres,
        estimatedRevenue,
        estimatedProfit,
        // stage,
        farmer: { connect: { id: farmerId } },
        variety: { connect: { id: CropVarietyId } },
        costs: {
          create: allCosts,
        },
      },
      include: {
        farmer: true,
        variety: { include: { crop: true } },
        costs: true
      }
    });

    res.status(201).json(farmPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create farm plan", error: err.message });
  }
};

const getFarmPlansByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
    console.log("Fetching farm plans for farmer ID:", farmerId);

    const plans = await prisma.farmPlan.findMany({
      where: { farmerId },  // this is the foreign key in farmPlan
      include: {
        variety: {
          include: { crop: true }
        },
        costs: true
      },
    });

    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch farm plans', error: err });
  }
};



export  {
    createFarmPlan,
    getFarmPlansByFarmer,
    getCosts,
    getGroupedCosts
  };
  // 2900 kaiso
  // 3300 super kaiso
  // 3500 super grade 2
  // 3800 grade 1

  // plastic BaseWrapperForGoverning
  // 1000 each size 
  // 5kgs 550 each 200,000 printing 450 
  // 10ks 630 each plate 220,000 printing 550
  // 25kgs 800 each plate 250,000 printing 700
  //50kg  1100 each plate 300,000 printing 950