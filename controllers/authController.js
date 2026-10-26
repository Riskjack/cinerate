const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Review = require('../models/Review');
const { validateRegister, validateLogin } = require('../utils/validate');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, createdAt: u.createdAt });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validateRegister(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(' ') });

    const email = req.body.email.toLowerCase().trim();
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ name: req.body.name.trim(), email, password: hashed });

    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validateLogin(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(' ') });

    const email = req.body.email.toLowerCase().trim();
    const user = await User.findOne({ email }).select('+password');
    // Same message for "no user" and "wrong password" so attackers can't tell which emails exist.
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile  -> logged-in user's info + all their reviews/ratings
exports.getProfile = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('movieId', 'title posterUrl releaseYear genre')
      .sort({ createdAt: -1 });
    res.json({ user: publicUser(req.user), reviews });
  } catch (err) {
    next(err);
  }
};
