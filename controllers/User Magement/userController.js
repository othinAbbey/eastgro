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

//imports
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Fixed Prisma client with connection handling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    },
  },
});

// Connection management
let isConnected = false;

const ensureConnection = async () => {
  if (!isConnected) {
    try {
      await prisma.$connect();
      isConnected = true;
      console.log('✅ Database connected');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
};

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Simple role mapping
const ROLE_MAPPING = {
  'SOLE_TRADER': 'SOLETRADER',
  'PASSIVE_TRADER': 'PASSIVETRADER',
  'ADMIN': 'ADMIN',
  'FARMER': 'FARMER',
  'CUSTOMER': 'CUSTOMER'
};

// Test registration with connection retry
const register = async (req, res) => {
  console.log('🚀 TEST Registration request:', req.body);
  
  try {
    const { name, contact, email, password, userRole, location, district } = req.body;

    // Basic validation
    if (!name || !contact || !email || !password || !userRole) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'contact', 'email', 'password', 'userRole']
      });
    }

    // Ensure connection before proceeding
    await ensureConnection();

    // Normalize role
    const normalizedRole = ROLE_MAPPING[userRole.toUpperCase()] || userRole.toUpperCase();
    
    console.log('🔧 Creating user with role:', normalizedRole);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create user with retry logic
    let newUser;
    try {
      newUser = await prisma.user.create({
        data: {
          name,
          contact,
          email: email.toLowerCase(),
          password: hashedPassword,
          userRole: normalizedRole,
          location: location || null,
          district: district || null
        }
      });
    } catch (dbError) {
      // If connection failed, try to reconnect and retry
      if (dbError.code === 'P1001') {
        console.log('🔄 Connection lost, reconnecting...');
        isConnected = false;
        await ensureConnection();
        // Retry the operation
        newUser = await prisma.user.create({
          data: {
            name,
            contact,
            email: email.toLowerCase(),
            password: hashedPassword,
            userRole: normalizedRole,
            location: location || null,
            district: district || null
          }
        });
      } else {
        throw dbError;
      }
    }

    console.log('✅ User created successfully - ID:', newUser.id);

    // Generate simple token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.userRole }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('💥 Registration error:', error);
    
    // Handle specific errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'email or contact';
      return res.status(409).json({ 
        error: `User with this ${field} already exists` 
      });
    }
    
    if (error.code === 'P1001' || error.code === 'P1017') {
      return res.status(503).json({ 
        error: 'Database connection failed. Please try again.' 
      });
    }

    return res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

// Test database connection
const testConnection = async (req, res) => {
  try {
    await ensureConnection();
    await prisma.$queryRaw`SELECT 1`;
    
    // Also test if we can access the user table
    const userCount = await prisma.user.count();
    
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      userCount,
      database: process.env.DATABASE_URL ? 'URL configured' : 'No URL'
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: error.message,
      code: error.code
    });
  }
}

// Check environment
const checkEnv = (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0
  });
}

export {
  register,
  testConnection,
  checkEnv
};