const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams gives us :productId
const Review = require('../models/Review');

// GET /api/products/:productId/reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products/:productId/reviews  (public — anyone can submit)
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, body } = req.body;
    if (!name || !email || !rating || !body) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const review = await Review.create({
      product: req.params.productId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rating: Number(rating),
      body: body.trim()
    });
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;