import express from 'express';
import roleMiddleware from '../../../middleware/roleMiddleware.js';
// import authMiddleware from '../../../middleware/authMiddleware.js'; 
import { 
    authenticateUser,
    restrictTo,
    requireAdmin,
    protect,
    authLimiter  
} from '../../../middleware/authMiddleware.js'; 
import customerController from '../../../controllers/Customers Management/customerController.js';
const router = express.Router();
// Create a new customer
router.post('/register', customerController.createCustomer);

// Get customer details by ID (only the customer or authorized roles can access)
// router.get('/customer/:id', roleMiddleware(['customer']), customerController.getCustomerById);
router.get('/customer/:id',authenticateUser, customerController.getCustomerById);
// router.get('/customer:id', customerController.getCustomerById);
// Update customer details
router.put('/customer/:id', roleMiddleware(['customer']), customerController.updateCustomer);
//get all customers
router.get('/all',authenticateUser, customerController.getAllCustomers)
export default router;