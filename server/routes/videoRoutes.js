const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Video    = require('../models/Video');
const { protect } = require('../middleware/auth');

// Cloudinary config (reads CLOUDINARY_* from .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer-Cloudinary storage: videos go to 'ritu-ghai/videos' folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ritu-ghai/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm', 'mkv'],
  },
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
    const videoUrl = req.file.path; // full Cloudinary HTTPS URL
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