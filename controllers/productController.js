// controllers/productController.js
const Product = require('../models/product');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching products' });
  }
};

const createProduct = async (req, res) => {
  const { name, category, price } = req.body;
  try {
    const newProduct = await Product.createProduct({ name, category, price });
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Error creating product' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
};
