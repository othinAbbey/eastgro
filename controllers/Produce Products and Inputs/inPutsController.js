// Import dependencies
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createFarmInput = async (req, res) => {
    try {
      const inputData = req.body;
  
      // Handle bulk creation (array of inputs)
      if (Array.isArray(inputData)) {
        // Validate all items in the array
        const validationErrors = [];
        const validInputs = inputData.filter(input => {
          const { name, type, quantity, unit, price } = input;
          if (!name || !type || !quantity || !unit || price === undefined) {
            validationErrors.push({ 
              input, 
              error: "Missing required fields" 
            });
            return false;
          }
          return true;
        });
  
        if (validationErrors.length > 0) {
          return res.status(400).json({
            message: "Some inputs had validation errors",
            errors: validationErrors,
            validInputsCount: validInputs.length
          });
        }
  
        const createdInputs = await prisma.farmInput.createMany({
          data: validInputs.map(input => ({
            ...input,
            quantity: Number(input.quantity),
            price: Number(input.price)
          })),
          skipDuplicates: true
        });
  
        return res.status(201).json({
          message: "Bulk creation successful",
          createdCount: createdInputs.count,
          skippedCount: inputData.length - validInputs.length
        });
      }
  
      // Handle single input creation (object)
      const { name, type, quantity, unit, price } = inputData;
      
      // Validate single input
      if (!name || !type || !quantity || !unit || price === undefined) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["name", "type", "quantity", "unit", "price"]
        });
      }
  
      const farmInput = await prisma.farmInput.create({
        data: { 
          name, 
          type, 
          quantity: Number(quantity), 
          unit,
          price: Number(price)
        },
      });
  
      res.status(201).json(farmInput);
  
    } catch (error) {
      console.error("Creation error:", error);
      res.status(500).json({ 
        error: "Failed to create farm input(s)",
        details: error.message,
        meta: error.meta // Prisma-specific error details
      });
    }
  };
const getAllFarmInputs = async (req, res) => {
    try {
      const farmInputs = await prisma.farmInput.findMany();
      res.json(farmInputs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  const getFarmInputById = async (req, res) => {
    try {
      const { id } = req.params;
      const farmInput = await prisma.farmInput.findUnique({
        where: { id },
      });
      if (!farmInput) {
        return res.status(404).json({ error: "Farm input not found" });
      }
      res.json(farmInput);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  
  };
  const updateFarmInput = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, type, quantity, unit } = req.body;
      const farmInput = await prisma.farmInput.update({
        where: { id },
        data: { name, type, quantity, unit },
      });
      res.json(farmInput);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
const deleteFarmInput = async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.farmInput.delete({
        where: { id },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export default {
    createFarmInput,
    getAllFarmInputs,
    getFarmInputById,
    updateFarmInput,
    deleteFarmInput
  }