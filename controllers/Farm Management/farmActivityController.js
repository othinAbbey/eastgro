// controllers/FarmActivityController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const addActivity = async (req, res) => {
  try {
    const { farmPlanId, title, description, scheduledDate } = req.body;
    const activity = await prisma.farmActivity.create({
      data: {
        title,
        description,
        scheduledDate,
        farmPlan: { connect: { id: farmPlanId } },
      },
    });
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: "Failed to add activity", error: err });
  }
};

const getActivities = async (req, res) => {
  try {
    const { farmPlanId } = req.params;
    const activities = await farmActivity.findMany({
      where: { farmPlanId },
    });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activities", error: err });
  }
};

export {
  addActivity,
  getActivities,
};
