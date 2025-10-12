
// // import bcrypt from 'bcrypt';
// // import jwt from 'jsonwebtoken';
// // import pkg from '@prisma/client';
// // const { PrismaClient, userRole } = pkg;
// // import dotenv from 'dotenv';
// // dotenv.config();

// // // Connection Pooling Manager
// // class PrismaManager {
// //   constructor() {
// //     this.prisma = null;
// //     this.isConnected = false;
// //     this.init();
// //   }

// //   init() {
// //     this.prisma = new PrismaClient({
// //       log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
// //       datasources: {
// //         db: {
// //           url: process.env.DATABASE_URL
// //         }
// //       }
// //     });
// //   }

// //   async connect() {
// //     if (this.isConnected) {
// //       return this.prisma;
// //     }

// //     try {
// //       // Test connection
// //       await this.prisma.$queryRaw`SELECT 1`;
// //       this.isConnected = true;
// //       console.log('✅ Database connected with connection pooling');
// //       return this.prisma;
// //     } catch (error) {
// //       console.error('❌ Database connection failed:', error);
// //       throw error;
// //     }
// //   }

// //   async query(callback, retries = 3) {
// //     let lastError;
    
// //     for (let attempt = 1; attempt <= retries; attempt++) {
// //       try {
// //         const prisma = await this.connect();
// //         return await callback(prisma);
// //       } catch (error) {
// //         lastError = error;
// //         console.error(`Query attempt ${attempt} failed:`, error.message);
        
// //         if (this.shouldRetry(error) && attempt < retries) {
// //           console.log(`Retrying... (${retries - attempt} attempts left)`);
// //           await this.handleReconnect();
// //           await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
// //           continue;
// //         }
// //         break;
// //       }
// //     }
    
// //     throw lastError;
// //   }

// //   shouldRetry(error) {
// //     const retryableErrors = [
// //       'P1001', // Can't reach database server
// //       'P1002', // Connection timeout
// //       'P1003', // Database does not exist
// //       'P1008', // Operations timed out
// //       'P1011', // Error opening a TLS connection
// //       'P1017', // Server has closed the connection
// //     ];
    
// //     return retryableErrors.includes(error.code) || 
// //            error.message.includes('connection') ||
// //            error.message.includes('closed');
// //   }

// //   async handleReconnect() {
// //     try {
// //       await this.prisma.$disconnect();
// //     } catch (error) {
// //       console.error('Error during disconnect:', error);
// //     }
    
// //     this.isConnected = false;
// //     this.init();
// //   }

// //   async disconnect() {
// //     try {
// //       await this.prisma.$disconnect();
// //       this.isConnected = false;
// //       console.log('📭 Database disconnected');
// //     } catch (error) {
// //       console.error('Error during disconnect:', error);
// //     }
// //   }
// // }

// // // Initialize connection manager
// // const dbManager = new PrismaManager();

// // const SALT_ROUNDS = 10;
// // const JWT_SECRET = process.env.JWT_SECRET;
// // const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// // // Helper function to exclude fields from user object
// // function exclude(user, keys) {
// //   const result = { ...user };
// //   for (let key of keys) {
// //     delete result[key];
// //   }
// //   return result;
// // }

// // // Register a new user
// // // const register = async (req, res) => {
// // //   try {
// // //     const { name, contact, email, password, userRole, location, district } = req.body;

// // //     // Validate input
// // //     if (!name || !contact || !email || !password || !userRole) {
// // //       return res.status(400).json({ 
// // //         error: 'Name, contact, email, password, and userRole are required' 
// // //       });
// // //     }

// // //     if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
// // //       return res.status(400).json({ error: 'Invalid email format' });
// // //     }

// // //     if (password.length < 8) {
// // //       return res.status(400).json({ 
// // //         error: 'Password must be at least 8 characters long' 
// // //       });
// // //     }

// // //     // Use connection pooling with retry logic
// // //     const result = await dbManager.query(async (prisma) => {
// // //       // Check for existing user
// // //       const existingUser = await prisma.user.findFirst({
// // //         where: { OR: [{ email }, { contact }] }
// // //       });

// // //       if (existingUser) {
// // //         const conflictField = existingUser.email === email ? 'email' : 'contact';
// // //         throw new Error(`USER_EXISTS_${conflictField}`);
// // //       }

// // //       // Hash password and create user
// // //       const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
// // //       const newUser = await prisma.user.create({
// // //         data: {
// // //           name,
// // //           contact,
// // //           email,
// // //           password: hashedPassword,
// // //           userRole,
// // //           location: location || null,
// // //           district: district || null
// // //         }
// // //       });

// // //       // Exclude password from response
// // //       const userWithoutPassword = exclude(newUser, ['password']);

// // //       // Generate JWT token
// // //       const token = jwt.sign(
// // //         { id: newUser.id, role: newUser.userRole }, 
// // //         JWT_SECRET, 
// // //         { expiresIn: JWT_EXPIRES_IN }
// // //       );

// // //       return { user: userWithoutPassword, token };
// // //     });

// // //     return res.status(201).json({
// // //       message: 'User registered successfully',
// // //       user: result.user,
// // //       token: result.token
// // //     });

// // //   } catch (error) {
// // //     console.error('Registration error:', error);
    
// // //     if (error.message.startsWith('USER_EXISTS_')) {
// // //       const field = error.message.replace('USER_EXISTS_', '');
// // //       return res.status(409).json({ 
// // //         error: `User with this ${field} already exists` 
// // //       });
// // //     }

// // //     if (error.code === 'P1001' || error.code === 'P1017') {
// // //       return res.status(503).json({ 
// // //         error: 'Database service temporarily unavailable. Please try again.' 
// // //       });
// // //     }

// // //     return res.status(500).json({ 
// // //       error: 'An error occurred during registration' 
// // //     });
// // //   }
// // // }
// // const register = async (req, res) => {
// //   try {
// //     // Handle case-insensitive field names
// //     const { 
// //       name, Name,
// //       contact, Contact, 
// //       email, Email,
// //       password, Password,
// //       userRole, UserRole, userrole,
// //       location, Location,
// //       district, District
// //     } = req.body;

// //     // Normalize field names (use camelCase if provided, fallback to other cases)
// //     const normalizedData = {
// //       name: name || Name,
// //       contact: contact || Contact,
// //       email: email || Email,
// //       password: password || Password,
// //       userRole: userRole || UserRole || userrole,
// //       location: location || Location,
// //       district: district || District
// //     };

// //     const { name: finalName, contact: finalContact, email: finalEmail, password: finalPassword, userRole: finalUserRole, location: finalLocation, district: finalDistrict } = normalizedData;

// //     // Validate input
// //     if (!finalName || !finalContact || !finalEmail || !finalPassword || !finalUserRole) {
// //       return res.status(400).json({ 
// //         error: 'Name, contact, email, password, and userRole are required',
// //         received: normalizedData // This helps debug what was actually received
// //       });
// //     }

// //     if (!finalEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
// //       return res.status(400).json({ error: 'Invalid email format' });
// //     }

// //     if (finalPassword.length < 8) {
// //       return res.status(400).json({ 
// //         error: 'Password must be at least 8 characters long' 
// //       });
// //     }

// //     // Use connection pooling with retry logic
// //     const result = await dbManager.query(async (prisma) => {
// //       // Check for existing user
// //       const existingUser = await prisma.user.findFirst({
// //         where: { OR: [{ email: finalEmail }, { contact: finalContact }] }
// //       });

// //       if (existingUser) {
// //         const conflictField = existingUser.email === finalEmail ? 'email' : 'contact';
// //         throw new Error(`USER_EXISTS_${conflictField}`);
// //       }

// //       // Hash password and create user
// //       const hashedPassword = await bcrypt.hash(finalPassword, SALT_ROUNDS);
// //       const newUser = await prisma.user.create({
// //         data: {
// //           name: finalName,
// //           contact: finalContact,
// //           email: finalEmail,
// //           password: hashedPassword,
// //           userRole: finalUserRole,
// //           location: finalLocation || null,
// //           district: finalDistrict || null
// //         }
// //       });

// //       // Exclude password from response
// //       const userWithoutPassword = exclude(newUser, ['password']);

// //       // Generate JWT token
// //       const token = jwt.sign(
// //         { id: newUser.id, role: newUser.userRole }, 
// //         JWT_SECRET, 
// //         { expiresIn: JWT_EXPIRES_IN }
// //       );

// //       return { user: userWithoutPassword, token };
// //     });

// //     return res.status(201).json({
// //       message: 'User registered successfully',
// //       user: result.user,
// //       token: result.token
// //     });

// //   } catch (error) {
// //     console.error('Registration error:', error);
    
// //     if (error.message.startsWith('USER_EXISTS_')) {
// //       const field = error.message.replace('USER_EXISTS_', '');
// //       return res.status(409).json({ 
// //         error: `User with this ${field} already exists` 
// //       });
// //     }

// //     if (error.code === 'P1001' || error.code === 'P1017') {
// //       return res.status(503).json({ 
// //         error: 'Database service temporarily unavailable. Please try again.' 
// //       });
// //     }

// //     return res.status(500).json({ 
// //       error: 'An error occurred during registration' 
// //     });
// //   }
// // }
// // // User login
// // const login = async (req, res) => {
// //   try {
// //     const { contact, password } = req.body;

// //     if (!contact || !password) {
// //       return res.status(400).json({ 
// //         error: 'Contact and password are required' 
// //       });
// //     }

// //     const result = await dbManager.query(async (prisma) => {
// //       const user = await prisma.user.findUnique({ where: { contact } });
// //       if (!user) {
// //         throw new Error('USER_NOT_FOUND');
// //       }

// //       const passwordMatch = await bcrypt.compare(password, user.password);
// //       if (!passwordMatch) {
// //         throw new Error('INVALID_PASSWORD');
// //       }

// //       const token = jwt.sign(
// //         { id: user.id, role: user.userRole }, 
// //         JWT_SECRET, 
// //         { expiresIn: JWT_EXPIRES_IN }
// //       );

// //       const userWithoutPassword = exclude(user, ['password']);

// //       return { user: userWithoutPassword, token };
// //     });

// //     // Respond to cookies with token
// //     res.cookie('token', result.token, {
// //       httpOnly: true,
// //       secure: process.env.NODE_ENV === 'production',
// //       sameSite: 'Strict',
// //       maxAge: 24 * 60 * 60 * 1000, // 24 hours
// //     });

// //     return res.json({
// //       message: 'Login successful',
// //       user: result.user,
// //     });

// //   } catch (error) {
// //     console.error('Login error:', error);
    
// //     if (error.message === 'USER_NOT_FOUND' || error.message === 'INVALID_PASSWORD') {
// //       return res.status(401).json({ error: 'Invalid credentials' });
// //     }

// //     if (error.code === 'P1001' || error.code === 'P1017') {
// //       return res.status(503).json({ 
// //         error: 'Database service temporarily unavailable. Please try again.' 
// //       });
// //     }

// //     return res.status(500).json({ error: 'An error occurred during login' });
// //   }
// // }

// // // Get current user profile
// // const getProfile = async (req, res) => {
// //   try {
// //     const userId = req.user.id;

// //     const user = await dbManager.query(async (prisma) => {
// //       return await prisma.user.findUnique({
// //         where: { id: userId },
// //         select: {
// //           id: true,
// //           name: true,
// //           contact: true,
// //           email: true,
// //           userRole: true,
// //           location: true,
// //           district: true,
// //           createdAt: true,
// //           updatedAt: true
// //         }
// //       });
// //     });

// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found' });
// //     }

// //     return res.json(user);
// //   } catch (error) {
// //     console.error('Get profile error:', error);
    
// //     if (error.code === 'P1001' || error.code === 'P1017') {
// //       return res.status(503).json({ 
// //         error: 'Database service temporarily unavailable. Please try again.' 
// //       });
// //     }

// //     return res.status(500).json({ error: 'Failed to get user profile' });
// //   }
// // }

// // // Update user profile
// // const updateProfile = async (req, res) => {
// //   try {
// //     const userId = req.user.id;
// //     const { name, contact, email, location, district } = req.body;

// //     // Validate input
// //     if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
// //       return res.status(400).json({ error: 'Invalid email format' });
// //     }

// //     const updatedUser = await dbManager.query(async (prisma) => {
// //       // Check if new email or contact already exists
// //       if (email || contact) {
// //         const existingUser = await prisma.user.findFirst({
// //           where: {
// //             AND: [
// //               { id: { not: userId } },
// //               { OR: [{ email }, { contact }] }
// //             ]
// //           }
// //         });

// //         if (existingUser) {
// //           const conflictField = existingUser.email === email ? 'email' : 'contact';
// //           throw new Error(`USER_EXISTS_${conflictField}`);
// //         }
// //       }

// //       return await prisma.user.update({
// //         where: { id: userId },
// //         data: { name, contact, email, location, district },
// //         select: {
// //           id: true,
// //           name: true,
// //           contact: true,
// //           email: true,
// //           userRole: true,
// //           location: true,
// //           district: true,
// //           updatedAt: true
// //         }
// //       });
// //     });

// //     return res.json({
// //       message: 'Profile updated successfully',
// //       user: updatedUser
// //     });
// //   } catch (error) {
// //     console.error('Update profile error:', error);
    
// //     if (error.message.startsWith('USER_EXISTS_')) {
// //       const field = error.message.replace('USER_EXISTS_', '');
// //       return res.status(409).json({ 
// //         error: `User with this ${field} already exists` 
// //       });
// //     }

// //     if (error.code === 'P1001' || error.code === 'P1017') {
// //       return res.status(503).json({ 
// //         error: 'Database service temporarily unavailable. Please try again.' 
// //       });
// //     }

// //     return res.status(500).json({ error: 'Failed to update profile' });
// //   }
// // }

// // // Change password
// // const newPassword = async (req, res) => {
// //   try {
// //     const userId = req.user.id;
// //     const { currentPassword, newPassword } = req.body;

// //     if (!currentPassword || !newPassword) {
// //       return res.status(400).json({ 
// //         error: 'Current password and new password are required' 
// //       });
// //     }

// //     if (newPassword.length < 8) {
// //       return res.status(400).json({ 
// //         error: 'New password must be at least 8 characters long' 
// //       });
// //     }

// //     await dbManager.query(async (prisma) => {
// //       const user = await prisma.user.findUnique({ where: { id: userId } });
// //       if (!user) {
// //         throw new Error('USER_NOT_FOUND');
// //       }

// //       const passwordMatch = await bcrypt.compare(currentPassword, user.password);
// //       if (!passwordMatch) {
// //         throw new Error('INVALID_CURRENT_PASSWORD');
// //       }

// //       const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
// //       await prisma.user.update({
// //         where: { id: userId },
// //         data: { password: hashedPassword }
// //       });
// //     });

// //     return res.json({ message: 'Password changed successfully' });
// //   } catch (error) {
// //     console.error('Change password error:', error);
    
// //     if (error.message === 'USER_NOT_FOUND') {
// //       return res.status(404).json({ error: 'User not found' });
// //     }

// //     if (error.message === 'INVALID_CURRENT_PASSWORD') {
// //       return res.status(401).json({ error: 'Current password is incorrect' });
// //     }

// //     if (error.code === 'P1001' || error.code === 'P1017') {
// //       return res.status(503).json({ 
// //         error: 'Database service temporarily unavailable. Please try again.' 
// //       });
// //     }

// //     return res.status(500).json({ error: 'Failed to change password' });
// //   }
// // }

// // // Admin: Get all users (paginated)
// // const getAllUsers = async (req, res) => {
// //   try {
// //     // Check if user is admin
// //     if (req.user.userRole !== userRole.ADMIN) {
// //       return res.status(403).json({ error: 'Unauthorized' });
// //     }

// //     const page = parseInt(req.query.page) || 1;
// //     const limit = parseInt(req.query.limit) || 10;
// //     const skip = (page - 1) * limit;

// //     const result = await dbManager.query(async (prisma) => {
// //       const [users, total] = await Promise.all([
// //         prisma.user.findMany({
// //           skip,
// //           take: limit,
// //           select: {
// //             id: true,
// //             name: true,
// //             email: true,
// //             contact: true,
// //             userRole: true,
// //             location: true,
// //             district: true,
// //             createdAt: true
// //           },
// //           orderBy: { createdAt: 'desc' }
// //         }),
// //         prisma.user.count()
// //       ]);

// //       return { users, total };
// //     });

// //     return res.json({
// //       users: result.users,
// //       meta: {
// //         total: result.total,
// //         page,
// //         limit,
// //         totalPages: Math.ceil(result.total / limit)
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Get all users error:', error);
    
// //     if (error.code === 'P1001' || error.code === 'P1017') {
// //       return res.status(503).json({ 
// //         error: 'Database service temporarily unavailable. Please try again.' 
// //       });
// //     }

// //     return res.status(500).json({ error: 'Failed to get users' });
// //   }
// // }
// // // Admin: Get User by ID
// // const getUserById = async (req, res) => {
// //   try {
// //     if (req.user.role !== userRole.ADMIN) {
// //       return res.status(403).json({ error: 'Unauthorized' });
// //     }

// //     const { id } = req.params;
// //     const user = await prisma.user.findUnique({
// //       where: { id },
// //       select: {
// //         id: true,
// //         name: true,
// //         email: true,
// //         contact: true,
// //         role: true,
// //         createdAt: true,
// //         updatedAt: true
// //       }
// //     });

// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found' });
// //     }

// //     return res.json({ user });
// //   } catch (error) {
// //     console.error('Get user by ID error:', error);
// //     return res.status(500).json({ error: 'Failed to get user' });
// //   }
// // }
// // // Admin: Update user role
// // const updatedUser =  async (req, res)=> {
// //   try {
// //     // Check if user is admin
// //     if (req.user.role !== userRole.ADMIN) {
// //       return res.status(403).json({ error: 'Unauthorized' });
// //     }

// //     const userId = req.params.id;
// //     const { role } = req.body;

// //     if (!Object.values(userRole).includes(role)) {
// //       return res.status(400).json({ error: 'Invalid role' });
// //     }

// //     const updatedUser = await prisma.user.update({
// //       where: { id: userId },
// //       data: { role },
// //       select: {
// //         id: true,
// //         name: true,
// //         email: true,
// //         role: true,
// //         updatedAt: true
// //       }
// //     });

// //     return res.json({
// //       message: 'User role updated successfully',
// //       user: updatedUser
// //     });
// //   } catch (error) {
// //     console.error('Update user role error:', error);
// //     return res.status(500).json({ error: 'Failed to update user role' });
// //   }
// // }

// // // Admin: Delete user
// // const deleteUser = async (req, res)=> {
// //   try {
// //     // Check if user is admin
// //     if (req.user.role !== userRole.ADMIN) {
// //       return res.status(403).json({ error: 'Unauthorized' });
// //     }

// //     const userId = req.params.id;
// //     await prisma.user.delete({ where: { id: userId } });

// //     return res.json({ message: 'User deleted successfully' });
// //   } catch (error) {
// //     console.error('Delete user error:', error);
// //     return res.status(500).json({ error: 'Failed to delete user' });
// //   }
// // }

// // // Request password reset
// // const requestPasswordReset = async (req, res)=> {
// //   try {
// //     const { email } = req.body;
// //     if (!email) {
// //       return res.status(400).json({ error: 'Email is required' });
// //     }

// //     const user = await prisma.user.findUnique({ where: { email } });
// //     if (!user) {
// //       // Don't reveal whether email exists for security
// //       return res.json({ message: 'If the email exists, a reset link has been sent' });
// //     }

// //     // Generate reset token (expires in 1 hour)
// //     const resetToken = jwt.sign(
// //       { id: user.id, action: 'password_reset' },
// //       JWT_SECRET,
// //       { expiresIn: '1h' }
// //     );

// //     // In a real app, you would send an email with this token
// //     return res.json({ 
// //       message: 'Password reset link generated',
// //       resetToken // In production, remove this line and actually send email
// //     });
// //   } catch (error) {
// //     console.error('Password reset request error:', error);
// //     return res.status(500).json({ error: 'Failed to process reset request' });
// //   }
// // }

// // // Reset password with token
// // const resetPassword = async (req, res)=> {
// //   try {
// //     const { token, newPassword } = req.body;

// //     if (!token || !newPassword) {
// //       return res.status(400).json({ 
// //         error: 'Token and new password are required' 
// //       });
// //     }

// //     if (newPassword.length < 8) {
// //       return res.status(400).json({ 
// //         error: 'New password must be at least 8 characters long' 
// //       });
// //     }

// //     // Verify token
// //     const decoded = jwt.verify(token, JWT_SECRET);
// //     if (decoded.action !== 'password_reset') {
// //       return res.status(400).json({ error: 'Invalid token' });
// //     }

// //     // Hash new password and update
// //     const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
// //     await prisma.user.update({
// //       where: { id: decoded.id },
// //       data: { password: hashedPassword }
// //     });

// //     return res.json({ message: 'Password reset successfully' });
// //   } catch (error) {
// //     console.error('Password reset error:', error);
// //     if (error instanceof jwt.TokenExpiredError) {
// //       return res.status(400).json({ error: 'Reset token has expired' });
// //     }
// //     if (error instanceof jwt.JsonWebTokenError) {
// //       return res.status(400).json({ error: 'Invalid token' });
// //     }
// //     return res.status(500).json({ error: 'Failed to reset password' });
// //   }
// // }

// // // Get users by role (paginated)
// // const getUsersByRole = async (req, res) =>{
// //   try {
// //     const { role } = req.params;
// //     const page = parseInt(req.query.page) || 1;
// //     const limit = parseInt(req.query.limit) || 10;
// //     const skip = (page - 1) * limit;

// //     // Validate role
// //     if (!Object.values(userRole).includes(role)) {
// //       return res.status(400).json({ error: 'Invalid role' });
// //     }

// //     const [users, total] = await Promise.all([
// //       prisma.user.findMany({
// //         where: { role },
// //         skip,
// //         take: limit,
// //         select: {
// //           id: true,
// //           name: true,
// //           email: true,
// //           role: true,
// //           createdAt: true
// //         },
// //         orderBy: { createdAt: 'desc' }
// //       }),
// //       prisma.user.count({ where: { role } })
// //     ]);

// //     return res.json({
// //       users,
// //       meta: {
// //         total,
// //         page,
// //         limit,
// //         totalPages: Math.ceil(total / limit),
// //         role
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Get users by role error:', error);
// //     return res.status(500).json({ error: 'Failed to get users by role' });
// //   }
// // }

// // // Admin: Get user by ID


// // // Count users by role
// // const countUsersByRole = async (req, res)=> {
// //   try {
// //     const counts = await Promise.all(
// //       Object.values(userRole).map(async (role) => {
// //         const count = await prisma.user.count({ where: { role } });
// //         return { role, count };
// //       })
// //     );

// //     return res.json({ counts });
// //   } catch (error) {
// //     console.error('Count users by role error:', error);
// //     return res.status(500).json({ error: 'Failed to count users by role' });
// //   }
// // }

// // // Search users by role with optional filters
// // const searchUsersByRole = async (req, res)=> {
// //   try {
// //     const { role } = req.params;
// //     const { query } = req.query;
// //     const page = parseInt(req.query.page) || 1;
// //     const limit = parseInt(req.query.limit) || 10;
// //     const skip = (page - 1) * limit;

// //     // Validate role
// //     if (!Object.values(userRole).includes(role)) {
// //       return res.status(400).json({ error: 'Invalid role' });
// //     }

// //     const where = { role };
    
// //     if (query) {
// //       where.OR = [
// //         { name: { contains: query, mode: 'insensitive' } },
// //         { email: { contains: query, mode: 'insensitive' } },
// //         { contact: { contains: query, mode: 'insensitive' } }
// //       ];
// //     }

// //     const [users, total] = await Promise.all([
// //       prisma.user.findMany({
// //         where,
// //         skip,
// //         take: limit,
// //         select: {
// //           id: true,
// //           name: true,
// //           email: true,
// //           contact: true,
// //           role: true,
// //           createdAt: true
// //         },
// //         orderBy: { createdAt: 'desc' }
// //       }),
// //       prisma.user.count({ where })
// //     ]);

// //     return res.json({
// //       users,
// //       meta: {
// //         total,
// //         page,
// //         limit,
// //         totalPages: Math.ceil(total / limit),
// //         role,
// //         query: query || null
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Search users by role error:', error);
// //     return res.status(500).json({ error: 'Failed to search users' });
// //   }
// // }


// // // Initialize connection on startup
// // dbManager.connect().catch(console.error);

// // // Graceful shutdown
// // process.on('SIGINT', async () => {
// //   console.log('🛑 Shutting down gracefully...');
// //   await dbManager.disconnect();
// //   process.exit(0);
// // });

// // process.on('SIGTERM', async () => {
// //   console.log('🛑 Received SIGTERM, shutting down...');
// //   await dbManager.disconnect();
// //   process.exit(0);
// // });

// // export {
// //   register,
// //   login,
// //   getProfile,
// //   updateProfile,
// //   newPassword,
// //   getAllUsers,
// //   getUserById,
// //   updatedUser,
// //   deleteUser,
// //   requestPasswordReset,
// //   resetPassword,
// //   getUsersByRole,
// //   countUsersByRole,
// //   searchUsersByRole
// // };

// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { PrismaClient, UserRole } from '@prisma/client';
// import dotenv from 'dotenv';

// dotenv.config();

// // Simple Prisma client - NO connection manager, NO connection testing
// const prisma = new PrismaClient({
//   log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
// });

// const SALT_ROUNDS = 10;
// const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

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
//   console.log('📨 Registration request received');
  
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

//     // Validate userRole
//     const validRoles = Object.values(UserRole);
//     if (!validRoles.includes(finalUserRole.toUpperCase())) {
//       return res.status(400).json({
//         error: 'Invalid userRole',
//         validRoles,
//         received: finalUserRole
//       });
//     }

//     console.log('✅ Validation passed, checking existing user...');

//     // DIRECT Prisma call - no wrapper
//     const existingUser = await prisma.user.findFirst({
//       where: { 
//         OR: [
//           { email: finalEmail.toLowerCase() },
//           { contact: finalContact }
//         ]
//       }
//     });

//     if (existingUser) {
//       console.log('❌ User already exists');
//       const conflictField = existingUser.email === finalEmail.toLowerCase() ? 'email' : 'contact';
//       return res.status(409).json({ 
//         error: `User with this ${conflictField} already exists` 
//       });
//     }

//     console.log('✅ No existing user found, creating user...');

//     // Hash password and create user - DIRECT Prisma call
//     const hashedPassword = await bcrypt.hash(finalPassword, SALT_ROUNDS);
    
//     const newUser = await prisma.user.create({
//       data: {
//         name: finalName,
//         contact: finalContact,
//         email: finalEmail.toLowerCase(),
//         password: hashedPassword,
//         userRole: finalUserRole.toUpperCase(),
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
//     if (email || contact) {
//       const existingUser = await prisma.user.findFirst({
//         where: {
//           AND: [
//             { id: { not: userId } },
//             { OR: [{ email }, { contact }] }
//           ]
//         }
//       });

//       if (existingUser) {
//         const conflictField = existingUser.email === email ? 'email' : 'contact';
//         return res.status(409).json({ 
//           error: `User with this ${conflictField} already exists` 
//         });
//       }
//     }

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

//     if (!Object.values(UserRole).includes(role)) {
//       return res.status(400).json({ error: 'Invalid role' });
//     }

//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: { userRole: role },
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

//     // Validate role
//     if (!Object.values(UserRole).includes(role)) {
//       return res.status(400).json({ error: 'Invalid role' });
//     }

//     const [users, total] = await Promise.all([
//       prisma.user.findMany({
//         where: { userRole: role },
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
//       prisma.user.count({ where: { userRole: role } })
//     ]);

//     return res.json({
//       users,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//         role
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
//     const counts = await Promise.all(
//       Object.values(UserRole).map(async (role) => {
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

//     // Validate role
//     if (!Object.values(UserRole).includes(role)) {
//       return res.status(400).json({ error: 'Invalid role' });
//     }

//     const where = { userRole: role };
    
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
//         role,
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
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Simple Prisma client - NO connection manager, NO connection testing
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Define valid roles manually since UserRole import is failing
const VALID_ROLES = ['ADMIN', 'FARMER', 'CUSTOMER', 'SOLE_TRADER', 'PASSIVE_TRADER', 'GUEST', 'EXPERT'];

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
  
  try {
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
      return res.status(400).json({ 
        error: 'Name, contact, email, password, and userRole are required',
        received: Object.keys(req.body)
      });
    }

    if (!finalEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (finalPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Validate userRole using our manual list
    const upperCaseRole = finalUserRole.toUpperCase();
    if (!VALID_ROLES.includes(upperCaseRole)) {
      return res.status(400).json({
        error: 'Invalid userRole',
        validRoles: VALID_ROLES,
        received: finalUserRole
      });
    }

    console.log('✅ Validation passed, checking existing user...');

    // DIRECT Prisma call - no wrapper
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: finalEmail.toLowerCase() },
          { contact: finalContact }
        ]
      }
    });

    if (existingUser) {
      console.log('❌ User already exists');
      const conflictField = existingUser.email === finalEmail.toLowerCase() ? 'email' : 'contact';
      return res.status(409).json({ 
        error: `User with this ${conflictField} already exists` 
      });
    }

    console.log('✅ No existing user found, creating user...');

    // Hash password and create user - DIRECT Prisma call
    const hashedPassword = await bcrypt.hash(finalPassword, SALT_ROUNDS);
    
    const newUser = await prisma.user.create({
      data: {
        name: finalName,
        contact: finalContact,
        email: finalEmail.toLowerCase(),
        password: hashedPassword,
        userRole: upperCaseRole,
        location: finalLocation || null,
        district: finalDistrict || null
      }
    });

    console.log('✅ User created successfully:', newUser.id);

    // Exclude password from response
    const userWithoutPassword = exclude(newUser, ['password']);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.userRole }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('🎉 Registration completed successfully');

    return res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('💥 Registration error:', error);
    console.error('💥 Error code:', error.code);
    console.error('💥 Error message:', error.message);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'User with this email or contact already exists' 
      });
    }
    
    if (error.code === 'P1001' || error.code === 'P1017') {
      return res.status(503).json({ 
        error: 'Database service temporarily unavailable. Please try again.' 
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
}

// User login
const login = async (req, res) => {
  try {
    const { contact, password } = req.body;

    if (!contact || !password) {
      return res.status(400).json({ 
        error: 'Contact and password are required' 
      });
    }

    // DIRECT Prisma call
    const user = await prisma.user.findUnique({ 
      where: { contact } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.userRole }, 
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
}

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        contact: true,
        email: true,
        userRole: true,
        location: true,
        district: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Failed to get user profile' });
  }
}

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, contact, email, location, district } = req.body;

    // Validate input
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if new email or contact already exists
    if (email || contact) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            { OR: [{ email }, { contact }] }
          ]
        }
      });

      if (existingUser) {
        const conflictField = existingUser.email === email ? 'email' : 'contact';
        return res.status(409).json({ 
          error: `User with this ${conflictField} already exists` 
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, contact, email, location, district },
      select: {
        id: true,
        name: true,
        contact: true,
        email: true,
        userRole: true,
        location: true,
        district: true,
        updatedAt: true
      }
    });

    return res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'User with this email or contact already exists' 
      });
    }

    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

// Change password
const newPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters long' 
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
}

// Admin: Get all users (paginated)
const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          contact: true,
          userRole: true,
          location: true,
          district: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    return res.json({
      users,
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
}

// Admin: Get User by ID
const getUserById = async (req, res) => {
  try {
    if (req.user.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        contact: true,
        userRole: true,
        location: true,
        district: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ error: 'Failed to get user' });
  }
}

// Admin: Update user role
const updatedUser = async (req, res) => {
  try {
    if (req.user.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userId = req.params.id;
    const { role } = req.body;

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { userRole: role },
      select: {
        id: true,
        name: true,
        email: true,
        userRole: true,
        updatedAt: true
      }
    });

    return res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
}

// Admin: Delete user
const deleteUser = async (req, res) => {
  try {
    if (req.user.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userId = req.params.id;
    await prisma.user.delete({ where: { id: userId } });

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists for security
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

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
}

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
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

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
}

// Get users by role (paginated)
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { userRole: role },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          userRole: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: { userRole: role } })
    ]);

    return res.json({
      users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        role
      }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    return res.status(500).json({ error: 'Failed to get users by role' });
  }
}

// Count users by role
const countUsersByRole = async (req, res) => {
  try {
    const counts = await Promise.all(
      VALID_ROLES.map(async (role) => {
        const count = await prisma.user.count({ where: { userRole: role } });
        return { role, count };
      })
    );

    return res.json({ counts });
  } catch (error) {
    console.error('Count users by role error:', error);
    return res.status(500).json({ error: 'Failed to count users by role' });
  }
}

// Search users by role with optional filters
const searchUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const where = { userRole: role };
    
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { contact: { contains: query, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          contact: true,
          userRole: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return res.json({
      users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        role,
        query: query || null
      }
    });
  } catch (error) {
    console.error('Search users by role error:', error);
    return res.status(500).json({ error: 'Failed to search users' });
  }
}

export {
  register,
  login,
  getProfile,
  updateProfile,
  newPassword,
  getAllUsers,
  getUserById,
  updatedUser,
  deleteUser,
  requestPasswordReset,
  resetPassword,
  getUsersByRole,
  countUsersByRole,
  searchUsersByRole
};