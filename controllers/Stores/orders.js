// // controllers/OrdersController.ts
// import { PrismaClient } from "@prisma/client";
// import { getServerSession } from "next-auth";

// const prisma = new PrismaClient();

// const handleOrders = async (req, res) => {
// try {
// const session = await getServerSession(req, res, authOptions);


// if (!session) {
//   return res.status(401).json({ error: "Unauthorized" });
// }

// if (req.method === "GET") {
//   const orders = await prisma.order.findMany({
//     where: { soleTraderId: session.user.id },
//     include: {
//       store: {
//         select: {
//           name: true,
//           location: true,
//         },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });
//   return res.status(200).json(orders);
// }

// if (req.method === "POST") {
//   const { storeId, quantity, notes } = req.body;

//   const store = await prisma.store.findUnique({
//     where: { id: storeId },
//   });

//   if (!store) {
//     return res.status(404).json({ error: "Store not found" });
//   }

//   if (quantity > store.maxQuantity) {
//     return res
//       .status(400)
//       .json({ error: `Quantity cannot exceed ${store.maxQuantity} kgs` });
//   }

//   const order = await prisma.order.create({
//     data: {
//       storeId,
//       storeName: store.name,
//       produce: store.produce,
//       quantity,
//       notes,
//       status: "PENDING",
//       soleTraderId: session.user.id,
//     },
//   });

//   return res.status(201).json(order);
// }

// res.setHeader("Allow", ["GET", "POST"]);
// return res.status(405).end(`Method ${req.method} Not Allowed`);


// } catch (error) {
// res.status(500).json({ message: "Failed to handle orders", error });
// }
// };

// export { handleOrders };

import pool from '../database.js';

const handleOrders = async (req, res) => {
  try {
    // For now, we'll use a simple farmer ID - you can replace with your session logic
    const farmerId = req.user?.id || 1; // Replace with actual session user ID

    if (req.method === "GET") {
      const ordersResult = await pool.query(
        `SELECT o.*, s.name as store_name, s.location as store_location
         FROM orders o
         LEFT JOIN stores s ON o.store_id = s.id
         WHERE o.farmer_id = $1
         ORDER BY o.created_at DESC`,
        [farmerId]
      );

      return res.status(200).json(ordersResult.rows);
    }

    if (req.method === "POST") {
      const { storeId, quantity, notes } = req.body;

      // Check if store exists
      const storeResult = await pool.query(
        'SELECT * FROM stores WHERE id = $1',
        [storeId]
      );

      if (storeResult.rows.length === 0) {
        return res.status(404).json({ error: "Store not found" });
      }

      const store = storeResult.rows[0];

      if (quantity > store.max_quantity) {
        return res.status(400).json({ 
          error: `Quantity cannot exceed ${store.max_quantity} kgs` 
        });
      }

      // Create order
      const orderResult = await pool.query(
        `INSERT INTO orders 
         (store_id, store_name, produce, quantity, notes, status, farmer_id) 
         VALUES ($1, $2, $3, $4, $5, 'PENDING', $6) 
         RETURNING *`,
        [storeId, store.name, store.produce, quantity, notes, farmerId]
      );

      return res.status(201).json(orderResult.rows[0]);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error) {
    console.error('Error handling orders:', error);
    res.status(500).json({ 
      message: "Failed to handle orders", 
      error: error.message 
    });
  }
};

export { handleOrders };