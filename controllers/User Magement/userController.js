// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import pool from '../../config/database.js';
// import { getClient } from '../../config/database.js';
// import dotenv from 'dotenv';

// dotenv.config();

// const SALT_ROUNDS = 10;
// const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// // User roles
// const UserRole = {
//   ADMIN: 'ADMIN',
//   FARMER: 'FARMER', 
//   CUSTOMER: 'CUSTOMER',
//   SOLETRADER: 'SOLETRADER',
//   PASSIVETRADER: 'PASSIVETRADER',
//   GUEST: 'GUEST',
//   EXPERT: 'EXPERT'
// };

// // Role mapping for normalization
// const ROLE_MAPPING = {
//   'ADMIN': UserRole.ADMIN,
//   'FARMER': UserRole.FARMER,
//   'CUSTOMER': UserRole.CUSTOMER,
//   'SOLETRADER': UserRole.SOLETRADER,
//   'PASSIVETRADER': UserRole.PASSIVETRADER,
//   'GUEST': UserRole.GUEST,
//   'EXPERT': UserRole.EXPERT,
//   'SOLE_TRADER': UserRole.SOLETRADER,
//   'PASSIVE_TRADER': UserRole.PASSIVETRADER,
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

// // Database connection helper with retry logic


// // Register a new user
// const register = async (req, res) => {
//   console.log('📨 Registration request received:', JSON.stringify(req.body, null, 2));
  
//   let client;
  
//   try {
//     // Get database client with retry logic
//     client = await getClient();
//     await client.query('BEGIN');

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
//       await client.query('ROLLBACK');
//       return res.status(400).json({ 
//         success: false,
//         error: 'Name, contact, email, password, and userRole are required',
//         received: Object.keys(req.body)
//       });
//     }

//     if (!finalEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ 
//         success: false,
//         error: 'Invalid email format' 
//       });
//     }

//     if (finalPassword.length < 8) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ 
//         success: false,
//         error: 'Password must be at least 8 characters long' 
//       });
//     }

//     // Normalize and validate userRole
//     const normalizedRole = normalizeUserRole(finalUserRole);
//     if (!normalizedRole) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid userRole',
//         validRoles: Object.values(UserRole),
//         received: finalUserRole,
//         suggestion: `Try one of: ${Object.values(UserRole).join(', ')}`
//       });
//     }

//     console.log('✅ Validation passed, checking existing user...');

//     // Check if user already exists
//     const existingUserResult = await client.query(
//       `SELECT id, email, contact FROM users 
//        WHERE email = $1 OR contact = $2`,
//       [finalEmail.toLowerCase(), finalContact]
//     );

//     if (existingUserResult.rows.length > 0) {
//       await client.query('ROLLBACK');
//       console.log('❌ User already exists');
//       const existingUser = existingUserResult.rows[0];
//       const conflictField = existingUser.email === finalEmail.toLowerCase() ? 'email' : 'contact';
//       return res.status(409).json({ 
//         success: false,
//         error: `User with this ${conflictField} already exists` 
//       });
//     }

//     console.log('✅ No existing user found, creating user...');

//     // Hash password and create user
//     const hashedPassword = await bcrypt.hash(finalPassword, SALT_ROUNDS);
    
//     console.log('🔧 Creating user with role:', normalizedRole);
    
//     const newUserResult = await client.query(
//       `INSERT INTO users 
//        (name, contact, email, password, user_role, location, district) 
//        VALUES ($1, $2, $3, $4, $5, $6, $7) 
//        RETURNING id, name, contact, email, user_role, location, district, created_at, updated_at`,
//       [
//         finalName,
//         finalContact,
//         finalEmail.toLowerCase(),
//         hashedPassword,
//         normalizedRole,
//         finalLocation,
//         finalDistrict
//       ]
//     );

//     const newUser = newUserResult.rows[0];
//     console.log('✅ User created successfully:', newUser.id);

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: newUser.id, role: newUser.user_role }, 
//       JWT_SECRET, 
//       { expiresIn: JWT_EXPIRES_IN }
//     );

//     await client.query('COMMIT');
//     console.log('🎉 Registration completed successfully');

//     return res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       user: newUser,
//       token
//     });

//   } catch (error) {
//     console.error('💥 Registration error:', error);
    
//     // Rollback transaction if client exists
//     if (client) {
//       try {
//         await client.query('ROLLBACK');
//       } catch (rollbackError) {
//         console.error('Rollback error:', rollbackError);
//       }
//     }
    
//     // Handle specific database errors
//     if (error.code === '23505') { // Unique violation
//       return res.status(409).json({ 
//         success: false,
//         error: 'User with this email or contact already exists' 
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Internal server error during registration',
//       details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
//     });
//   } finally {
//     // Always release client back to pool
//     if (client) {
//       try {
//         client.release();
//       } catch (releaseError) {
//         console.error('Error releasing client:', releaseError);
//       }
//     }
//   }
// };

// // User login
// const login = async (req, res) => {
//   let client;
//   try {
//     const { contact, password } = req.body;

//     if (!contact || !password) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Contact and password are required' 
//       });
//     }

//     client = await getClient();

//     const userResult = await client.query(
//       'SELECT * FROM users WHERE contact = $1',
//       [contact]
//     );

//     if (userResult.rows.length === 0) {
//       return res.status(401).json({ 
//         success: false,
//         error: 'Invalid credentials' 
//       });
//     }

//     const user = userResult.rows[0];
//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ 
//         success: false,
//         error: 'Invalid credentials' 
//       });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.user_role }, 
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
//       success: true,
//       message: 'Login successful',
//       user: userWithoutPassword,
//       token
//     });

//   } catch (error) {
//     console.error('Login error:', error);
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'An error occurred during login'
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Get current user profile
// const getProfile = async (req, res) => {
//   let client;
//   try {
//     const userId = req.user.id;
//     client = await getClient();

//     const userResult = await client.query(
//       `SELECT id, name, contact, email, user_role, location, district, created_at, updated_at 
//        FROM users WHERE id = $1`,
//       [userId]
//     );

//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'User not found' 
//       });
//     }

//     return res.json({
//       success: true,
//       user: userResult.rows[0]
//     });
//   } catch (error) {
//     console.error('Get profile error:', error);
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to get user profile' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Update user profile
// const updateProfile = async (req, res) => {
//   let client;
  
//   try {
//     client = await getClient();
//     await client.query('BEGIN');
    
//     const userId = req.user.id;
//     const { name, contact, email, location, district } = req.body;

//     // Validate input
//     if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ 
//         success: false,
//         error: 'Invalid email format' 
//       });
//     }

//     // Check if new email or contact already exists
//     if (email || contact) {
//       const existingUserResult = await client.query(
//         `SELECT id FROM users 
//          WHERE (email = $1 OR contact = $2) AND id != $3`,
//         [email, contact, userId]
//       );

//       if (existingUserResult.rows.length > 0) {
//         await client.query('ROLLBACK');
//         const existingUser = existingUserResult.rows[0];
//         const conflictField = existingUser.email === email ? 'email' : 'contact';
//         return res.status(409).json({ 
//           success: false,
//           error: `User with this ${conflictField} already exists` 
//         });
//       }
//     }

//     const updatedUserResult = await client.query(
//       `UPDATE users 
//        SET name = COALESCE($1, name),
//            contact = COALESCE($2, contact),
//            email = COALESCE($3, email),
//            location = COALESCE($4, location),
//            district = COALESCE($5, district),
//            updated_at = CURRENT_TIMESTAMP
//        WHERE id = $6
//        RETURNING id, name, contact, email, user_role, location, district, updated_at`,
//       [name, contact, email, location, district, userId]
//     );

//     await client.query('COMMIT');

//     return res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       user: updatedUserResult.rows[0]
//     });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Update profile error:', error);
    
//     if (error.code === '23505') {
//       return res.status(409).json({ 
//         success: false,
//         error: 'User with this email or contact already exists' 
//       });
//     }

//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to update profile' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Change password
// const newPassword = async (req, res) => {
//   let client;
  
//   try {
//     client = await getClient();
//     await client.query('BEGIN');
    
//     const userId = req.user.id;
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ 
//         success: false,
//         error: 'Current password and new password are required' 
//       });
//     }

//     if (newPassword.length < 8) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ 
//         success: false,
//         error: 'New password must be at least 8 characters long' 
//       });
//     }

//     const userResult = await client.query(
//       'SELECT password FROM users WHERE id = $1',
//       [userId]
//     );

//     if (userResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ 
//         success: false,
//         error: 'User not found' 
//       });
//     }

//     const user = userResult.rows[0];
//     const passwordMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!passwordMatch) {
//       await client.query('ROLLBACK');
//       return res.status(401).json({ 
//         success: false,
//         error: 'Current password is incorrect' 
//       });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
//     await client.query(
//       'UPDATE users SET password = $1 WHERE id = $2',
//       [hashedPassword, userId]
//     );

//     await client.query('COMMIT');

//     return res.json({ 
//       success: true,
//       message: 'Password changed successfully' 
//     });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Change password error:', error);
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to change password' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Admin: Get all users (paginated)
// const getUsers = async (req, res) => {
//   let client;
//   try {
//     // Check if user is admin
//     if (req.user.role !== UserRole.ADMIN) {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Unauthorized' 
//       });
//     }

//     client = await getClient();

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     const [usersResult, totalResult] = await Promise.all([
//       client.query(
//         `SELECT id, name, email, contact, user_role, location, district, created_at
//          FROM users 
//          ORDER BY created_at DESC 
//          LIMIT $1 OFFSET $2`,
//         [limit, offset]
//       ),
//       client.query('SELECT COUNT(*) FROM users')
//     ]);

//     const total = parseInt(totalResult.rows[0].count);

//     return res.json({
//       success: true,
//       users: usersResult.rows,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Get all users error:', error);
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to get users' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Admin: Get User by ID
// const getUserById = async (req, res) => {
//   let client;
//   try {
//     if (req.user.role !== UserRole.ADMIN) {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Unauthorized' 
//       });
//     }

//     client = await getClient();

//     const { id } = req.params;
//     const userResult = await client.query(
//       `SELECT id, name, email, contact, user_role, location, district, created_at, updated_at
//        FROM users WHERE id = $1`,
//       [id]
//     );

//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'User not found' 
//       });
//     }

//     return res.json({ 
//       success: true,
//       user: userResult.rows[0] 
//     });
//   } catch (error) {
//     console.error('Get user by ID error:', error);
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to get user' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Admin: Update user role
// const updatedUser = async (req, res) => {
//   let client;
//   try {
//     if (req.user.role !== UserRole.ADMIN) {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Unauthorized' 
//       });
//     }

//     client = await getClient();

//     const userId = req.params.id;
//     const { role } = req.body;

//     const normalizedRole = normalizeUserRole(role);
//     if (!normalizedRole) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Invalid role',
//         validRoles: Object.values(UserRole)
//       });
//     }

//     const updatedUserResult = await client.query(
//       `UPDATE users 
//        SET user_role = $1, updated_at = CURRENT_TIMESTAMP
//        WHERE id = $2
//        RETURNING id, name, email, user_role, updated_at`,
//       [normalizedRole, userId]
//     );

//     return res.json({
//       success: true,
//       message: 'User role updated successfully',
//       user: updatedUserResult.rows[0]
//     });
//   } catch (error) {
//     console.error('Update user role error:', error);
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to update user role' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Admin: Delete user
// const deleteUser = async (req, res) => {
//   let client;
//   try {
//     if (req.user.role !== UserRole.ADMIN) {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Unauthorized' 
//       });
//     }

//     client = await getClient();

//     const userId = req.params.id;
//     await client.query('DELETE FROM users WHERE id = $1', [userId]);

//     return res.json({ 
//       success: true,
//       message: 'User deleted successfully' 
//     });
//   } catch (error) {
//     console.error('Delete user error:', error);
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to delete user' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Request password reset
// const requestPasswordReset = async (req, res) => {
//   let client;
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Email is required' 
//       });
//     }

//     client = await getClient();

//     const userResult = await client.query(
//       'SELECT id FROM users WHERE email = $1',
//       [email]
//     );

//     if (userResult.rows.length === 0) {
//       // Don't reveal whether email exists for security
//       return res.json({ 
//         success: true,
//         message: 'If the email exists, a reset link has been sent' 
//       });
//     }

//     const user = userResult.rows[0];

//     // Generate reset token (expires in 1 hour)
//     const resetToken = jwt.sign(
//       { id: user.id, action: 'password_reset' },
//       JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     return res.json({ 
//       success: true,
//       message: 'Password reset link generated',
//       resetToken
//     });
//   } catch (error) {
//     console.error('Password reset request error:', error);
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to process reset request' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Reset password with token
// const resetPassword = async (req, res) => {
//   let client;
//   try {
//     const { token, newPassword } = req.body;

//     if (!token || !newPassword) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Token and new password are required' 
//       });
//     }

//     if (newPassword.length < 8) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'New password must be at least 8 characters long' 
//       });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, JWT_SECRET);
//     if (decoded.action !== 'password_reset') {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Invalid token' 
//       });
//     }

//     client = await getClient();

//     // Hash new password and update
//     const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
//     await client.query(
//       'UPDATE users SET password = $1 WHERE id = $2',
//       [hashedPassword, decoded.id]
//     );

//     return res.json({ 
//       success: true,
//       message: 'Password reset successfully' 
//     });
//   } catch (error) {
//     console.error('Password reset error:', error);
//     if (error instanceof jwt.TokenExpiredError) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Reset token has expired' 
//       });
//     }
//     if (error instanceof jwt.JsonWebTokenError) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Invalid token' 
//       });
//     }
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to reset password' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Get users by role (paginated)
// const getUsersByRole = async (req, res) => {
//   let client;
//   try {
//     const { role } = req.params;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     client = await getClient();

//     // Normalize role
//     const normalizedRole = normalizeUserRole(role);
//     if (!normalizedRole) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Invalid role' 
//       });
//     }

//     const [usersResult, totalResult] = await Promise.all([
//       client.query(
//         `SELECT id, name, email, user_role, created_at
//          FROM users 
//          WHERE user_role = $1
//          ORDER BY created_at DESC 
//          LIMIT $2 OFFSET $3`,
//         [normalizedRole, limit, offset]
//       ),
//       client.query(
//         'SELECT COUNT(*) FROM users WHERE user_role = $1',
//         [normalizedRole]
//       )
//     ]);

//     const total = parseInt(totalResult.rows[0].count);

//     return res.json({
//       success: true,
//       users: usersResult.rows,
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
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to get users by role' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Count users by role
// const countUsersByRole = async (req, res) => {
//   let client;
//   try {
//     client = await getClient();

//     const uniqueRoles = Object.values(UserRole);
//     const counts = await Promise.all(
//       uniqueRoles.map(async (role) => {
//         const countResult = await client.query(
//           'SELECT COUNT(*) FROM users WHERE user_role = $1',
//           [role]
//         );
//         return { role, count: parseInt(countResult.rows[0].count) };
//       })
//     );

//     return res.json({ 
//       success: true,
//       counts 
//     });
//   } catch (error) {
//     console.error('Count users by role error:', error);
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to count users by role' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// // Search users by role with optional filters
// const searchUsersByRole = async (req, res) => {
//   let client;
//   try {
//     const { role } = req.params;
//     const { query } = req.query;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     client = await getClient();

//     // Normalize role
//     const normalizedRole = normalizeUserRole(role);
//     if (!normalizedRole) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Invalid role' 
//       });
//     }

//     let whereClause = 'WHERE user_role = $1';
//     const params = [normalizedRole];

//     if (query) {
//       whereClause += ` AND (name ILIKE $2 OR email ILIKE $2 OR contact ILIKE $2)`;
//       params.push(`%${query}%`);
//     }

//     const [usersResult, totalResult] = await Promise.all([
//       client.query(
//         `SELECT id, name, email, contact, user_role, created_at
//          FROM users 
//          ${whereClause}
//          ORDER BY created_at DESC 
//          LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
//         [...params, limit, offset]
//       ),
//       client.query(
//         `SELECT COUNT(*) FROM users ${whereClause}`,
//         params
//       )
//     ]);

//     const total = parseInt(totalResult.rows[0].count);

//     return res.json({
//       success: true,
//       users: usersResult.rows,
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
    
//     if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
//       return res.status(503).json({ 
//         success: false,
//         error: 'Database connection issue. Please try again.'
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to search users' 
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// export {
//   register,
//   login,
//   getProfile,
//   updateProfile,
//   newPassword,
//   getUsers,
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
import { getClient } from '../../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// User roles - UPDATED to match frontend values
const UserRole = {
  ADMIN: 'admin',
  FARMER: 'farmer', 
  CUSTOMER: 'customer',
  SOLETRADER: 'soletrader',
  PASSIVETRADER: 'passivetrader',
  GUEST: 'guest'
};

// Role mapping for normalization - UPDATED to handle frontend values
const ROLE_MAPPING = {
  // Standard values (from frontend)
  'ADMIN': UserRole.ADMIN,
  'FARMER': UserRole.FARMER,
  'CUSTOMER': UserRole.CUSTOMER,
  'SOLETRADER': UserRole.SOLETRADER,
  'PASSIVETRADER': UserRole.PASSIVETRADER,
  'GUEST': UserRole.GUEST,
  
  // Frontend values (lowercase)
  'admin': UserRole.ADMIN,
  'farmer': UserRole.FARMER,
  'customer': UserRole.CUSTOMER,
  'soletrader': UserRole.SOLETRADER,
  'passivetrader': UserRole.PASSIVETRADER,
  'guest': UserRole.GUEST,
  
  // Legacy/alternative formats for backward compatibility
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
  
  let client;
  
  try {
    // Get database client with retry logic
    client = await getClient();
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
        success: false,
        error: 'Name, contact, email, password, and userRole are required',
        received: Object.keys(req.body)
      });
    }

    if (!finalEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    if (finalPassword.length < 8) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Normalize and validate userRole
    const normalizedRole = normalizeUserRole(finalUserRole);
    if (!normalizedRole) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
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
        success: false,
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
      success: true,
      message: 'User registered successfully',
      user: newUser,
      token
    });

  } catch (error) {
    console.error('💥 Registration error:', error);
    
    // Rollback transaction if client exists
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ 
        success: false,
        error: 'User with this email or contact already exists' 
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Internal server error during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  } finally {
    // Always release client back to pool
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
  }
};

// User login
const login = async (req, res) => {
  let client;
  try {
    const { contact, password } = req.body;

    if (!contact || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Contact and password are required' 
      });
    }

    client = await getClient();

    const userResult = await client.query(
      'SELECT * FROM users WHERE contact = $1',
      [contact]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
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
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'An error occurred during login'
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  let client;
  try {
    const userId = req.user.id;
    client = await getClient();

    const userResult = await client.query(
      `SELECT id, name, contact, email, user_role, location, district, created_at, updated_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    return res.json({
      success: true,
      user: userResult.rows[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to get user profile' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  let client;
  
  try {
    client = await getClient();
    await client.query('BEGIN');
    
    const userId = req.user.id;
    const { name, contact, email, location, district } = req.body;

    // Validate input
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
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
          success: false,
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
      success: true,
      message: 'Profile updated successfully',
      user: updatedUserResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update profile error:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        success: false,
        error: 'User with this email or contact already exists' 
      });
    }

    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to update profile' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Change password
const newPassword = async (req, res) => {
  let client;
  
  try {
    client = await getClient();
    await client.query('BEGIN');
    
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'New password must be at least 8 characters long' 
      });
    }

    const userResult = await client.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      await client.query('ROLLBACK');
      return res.status(401).json({ 
        success: false,
        error: 'Current password is incorrect' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await client.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    await client.query('COMMIT');

    return res.json({ 
      success: true,
      message: 'Password changed successfully' 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Change password error:', error);
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to change password' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Admin: Get all users (paginated)
const getUsers = async (req, res) => {
  let client;
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    client = await getClient();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [usersResult, totalResult] = await Promise.all([
      client.query(
        `SELECT id, name, email, contact, user_role, location, district, created_at
         FROM users 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      client.query('SELECT COUNT(*) FROM users')
    ]);

    const total = parseInt(totalResult.rows[0].count);

    return res.json({
      success: true,
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
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to get users' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Admin: Get User by ID
const getUserById = async (req, res) => {
  let client;
  try {
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    client = await getClient();

    const { id } = req.params;
    const userResult = await client.query(
      `SELECT id, name, email, contact, user_role, location, district, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    return res.json({ 
      success: true,
      user: userResult.rows[0] 
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to get user' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Admin: Update user role
const updatedUser = async (req, res) => {
  let client;
  try {
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    client = await getClient();

    const userId = req.params.id;
    const { role } = req.body;

    const normalizedRole = normalizeUserRole(role);
    if (!normalizedRole) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid role',
        validRoles: Object.values(UserRole)
      });
    }

    const updatedUserResult = await client.query(
      `UPDATE users 
       SET user_role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, user_role, updated_at`,
      [normalizedRole, userId]
    );

    return res.json({
      success: true,
      message: 'User role updated successfully',
      user: updatedUserResult.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to update user role' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
  let client;
  try {
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    client = await getClient();

    const userId = req.params.id;
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    return res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to delete user' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  let client;
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required' 
      });
    }

    client = await getClient();

    const userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal whether email exists for security
      return res.json({ 
        success: true,
        message: 'If the email exists, a reset link has been sent' 
      });
    }

    const user = userResult.rows[0];

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, action: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ 
      success: true,
      message: 'Password reset link generated',
      resetToken
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to process reset request' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  let client;
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false,
        error: 'New password must be at least 8 characters long' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.action !== 'password_reset') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }

    client = await getClient();

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await client.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, decoded.id]
    );

    return res.json({ 
      success: true,
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ 
        success: false,
        error: 'Reset token has expired' 
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to reset password' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Get users by role (paginated)
const getUsersByRole = async (req, res) => {
  let client;
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    client = await getClient();

    // Normalize role
    const normalizedRole = normalizeUserRole(role);
    if (!normalizedRole) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid role' 
      });
    }

    const [usersResult, totalResult] = await Promise.all([
      client.query(
        `SELECT id, name, email, user_role, created_at
         FROM users 
         WHERE user_role = $1
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [normalizedRole, limit, offset]
      ),
      client.query(
        'SELECT COUNT(*) FROM users WHERE user_role = $1',
        [normalizedRole]
      )
    ]);

    const total = parseInt(totalResult.rows[0].count);

    return res.json({
      success: true,
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
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to get users by role' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Count users by role
const countUsersByRole = async (req, res) => {
  let client;
  try {
    client = await getClient();

    const uniqueRoles = Object.values(UserRole);
    const counts = await Promise.all(
      uniqueRoles.map(async (role) => {
        const countResult = await client.query(
          'SELECT COUNT(*) FROM users WHERE user_role = $1',
          [role]
        );
        return { role, count: parseInt(countResult.rows[0].count) };
      })
    );

    return res.json({ 
      success: true,
      counts 
    });
  } catch (error) {
    console.error('Count users by role error:', error);
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to count users by role' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Search users by role with optional filters
const searchUsersByRole = async (req, res) => {
  let client;
  try {
    const { role } = req.params;
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    client = await getClient();

    // Normalize role
    const normalizedRole = normalizeUserRole(role);
    if (!normalizedRole) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid role' 
      });
    }

    let whereClause = 'WHERE user_role = $1';
    const params = [normalizedRole];

    if (query) {
      whereClause += ` AND (name ILIKE $2 OR email ILIKE $2 OR contact ILIKE $2)`;
      params.push(`%${query}%`);
    }

    const [usersResult, totalResult] = await Promise.all([
      client.query(
        `SELECT id, name, email, contact, user_role, created_at
         FROM users 
         ${whereClause}
         ORDER BY created_at DESC 
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
      client.query(
        `SELECT COUNT(*) FROM users ${whereClause}`,
        params
      )
    ]);

    const total = parseInt(totalResult.rows[0].count);

    return res.json({
      success: true,
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
    
    if (error.message.includes('Connection terminated') || error.code === 'ECONNRESET') {
      return res.status(503).json({ 
        success: false,
        error: 'Database connection issue. Please try again.'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Failed to search users' 
    });
  } finally {
    if (client) {
      client.release();
    }
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