// import express from 'express';
// import { addCustomer, getCustomerById, updateCustomer, deleteCustomer } from '../controllers/customerController.js';
// const router = express.Router();

// // Add a new customer
// router.post('/customers', addCustomer);

// // Get customer details by ID
// router.get('/customers/:id', getCustomerById);

// // Update customer details
// router.put('/customers/:id', updateCustomer);

// // Delete a customer
// router.delete('/customers/:id', deleteCustomer);

// export default router;



import express from 'express';
import roleMiddleware from '../../../middleware/roleMiddleware.js';
import customerController from '../../../controllers/Customers Management/customerController.js';
const router = express.Router();
// Create a new customer
router.post('/register', customerController.createCustomer);

// Get customer details by ID (only the customer or authorized roles can access)
router.get('/customer/:id', roleMiddleware(['customer']), customerController.getCustomerById);
// router.get('/customer:id', customerController.getCustomerById);
// Update customer details
router.put('/customer/:id', roleMiddleware(['customer']), customerController.updateCustomer);

export default router;