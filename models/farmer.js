// models/farmer.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Farmer = {
  getAllFarmers: async () => {
    return await prisma.farmer.findMany();
  },
  getFarmerById: async (id) => {
    return await prisma.farmer.findUnique({
      where: { id: Number(id) },
      include: { products: true }, // Include related products if needed
    });
  },
  createFarmer: async (farmer) => {
    const { name, farmLocation, contact } = farmer;
    return await prisma.farmer.create({
      data: { name, farmLocation, contact },
    });
  },
};

module.exports = Farmer;
