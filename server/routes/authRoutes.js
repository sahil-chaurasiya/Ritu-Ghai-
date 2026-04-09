const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password required' });

  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, username: admin.username });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
