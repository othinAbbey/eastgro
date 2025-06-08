//this will 
//Automatically assign farmers to groups based on their crop type.
// Aggregate total quantity of crops in the grou
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Function to assign farmer to a group based on crop type
// const assignFarmerToGroup = async (req, res) => {
//   const { farmerId, cropType, region, quantity } = req.body;

//   try {
//     // Check if a group for this cropType and region already exists
//     let group = await prisma.group.findFirst({
//       where: { cropType, region },
//     });

//     // If group doesn't exist, create a new one
//     if (!group) {
//       group = await prisma.group.create({
//         data: {
//           farmerId,
//           cropType,
//           region,
//           totalQuantity: quantity,
//         },
//       });
//     } else {
//       // Update group's total quantity
//       await prisma.group.update({
//         where: { id: group.id },
//         data: {
//           totalQuantity: group.totalQuantity + quantity,
//         },
//       });
//     }

//     // Assign farmer to the group
//     await prisma.farmer.update({
//       where: { id: farmerId },
//       data: {
//         groupId: group.id,
//       },
//     });

//     res.json({ message: 'Farmer successfully assigned to group', group });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const assignFarmerToGroup = async (req, res) => {
  const { farmerId, cropType, region, quantity } = req.body;

  // Basic validation
  if (!farmerId || !cropType || !region || quantity === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: farmerId, cropType, region, quantity',
    });
  }

  if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({
      error: 'Quantity must be a valid number greater than 0',
    });
  }

  try {
    // Check if the farmer exists
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
    });

    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Check if a group already exists
    let group = await prisma.group.findFirst({
      where: { cropType, region },
    });

    if (!group) {
      // Create a new group
      group = await prisma.group.create({
        data: {
          cropType,
          region,
          farmerId,
          totalQuantity: quantity,
        },
      });
    } else {
      // Update group quantity
      group = await prisma.group.update({
        where: { id: group.id },
        data: {
          totalQuantity: group.totalQuantity + quantity,
        },
      });
    }

    // Assign farmer to group
    await prisma.farmer.update({
      where: { id: farmerId },
      data: { groupId: group.id },
    });

    res.json({ message: '✅ Farmer successfully assigned to group', group });
  } catch (error) {
    console.error('❌ Group assignment error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Farmer or group not found for update' });
    }

    res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
};

// Retrieve grouped farmers for bulk sales
const getGroupedFarmers = async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        farmers: true,
      },
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get farmers by crop type or region
const getFarmersByCriteria = async (req, res) => {
  try {
    const { cropType, region } = req.query;

    // Validate query parameters
    if (!cropType && !region) {
      return res.status(400).json({ error: "Please provide cropType or region as query parameters." });
    }

    // Build the query filter
    const where = {};
    if (cropType) where.type = cropType;
    if (region) where.region = region;

    // Fetch farmers based on the criteria
    const farmers = await prisma.farmer.findMany({
      where: {
        produce: {
          some: where, // Filter by crop type or region in the Produce model
        },
      },
      include: {
        produce: true, // Include the produce details
      },
    });

    // If no farmers are found, return a 404 error
    if (farmers.length === 0) {
      return res.status(404).json({ error: "No farmers found for the given criteria." });
    }

    res.json(farmers);
  } catch (error) {
    console.error("Error fetching farmers:", error); // Debugging: Log the error
    res.status(500).json({ error: error.message });
  }
};
//get groups where farmer belongs by farmer id
const getFarmerGroups = async (req, res) => {
  const farmerId = req.params.id;

  try {
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: { group: true }, // Include the group details
    });

    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found." });
    }

    res.json(farmer.group);
  } catch (error) {
    console.error("Error fetching farmer groups:", error); // Debugging: Log the error
    res.status(500).json({ error: error.message });
  }
};

export default { assignFarmerToGroup, getGroupedFarmers, getFarmersByCriteria,getFarmerGroups };
