// controllers/OrdersController.ts
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

const handleOrders = async (req, res) => {
try {
const session = await getServerSession(req, res, authOptions);


if (!session) {
  return res.status(401).json({ error: "Unauthorized" });
}

if (req.method === "GET") {
  const orders = await prisma.order.findMany({
    where: { soleTraderId: session.user.id },
    include: {
      store: {
        select: {
          name: true,
          location: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.status(200).json(orders);
}

if (req.method === "POST") {
  const { storeId, quantity, notes } = req.body;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  if (quantity > store.maxQuantity) {
    return res
      .status(400)
      .json({ error: `Quantity cannot exceed ${store.maxQuantity} kgs` });
  }

  const order = await prisma.order.create({
    data: {
      storeId,
      storeName: store.name,
      produce: store.produce,
      quantity,
      notes,
      status: "PENDING",
      soleTraderId: session.user.id,
    },
  });

  return res.status(201).json(order);
}

res.setHeader("Allow", ["GET", "POST"]);
return res.status(405).end(`Method ${req.method} Not Allowed`);


} catch (error) {
res.status(500).json({ message: "Failed to handle orders", error });
}
};

export { handleOrders };
