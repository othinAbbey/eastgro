// const prisma = require('../utils/prismaClient');

// // Register a new farmer
// const registerFarmer = async (req, res) => {
//   const { name, email, phone, farm_location, farm_type } = req.body;
//   try {
//     const farmer = await prisma.farmer.create({
//       data: { name, email, phone, farm_location, farm_type },
//     });
//     res.status(201).json({ message: 'Farmer registered successfully!', farmer });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Get all farmers
// const getAllFarmers = async (req, res) => {
//   try {
//     const farmers = await prisma.farmer.findMany();
//     res.status(200).json(farmers);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = { registerFarmer, getAllFarmers };

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// const createFarmer = async (req, res) => {
//   try {
//     const { name, contact, location, farmDetails } = req.body;
//     const farmer = await prisma.farmer.create({
//       data: { name, contact, location, farmDetails },
//     });
//     res.json(farmer);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const getFarmers = async (req, res) => {
//   try {
//     const farmers = await prisma.farmer.findMany();
//     res.json(farmers);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export { createFarmer, getFarmers };

const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createFarmer = async (req, res) => {
  const { name, contact, password, farmDetails } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const farmer = await prisma.farmer.create({
      data: {
        name,
        contact,
        password: hashedPassword,
        farmDetails,
        role: 'farmer',
      },
    });
    
    const token = jwt.sign({ id: farmer.id, role: 'farmer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).send('Error creating farmer');
  }
};

const getFarmerById = async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: { id: req.params.id },
    });
    
    if (!farmer) return res.status(404).send('Farmer not found');
    
    res.status(200).json(farmer);
  } catch (err) {
    res.status(500).send('Error fetching farmer data');
  }
};

const updateFarmer = async (req, res) => {
  const { name, contact, farmDetails } = req.body;

  try {
    const updatedFarmer = await prisma.farmer.update({
      where: { id: req.params.id },
      data: { name, contact, farmDetails },
    });

    res.status(200).json(updatedFarmer);
  } catch (err) {
    res.status(400).send('Error updating farmer');
  }
};
export { createFarmer, getFarmerById, updateFarmer };