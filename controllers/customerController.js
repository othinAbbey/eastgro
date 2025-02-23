import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const createCustomer = async (req, res) => {
  const { name, contact, password, purchaseHistory } = req.body;

  try {
    // Check if the customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { contact },
    });

    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this contact already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the customer record
    const customer = await prisma.customer.create({
      data: {
        name,
        contact,
        password: hashedPassword,
        purchaseHistory,
        role: 'customer',
      },
    });

    // Generate JWT for the newly created customer
    const token = jwt.sign({ id: customer.id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send token and customer data in the response
    res.status(201).json({
      message: 'Customer created successfully',
      token, // JWT token
      customer: { id: customer.id, name: customer.name, contact: customer.contact, purchaseHistory: customer.purchaseHistory },
    });
  } catch (err) {
    console.error('Error details:', err); // Log the full error for debugging
    res.status(500).send('Error creating customer');
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
    });

    if (!customer) {
      return res.status(404).send('Customer not found');
    }

    res.status(200).json(customer);
  } catch (err) {
    console.error('Error details:', err); // Log error for debugging
    res.status(500).send('Error fetching customer data');
  }
};

const updateCustomer = async (req, res) => {
  const { name, contact, purchaseHistory } = req.body;

  try {
    const updatedCustomer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, contact, purchaseHistory },
    });

    res.status(200).json({
      message: 'Customer updated successfully',
      updatedCustomer,
    });
  } catch (err) {
    console.error('Error details:', err); // Log error for debugging
    res.status(400).send('Error updating customer');
  }
};

export default { createCustomer, getCustomerById, updateCustomer };