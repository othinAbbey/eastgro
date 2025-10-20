// const express = require('express');
import express from 'express';
const router = express.Router();
import {
 
  register, 
  login,
  getProfile,
  updateProfile,
  newPassword,
  getUsers,
  getUserById,
  updatedUser,
  deleteUser,
  requestPasswordReset,
  resetPassword,
  getUsersByRole,
  countUsersByRole,
  searchUsersByRole
} from "../../../controllers/User Magement/userController.js"; // Import user controller functions
// import userController from '../../../controllers/User Magement/userController.js'; // Import user controller functions
// Import authentication middleware

// import  authenticateUser  from '../../../middleware/authMiddleware.js';
// import requireAdmin from '../../../middleware/roleMiddleware.js';

// import  authLimiter from '../../../middleware/authMiddleware.js'; // Import rate limiting middleware
import { 
  authenticateUser,
  restrictTo,
  requireAdmin,
  protect,
  authLimiter 
} from '../../../middleware/authMiddleware.js'; // Import authentication middleware

// Public routes (no authentication required)
router.post('/register', register);
// router.get('/health', healthCheck);
router.get('/users', getUsers);
router.post('/login',authLimiter, login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Authenticated user routes (require valid JWT)
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);
router.put('/change-password', authenticateUser, newPassword);

// Admin routes (require admin privileges)
router.get('/users', authenticateUser, requireAdmin, getUsers);
router.get('/users/:id', authenticateUser, requireAdmin, getUserById);
router.put('/users/:id/role', authenticateUser, requireAdmin, updatedUser);
router.delete('/users/:id', authenticateUser, requireAdmin, deleteUser);

// Role-based user management routes
router.get('/users/role/:role', authenticateUser, requireAdmin, getUsersByRole);
router.get('/users/count-by-role', authenticateUser, requireAdmin, countUsersByRole);
router.get('/users/search/:role', authenticateUser, requireAdmin, searchUsersByRole);

export default  router;