const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const Video    = require('../models/Video');
const { protect } = require('../middleware/auth');

// Multer — store video files in public/uploads, up to 200MB
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../public/uploads')),
  filename:    (req, file, cb) => cb(null, 'vid-' + Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files are allowed'));
  }
});

// GET /api/videos  — public, active only
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, videos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/videos/all  — admin, includes inactive
router.get('/all', protect, async (req, res) => {
  try {
    const videos = await Video.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, videos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/videos  — admin only, uploads actual video file
router.post('/', protect, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Video file is required' });
    const { linkUrl, caption, order } = req.body;
    if (!linkUrl) return res.status(400).json({ success: false, message: 'Click-through link URL is required' });
    const videoUrl = '/uploads/' + req.file.filename;
    const video = await Video.create({
      videoUrl,
      linkUrl,
      caption: caption || '',
      order:   order ? parseInt(order) : 0
    });
    res.status(201).json({ success: true, video });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/videos/:id  — admin only
router.put('/:id', protect, async (req, res) => {
  try {
    const { caption, order, isActive, linkUrl } = req.body;
    const updates = {};
    if (caption  !== undefined) updates.caption  = caption;
    if (linkUrl  !== undefined) updates.linkUrl   = linkUrl;
    if (order    !== undefined) updates.order     = parseInt(order);
    if (isActive !== undefined) updates.isActive  = isActive;
    const video = await Video.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, video });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/videos/:id  — admin only
router.delete('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;