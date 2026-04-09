const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'zorka_secret_key_2024';

const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  } else {
    token = req.cookies && req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select('-password');
    if (!req.admin) return res.status(401).json({ success: false, message: 'Admin not found' });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

module.exports = { protect, JWT_SECRET };
