import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createFacility = async (req, res) => {
  try {
    const { name, location, processingCapacity } = req.body;
    const facility = await prisma.facility.create({
      data: { name, location, processingCapacity },
    });
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFacilities = async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany();
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};