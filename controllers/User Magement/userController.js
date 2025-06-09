import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();


const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Helper function to exclude fields from user object
function exclude(user, keys) {
  const result = { ...user };
  for (let key of keys) {
    delete result[key];
  }
  return result;
}

// Register a new user
const register = async(req, res)=> {
  try {
    const { name, contact, email, password, role } = req.body;

    // Validate input
    if (!name || !contact || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, contact, email, and password are required' 
      });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { contact }] }
    });

    if (existingUser) {
      const conflictField = existingUser.email === email ? 'email' : 'contact';
      return res.status(409).json({ 
        error: `User with this ${conflictField} already exists` 
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await prisma.user.create({
      data: {
        name,
        contact,
        email,
        password: hashedPassword,
        UserRole
      }
    });

    // Exclude password from response
    const userWithoutPassword = exclude(newUser, ['password']);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'An error occurred during registration' 
    });
  }
}

// User login
const login = async(req, res) => {
  try {
    const { contact, password } = req.body;

    if (!contact || !password) {
      return res.status(400).json({ 
        error: 'Contact and password are required' 
      });
    }

    const user = await prisma.user.findUnique({ where: { contact } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
    //Respond to cookies with token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: 'Strict',
      maxAge: JWT_EXPIRES_IN,
    });

    const userWithoutPassword = exclude(user, ['password']);

    return res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      // token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
}

// Get current user profile
const getProfile = async (req, res) =>{
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        contact: true,
        email: true,
        role: true,
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
const updateProfile = async (req, res) =>{
  try {
    const userId = req.user.id;
    const { name, contact, email } = req.body;

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
      data: { name, contact, email },
      select: {
        id: true,
        name: true,
        contact: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });

    return res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

// Change password
const newPassword = async (req, res) =>{
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
const getAllUsers= async(req, res)=> {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
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
          role: true,
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
    if (req.user.role !== UserRole.ADMIN) {
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
        role: true,
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
const updatedUser =  async (req, res)=> {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userId = req.params.id;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
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
const deleteUser = async (req, res)=> {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
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
const requestPasswordReset = async (req, res)=> {
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

    // In a real app, you would send an email with this token
    return res.json({ 
      message: 'Password reset link generated',
      resetToken // In production, remove this line and actually send email
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ error: 'Failed to process reset request' });
  }
}

// Reset password with token
const resetPassword = async (req, res)=> {
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
const getUsersByRole = async (req, res) =>{
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { role },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: { role } })
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

// Admin: Get user by ID


// Count users by role
const countUsersByRole = async (req, res)=> {
  try {
    const counts = await Promise.all(
      Object.values(UserRole).map(async (role) => {
        const count = await prisma.user.count({ where: { role } });
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
const searchUsersByRole = async (req, res)=> {
  try {
    const { role } = req.params;
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const where = { role };
    
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
          role: true,
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


export  {
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
  // countUsersByRole,
  searchUsersByRole
};
