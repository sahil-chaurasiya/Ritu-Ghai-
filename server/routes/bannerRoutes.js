const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Banner = require('../models/Banner');
const { protect } = require('../middleware/auth');

// Cloudinary config (reads CLOUDINARY_* from .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer-Cloudinary storage: images go to the 'ritu-ghai/banners' folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ritu-ghai/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Accepts an optional desktop image + optional mobile image on one request
const uploadBannerImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]);

// GET /api/banners — public, active banners in order
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/banners/all — admin only, everything including inactive
router.get('/all', protect, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/banners — admin only
router.post('/', protect, uploadBannerImages, async (req, res) => {
  try {
    const { alt, link, order, isActive } = req.body;
    const image = req.files && req.files.image ? req.files.image[0].path : '';
    const mobileImage = req.files && req.files.mobileImage ? req.files.mobileImage[0].path : '';

    if (!image) {
      return res.status(400).json({ success: false, message: 'A desktop banner image is required.' });
    }

    const banner = await Banner.create({
      image,
      mobileImage,
      alt: alt || 'Banner',
      link: link || '',
      order: order !== undefined ? order : 0,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true
    });
    res.status(201).json({ success: true, banner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/banners/:id — admin only
router.put('/:id', protect, uploadBannerImages, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    const { alt, link, order, isActive } = req.body;

    if (req.files && req.files.image) banner.image = req.files.image[0].path;
    if (req.files && req.files.mobileImage) banner.mobileImage = req.files.mobileImage[0].path;
    if (alt !== undefined) banner.alt = alt;
    if (link !== undefined) banner.link = link;
    if (order !== undefined) banner.order = order;
    if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;

    await banner.save();
    res.json({ success: true, banner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/banners-order/save — admin only, reorder banners (array of { _id, order })
router.put('/order/save', protect, async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'order must be an array.' });
    }
    await Promise.all(order.map(item =>
      Banner.findByIdAndUpdate(item._id, { order: item.order })
    ));
    res.json({ success: true, message: 'Banner order saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/banners/:id — admin only
router.delete('/:id', protect, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;