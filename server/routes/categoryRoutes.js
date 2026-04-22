const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

// GET /api/categories — public, returns active categories in order
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/categories/all — admin only, returns all including inactive
router.get('/all', protect, async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/categories — admin only
router.post('/', protect, async (req, res) => {
  try {
    const { label, value, order, isActive } = req.body;
    // Auto-derive value from label if not provided
    const finalValue = value || label.trim().replace(/\s+/g, ' ');
    const category = await Category.create({
      label: label.trim(),
      value: finalValue,
      order: order !== undefined ? order : 0,
      isActive: isActive !== undefined ? isActive : true
    });
    res.status(201).json({ success: true, category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A category with this value already exists.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/categories/:id — admin only
router.put('/:id', protect, async (req, res) => {
  try {
    const { label, value, order, isActive } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { label, value, order, isActive },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A category with this value already exists.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/categories/:id — admin only
router.delete('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;