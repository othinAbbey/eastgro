// services/CostCalculationService.js
import { PrismaClient, CostType } from '@prisma/client';

const prisma = new PrismaClient();

const getCostTemplatesByCrop = async (cropId) => {
  return await prisma.costTemplate.findMany({
    where: { cropId },
    orderBy: { type: 'asc' }
  });
};

const calculateCostsForPlan = async (cropVarietyId) => {
  // Get crop variety with its crop
  const variety = await prisma.cropVariety.findUnique({
    where: { id: cropVarietyId },
    include: { crop: true }
  });

  if (!variety) {
    throw new Error('Crop variety not found');
  }

  // Get all cost templates for this crop
  const templates = await getCostTemplatesByCrop(variety.crop.id);

  // Group by cost type
  const costsByType = {
    [CostType.ONE_TIME]: [],
    [CostType.SEASONAL]: [],
    [CostType.INVESTMENTCOSTS]: []
  };

  templates.forEach(template => {
    costsByType[template.type].push({
      type: template.type,
      stage: template.stage,
      category: template.category,
      description: template.description,
      amount: template.amount,
      isCustom: false
    });
  });

  return costsByType;
};

export  { calculateCostsForPlan };