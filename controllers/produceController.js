// const prisma = require('../utils/prismaClient');

// // Get all products
// const getAllProducts = async (req, res) => {
//   try {
//     const products = await prisma.product.findMany();
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Add a new product
// const addProduct = async (req, res) => {
//   const { name, description, price, category } = req.body;
//   try {
//     const product = await prisma.product.create({
//       data: { name, description, price, category },
//     });
//     res.status(201).json({ message: 'Product added successfully!', product });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// module.exports = { getAllProducts, addProduct };

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createProduce = async (req, res) => {
  try {
    const { farmerId, type, quantity, harvestDate, qualityReport } = req.body;
    const produce = await prisma.produce.create({
      data: { farmerId, type, quantity, harvestDate: new Date(harvestDate), qualityReport },
    });
    res.json(produce);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProduce = async (req, res) => {
  try {
    const produce = await prisma.produce.findMany({ include: { farmer: true } });
    res.json(produce);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a list of the ids and name of the produce from the produce tabel,
//This is used to populate the dropdown list in the frontend
const getProduceList = async (req, res) => {
  try {
    const produce = await prisma.produce.findMany({
      select: {
        id: true,
        type: true,
      },
    });
    res.json(produce);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export { createProduce, getProduce, getProduceList };