
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Register a produce (produce) with optional farmerId
const registerproduce = async (req, res) => {
  try {
    const { farmerId, type, quantity, harvestDate, isBiofortified } = req.body;

    // Ensure required fields are provided
    if (!type || !quantity || !harvestDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If a farmerId is provided, check if the farmer exists
    if (farmerId) {
      const farmer = await prisma.farmer.findUnique({
        where: { id: farmerId },
      });

      if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
      }
    }

    // Create the produce (produce) record in the database
    const produce = await prisma.produce.create({
      data: {
        farmerId: farmerId || null,  // Optional farmerId (null if not provided)
        type,
        quantity: parseInt(quantity),  // Ensure quantity is an integer
        harvestDate: new Date(harvestDate),  // Ensure the date is correctly formatted
        isBiofortified: isBiofortified || false,
        status: 'HARVESTED',
      },
    });

    res.status(201).json({ message: 'produce registered successfully', produce });
  } catch (error) {
    console.error('Error registering produce:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Fetch all produces (produce)
const getAllproduces = async (req, res) => {
  try {
    const produces = await prisma.produce.findMany();
    res.status(200).json(produces);
  } catch (error) {
    console.error('Error fetching produces:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Fetch a specific produce by ID
// Note: The ID is an integer by default in Prisma
// If you are using UUIDs, you can update the code to use UUIDs instead
//using UUIDs 
const getproduceById = async (req, res) => {
  const { id } = req.params; // Get the ID from the URL
  console.log(`ID Received: ${id}`); // Debug log

  try {
    const produce = await prisma.produce.findUnique({
      where: {
        id: id, // UUID is a string by default in Prisma
      },
    });

    if (!produce) {
      return res.status(404).json({ message: 'produce not found' });
    }

    res.json(produce);
  } catch (error) {
    console.error('Error fetching produce:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Update an existing produce
const updateproduce = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, harvestDate, isBiofortified } = req.body;

    // Ensure required fields are provided
    if (!type || !quantity || !harvestDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update the produce in the database
    const produce = await prisma.produce.update({
      where: { id: id },
      data: {
        type,
        quantity: parseInt(quantity),
        harvestDate: new Date(harvestDate),
        isBiofortified: isBiofortified || false,
      },
    });

    res.status(200).json({ message: 'produce updated successfully', produce });
  } catch (error) {
    console.error('Error updating produce:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Delete a produce by ID
const deleteproduce = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the produce from the database
    await prisma.produce.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'produce deleted successfully' });
  } catch (error) {
    console.error('Error deleting produce:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export { registerproduce, getAllproduces, getproduceById, updateproduce, deleteproduce };
