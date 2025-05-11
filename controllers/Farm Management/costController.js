// controllers/CostController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const addCustomCost = async (req, res)=> {
    try {
      const { farmPlanId, category, label, amount } = req.body;

      const cost = await prisma.investmentCost.create({
        data: {
          farmPlanId,
          stage: category,
          label,
          amount,
        },
      });

      res.status(201).json(cost);
    } catch (err) {
      res.status(500).json({ message: 'Failed to add cost', error: err });
    }
  }

export {
    addCustomCost,
  };
