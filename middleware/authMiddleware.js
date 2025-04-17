const protect = (req, res, next) => {
    // Your existing authentication logic
    // Verify JWT token, etc.
    next();
  };
  
const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'You do not have permission to perform this action'
        });
      }
      next();
    };
  };
  export default {
    protect,
    restrictTo
  }