const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Multer config: store images in public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../public/uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/products  – public
router.get('/', async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = { isActive: true };
    if (category && category !== 'all') query.category = category;

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
    const { name, price, originalPrice, description, category, stock, badge } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    const product = await Product.create({ name, price, originalPrice, description, category, stock, badge, images });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id – admin only
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, originalPrice, description, category, stock, badge, existingImages } = req.body;
    const newImages = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    const keptImages = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];
    const images = [...keptImages, ...newImages];

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, originalPrice, description, category, stock, badge, images },
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
