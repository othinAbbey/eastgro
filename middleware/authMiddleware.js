import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

/**
 * Middleware to authenticate user via JWT token.
 * Looks for token in cookies or Authorization header.
 */
export const authenticateUser = (req, res, next) => {
  let token = null;

  // From cookies
  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // From Authorization header
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token found
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'No token provided. Please log in.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to req
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      error: 'Invalid or expired token.' 
    });
  }
};

/**
 * Middleware to check if user has the required roles.
 * @param  {...string} roles - List of allowed roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

/**
 * Admin-only shortcut middleware
 */
export const requireAdmin = restrictTo('admin');

/**
 * General middleware to protect routes (useful placeholder for basic auth check)
 */
/**
 * Enhanced protection middleware with request logging
 */
export const protect = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Optional: Log access attempts
  console.log(`Protected route accessed by user ${req.user.id} at ${new Date().toISOString()}`);

  // Optional: Check if user account is active
  if (req.user.status === 'suspended') {
    return res.status(403).json({
      success: false,
      error: 'Account suspended. Please contact support.'
    });
  }

  next();
};
/**
 * Rate limiting middleware for authentication routes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (corrected from 150 * 600 * 10000)
  max: 100, // limit each IP to 100 requests per windowMs
  message: { 
    success: false,
    error: 'Too many authentication attempts from this IP. Please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Alternative authentication middleware (similar to authenticateUser but with different response format)
 */
export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};