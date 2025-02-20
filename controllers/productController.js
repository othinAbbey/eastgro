const prisma = require('../utils/prismaClient');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  const { name, description, price, category } = req.body;
  try {
    const product = await prisma.product.create({
      data: { name, description, price, category },
    });
    res.status(201).json({ message: 'Product added successfully!', product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAllProducts, addProduct };