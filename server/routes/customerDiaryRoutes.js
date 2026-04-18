const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const CustomerDiary = require('../models/CustomerDiary');
const { protect } = require('../middleware/auth');

// Cloudinary config (reads CLOUDINARY_* from .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer-Cloudinary storage: photos go to 'ritu-ghai/customer-diaries' folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ritu-ghai/customer-diaries',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
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
    const url = req.file.path; // full Cloudinary HTTPS URL
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