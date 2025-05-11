// controllers/FarmRecordController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const addRecord =async (req, res)=>{
    try {
      const { farmPlanId, type, note, image } = req.body;

      const record = await prisma.farmRecord.create({
        data: {
          type,
          note,
          image,
          farmPlan: { connect: { id: farmPlanId } },
        },
      });

      res.status(201).json(record);
    } catch (err) {
      res.status(500).json({ message: 'Failed to add farm record', error: err });
    }
  }

const getRecords =async(req, res)=> {
    try {
      const { farmPlanId } = req.params;
      const records = await farmRecord.findMany({
        where: { farmPlanId },
        orderBy: { createdAt: 'desc' },
      });
      res.json(records);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch records', error: err });
    }
  }


export {
    addRecord,
    getRecords,
}
