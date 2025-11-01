import express from 'express';
const router = express.Router();

// Import user controller functions
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
  searchUsersByRole,
} from "../../../controllers/User Magement/userController.js";
import { logout } from '../../../controllers/User Magement/authController.js';
// Import authentication middleware
import {
  authenticateUser,
  restrictTo,
  requireAdmin,
  authLimiter
} from '../../../middleware/authMiddleware.js';

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
// router.get('/verify', verifyToken);

// Authenticated user routes (require valid JWT)
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);
router.put('/change-password', authenticateUser, newPassword);
router.post('/logout', logout);

// Admin routes (require admin privileges)
// Note: The /users route is defined twice - consolidated here
router.get('/users', authenticateUser, requireAdmin, getUsers);
router.get('/users/:id', authenticateUser, requireAdmin, getUserById);
router.put('/users/:id/role', authenticateUser, requireAdmin, updatedUser);
router.delete('/users/:id', authenticateUser, requireAdmin, deleteUser);

// Role-based user management routes
router.get('/users/role/:role', authenticateUser, requireAdmin, getUsersByRole);
router.get('/users/count-by-role', authenticateUser, requireAdmin, countUsersByRole);
router.get('/users/search/:role', authenticateUser, requireAdmin, searchUsersByRole);

export default router;