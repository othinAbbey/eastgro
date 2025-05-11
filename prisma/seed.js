// // prisma/seed.js
// import { PrismaClient, CostType, Stage } from '@prisma/client';

// const prisma = new PrismaClient();

// const cropCostTemplates = {
//   // Maize example
//   'cropid here': [
//     { type: CostType.ONE_TIME, stage: Stage.LAND_PREPARATION, category: "Land Preparation", amount: 5000 },
//     { type: CostType.ONE_TIME, stage: Stage.PLANTING, category: "Seeds", amount: 2000 },
//     { type: CostType.SEASONAL, stage: Stage.MANAGEMENT, category: "Fertilizers", amount: 1000 },
//     // ... other costs
//   ],
//   // Tomato example (different costs)
//   'crop id here': [
//     { type: CostType.ONE_TIME, stage: Stage.LAND_PREPARATION, category: "Land Preparation", amount: 6000 },
//     { type: CostType.ONE_TIME, stage: Stage.PLANTING, category: "Seedlings", amount: 3000 },
//     { type: CostType.SEASONAL, stage: Stage.MANAGEMENT, category: "Trellising", amount: 1500 },
//     // ... other costs
//   ]
// };

// async function seedCostTemplates() {
//   for (const [cropId, templates] of Object.entries(cropCostTemplates)) {
//     await prisma.costTemplate.createMany({
//       data: templates.map(template => ({
//         ...template,
//         cropId,
//         description: `${template.category} for ${cropId.split('-')[0]}`
//       }))
//     });
//   }
// }

// seedCostTemplates()
//   .catch(e => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// prisma/seed.js
import { PrismaClient, CostType, Stage } from '@prisma/client';

const prisma = new PrismaClient();

const cropCostTemplates = {
  // Organic Tomato Garden
  '67512a9d-5502-43e5-b5f2-6e66a37c008b': [
    {
      type: CostType.ONE_TIME,
      stage: Stage.LAND_PREPARATION,
      amount: 1500,
    },
    {
      type: CostType.ONE_TIME,
      stage: Stage.PLANTING,
      amount: 800,
    },
    {
      type: CostType.INVESTMENTCOSTS,
      stage: Stage.PLANTING,
      amount: 1200,
    },
    {
      type: CostType.SEASONAL,
      stage: Stage.MANAGEMENT,
      amount: 150,
    },
  ],

  // Arabica Coffee Farm
  '6c239000-2fdd-474a-9481-b8dcd854b5b6': [
    {
      type: CostType.ONE_TIME,
      stage: Stage.LAND_PREPARATION,
      amount: 4500,
    },
    {
      type: CostType.ONE_TIME,
      stage: Stage.PLANTING,
      amount: 2100,
    },
    {
      type: CostType.INVESTMENTCOSTS,
      stage: Stage.PLANTING,
      amount: 1800,
    },
    {
      type: CostType.SEASONAL,
      stage: Stage.MANAGEMENT,
      amount: 300,
    },
  ],

  // Kidney Bean Plot
  '6c239000-2fdd-474a-9481-b8dcd854b5b6-KIDNEY': [
    {
      type: CostType.ONE_TIME,
      stage: Stage.LAND_PREPARATION,
      amount: 900,
    },
    {
      type: CostType.ONE_TIME,
      stage: Stage.PLANTING,
      amount: 300,
    },
    {
      type: CostType.INVESTMENTCOSTS,
      stage: Stage.PLANTING,
      amount: 450,
    },
    {
      type: CostType.SEASONAL,
      stage: Stage.MANAGEMENT,
      amount: 200,
    },
  ],

  // Cavendish Banana Plantation
  'ea8e8a75-7d56-4956-9af3-42f41f9c0b9f': [
    {
      type: CostType.ONE_TIME,
      stage: Stage.LAND_PREPARATION,
      amount: 7800,
    },
    {
      type: CostType.ONE_TIME,
      stage: Stage.PLANTING,
      amount: 5900,
    },
    {
      type: CostType.INVESTMENTCOSTS,
      stage: Stage.PLANTING,
      amount: 4300,
    },
    {
      type: CostType.SEASONAL,
      stage: Stage.MANAGEMENT,
      amount: 70900,
    },
    {
      type: CostType.SEASONAL,
      stage: Stage.MANAGEMENT,
      amount: 45000,
    },
  ],
};

async function seedCostTemplates() {
  for (const [rawCropId, templates] of Object.entries(cropCostTemplates)) {
    // Handle the same crop ID with different varieties (e.g., Kidney vs Arabica) by trimming the extra suffix
    const cropId = rawCropId.includes('-KIDNEY') ? rawCropId.split('-KIDNEY')[0] : rawCropId;

    await prisma.costTemplate.createMany({
      data: templates.map((template) => ({
        cropId,
        type: template.type,
        stage: template.stage,
        amount: template.amount,
        description: `${template.category} cost for crop ${cropId.slice(0, 8)}...`,
      })),
    });
  }
}

seedCostTemplates()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('✅ Cost templates seeded!');
  });
