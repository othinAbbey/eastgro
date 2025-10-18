// import dotenv from 'dotenv';
// dotenv.config();
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

// const createCustomer = async (req, res) => {
//   const { name, contact, password, purchaseHistory } = req.body;

//   try {
//     // Check if the customer already exists
//     const existingCustomer = await prisma.customer.findUnique({
//       where: { contact },
//     });

//     if (existingCustomer) {
//       return res.status(400).json({ message: 'Customer with this contact already exists' });
//     }

//     // Hash the password before saving
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the customer record
//     const customer = await prisma.customer.create({
//       data: {
//         name,
//         contact,
//         password: hashedPassword,
//         purchaseHistory,
//         role: 'customer',
//       },
//     });

//     // Generate JWT for the newly created customer
//     const token = jwt.sign({ id: customer.id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     // Send token and customer data in the response
//     res.status(201).json({
//       message: 'Customer created successfully',
//       token, // JWT token
//       customer: { id: customer.id, name: customer.name, contact: customer.contact, purchaseHistory: customer.purchaseHistory },
//     });
//   } catch (err) {
//     console.error('Error details:', err); // Log the full error for debugging
//     res.status(500).send('Error creating customer');
//   }
// };

// const getCustomerById = async (req, res) => {
//   const id = req.params.id;
//   try {
//     const customer = await prisma.customer.findUnique({
//       where: { id:id },
//     });

//     if (!customer) {
//       return res.status(404).send('Customer not found');
//     }

//     res.status(200).json(customer);
//   } catch (err) {
//     console.error('Error details:', err); // Log error for debugging
//     res.status(500).send('Error fetching customer data');
//   }
// };

// const updateCustomer = async (req, res) => {
//   const id = req.params.id;
//   const { name, contact, purchaseHistory } = req.body;

//   try {
//     // Fetch current customer details
//     const customer = await prisma.customer.findUnique({
//       where: { id: id },
//     });

//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     // Check if the name is different from the one in the database
//     if (name && name !== customer.name) {
//       return res.status(400).json({ message: "Name cannot be edited" });
//     }

// const updatedCustomer = await prisma.customer.update({
//       where: { id: id },
//       data: { contact, purchaseHistory }, // Only update allowed fields
//     });

//     res.status(200).json({
//       message: "Customer updated successfully",
//       updatedCustomer,
//     });
//   } catch (err) {
//     console.error("Error details:", err);
//     res.status(400).send("Error updating customer");
//   }
// };

// const getAllCustomers = async () => {
//   try {
//     const customers = await prisma.user.findMany({
//       where: {
//         userRole: 'CUSTOMER',
//       },
//       select: {
//         name: true,
//         contact: true,
//       },
//     });

//     return customers;
//   } catch (error) {
//     console.error('Error fetching customers:', error);
//     throw new Error('Failed to fetch customers');
//   }
// };





// export default { createCustomer, getCustomerById, updateCustomer, getAllCustomers};

import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, getClient } from '../../config/database.js';

const createCustomer = async (req, res) => {
  const { name, contact, password, purchaseHistory } = req.body;
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Check if the customer already exists
    const existingCustomer = await client.query(
      'SELECT id FROM customers WHERE contact = $1',
      [contact]
    );

    if (existingCustomer.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'Customer with this contact already exists' 
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the customer record using SQL
    const customerResult = await client.query(
      `INSERT INTO customers (name, contact, password, purchase_history, role, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id, name, contact, purchase_history as "purchaseHistory", role, created_at`,
      [name, contact, hashedPassword, purchaseHistory, 'customer']
    );

    const customer = customerResult.rows[0];

    // Generate JWT for the newly created customer
    const token = jwt.sign(
      { id: customer.id, role: 'customer' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    await client.query('COMMIT');

    // Send token and customer data in the response
    res.status(201).json({
      message: 'Customer created successfully',
      token,
      customer: { 
        id: customer.id, 
        name: customer.name, 
        contact: customer.contact, 
        purchaseHistory: customer.purchaseHistory 
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error details:', err);
    res.status(500).json({ 
      message: 'Error creating customer',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

const getCustomerById = async (req, res) => {
  const id = req.params.id;
  
  try {
    const customerResult = await query(
      'SELECT id, name, contact, purchase_history as "purchaseHistory", role, created_at FROM customers WHERE id = $1',
      [id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customer = customerResult.rows[0];
    res.status(200).json(customer);
  } catch (err) {
    console.error('Error details:', err);
    res.status(500).json({ 
      message: 'Error fetching customer data',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const updateCustomer = async (req, res) => {
  const id = req.params.id;
  const { name, contact, purchaseHistory } = req.body;
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Fetch current customer details
    const customerResult = await client.query(
      'SELECT name FROM customers WHERE id = $1',
      [id]
    );

    if (customerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Customer not found" });
    }

    const currentCustomer = customerResult.rows[0];

    // Check if the name is different from the one in the database
    if (name && name !== currentCustomer.name) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Name cannot be edited" });
    }

    // Update customer using SQL
    const updatedCustomerResult = await client.query(
      `UPDATE customers 
       SET contact = $1, purchase_history = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, name, contact, purchase_history as "purchaseHistory", role, updated_at`,
      [contact, purchaseHistory, id]
    );

    await client.query('COMMIT');

    const updatedCustomer = updatedCustomerResult.rows[0];

    res.status(200).json({
      message: "Customer updated successfully",
      updatedCustomer,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error details:", err);
    res.status(400).json({ 
      message: "Error updating customer",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customersResult = await query(
      `SELECT id, name, contact, purchase_history as "purchaseHistory", role, created_at 
       FROM customers 
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      customers: customersResult.rows,
      count: customersResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      message: 'Failed to fetch customers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// If you need the original function signature (without req/res)
const getAllCustomersData = async () => {
  try {
    const customersResult = await query(
      'SELECT name, contact FROM customers ORDER BY created_at DESC'
    );
    return customersResult.rows;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers');
  }
};

export default { 
  createCustomer, 
  getCustomerById, 
  updateCustomer, 
  getAllCustomers,
  getAllCustomersData 
};