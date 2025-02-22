const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const router = express.Router();

// Register a new user (Farmer or Customer)
router.post('/register', async (req, res) => {
  const { name, contact, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === 'farmer') {
      user = await prisma.farmer.create({
        data: {
          name,
          contact,
          password: hashedPassword,
          role,
        },
      });
    } else if (role === 'customer') {
      user = await prisma.customer.create({
        data: {
          name,
          contact,
          password: hashedPassword,
          role,
        },
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token });
  } catch (err) {
    res.status(400).send('Error creating user');
  }
});

// Login route for Farmer or Customer
router.post('/login', async (req, res) => {
  const { contact, password } = req.body;

  try {
    const user = await prisma.farmer.findUnique({
      where: { contact },
    }) || await prisma.customer.findUnique({
      where: { contact },
    });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(400).send('Error logging in');
  }
});

module.exports = router;
