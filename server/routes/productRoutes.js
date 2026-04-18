const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Cloudinary config (reads CLOUDINARY_* from .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer-Cloudinary storage: images go to the 'ritu-ghai/products' folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ritu-ghai/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/products  – public
router.get('/', async (req, res) => {
  try {
    const { category, sort, minPrice, maxPrice, size } = req.query;
    let query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
    }
    if (size) {
      const sizes = Array.isArray(size) ? size : [size];
      query.sizes = { $in: sizes };
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };

    const products = await Product.find(query).sort(sortObj);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id – public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products – admin only
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, originalPrice, description, additionalInfo, category, stock, badge } = req.body;
    const sizes = req.body.sizes ? (Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes]) : [];
    const images = req.files ? req.files.map(f => f.path) : [];
    const product = await Product.create({ name, price, originalPrice, description, additionalInfo, category, stock, badge, images, sizes });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id – admin only
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, originalPrice, description, additionalInfo, category, stock, badge, existingImages } = req.body;
    const sizes = req.body.sizes ? (Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes]) : [];
    const newImages = req.files ? req.files.map(f => f.path) : [];
    const keptImages = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];
    const images = [...keptImages, ...newImages];

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, originalPrice, description, additionalInfo, category, stock, badge, images, sizes },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id – admin only
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/categories – public
router.get('/categories/list', async (req, res) => {
  try {
    const cats = await Product.distinct('category', { isActive: true });
    res.json({ success: true, categories: cats });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;