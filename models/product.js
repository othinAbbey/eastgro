// models/product.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Product = {
  getAllProducts: async () => {
    return await prisma.product.findMany();
  },
  createProduct: async (product) => {
    const { name, category, price, farmerId } = product;
    return await prisma.product.create({
      data: { name, category, price, farmerId },
    });
  },
};

module.exports = Product;
