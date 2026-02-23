// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.error('JWT_SECRET not set in env');
  process.exit(1);
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

exports.signup = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ message: 'email already in use' });

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await User.create({ email, name, passwordHash });
  const token = signToken(user);

  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'invalid credentials' });

  const token = signToken(user);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
};

exports.me = async (req, res) => {
  // req.user is set by auth middleware
  const user = await User.findByPk(req.user.id, { attributes: ['id', 'email', 'name', 'createdAt'] });
  res.json({ user });
};