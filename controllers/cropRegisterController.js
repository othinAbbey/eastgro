// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// const registerCrop = async (req, res) => {
//   try {
//     const { farmerId, type, quantity, harvestDate, isBiofortified } = req.body;

//     if (!farmerId || !type || !quantity || !harvestDate) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const farmer = await prisma.farmer.findUnique({
//       where: { id: farmerId },
//     });

//     if (!farmer) {
//       return res.status(404).json({ error: 'Farmer not found' });
//     }

//     const produce = await prisma.produce.create({
//       data: {
//         farmerId,
//         type,
//         quantity: parseInt(quantity),
//         harvestDate: new Date(harvestDate),
//         isBiofortified: isBiofortified || false,
//         status: 'HARVESTED',
//       },
//     });

//     res.status(201).json({ message: 'Crop registered successfully', produce });
//   } catch (error) {
//     console.error('Error registering crop:', error);
//     res.status(500).json({ error: 'Internal Server Error', message: error.message });
//   }
// };

// const getAllCrops = async (req, res) => {
//   try {
//     const crops = await prisma.produce.findMany();
//     res.status(200).json(crops);
//   } catch (error) {
//     console.error('Error fetching crops:', error);
//     res.status(500).json({ error: 'Internal Server Error', message: error.message });
//   }
// };

// const getCropById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const crop = await prisma.produce.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!crop) {
//       return res.status(404).json({ error: 'Crop not found' });
//     }

//     res.status(200).json(crop);
//   } catch (error) {
//     console.error('Error fetching crop:', error);
//     res.status(500).json({ error: 'Internal Server Error', message: error.message });
//   }
// };

// const updateCrop = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { type, quantity, harvestDate, isBiofortified } = req.body;

//     const crop = await prisma.produce.update({
//       where: { id: parseInt(id) },
//       data: {
//         type,
//         quantity: parseInt(quantity),
//         harvestDate: new Date(harvestDate),
//         isBiofortified: isBiofortified || false,
//       },
//     });

//     res.status(200).json({ message: 'Crop updated successfully', crop });
//   } catch (error) {
//     console.error('Error updating crop:', error);
//     res.status(500).json({ error: 'Internal Server Error', message: error.message });
//   }
// };

// const deleteCrop = async (req, res) => {
//   try {
//     const { id } = req.params;

//     await prisma.produce.delete({
//       where: { id: parseInt(id) },
//     });

//     res.status(200).json({ message: 'Crop deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting crop:', error);
//     res.status(500).json({ error: 'Internal Server Error', message: error.message });
//   }
// };

// export { registerCrop, getAllCrops, getCropById, updateCrop, deleteCrop };


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Register a crop (produce) with optional farmerId
const registerCrop = async (req, res) => {
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

    // Create the crop (produce) record in the database
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

    res.status(201).json({ message: 'Crop registered successfully', produce });
  } catch (error) {
    console.error('Error registering crop:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Fetch all crops (produce)
const getAllCrops = async (req, res) => {
  try {
    const crops = await prisma.produce.findMany();
    res.status(200).json(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Fetch a specific crop by ID
// Note: The ID is an integer by default in Prisma
// If you are using UUIDs, you can update the code to use UUIDs instead
//using UUIDs 
const getCropById = async (req, res) => {
  const { id } = req.params; // Get the ID from the URL
  console.log(`ID Received: ${id}`); // Debug log

  try {
    const crop = await prisma.produce.findUnique({
      where: {
        id: id, // UUID is a string by default in Prisma
      },
    });

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    res.json(crop);
  } catch (error) {
    console.error('Error fetching crop:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Update an existing crop
const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, harvestDate, isBiofortified } = req.body;

    // Ensure required fields are provided
    if (!type || !quantity || !harvestDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update the crop in the database
    const crop = await prisma.produce.update({
      where: { id: id },
      data: {
        type,
        quantity: parseInt(quantity),
        harvestDate: new Date(harvestDate),
        isBiofortified: isBiofortified || false,
      },
    });

    res.status(200).json({ message: 'Crop updated successfully', crop });
  } catch (error) {
    console.error('Error updating crop:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Delete a crop by ID
const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the crop from the database
    await prisma.produce.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Crop deleted successfully' });
  } catch (error) {
    console.error('Error deleting crop:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export { registerCrop, getAllCrops, getCropById, updateCrop, deleteCrop };
