// // pages/api/special-offers.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import { prisma } from "../../../lib/prisma";

// export default async function handler(req, res) {
// if (req.method !== "GET") {
// res.setHeader("Allow", ["GET"]);
// return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// try {
// const specialOffers = await prisma.offer.findMany({
// select: {
// id: true,
// storeName: true,
// offer: true,
// icon: true,
// createdAt: true, // optional if you want to show when the offer was added
// },
// orderBy: {
// createdAt: "desc", // newest offers first
// },
// });


// return res.status(200).json(specialOffers);


// } catch (error) {
// console.error("Error fetching offers:", error);
// return res.status(500).json({ error: "Failed to fetch special offers" });
// }
// }

import pool from '../database.js';

const getSpecialOffers = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const offersResult = await pool.query(
      `SELECT id, store_name, offer, icon, created_at
       FROM offers 
       ORDER BY created_at DESC`
    );

    return res.status(200).json(offersResult.rows);

  } catch (error) {
    console.error("Error fetching offers:", error);
    return res.status(500).json({ 
      error: "Failed to fetch special offers",
      details: error.message 
    });
  }
};

export default getSpecialOffers;