const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT and attaches the logged-in user to req.user
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'saas_jwt_secret_ai_studio_2026';
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.id).populate('current_plan');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};
