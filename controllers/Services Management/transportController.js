import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createTransporter = async (req, res) => {
  try {
    const { name, contact, vehicleDetails,status,Region} = req.body;
    const transporter = await prisma.transporter.create({
      data: { name, contact, vehicleDetails,status,Region },
    });
    res.json(transporter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTransporters = async (req, res) => {
  try {
    const transporters = await prisma.transporter.findMany();
    res.json(transporters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//get one transporter based on selected region and status, where his available or not
const getTransporter = async (req, res) => {
  try {
    // Get the transporter ID from the request body
    const { id } = req.body;

    // Fetch the transporter from the database using the ID
    const transporter = await prisma.transporter.findUnique({
      where: { id }, // equivalent to { id: id }
    });

    // If no transporter is found, return a 404 error
    if (!transporter) {
      return res.status(404).json({ error: "Transporter not found" });
    }

    // Send the found transporter as the response
    res.json(transporter);
  } catch (error) {
    // If something goes wrong, return a 500 with the error message
    res.status(500).json({ error: error.message });
  }
};




export { createTransporter, getTransporters ,getTransporter};