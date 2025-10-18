// // controllers/DashboardStatsController.ts
// import { PrismaClient } from "@prisma/client";
// import { getServerSession } from "next-auth";

// const prisma = new PrismaClient();

// const getDashboardStats = async (req, res) => {
// try {
// const session = await getServerSession(req, res, authOptions);


// if (!session) {
//   return res.status(401).json({ error: "Unauthorized" });
// }

// if (req.method !== "GET") {
//   res.setHeader("Allow", ["GET"]);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// const [currentOrders, previousOrders, totalStores, totalQuantity] =
//   await Promise.all([
//     prisma.order.count({
//       where: {
//         soleTraderId: session.user.id,
//         status: { in: ["PENDING", "PROCESSING"] },
//       },
//     }),
//     prisma.order.count({
//       where: {
//         soleTraderId: session.user.id,
//         status: "COMPLETED",
//       },
//     }),
//     prisma.store.count({
//       where: { status: "ACTIVE" },
//     }),
//     prisma.order.aggregate({
//       where: { soleTraderId: session.user.id },
//       _sum: { quantity: true },
//     }),
//   ]);

// res.status(200).json({
//   currentOrders,
//   previousOrders,
//   totalStores,
//   totalQuantity: totalQuantity._sum.quantity || 0,
// });

// } catch (error) {
// res.status(500).json({
// message: "Failed to fetch dashboard stats",
// error,
// });
// }
// };

// export { getDashboardStats };
import pool from '../database.js';

const getDashboardStats = async (req, res) => {
  try {
    // For now, we'll use a simple farmer ID - you can replace with your session logic
    const farmerId = req.user?.id || 1; // Replace with actual session user ID

    const [
      currentOrdersResult,
      previousOrdersResult,
      totalStoresResult,
      totalQuantityResult
    ] = await Promise.all([
      // Current orders (assuming orders table exists)
      pool.query(
        `SELECT COUNT(*) FROM orders 
         WHERE farmer_id = $1 AND status IN ('PENDING', 'PROCESSING')`,
        [farmerId]
      ),
      // Previous orders
      pool.query(
        `SELECT COUNT(*) FROM orders 
         WHERE farmer_id = $1 AND status = 'COMPLETED'`,
        [farmerId]
      ),
      // Total stores (assuming stores table exists)
      pool.query(
        `SELECT COUNT(*) FROM stores WHERE status = 'ACTIVE'`
      ),
      // Total quantity
      pool.query(
        `SELECT COALESCE(SUM(quantity), 0) as total_quantity 
         FROM orders WHERE farmer_id = $1`,
        [farmerId]
      )
    ]);

    const stats = {
      currentOrders: parseInt(currentOrdersResult.rows[0].count),
      previousOrders: parseInt(previousOrdersResult.rows[0].count),
      totalStores: parseInt(totalStoresResult.rows[0].count),
      totalQuantity: parseFloat(totalQuantityResult.rows[0].total_quantity)
    };

    res.status(200).json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message
    });
  }
};

export { getDashboardStats };