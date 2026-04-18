const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const CustomerDiary = require('../models/CustomerDiary');
const { protect } = require('../middleware/auth');

// Multer config: store in public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../public/uploads')),
  filename: (req, file, cb) => cb(null, 'cd-' + Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/customer-diaries  – public
router.get('/', async (req, res) => {
  try {
    const photos = await CustomerDiary.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, photos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/customer-diaries/all  – admin, includes inactive
router.get('/all', protect, async (req, res) => {
  try {
    const photos = await CustomerDiary.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, photos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/customer-diaries  – admin only
router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Photo file is required' });
    const { caption, order } = req.body;
    const url = '/uploads/' + req.file.filename;
    const photo = await CustomerDiary.create({ url, caption: caption || '', order: order ? parseInt(order) : 0 });
    res.status(201).json({ success: true, photo });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/customer-diaries/:id  – admin only
router.put('/:id', protect, async (req, res) => {
  try {
    const { caption, order, isActive } = req.body;
    const photo = await CustomerDiary.findByIdAndUpdate(
      req.params.id,
      { caption, order: order !== undefined ? parseInt(order) : undefined, isActive },
      { new: true, runValidators: true }
    );
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });
    res.json({ success: true, photo });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/customer-diaries/:id  – admin only
router.delete('/:id', protect, async (req, res) => {
  try {
    const photo = await CustomerDiary.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });
    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
