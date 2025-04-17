import { PrismaClient } from '@prisma/client';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

// Ensure JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment variables");
}

router.post('/login', async (req, res) => {
  const { contact, password,role } = req.body;

  try {
    // Run both queries in parallel
    const [farmer, customer] = await Promise.all([
      prisma.farmer.findUnique({ where: { contact } }),
      prisma.customer.findUnique({ where: { contact } })
    ]);

    const user = farmer || customer;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Set the token as a cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 3600000, // 1 hour expiry
    });

    // Send response with user data
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        contact: user.contact,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Error logging in' });
  }
});

export default router;

