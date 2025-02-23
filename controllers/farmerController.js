import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const createFarmer = async (req, res) => {
  const { name, contact, password, farmDetails, location } = req.body;
  
  try {
    // Check if the farmer already exists
    const existingFarmer = await prisma.farmer.findUnique({
      where: { contact },
    });
    
    if (existingFarmer) {
      return res.status(400).json({ message: 'Farmer with this contact already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the farmer record
    const farmer = await prisma.farmer.create({
      data: {
        name,
        contact,
        password: hashedPassword,
        farmDetails,
        role: 'farmer',
        location,
      },
    });
    
    // Generate JWT for the newly created farmer
    const token = jwt.sign({ id: farmer.id, role: 'farmer' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send token and farmer data in the response
    res.status(201).json({
      message: 'Farmer created successfully',
      token, // JWT token
      farmer: { id: farmer.id, name: farmer.name, contact: farmer.contact, farmDetails: farmer.farmDetails, location: farmer.location }
    });
  } catch (err) {
    console.error('Error details:', err); // Log the full error for debugging
    res.status(500).send('Error creating farmer');
  }
};

const getFarmerById = async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: { id: req.params.id },
    });

    if (!farmer) {
      return res.status(404).send('Farmer not found');
    }

    res.status(200).json(farmer);
  } catch (err) {
    console.error('Error details:', err); // Log error for debugging
    res.status(500).send('Error fetching farmer data');
  }
};

const updateFarmer = async (req, res) => {
  const { name, contact, farmDetails, location } = req.body;

  try {
    const updatedFarmer = await prisma.farmer.update({
      where: { id: req.params.id },
      data: { name, contact, farmDetails, location },
    });

    res.status(200).json({
      message: 'Farmer updated successfully',
      updatedFarmer,
    });
  } catch (err) {
    console.error('Error details:', err); // Log error for debugging
    res.status(400).send('Error updating farmer');
  }
};

export default { createFarmer, getFarmerById, updateFarmer };
