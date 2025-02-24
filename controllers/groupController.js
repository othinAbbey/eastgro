//this will 
//Automatically assign farmers to groups based on their crop type.
// Aggregate total quantity of crops in the grou
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Function to assign farmer to a group based on crop type
const assignFarmerToGroup = async (req, res) => {
  const { farmerId, cropType, quantity } = req.body;

  try {
    // Check if a group for this cropType already exists
    let group = await prisma.group.findFirst({
      where: { cropType },
    });

    // If group doesn't exist, create a new one
    if (!group) {
      group = await prisma.group.create({
        data: {
          cropType,
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

export { assignFarmerToGroup, getGroupedFarmers };
