// import jwt from 'jsonwebtoken';
// import rateLimit from 'express-rate-limit';
// /**
//  * Middleware to authenticate user via JWT token.
//  * Looks for token in cookies or Authorization header.
//  */
// const authenticateUser = (req, res, next) => {
//   let token = null;

//   // From cookies
//   if (req.cookies?.token) {
//     token = req.cookies.token;
//   }

//   // From Authorization header
//   else if (req.headers.authorization?.startsWith('Bearer ')) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   // No token found
//   if (!token) {
//     return res.status(401).json({ error: 'No token provided. Please log in.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach user info to req
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: 'Invalid or expired token.' });
//   }
// };

// /**
//  * Middleware to check if user has the required roles.
//  * @param  {...string} roles - List of allowed roles
//  */
// const restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({
//         error: 'You do not have permission to perform this action.',
//       });
//     }
//     next();
//   };
// };

// /**
//  * General middleware to protect routes (useful placeholder for basic auth check)
//  */
// const protect = (req, res, next) => {
//   // You can add extra logic here if needed
//   next();
// };



// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10,
//   message: 'Too many attempts. Try again later.'
// });




// export {
//   authenticateUser,
//   restrictTo,
//   protect,
//   authLimiter
// };


import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

/**
 * Middleware to authenticate user via JWT token.
 * Looks for token in cookies or Authorization header.
 */
const authenticateUser = (req, res, next) => {
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
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to req
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Middleware to check if user has the required roles.
 * @param  {...string} roles - List of allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

/**
 * Admin-only shortcut middleware
 */
const requireAdmin = restrictTo('admin');

/**
 * General middleware to protect routes (useful placeholder for basic auth check)
 */
const protect = (req, res, next) => {
  // You can add extra logic here if needed
  next();
};

const authLimiter = rateLimit({
  windowMs: 150 * 600 * 10000, // 15 minutes
  max: 100,
  message: 'Too many attempts. Try again later.'
});

export {
  authenticateUser,
  restrictTo,
  requireAdmin,
  protect,
  authLimiter
};
