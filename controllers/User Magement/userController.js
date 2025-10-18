// //imports
// import bcrypt from 'bcrypt'; // For password hashing
// import jwt from 'jsonwebtoken'; // For JWT token generation
// import { PrismaClient } from '@prisma/client'; //
// import dotenv from 'dotenv';

// dotenv.config();

// // Simple Prisma client
// const prisma = new PrismaClient({
//   log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
// });

// const SALT_ROUNDS = 10;
// const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// // Match your exact Prisma enum values
// const UserRole = {
//   ADMIN: 'ADMIN',
//   FARMER: 'FARMER', 
//   CUSTOMER: 'CUSTOMER',
//   SOLETRADER: 'SOLETRADER',        // No underscore
//   PASSIVETRADER: 'PASSIVETRADER',  // No underscore
//   GUEST: 'GUEST',
//   EXPERT: 'EXPERT'
// };

// // Define flexible role mapping
// const ROLE_MAPPING = {
//   // Direct matches
//   'ADMIN': UserRole.ADMIN,
//   'FARMER': UserRole.FARMER,
//   'CUSTOMER': UserRole.CUSTOMER,
//   'SOLETRADER': UserRole.SOLETRADER,        // No underscore
//   'PASSIVETRADER': UserRole.PASSIVETRADER,  // No underscore
//   'GUEST': UserRole.GUEST,
//   'EXPERT': UserRole.EXPERT,
  
//   // Variations with underscores (map to no-underscore)
//   'SOLE_TRADER': UserRole.SOLETRADER,
//   'PASSIVE_TRADER': UserRole.PASSIVETRADER,
  
//   // Other common variations
//   'SOLE TRADER': UserRole.SOLETRADER,
//   'SOLE-TRADER': UserRole.SOLETRADER,
//   'PASSIVE TRADER': UserRole.PASSIVETRADER,
//   'PASSIVE-TRADER': UserRole.PASSIVETRADER,
//   'SOLE': UserRole.SOLETRADER,
//   'PASSIVE': UserRole.PASSIVETRADER
// };

// // Helper function to normalize and validate userRole
// function normalizeUserRole(inputRole) {
//   if (!inputRole) return null;
  
//   const upperRole = inputRole.toUpperCase().trim();
  
//   // Direct match in mapping
//   if (ROLE_MAPPING[upperRole]) {
//     return ROLE_MAPPING[upperRole];
//   }
  
//   return null;
// }

// // Helper function to exclude fields from user object
// function exclude(user, keys) {
//   const result = { ...user };
//   for (let key of keys) {
//     delete result[key];
//   }
//   return result;
// }

// // Register a new user
// const register = async (req, res) => {
//   console.log('📨 Registration request received:', JSON.stringify(req.body, null, 2));
  
//   try {
//     // Handle case-insensitive field names
//     const { 
//       name, Name,
//       contact, Contact, 
//       email, Email,
//       password, Password,
//       userRole, UserRole, userrole,
//       location, Location,
//       district, District
//     } = req.body;

//     // Normalize field names
//     const normalizedData = {
//       name: name || Name,
//       contact: contact || Contact,
//       email: email || Email,
//       password: password || Password,
//       userRole: userRole || UserRole || userrole,
//       location: location || Location,
//       district: district || District
//     };

//     const { 
//       name: finalName, 
//       contact: finalContact, 
//       email: finalEmail, 
//       password: finalPassword, 
//       userRole: finalUserRole, 
//       location: finalLocation, 
//       district: finalDistrict 
//     } = normalizedData;

//     console.log('🔍 Normalized data:', normalizedData);

//     // Validate input
//     if (!finalName || !finalContact || !finalEmail || !finalPassword || !finalUserRole) {
//       return res.status(400).json({ 
//         error: 'Name, contact, email, password, and userRole are required',
//         received: Object.keys(req.body)
//       });
//     }

//     if (!finalEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
//       return res.status(400).json({ error: 'Invalid email format' });
//     }

//     if (finalPassword.length < 8) {
//       return res.status(400).json({ 
//         error: 'Password must be at least 8 characters long' 
//       });
//     }

//     // Normalize and validate userRole
//     const normalizedRole = normalizeUserRole(finalUserRole);
//     if (!normalizedRole) {
//       return res.status(400).json({
//         error: 'Invalid userRole',
//         validRoles: Object.values(UserRole),
//         received: finalUserRole,
//         suggestion: `Try one of: ${Object.values(UserRole).join(', ')}`
//       });
//     }

//     console.log('✅ Validation passed, checking existing user...');

//     // DIRECT Prisma call - no wrapper
//     // const existingUser = await prisma.user.findFirst({
//     //   where: { 
//     //     OR: [
//     //       { email: finalEmail.toLowerCase() },
//     //       { contact: finalContact }
//     //     ]
//     //   }
//     // });

//     // if (existingUser) {
//     //   console.log('❌ User already exists');
//     //   const conflictField = existingUser.email === finalEmail.toLowerCase() ? 'email' : 'contact';
//     //   return res.status(409).json({ 
//     //     error: `User with this ${conflictField} already exists` 
//     //   });
//     // }

//     console.log('✅ No existing user found, creating user...');

//     // Hash password and create user - DIRECT Prisma call
//     const hashedPassword = await bcrypt.hash(finalPassword, SALT_ROUNDS);
    
//     console.log('🔧 Creating user with role:', normalizedRole);
    
//     const newUser = await prisma.user.create({
//       data: {
//         name: finalName,
//         contact: finalContact,
//         email: finalEmail.toLowerCase(),
//         password: hashedPassword,
//         userRole: normalizedRole,  // This now matches your enum exactly
//         location: finalLocation || null,
//         district: finalDistrict || null
//       }
//     });

//     console.log('✅ User created successfully:', newUser.id);

//     // Exclude password from response
//     const userWithoutPassword = exclude(newUser, ['password']);

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: newUser.id, role: newUser.userRole }, 
//       JWT_SECRET, 
//       { expiresIn: JWT_EXPIRES_IN }
//     );

//     console.log('🎉 Registration completed successfully');

//     return res.status(201).json({
//       message: 'User registered successfully',
//       user: userWithoutPassword,
//       token
//     });

//   } catch (error) {
//     console.error('💥 Registration error:', error);
//     console.error('💥 Error code:', error.code);
//     console.error('💥 Error message:', error.message);
    
//     // Handle specific Prisma errors
//     if (error.code === 'P2002') {
//       return res.status(409).json({ 
//         error: 'User with this email or contact already exists' 
//       });
//     }
    
//     if (error.code === 'P1001' || error.code === 'P1017') {
//       return res.status(503).json({ 
//         error: 'Database service temporarily unavailable. Please try again.' 
//       });
//     }

//     return res.status(500).json({ 
//       error: 'Internal server error during registration',
//       details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
//     });
//   }
// }

// // User login
// const login = async (req, res) => {
//   try {
//     const { contact, password } = req.body;

//     if (!contact || !password) {
//       return res.status(400).json({ 
//         error: 'Contact and password are required' 
//       });
//     }

//     // DIRECT Prisma call
//     const user = await prisma.user.findUnique({ 
//       where: { contact } 
//     });

//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.userRole }, 
//       JWT_SECRET, 
//       { expiresIn: JWT_EXPIRES_IN }
//     );

//     const userWithoutPassword = exclude(user, ['password']);

//     // Set cookie
//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'Strict',
//       maxAge: 24 * 60 * 60 * 1000, // 24 hours
//     });

//     return res.json({
//       message: 'Login successful',
//       user: userWithoutPassword,
//       token
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     return res.status(500).json({ error: 'An error occurred during login' });
//   }
// }

// // Get current user profile
// const getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         name: true,
//         contact: true,
//         email: true,
//         userRole: true,
//         location: true,
//         district: true,
//         createdAt: true,
//         updatedAt: true
//       }
//     });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     return res.json(user);
//   } catch (error) {
//     console.error('Get profile error:', error);
//     return res.status(500).json({ error: 'Failed to get user profile' });
//   }
// }

// // Update user profile
// const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { name, contact, email, location, district } = req.body;

//     // Validate input
//     if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
//       return res.status(400).json({ error: 'Invalid email format' });
//     }

//     // Check if new email or contact already exists
//     // if (email || contact) {
//     //   const existingUser = await prisma.user.findFirst({
//     //     where: {
//     //       AND: [
//     //         { id: { not: userId } },
//     //         { OR: [{ email }, { contact }] }
//     //       ]
//     //     }
//     //   });

//     //   if (existingUser) {
//     //     const conflictField = existingUser.email === email ? 'email' : 'contact';
//     //     return res.status(409).json({ 
//     //       error: `User with this ${conflictField} already exists` 
//     //     });
//     //   }
//     // }

//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: { name, contact, email, location, district },
//       select: {
//         id: true,
//         name: true,
//         contact: true,
//         email: true,
//         userRole: true,
//         location: true,
//         district: true,
//         updatedAt: true
//       }
//     });

//     return res.json({
//       message: 'Profile updated successfully',
//       user: updatedUser
//     });
//   } catch (error) {
//     console.error('Update profile error:', error);
    
//     if (error.code === 'P2002') {
//       return res.status(409).json({ 
//         error: 'User with this email or contact already exists' 
//       });
//     }

//     return res.status(500).json({ error: 'Failed to update profile' });
//   }
// }

// // Change password
// const newPassword = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({ 
//         error: 'Current password and new password are required' 
//       });
//     }

//     if (newPassword.length < 8) {
//       return res.status(400).json({ 
//         error: 'New password must be at least 8 characters long' 
//       });
//     }

//     const user = await prisma.user.findUnique({ where: { id: userId } });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const passwordMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ error: 'Current password is incorrect' });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
//     await prisma.user.update({
//       where: { id: userId },
//       data: { password: hashedPassword }
//     });

//     return res.json({ message: 'Password changed successfully' });
//   } catch (error) {
//     console.error('Change password error:', error);
//     return res.status(500).json({ error: 'Failed to change password' });
//   }
// }

// // Admin: Get all users (paginated)
// const getAllUsers = async (req, res) => {
//   try {
//     // Check if user is admin
//     if (req.user.userRole !== UserRole.ADMIN) {
//       return res.status(403).json({ error: 'Unauthorized' });
//     }

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const [users, total] = await Promise.all([
//       prisma.user.findMany({
//         skip,
//         take: limit,
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           contact: true,
//           userRole: true,
//           location: true,
//           district: true,
//           createdAt: true
//         },
//         orderBy: { createdAt: 'desc' }
//       }),
//       prisma.user.count()
//     ]);

//     return res.json({
//       users,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Get all users error:', error);
//     return res.status(500).json({ error: 'Failed to get users' });
//   }
// }

// // Admin: Get User by ID
// const getUserById = async (req, res) => {
//   try {
//     if (req.user.userRole !== UserRole.ADMIN) {
//       return res.status(403).json({ error: 'Unauthorized' });
//     }

//     const { id } = req.params;
//     const user = await prisma.user.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         contact: true,
//         userRole: true,
//         location: true,
//         district: true,
//         createdAt: true,
//         updatedAt: true
//       }
//     });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     return res.json({ user });
//   } catch (error) {
//     console.error('Get user by ID error:', error);
//     return res.status(500).json({ error: 'Failed to get user' });
//   }
// }

// // Admin: Update user role
// const updatedUser = async (req, res) => {
//   try {
//     if (req.user.userRole !== UserRole.ADMIN) {
//       return res.status(403).json({ error: 'Unauthorized' });
//     }

//     const userId = req.params.id;
//     const { role } = req.body;

//     const normalizedRole = normalizeUserRole(role);
//     if (!normalizedRole) {
//       return res.status(400).json({ 
//         error: 'Invalid role',
//         validRoles: Object.values(UserRole)
//       });
//     }

//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: { userRole: normalizedRole },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         userRole: true,
//         updatedAt: true
//       }
//     });

//     return res.json({
//       message: 'User role updated successfully',
//       user: updatedUser
//     });
//   } catch (error) {
//     console.error('Update user role error:', error);
//     return res.status(500).json({ error: 'Failed to update user role' });
//   }
// }

// // Admin: Delete user
// const deleteUser = async (req, res) => {
//   try {
//     if (req.user.userRole !== UserRole.ADMIN) {
//       return res.status(403).json({ error: 'Unauthorized' });
//     }

//     const userId = req.params.id;
//     await prisma.user.delete({ where: { id: userId } });

//     return res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     console.error('Delete user error:', error);
//     return res.status(500).json({ error: 'Failed to delete user' });
//   }
// }

// // Request password reset
// const requestPasswordReset = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ error: 'Email is required' });
//     }

//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       // Don't reveal whether email exists for security
//       return res.json({ message: 'If the email exists, a reset link has been sent' });
//     }

//     // Generate reset token (expires in 1 hour)
//     const resetToken = jwt.sign(
//       { id: user.id, action: 'password_reset' },
//       JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     return res.json({ 
//       message: 'Password reset link generated',
//       resetToken
//     });
//   } catch (error) {
//     console.error('Password reset request error:', error);
//     return res.status(500).json({ error: 'Failed to process reset request' });
//   }
// }

// // Reset password with token
// const resetPassword = async (req, res) => {
//   try {
//     const { token, newPassword } = req.body;

//     if (!token || !newPassword) {
//       return res.status(400).json({ 
//         error: 'Token and new password are required' 
//       });
//     }

//     if (newPassword.length < 8) {
//       return res.status(400).json({ 
//         error: 'New password must be at least 8 characters long' 
//       });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, JWT_SECRET);
//     if (decoded.action !== 'password_reset') {
//       return res.status(400).json({ error: 'Invalid token' });
//     }

//     // Hash new password and update
//     const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
//     await prisma.user.update({
//       where: { id: decoded.id },
//       data: { password: hashedPassword }
//     });

//     return res.json({ message: 'Password reset successfully' });
//   } catch (error) {
//     console.error('Password reset error:', error);
//     if (error instanceof jwt.TokenExpiredError) {
//       return res.status(400).json({ error: 'Reset token has expired' });
//     }
//     if (error instanceof jwt.JsonWebTokenError) {
//       return res.status(400).json({ error: 'Invalid token' });
//     }
//     return res.status(500).json({ error: 'Failed to reset password' });
//   }
// }

// // Get users by role (paginated)
// const getUsersByRole = async (req, res) => {
//   try {
//     const { role } = req.params;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // Normalize role
//     const normalizedRole = normalizeUserRole(role);
//     if (!normalizedRole) {
//       return res.status(400).json({ error: 'Invalid role' });
//     }

//     const [users, total] = await Promise.all([
//       prisma.user.findMany({
//         where: { userRole: normalizedRole },
//         skip,
//         take: limit,
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           userRole: true,
//           createdAt: true
//         },
//         orderBy: { createdAt: 'desc' }
//       }),
//       prisma.user.count({ where: { userRole: normalizedRole } })
//     ]);

//     return res.json({
//       users,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//         role: normalizedRole
//       }
//     });
//   } catch (error) {
//     console.error('Get users by role error:', error);
//     return res.status(500).json({ error: 'Failed to get users by role' });
//   }
// }

// // Count users by role
// const countUsersByRole = async (req, res) => {
//   try {
//     const uniqueRoles = Object.values(UserRole);
//     const counts = await Promise.all(
//       uniqueRoles.map(async (role) => {
//         const count = await prisma.user.count({ where: { userRole: role } });
//         return { role, count };
//       })
//     );

//     return res.json({ counts });
//   } catch (error) {
//     console.error('Count users by role error:', error);
//     return res.status(500).json({ error: 'Failed to count users by role' });
//   }
// }

// // Search users by role with optional filters
// const searchUsersByRole = async (req, res) => {
//   try {
//     const { role } = req.params;
//     const { query } = req.query;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // Normalize role
//     const normalizedRole = normalizeUserRole(role);
//     if (!normalizedRole) {
//       return res.status(400).json({ error: 'Invalid role' });
//     }

//     const where = { userRole: normalizedRole };
    
//     if (query) {
//       where.OR = [
//         { name: { contains: query, mode: 'insensitive' } },
//         { email: { contains: query, mode: 'insensitive' } },
//         { contact: { contains: query, mode: 'insensitive' } }
//       ];
//     }

//     const [users, total] = await Promise.all([
//       prisma.user.findMany({
//         where,
//         skip,
//         take: limit,
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           contact: true,
//           userRole: true,
//           createdAt: true
//         },
//         orderBy: { createdAt: 'desc' }
//       }),
//       prisma.user.count({ where })
//     ]);

//     return res.json({
//       users,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//         role: normalizedRole,
//         query: query || null
//       }
//     });
//   } catch (error) {
//     console.error('Search users by role error:', error);
//     return res.status(500).json({ error: 'Failed to search users' });
//   }
// }

// export {
//   register,
//   login,
//   getProfile,
//   updateProfile,
//   newPassword,
//   getAllUsers,
//   getUserById,
//   updatedUser,
//   deleteUser,
//   requestPasswordReset,
//   resetPassword,
//   getUsersByRole,
//   countUsersByRole,
//   searchUsersByRole
// };

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// User roles
const UserRole = {
  ADMIN: 'ADMIN',
  FARMER: 'FARMER', 
  CUSTOMER: 'CUSTOMER',
  SOLETRADER: 'SOLETRADER',
  PASSIVETRADER: 'PASSIVETRADER',
  GUEST: 'GUEST',
  EXPERT: 'EXPERT'
};

// Role mapping for normalization
const ROLE_MAPPING = {
  'ADMIN': UserRole.ADMIN,
  'FARMER': UserRole.FARMER,
  'CUSTOMER': UserRole.CUSTOMER,
  'SOLETRADER': UserRole.SOLETRADER,
  'PASSIVETRADER': UserRole.PASSIVETRADER,
  'GUEST': UserRole.GUEST,
  'EXPERT': UserRole.EXPERT,
  'SOLE_TRADER': UserRole.SOLETRADER,
  'PASSIVE_TRADER': UserRole.PASSIVETRADER,
  'SOLE TRADER': UserRole.SOLETRADER,
  'SOLE-TRADER': UserRole.SOLETRADER,
  'PASSIVE TRADER': UserRole.PASSIVETRADER,
  'PASSIVE-TRADER': UserRole.PASSIVETRADER,
  'SOLE': UserRole.SOLETRADER,
  'PASSIVE': UserRole.PASSIVETRADER
};

// Helper function to normalize and validate userRole
function normalizeUserRole(inputRole) {
  if (!inputRole) return null;
  
  const upperRole = inputRole.toUpperCase().trim();
  
  if (ROLE_MAPPING[upperRole]) {
    return ROLE_MAPPING[upperRole];
  }
  
  return null;
}

// Helper function to exclude fields from user object
function exclude(user, keys) {
  const result = { ...user };
  for (let key of keys) {
    delete result[key];
  }
  return result;
}

// Register a new user
const register = async (req, res) => {
  console.log('📨 Registration request received:', JSON.stringify(req.body, null, 2));
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Handle case-insensitive field names
    const { 
      name, Name,
      contact, Contact, 
      email, Email,
      password, Password,
      userRole, UserRole, userrole,
      location, Location,
      district, District
    } = req.body;

    // Normalize field names
    const normalizedData = {
      name: name || Name,
      contact: contact || Contact,
      email: email || Email,
      password: password || Password,
      userRole: userRole || UserRole || userrole,
      location: location || Location,
      district: district || District
    };

    const { 
      name: finalName, 
      contact: finalContact, 
      email: finalEmail, 
      password: finalPassword, 
      userRole: finalUserRole, 
      location: finalLocation, 
      district: finalDistrict 
    } = normalizedData;

    console.log('🔍 Normalized data:', normalizedData);

    // Validate input
    if (!finalName || !finalContact || !finalEmail || !finalPassword || !finalUserRole) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Name, contact, email, password, and userRole are required',
        received: Object.keys(req.body)
      });
    }

    if (!finalEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (finalPassword.length < 8) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Normalize and validate userRole
    const normalizedRole = normalizeUserRole(finalUserRole);
    if (!normalizedRole) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Invalid userRole',
        validRoles: Object.values(UserRole),
        received: finalUserRole,
        suggestion: `Try one of: ${Object.values(UserRole).join(', ')}`
      });
    }

    console.log('✅ Validation passed, checking existing user...');

    // Check if user already exists
    const existingUserResult = await client.query(
      `SELECT id, email, contact FROM users 
       WHERE email = $1 OR contact = $2`,
      [finalEmail.toLowerCase(), finalContact]
    );

    if (existingUserResult.rows.length > 0) {
      await client.query('ROLLBACK');
      console.log('❌ User already exists');
      const existingUser = existingUserResult.rows[0];
      const conflictField = existingUser.email === finalEmail.toLowerCase() ? 'email' : 'contact';
      return res.status(409).json({ 
        error: `User with this ${conflictField} already exists` 
      });
    }

    console.log('✅ No existing user found, creating user...');

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(finalPassword, SALT_ROUNDS);
    
    console.log('🔧 Creating user with role:', normalizedRole);
    
    const newUserResult = await client.query(
      `INSERT INTO users 
       (name, contact, email, password, user_role, location, district) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, name, contact, email, user_role, location, district, created_at, updated_at`,
      [
        finalName,
        finalContact,
        finalEmail.toLowerCase(),
        hashedPassword,
        normalizedRole,
        finalLocation,
        finalDistrict
      ]
    );

    const newUser = newUserResult.rows[0];
    console.log('✅ User created successfully:', newUser.id);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.user_role }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    await client.query('COMMIT');
    console.log('🎉 Registration completed successfully');

    return res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('💥 Registration error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ 
        error: 'User with this email or contact already exists' 
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  } finally {
    client.release();
  }
};

// User login
const login = async (req, res) => {
  try {
    const { contact, password } = req.body;

    if (!contact || !password) {
      return res.status(400).json({ 
        error: 'Contact and password are required' 
      });
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE contact = $1',
      [contact]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.user_role }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userWithoutPassword = exclude(user, ['password']);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      `SELECT id, name, contact, email, user_role, location, district, created_at, updated_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Failed to get user profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userId = req.user.id;
    const { name, contact, email, location, district } = req.body;

    // Validate input
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if new email or contact already exists
    if (email || contact) {
      const existingUserResult = await client.query(
        `SELECT id FROM users 
         WHERE (email = $1 OR contact = $2) AND id != $3`,
        [email, contact, userId]
      );

      if (existingUserResult.rows.length > 0) {
        await client.query('ROLLBACK');
        const existingUser = existingUserResult.rows[0];
        const conflictField = existingUser.email === email ? 'email' : 'contact';
        return res.status(409).json({ 
          error: `User with this ${conflictField} already exists` 
        });
      }
    }

    const updatedUserResult = await client.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           contact = COALESCE($2, contact),
           email = COALESCE($3, email),
           location = COALESCE($4, location),
           district = COALESCE($5, district),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name, contact, email, user_role, location, district, updated_at`,
      [name, contact, email, location, district, userId]
    );

    await client.query('COMMIT');

    return res.json({
      message: 'Profile updated successfully',
      user: updatedUserResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update profile error:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'User with this email or contact already exists' 
      });
    }

    return res.status(500).json({ error: 'Failed to update profile' });
  } finally {
    client.release();
  }
};

// Change password
const newPassword = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters long' 
      });
    }

    const userResult = await client.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      await client.query('ROLLBACK');
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await client.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    await client.query('COMMIT');

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  } finally {
    client.release();
  }
};

// Admin: Get all users (paginated)
const getUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [usersResult, totalResult] = await Promise.all([
      pool.query(
        `SELECT id, name, email, contact, user_role, location, district, created_at
         FROM users 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query('SELECT COUNT(*) FROM users')
    ]);

    const total = parseInt(totalResult.rows[0].count);

    return res.json({
      users: usersResult.rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Failed to get users' });
  }
};

// Admin: Get User by ID
const getUserById = async (req, res) => {
  try {
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const userResult = await pool.query(
      `SELECT id, name, email, contact, user_role, location, district, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: userResult.rows[0] });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ error: 'Failed to get user' });
  }
};

// Admin: Update user role
const updatedUser = async (req, res) => {
  try {
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userId = req.params.id;
    const { role } = req.body;

    const normalizedRole = normalizeUserRole(role);
    if (!normalizedRole) {
      return res.status(400).json({ 
        error: 'Invalid role',
        validRoles: Object.values(UserRole)
      });
    }

    const updatedUserResult = await pool.query(
      `UPDATE users 
       SET user_role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, user_role, updated_at`,
      [normalizedRole, userId]
    );

    return res.json({
      message: 'User role updated successfully',
      user: updatedUserResult.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userId = req.params.id;
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal whether email exists for security
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const user = userResult.rows[0];

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, action: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ 
      message: 'Password reset link generated',
      resetToken
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ error: 'Failed to process reset request' });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters long' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.action !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, decoded.id]
    );

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Failed to reset password' });
  }
};

// Get users by role (paginated)
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Normalize role
    const normalizedRole = normalizeUserRole(role);
    if (!normalizedRole) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const [usersResult, totalResult] = await Promise.all([
      pool.query(
        `SELECT id, name, email, user_role, created_at
         FROM users 
         WHERE user_role = $1
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [normalizedRole, limit, offset]
      ),
      pool.query(
        'SELECT COUNT(*) FROM users WHERE user_role = $1',
        [normalizedRole]
      )
    ]);

    const total = parseInt(totalResult.rows[0].count);

    return res.json({
      users: usersResult.rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        role: normalizedRole
      }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    return res.status(500).json({ error: 'Failed to get users by role' });
  }
};

// Count users by role
const countUsersByRole = async (req, res) => {
  try {
    const uniqueRoles = Object.values(UserRole);
    const counts = await Promise.all(
      uniqueRoles.map(async (role) => {
        const countResult = await pool.query(
          'SELECT COUNT(*) FROM users WHERE user_role = $1',
          [role]
        );
        return { role, count: parseInt(countResult.rows[0].count) };
      })
    );

    return res.json({ counts });
  } catch (error) {
    console.error('Count users by role error:', error);
    return res.status(500).json({ error: 'Failed to count users by role' });
  }
};

// Search users by role with optional filters
const searchUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Normalize role
    const normalizedRole = normalizeUserRole(role);
    if (!normalizedRole) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    let whereClause = 'WHERE user_role = $1';
    const params = [normalizedRole];

    if (query) {
      whereClause += ` AND (name ILIKE $2 OR email ILIKE $2 OR contact ILIKE $2)`;
      params.push(`%${query}%`);
    }

    const [usersResult, totalResult] = await Promise.all([
      pool.query(
        `SELECT id, name, email, contact, user_role, created_at
         FROM users 
         ${whereClause}
         ORDER BY created_at DESC 
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
      pool.query(
        `SELECT COUNT(*) FROM users ${whereClause}`,
        params
      )
    ]);

    const total = parseInt(totalResult.rows[0].count);

    return res.json({
      users: usersResult.rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        role: normalizedRole,
        query: query || null
      }
    });
  } catch (error) {
    console.error('Search users by role error:', error);
    return res.status(500).json({ error: 'Failed to search users' });
  }
};

export {
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
};