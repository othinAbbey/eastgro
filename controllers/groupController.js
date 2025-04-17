//this will 
//Automatically assign farmers to groups based on their crop type.
// Aggregate total quantity of crops in the grou
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Function to assign farmer to a group based on crop type
const assignFarmerToGroup = async (req, res) => {
  const { farmerId, cropType, region, quantity } = req.body;

  try {
    // Check if a group for this cropType and region already exists
    let group = await prisma.group.findFirst({
      where: { cropType, region },
    });

    // If group doesn't exist, create a new one
    if (!group) {
      group = await prisma.group.create({
        data: {
          cropType,
          region,
          totalQuantity: quantity,
        },
      });
    } else {
      // Update group's total quantity
      await prisma.group.update({
        where: { id: group.id },
        data: {
          totalQuantity: group.totalQuantity + quantity,
        },
      });
    }

    // Assign farmer to the group
    await prisma.farmer.update({
      where: { id: farmerId },
      data: {
        groupId: group.id,
      },
    });

    res.json({ message: 'Farmer successfully assigned to group', group });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

export default { assignFarmerToGroup, getGroupedFarmers, getFarmersByCriteria };
