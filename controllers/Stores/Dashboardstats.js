// controllers/DashboardStatsController.ts
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
try {
const session = await getServerSession(req, res, authOptions);


if (!session) {
  return res.status(401).json({ error: "Unauthorized" });
}

if (req.method !== "GET") {
  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

const [currentOrders, previousOrders, totalStores, totalQuantity] =
  await Promise.all([
    prisma.order.count({
      where: {
        soleTraderId: session.user.id,
        status: { in: ["PENDING", "PROCESSING"] },
      },
    }),
    prisma.order.count({
      where: {
        soleTraderId: session.user.id,
        status: "COMPLETED",
      },
    }),
    prisma.store.count({
      where: { status: "ACTIVE" },
    }),
    prisma.order.aggregate({
      where: { soleTraderId: session.user.id },
      _sum: { quantity: true },
    }),
  ]);

res.status(200).json({
  currentOrders,
  previousOrders,
  totalStores,
  totalQuantity: totalQuantity._sum.quantity || 0,
});

} catch (error) {
res.status(500).json({
message: "Failed to fetch dashboard stats",
error,
});
}
};

export { getDashboardStats };
