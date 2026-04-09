const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.json({ success: true, cart: [], total: 0 });

    // Enrich with product data
    const enriched = [];
    for (const item of cart) {
      const product = await Product.findById(item.productId);
      if (product) {
        enriched.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0] || '/assets/images/product-img-1.jpg',
          quantity: item.quantity,
          subtotal: product.price * item.quantity
        });
      }
    }
    const total = enriched.reduce((sum, i) => sum + i.subtotal, 0);
    res.json({ success: true, cart: enriched, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cart/add
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < 1) return res.status(400).json({ success: false, message: 'Out of stock' });

    if (!req.session.cart) req.session.cart = [];
    const existingIndex = req.session.cart.findIndex(i => i.productId.toString() === productId);

    if (existingIndex >= 0) {
      req.session.cart[existingIndex].quantity += parseInt(quantity);
    } else {
      req.session.cart.push({ productId, quantity: parseInt(quantity) });
    }

    const cartCount = req.session.cart.reduce((sum, i) => sum + i.quantity, 0);
    res.json({ success: true, message: 'Added to cart', cartCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cart/remove
router.post('/remove', (req, res) => {
  try {
    const { productId } = req.body;
    if (!req.session.cart) return res.json({ success: true, cart: [] });
    req.session.cart = req.session.cart.filter(i => i.productId.toString() !== productId);
    res.json({ success: true, message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cart/update
router.post('/update', (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!req.session.cart) return res.json({ success: true });
    const item = req.session.cart.find(i => i.productId.toString() === productId);
    if (item) {
      item.quantity = Math.max(1, parseInt(quantity));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cart/clear
router.post('/clear', (req, res) => {
  req.session.cart = [];
  res.json({ success: true });
});

module.exports = router;
