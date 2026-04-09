const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/wishlist
router.get('/', async (req, res) => {
  try {
    const wishlist = req.session.wishlist || [];
    if (!wishlist.length) return res.json({ success: true, wishlist: [] });
    const enriched = [];
    for (const productId of wishlist) {
      const product = await Product.findById(productId);
      if (product) enriched.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/assets/images/product-img-1.jpg',
        stock: product.stock
      });
    }
    res.json({ success: true, wishlist: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/wishlist/add
router.post('/add', async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId required' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (!req.session.wishlist) req.session.wishlist = [];
    if (!req.session.wishlist.includes(productId)) {
      req.session.wishlist.push(productId);
    }
    res.json({ success: true, message: 'Added to wishlist', count: req.session.wishlist.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/wishlist/remove
router.post('/remove', (req, res) => {
  try {
    const { productId } = req.body;
    if (!req.session.wishlist) return res.json({ success: true });
    req.session.wishlist = req.session.wishlist.filter(id => id.toString() !== productId);
    res.json({ success: true, count: req.session.wishlist.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
