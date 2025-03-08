import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {registerCrop} from '../controllers/cropRegisterController.js'; // Import the registerproduce function

// const createFarmer = async (req, res) => {
//   const { name, contact, password, farmDetails, location, produces } = req.body; // produces will be an array of produce names

//   try {
//     // Check if the farmer already exists
//     const existingFarmer = await prisma.farmer.findUnique({
//       where: { contact },
//     });

//     if (existingFarmer) {
//       return res.status(400).json({ message: 'Farmer with this contact already exists' });
//     }

//     // Hash the password before saving
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the farmer record
//     const farmer = await prisma.farmer.create({
//       data: {
//         name,
//         contact,
//         password: hashedPassword,
//         farmDetails,
//         role: 'farmer',
//         location,
//       },
//     });

//     // Process the produces selected by the farmer using the registerproduce function
//     let farmerproduces = [];
//     for (let produceName of produces) {
//       // Use the registerproduce function to either create or get the produce
//       const produce = await registerproduce(produceName);

//       // Add the produce to the farmer's produces
//       farmerproduces.push({ id: produce.id });
//     }

//     // Link the produces to the farmer (Many-to-many relationship)
//     await prisma.farmer.update({
//       where: { id: farmer.id },
//       data: {
//         produces: {
//           connect: farmerproduces, // Connecting the existing or newly created produces
//         },
//       },
//     });

//     // Generate JWT for the newly created farmer
//     const token = jwt.sign({ id: farmer.id, role: 'farmer' }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     // Send token and farmer data in the response
//     res.status(201).json({
//       message: 'Farmer created successfully',
//       token, // JWT token
//       farmer: {
//         id: farmer.id,
//         name: farmer.name,
//         contact: farmer.contact,
//         farmDetails: farmer.farmDetails,
//         location: farmer.location,
//         produces, // Include produces in the response
//       },
//     });
//   } catch (err) {
//     console.error('Error details:', err); // Log the full error for debugging
//     res.status(500).send('Error creating farmer');
//   }
// };
const createFarmer = async (req, res) => {
  const { name, contact, password, farmDetails, location, produce } = req.body;

  // Ensure produces is an array, default to empty array if missing or invalid
  const farmerProduce = Array.isArray(produce) ? produce : [];

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

    // Process the produces selected by the farmer using the registerproduce function
    let producesToConnect = [];
    for (let produce of farmerProduce) {
      try {
        // Use the registerproduce utility function to create the produce
        const newproduce = await registerCrop({
          farmerId: farmer.id, // Link the produce to the newly created farmer
          type: produce.type,
          quantity: produce.quantity || 0, // Default quantity (you can modify this as needed)
          harvestDate: produce.harvestDate || new Date().toISOString(), // Default to current date
          isBiofortified: produce.isBiofortified || false, // Default to false
          status: produce.status || 'HARVESTED', // Default to 'HARVESTED'
        });

        // Add the produce to the farmer's produces
        producesToConnect.push({ id: newproduce.id });
      } catch (err) {
        console.error(`Error processing produce ${produce.type}:`, err);
        // Continue processing other produces even if one fails
      }
    }

    // Link the produces to the farmer (Many-to-many relationship)
    await prisma.farmer.update({
      where: { id: farmer.id },
      data: {
        produce: {
          connect: producesToConnect, // Connecting the existing or newly created produces
        },
      },
    });

    // Generate JWT for the newly created farmer
    const token = jwt.sign({ id: farmer.id, role: 'farmer' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send token and farmer data in the response
    res.status(201).json({
      message: 'Farmer created successfully',
      token, // JWT token
      farmer: {
        id: farmer.id,
        name: farmer.name,
        contact: farmer.contact,
        farmDetails: farmer.farmDetails,
        location: farmer.location,
        produce: farmerProduce, // Include produces in the response
      },
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
      include: { produce: true }, // Include produces associated with the farmer
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
  const { name, contact, farmDetails, location, produce } = req.body;

  try {
    // Update the farmer's details
    const updatedFarmer = await prisma.farmer.update({
      where: { id: req.params.id },
      data: { name, contact, farmDetails, location },
    });

    // Update the farmer's produces
    let farmerproduces = [];
    for (let produceName of produce) {
      // Use the registerproduce function to either create or get the produce
      const produce = await registerproduce(produceName);

      // Connect the produce to the farmer
      farmerproduces.push({ id: produce.id });
    }

    // Link the produces to the farmer (Many-to-many relationship)
    await prisma.farmer.update({
      where: { id: updatedFarmer.id },
      data: {
        produce: {
          set: farmerproduces, // Set the new list of crops for the farmer
        },
      },
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
