const prisma = require('../utils/prismaClient');

// Register a new farmer
const registerFarmer = async (req, res) => {
  const { name, email, phone, farm_location, farm_type } = req.body;
  try {
    const farmer = await prisma.farmer.create({
      data: { name, email, phone, farm_location, farm_type },
    });
    res.status(201).json({ message: 'Farmer registered successfully!', farmer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all farmers
const getAllFarmers = async (req, res) => {
  try {
    const farmers = await prisma.farmer.findMany();
    res.status(200).json(farmers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerFarmer, getAllFarmers };