// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// import express from 'express';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

// const router = express.Router();

// // Login route for Farmer or Customer
// router.post('/login', async (req, res) => {
//   const { contact, password } = req.body;

//   try {
//     const user = await prisma.farmer.findUnique({
//       where: { contact },
//     }) || await prisma.customer.findUnique({
//       where: { contact },
//     });

//     if (!user) {
//       return res.status(404).send('User not found');
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).send('Invalid password');
//     }

//     const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });

//     res.status(200).json({ token });
//     //send user data as response
//   } catch (err) {
//     res.status(400).send('Error logging in');
//   }
// });
// export default router;

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Login route for Farmer or Customer
router.post('/login', async (req, res) => {
  const { contact, password } = req.body;

  try {
    // Try to find the user from Farmer or Customer table based on the contact
    const user = await prisma.farmer.findUnique({
      where: { contact },
    }) || await prisma.customer.findUnique({
      where: { contact },
    });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Compare the hashed password with the provided one
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid password');
    }

    // Generate a token with user ID and role
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Send the token and user data as a response
    // res.status(200).json({
    //   token,
    //   user: {
    //     id: user.id,
    //     contact: user.contact,
    //     role: user.role, // This assumes the role is stored in the user model
    //     // Add any other user-specific information you want to send
    //   },
    // });

    res.cookie('token', token, {
      httpOnly: true, // Prevent access to cookie from JavaScript
      secure: process.env.NODE_ENV === 'production', // Only set cookie over HTTPS in production
      sameSite: 'Strict', // Mitigates CSRF attacks
      maxAge: 3600000, // 1 hour expiry (matches JWT expiry)
    });

  } catch (err) {
    res.status(400).send('Error logging in');
  }
});

export default router;
