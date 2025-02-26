import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createTransporter = async (req, res) => {
  try {
    const { name, contact, vehicleDetails } = req.body;
    const transporter = await prisma.transporter.create({
      data: { name, contact, vehicleDetails },
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
const getTransporter = async(req, res) => {
try {
  const transporter = await prisma.transporter.findUnique();
  res.json(transporter)
} catch(error){
  res.status(500).json({error: error.message})
}
}

export { createTransporter, getTransporters ,getTransporter};