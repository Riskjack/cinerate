const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects private routes. Expects the header:  Authorization: Bearer <token>
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Please log in to continue.' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'This account no longer exists.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Your session is invalid or expired. Please log in again.' });
  }
};

module.exports = { protect };
