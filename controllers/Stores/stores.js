// controllers/StoresController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Get all active stores
 */
const getStores = async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        produce: true,
        maxQuantity: true,
        timeframe: true,
        location: true,
        contact: true,
      },
    });
    res.status(200).json(stores);
  } catch (err) {
    console.error("❌ Failed to fetch stores:", err);
    res.status(500).json({ message: "Failed to fetch stores", error: err });
  }
};

/**
 * Create a new store
 */
const createStore = async (req, res) => {
  try {
    const { name, produce, maxQuantity, timeframe, location, contact } = req.body;

    if (!name || !produce || !maxQuantity || !timeframe || !location || !contact) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const store = await prisma.store.create({
      data: {
        name,
        produce,
        maxQuantity,
        timeframe,
        location,
        contact,
        status: 'ACTIVE',
      },
    });

    res.status(201).json(store);
  } catch (err) {
    console.error("❌ Failed to create store:", err);
    res.status(500).json({ message: "Failed to create store", error: err });
  }
};

export {
  getStores,
  createStore,
};
