// controllers/farmerController.js
const Farmer = require('../models/farmer');

const getAllFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.getAllFarmers();
    res.status(200).json(farmers);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching farmers' });
  }
};

const getFarmerById = async (req, res) => {
  const { id } = req.params;
  try {
    const farmer = await Farmer.getFarmerById(id);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    res.status(200).json(farmer);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching farmer' });
  }
};

const createFarmer = async (req, res) => {
  const { name, farmLocation, contact } = req.body;
  try {
    const newFarmer = await Farmer.createFarmer({ name, farmLocation, contact });
    res.status(201).json(newFarmer);
  } catch (err) {
    res.status(500).json({ error: 'Error creating farmer' });
  }
};

module.exports = {
  getAllFarmers,
  getFarmerById,
  createFarmer,
};
