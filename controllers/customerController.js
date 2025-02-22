// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();


// // Add a new customer
// const addCustomer = async (req, res) => {
//   const { name, contact, purchaseHistory } = req.body;

//   try {
//     const newCustomer = await Prisma.customer.create({
//       data: {
//         name,
//         contact,
//         purchaseHistory,
//       },
//     });
//     res.status(201).json({ customer: newCustomer });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to add customer' });
//   }
// };

// // Get customer details by ID
// const getCustomerById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const customer = await prisma.customer.findUnique({
//       where: { id },
//     });

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     res.json(customer);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to retrieve customer' });
//   }
// };

// // Update customer details
// const updateCustomer = async (req, res) => {
//   const { id } = req.params;
//   const { name, contact, purchaseHistory } = req.body;

//   try {
//     const updatedCustomer = await prisma.customer.update({
//       where: { id },
//       data: {
//         name,
//         contact,
//         purchaseHistory,
//       },
//     });

//     res.json({ customer: updatedCustomer });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to update customer' });
//   }
// };

// // Delete a customer
// const deleteCustomer = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const deletedCustomer = await prisma.customer.delete({
//       where: { id },
//     });

//     res.json({ message: 'Customer deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to delete customer' });
//   }
// };

// export { addCustomer, getCustomerById, updateCustomer, deleteCustomer };

const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

createCustomer = async (req, res) => {
  const { name, contact, password, purchaseHistory } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await prisma.customer.create({
      data: {
        name,
        contact,
        password: hashedPassword,
        purchaseHistory,
        role: 'customer',
      },
    });
    
    const token = jwt.sign({ id: customer.id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).send('Error creating customer');
  }
};

getCustomerById = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
    });
    
    if (!customer) return res.status(404).send('Customer not found');
    
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).send('Error fetching customer data');
  }
};

updateCustomer = async (req, res) => {
  const { name, contact, purchaseHistory } = req.body;

  try {
    const updatedCustomer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, contact, purchaseHistory },
    });

    res.status(200).json(updatedCustomer);
  } catch (err) {
    res.status(400).send('Error updating customer');
  }
};
export { createCustomer, getCustomerById, updateCustomer };