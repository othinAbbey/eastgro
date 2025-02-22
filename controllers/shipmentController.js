import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createShipment = async (req, res) => {
  try {
    const { transporterId, facilityId, status, departureTime, arrivalTime } = req.body;
    const shipment = await prisma.shipment.create({
      data: { transporterId, facilityId, status, departureTime: new Date(departureTime), arrivalTime: new Date(arrivalTime) },
    });
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getShipments = async (req, res) => {
  try {
    const shipments = await prisma.shipment.findMany();
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createShipment, getShipments };