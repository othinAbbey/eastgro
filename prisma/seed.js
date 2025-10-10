import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting complete database seeder...');

  // Clear existing data (optional - be careful in production)
  // await clearDatabase();

  // Seed all data
  await seedUsers();
  await seedFarmers();
  await seedGroups();
  await seedCrops();
  await seedFarmPlans();
  await seedServiceProviders();
  await seedProducts();
  await seedProduce();
  await seedFacilities();
  await seedTransporters();
  await seedShipments();
  await seedInvestments();
  await seedTransactions();
  await seedProblems();
  await seedWeather();
   await seedCustomers();

  console.log('🎉 Complete database seeder finished successfully!');
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  const users = [
    {
      name: 'Admin User',
      contact: '+256700000001',
      email: 'admin@agrotrader.com',
      password: await hash('admin123', SALT_ROUNDS),
      userRole: 'ADMIN'
    },
    {
      name: 'John Investor',
      contact: '+256700000002',
      email: 'john.investor@example.com',
      password: await hash('password123', SALT_ROUNDS),
      userRole: 'CUSTOMER'
    },
    {
      name: 'Sarah Trader',
      contact: '+256700000003',
      email: 'sarah.trader@example.com',
      password: await hash('password123', SALT_ROUNDS),
      userRole: 'CUSTOMER'
    },
    {
      name: 'David Customer',
      contact: '+256700000004',
      email: 'david.customer@example.com',
      password: await hash('password123', SALT_ROUNDS),
      userRole: 'CUSTOMER'
    },
    {
      name: 'Agent Smith',
      contact: '+256700000005',
      email: 'agent.smith@example.com',
      password: await hash('password123', SALT_ROUNDS),
      userRole: 'AGENT'
    }
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });
  }
  console.log('✅ Users seeded');
}

async function seedFarmers() {
  console.log('👨‍🌾 Seeding farmers...');
  
  const farmers = [
    {
      name: 'Mike Farmer',
      contact: '+256700000101',
      location: 'Eastern Region, Iganga',
      password: await hash('farmer123', SALT_ROUNDS),
      farmDetails: 'Organic rice farm with 50 acres, family-owned for 3 generations'
    },
    {
      name: 'Grace Grower',
      contact: '+256700000102',
      location: 'Central Region, Mpigi',
      password: await hash('farmer123', SALT_ROUNDS),
      farmDetails: 'Maize and beans farm with 30 acres, using modern irrigation'
    },
    {
      name: 'Robert Cultivator',
      contact: '+256700000103',
      location: 'Western Region, Mbarara',
      password: await hash('farmer123', SALT_ROUNDS),
      farmDetails: 'Coffee and banana plantation with 25 acres'
    }
  ];

  for (const farmerData of farmers) {
    await prisma.farmer.upsert({
      where: { contact: farmerData.contact },
      update: {},
      create: farmerData
    });
  }
  console.log('✅ Farmers seeded');
}

async function seedGroups() {
  console.log('👥 Seeding farmer groups...');
  
  const groups = [
    {
      cropType: 'Rice',
      region: 'Eastern',
      totalQuantity: 15000
    },
    {
      cropType: 'Maize',
      region: 'Central',
      totalQuantity: 20000
    },
    {
      cropType: 'Coffee',
      region: 'Western',
      totalQuantity: 5000
    }
  ];

  for (const groupData of groups) {
    await prisma.group.create({
      data: groupData
    });
  }
  console.log('✅ Farmer groups seeded');
}

async function seedCrops() {
  console.log('🌾 Seeding crops and varieties...');
  
  const crops = [
    {
      name: 'Rice',
      description: 'Staple food crop grown in paddies, rich in carbohydrates',
      agronomy: {
        create: [
          { content: 'Requires flooded fields during growth period' },
          { content: 'Optimal temperature: 20-35°C' },
          { content: 'Harvest when 80-85% of grains are yellow' }
        ]
      },
      inputs: {
        create: [
          { name: 'NPK Fertilizer', type: 'Fertilizer', description: 'Balanced NPK for rice growth' },
          { name: 'Urea', type: 'Fertilizer', description: 'Nitrogen source for vegetative growth' }
        ]
      },
      pests: {
        create: [
          { name: 'Rice Stem Borer', description: 'Larvae bore into stems', control: 'Use pheromone traps' },
          { name: 'Rice Bug', description: 'Sucks sap from grains', control: 'Neem oil application' }
        ]
      },
      diseases: {
        create: [
          { name: 'Rice Blast', description: 'Fungal disease affecting leaves', treatment: 'Fungicide application' },
          { name: 'Bacterial Blight', description: 'Bacterial infection', treatment: 'Copper-based bactericides' }
        ]
      },
      CropVariety: {
        create: [
          {
            name: 'NERICA 4',
            description: 'High-yielding drought-resistant variety',
            daysToMaturity: 110,
            yieldPotential: 'High',
            kgPerAcre: 800,
            yieldPerAcre: '3-4 tons',
            marketPricePerKg: 850
          },
          {
            name: 'K85',
            description: 'Traditional aromatic variety',
            daysToMaturity: 120,
            yieldPotential: 'Medium',
            kgPerAcre: 600,
            yieldPerAcre: '2-3 tons',
            marketPricePerKg: 1200
          }
        ]
      },
      CostTemplate: {
        create: [
          { type: 'ONE_TIME', stage: 'LAND_PREPARATION', description: 'Plowing and leveling', amount: 50000, isRequired: true },
          { type: 'SEASONAL', stage: 'PLANTING', description: 'Seeds and planting', amount: 30000, isRequired: true },
          { type: 'SEASONAL', stage: 'MANAGEMENT', description: 'Fertilizers and pesticides', amount: 40000, isRequired: true }
        ]
      }
    },
    {
      name: 'Maize',
      description: 'Cereal crop, staple food in many regions',
      agronomy: {
        create: [
          { content: 'Well-drained loamy soil preferred' },
          { content: 'Plant at onset of rains' },
          { content: 'Weed regularly during early growth' }
        ]
      },
      CropVariety: {
        create: [
          {
            name: 'Longe 5',
            description: 'High-yielding hybrid maize',
            daysToMaturity: 90,
            yieldPotential: 'High',
            kgPerAcre: 1200,
            yieldPerAcre: '4-5 tons',
            marketPricePerKg: 750
          }
        ]
      }
    }
  ];

  for (const cropData of crops) {
    // Use upsert to handle existing crops
    await prisma.crop.upsert({
      where: { name: cropData.name },
      update: {
        // Update description if it changed
        description: cropData.description
        // Note: For nested relations, you might want to handle them separately
        // or leave them out of updates to avoid duplication
      },
      create: cropData
    });
  }
  console.log('✅ Crops and varieties seeded');
}
async function seedFarmPlans() {
  console.log('📅 Seeding farm plans...');
  
  const farmers = await prisma.farmer.findMany();
  const riceVariety = await prisma.cropVariety.findFirst({ where: { name: 'NERICA 4' } });
  const maizeVariety = await prisma.cropVariety.findFirst({ where: { name: 'Longe 5' } });

  if (farmers.length > 0 && riceVariety && maizeVariety) {
    const farmPlans = [
      {
        name: 'Rice Season 2024',
        plantingDate: new Date('2024-03-01'),
        gardenSize: 10,
        farmerId: farmers[0].id,
        varietyId: riceVariety.id,
        estimatedYield: 8000,
        estimatedRevenue: 6800000,
        estimatedProfit: 2500000,
        costs: {
          create: [
            { type: 'ONE_TIME', stage: 'LAND_PREPARATION', description: 'Tractor plowing', amount: 200000, isCustom: true },
            { type: 'SEASONAL', stage: 'PLANTING', description: 'Seeds purchase', amount: 150000, isCustom: true }
          ]
        },
        activities: {
          create: [
            { title: 'Land Preparation', description: 'Plowed 10 acres using tractor', timestamp: new Date('2024-02-20') },
            { title: 'Planting', description: 'Completed rice planting', timestamp: new Date('2024-03-05') }
          ]
        }
      }
    ];

    for (const planData of farmPlans) {
      await prisma.farmPlan.create({
        data: planData
      });
    }
  }
  console.log('✅ Farm plans seeded');
}

async function seedServiceProviders() {
  console.log('🔧 Seeding service providers...');
  
  // First create services
  await prisma.service.createMany({
    data: [
      {
        name: 'Soil Testing',
        description: 'Comprehensive soil analysis and recommendations',
        basePrice: 50000,
        category: 'Testing'
      },
      {
        name: 'Crop Spraying',
        description: 'Professional pesticide and fertilizer application',
        basePrice: 30000,
        category: 'Spraying'
      },
      {
        name: 'Harvesting Service',
        description: 'Mechanical harvesting with modern equipment',
        basePrice: 100000,
        category: 'Harvesting'
      }
    ],
    skipDuplicates: true
  });

  const providers = [
    {
      name: 'AgriTech Services',
      contact: '+256700000201',
      email: 'agritech@example.com',
      password: await hash('provider123', SALT_ROUNDS),
      businessName: 'AgriTech Services Ltd',
      description: 'Professional agricultural services',
      location: 'Kampala',
      qualifications: ['Certified Agronomist', 'ISO Certified'],
      equipment: ['Tractors', 'Sprayers', 'Harvesters'],
      minOrderAmount: 50000,
      travelRadius: 200
    }
  ];

  for (const providerData of providers) {
    await prisma.serviceProvider.upsert({
      where: { email: providerData.email },
      update: {},
      create: providerData
    });
  }
  console.log('✅ Service providers seeded');
}

async function seedProducts() {
  console.log('🛍️ Seeding products...');
  
  const products = [
    {
      name: 'Premium Rice',
      price: 850,
      quantity: 5000,
      unit: 'Kgs'
    },
    {
      name: 'Quality Maize',
      price: 750,
      quantity: 3000,
      unit: 'Kgs'
    },
    {
      name: 'Organic Beans',
      price: 1200,
      quantity: 1000,
      unit: 'Kgs'
    },
    {
      name: 'Arabica Coffee',
      price: 2500,
      quantity: 500,
      unit: 'Kgs'
    }
  ];

  for (const productData of products) {
    await prisma.product.create({
      data: productData
    });
  }
  console.log('✅ Products seeded');
}

async function seedProduce() {
  console.log('🌱 Seeding produce...');
  
  const farmers = await prisma.farmer.findMany();
  
  if (farmers.length > 0) {
    const produce = [
      {
        type: 'Rice',
        region: 'Eastern',
        quantity: 5000,
        price: 500,
        unit: 'kgs',
        harvestDate: new Date('2024-06-01'),
        qualityReport: 'A',
        status: 'HARVESTED',
        farmerId: farmers[0].id
      },
      {
        type: 'Maize',
        region: 'Central',
        quantity: 3000,
        price: 450,
        unit: 'kgs',
        harvestDate: new Date('2024-06-15'),
        qualityReport: 'B',
        status: 'HARVESTED',
        farmerId: farmers[1].id
      },
      {
        type: 'Beans',
        region: 'Western',
        quantity: 1000,
        price: 800,
        unit: 'kgs',
        harvestDate: new Date('2024-05-20'),
        qualityReport: 'A',
        status: 'PROCESSED',
        farmerId: farmers[2].id
      }
    ];

    for (const produceData of produce) {
      await prisma.produce.create({
        data: produceData
      });
    }
  }
  console.log('✅ Produce seeded');
}

async function seedFacilities() {
  console.log('🏭 Seeding facilities...');
  
  const facilities = [
    {
      name: 'Kampala Central Warehouse',
      location: 'Kampala Industrial Area',
      processingDetails: 'Temperature-controlled storage, 1000-ton capacity',
      workload: 75
    },
    {
      name: 'Jinja Processing Plant',
      location: 'Jinja',
      processingDetails: 'Rice milling and packaging facility',
      workload: 60
    },
    {
      name: 'Mbale Cold Storage',
      location: 'Mbale',
      processingDetails: 'Refrigerated storage for perishables',
      workload: 40
    }
  ];

  for (const facilityData of facilities) {
    await prisma.facility.create({
      data: facilityData
    });
  }
  console.log('✅ Facilities seeded');
}

async function seedTransporters() {
  console.log('🚚 Seeding transporters...');
  
  const transporters = [
    {
      name: 'QuickTrans Logistics',
      contact: '+256700000301',
      vehicleDetails: '5-ton trucks, refrigerated containers',
      status: 'Available',
      Region: 'Nationwide'
    },
    {
      name: 'AgriHaul Services',
      contact: '+256700000302',
      vehicleDetails: '10-ton trucks, grain carriers',
      status: 'Available',
      Region: 'Eastern and Central'
    }
  ];

  for (const transporterData of transporters) {
    // Check if transporter exists first, then create if not
    const existingTransporter = await prisma.transporter.findFirst({
      where: { contact: transporterData.contact }
    });

    if (!existingTransporter) {
      await prisma.transporter.create({
        data: transporterData
      });
    }
  }
  console.log('✅ Transporters seeded');
}

async function seedShipments() {
  console.log('📦 Seeding shipments...');
  
  const produce = await prisma.produce.findMany();
  const facilities = await prisma.facility.findMany();
  const transporters = await prisma.transporter.findMany();

  if (produce.length > 0 && facilities.length > 0 && transporters.length > 0) {
    const shipments = [
      {
        destination: 'Kampala Central Market',
        status: 'DELIVERED',
        deliveryDate: new Date('2024-06-10'),
        produceId: produce[0].id,
        facilityId: facilities[0].id,
        transporterId: transporters[0].id
      },
      {
        destination: 'Jinja Retail Hub',
        status: 'IN_TRANSIT',
        produceId: produce[1].id,
        transporterId: transporters[1].id
      }
    ];

    for (const shipmentData of shipments) {
      await prisma.shipment.create({
        data: shipmentData
      });
    }
  }
  console.log('✅ Shipments seeded');
}

async function seedInvestments() {
  console.log('💰 Seeding investments...');
  
  const investors = await prisma.user.findMany({
    where: { userRole: 'CUSTOMER' }
  });

  if (investors.length >= 2) {
    const john = investors[0];
    const sarah = investors[1];

    const investments = [
      {
        investorId: john.id,
        initialAmount: 500000,
        currentBalance: 543200,
        monthlyReturnRate: 7.1,
        totalEarned: 43200,
        status: 'ACTIVE',
        startDate: new Date('2024-01-15'),
        nextPayoutDate: new Date('2024-07-01'),
        inventory: {
          create: {
            productType: 'Rice',
            totalPurchased: 1000,
            sold: 300,
            remaining: 700,
            averageBuyPrice: 500,
            currentMarketPrice: 850,
            currentValue: 595000
          }
        },
        transactions: {
          create: [
            {
              type: 'investment',
              amount: 500000,
              description: 'Initial Investment',
              status: 'completed',
              date: new Date('2024-01-15')
            },
            {
              type: 'payout',
              amount: 35500,
              description: 'Monthly Return (7.1%)',
              status: 'completed',
              date: new Date('2024-02-01')
            }
          ]
        },
        payouts: {
          create: [
            {
              amount: 35500,
              status: 'PAID',
              scheduledDate: new Date('2024-02-01'),
              paidDate: new Date('2024-02-01')
            }
          ]
        }
      },
      {
        investorId: sarah.id,
        initialAmount: 1000000,
        currentBalance: 1071000,
        monthlyReturnRate: 7.1,
        totalEarned: 71000,
        status: 'ACTIVE',
        startDate: new Date('2024-02-01'),
        nextPayoutDate: new Date('2024-07-03'),
        inventory: {
          create: {
            productType: 'Rice',
            totalPurchased: 2000,
            sold: 500,
            remaining: 1500,
            averageBuyPrice: 500,
            currentMarketPrice: 850,
            currentValue: 1275000
          }
        },
        transactions: {
          create: [
            {
              type: 'investment',
              amount: 1000000,
              description: 'Premium Investment',
              status: 'completed',
              date: new Date('2024-02-01')
            }
          ]
        }
      }
    ];

    for (const investmentData of investments) {
      await prisma.investment.create({
        data: investmentData
      });
    }

    // Create some investment sales
    const investment = await prisma.investment.findFirst({
      include: { inventory: true }
    });

    if (investment && investment.inventory.length > 0) {
      await prisma.investmentSale.create({
        data: {
          inventoryId: investment.inventory[0].id,
          quantity: 150,
          pricePerUnit: 850,
          totalAmount: 127500,
          buyer: 'Kampala Supermarket',
          date: new Date('2024-04-10')
        }
      });
    }
  }
  console.log('✅ Investments seeded');
}
async function seedCustomers() {
  console.log('🛒 Seeding customers...');
  
  const customers = [
    {
      name: 'Retail Buyer',
      contact: '+256700000401',
      password: await hash('customer123', SALT_ROUNDS),
      purchaseHistory: 'Regular buyer of rice and maize'
    },
    {
      name: 'Supermarket Chain',
      contact: '+256700000402',
      password: await hash('customer123', SALT_ROUNDS),
      purchaseHistory: 'Bulk purchases for retail stores'
    }
  ];

  for (const customerData of customers) {
    await prisma.customer.upsert({
      where: { contact: customerData.contact },
      update: {},
      create: customerData
    });
  }
  console.log('✅ Customers seeded');
}

async function seedTransactions() {
  console.log('💳 Seeding transactions...');
  
  const customers = await prisma.customer.findMany();
  const products = await prisma.product.findMany();

  if (customers.length > 0 && products.length > 0) {
    const transactions = [
      {
        buyerId: customers[0].id,
        totalAmount: 425000,
        paymentMethod: 'MOBILE_MONEY',
        status: 'COMPLETED'
      },
      {
        buyerId: customers[0].id,
        totalAmount: 225000,
        paymentMethod: 'CASH',
        status: 'PENDING'
      }
    ];

    for (const transactionData of transactions) {
      await prisma.transaction.create({
        data: transactionData
      });
    }
  }
  console.log('✅ Transactions seeded');
}

async function seedProblems() {
  console.log('🚨 Seeding problems...');
  
  const farmers = await prisma.farmer.findMany();

  if (farmers.length > 0) {
    const problems = [
      {
        farmtype: 'Rice Farm',
        Crop: 'Rice',
        Disease: 'Rice Blast',
        Pest: 'Rice Stem Borer',
        farmerId: farmers[0].id,
        progress: {
          create: [
            {
              update: 'Problem reported and photos taken',
              updatedBy: 'Field Agent',
              status: 'REPORTED'
            },
            {
              update: 'Agronomist assigned for diagnosis',
              updatedBy: 'System',
              status: 'IN_PROGRESS'
            }
          ]
        }
      }
    ];

    for (const problemData of problems) {
      await prisma.problem.create({
        data: problemData
      });
    }
  }
  console.log('✅ Problems seeded');
}

async function seedWeather() {
  console.log('☀️ Seeding weather data...');
  
  const farmers = await prisma.farmer.findMany();

  if (farmers.length > 0) {
    const weatherData = [
      {
        farmerId: farmers[0].id,
        location: 'Eastern Region, Iganga',
        temperature: 28.5,
        humidity: 65,
        windSpeed: 12,
        conditions: 'Partly Cloudy',
        description: 'Ideal for rice growth',
        icon: 'partly-cloudy-day',
        timestamp: new Date()
      },
      {
        location: 'Central Region, Kampala',
        temperature: 26.0,
        humidity: 70,
        windSpeed: 8,
        conditions: 'Light Rain',
        description: 'Good for maize planting',
        icon: 'rain',
        timestamp: new Date()
      }
    ];

    for (const weather of weatherData) {
      await prisma.weather.create({
        data: weather
      });
    }
  }
  console.log('✅ Weather data seeded');
}

main()
  .catch((e) => {
    console.error('❌ Seeder error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });