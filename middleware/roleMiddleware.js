import jwt from 'jsonwebtoken';

const roleMiddleware = (roles) => {
  return async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(403).send('Access denied');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma[decoded.role].findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(404).send('User not found');
      }

      // Check if the user's role matches the required roles
      if (!roles.includes(user.role)) {
        return res.status(403).send('Forbidden');
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).send('Invalid token');
    }
  };
};

export default roleMiddleware;
