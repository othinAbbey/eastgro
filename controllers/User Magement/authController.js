import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/database.js';

// Constants
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment variables");
}

// Helper function to exclude fields from user object
function exclude(user, keys) {
  const result = { ...user };
  for (let key of keys) {
    delete result[key];
  }
  return result;
}

// Main login function
export const login = async (req, res) => {
  let client;
  try {
    const { contact, password } = req.body;

    // Validation
    if (!contact || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Contact and password are required' 
      });
    }

    client = await pool.connect();

    // Find user in users table only
    const userResult = await client.query(
      `SELECT id, name, contact, email, password, user_role, location, district, created_at, updated_at
       FROM users 
       WHERE contact = $1`,
      [contact]
    );

    // No user found
    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    const user = userResult.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.user_role
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const userWithoutPassword = exclude(user, ['password']);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token: token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific database errors
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

// Logout function
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

// Verify token function
export const verifyToken = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get fresh user data from users table
    const userResult = await pool.query(
      `SELECT id, name, contact, email, user_role, location, district, created_at
       FROM users 
       WHERE id = $1`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        valid: true
      }
    });

  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Get current user profile function
export const getProfile = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user profile from users table
    const userResult = await pool.query(
      `SELECT id, name, contact, email, user_role, location, district, created_at, updated_at
       FROM users 
       WHERE id = $1`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(401).json({
      success: false,
      error: 'Invalid token or user not found'
    });
  }
};