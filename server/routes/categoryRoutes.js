const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

// GET /api/categories — public, returns active categories (with active subcategories) in order
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    // Only expose active subcategories (and their active sub-subcategories) to public
    const result = categories.map(c => ({
      ...c.toObject(),
      subcategories: (c.subcategories || [])
        .filter(s => s.isActive)
        .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
        .map(s => ({
          ...s,
          subcategories: (s.subcategories || [])
            .filter(g => g.isActive)
            .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
        }))
    }));
    res.json({ success: true, categories: result });
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

// ─── SUBCATEGORY ROUTES ────────────────────────────────────────────────────

// GET /api/categories/:id/subcategories — admin only
router.get('/:id/subcategories', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    const subcategories = (category.subcategories || []).sort((a, b) => a.order - b.order);
    res.json({ success: true, subcategories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/categories/:id/subcategories — admin only
router.post('/:id/subcategories', protect, async (req, res) => {
  try {
    const { label, value, order, isActive } = req.body;
    if (!label || !value) {
      return res.status(400).json({ success: false, message: 'Label and value are required.' });
    }
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    // Check for duplicate value within this category
    const exists = category.subcategories.some(s => s.value === value.trim());
    if (exists) {
      return res.status(400).json({ success: false, message: 'A subcategory with this value already exists in this category.' });
    }

    category.subcategories.push({
      label: label.trim(),
      value: value.trim(),
      order: order !== undefined ? order : category.subcategories.length,
      isActive: isActive !== undefined ? isActive : true
    });
    await category.save();
    const newSub = category.subcategories[category.subcategories.length - 1];
    res.status(201).json({ success: true, subcategory: newSub });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/categories/:id/subcategories/:subId — admin only
router.put('/:id/subcategories/:subId', protect, async (req, res) => {
  try {
    const { label, value, order, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const sub = category.subcategories.id(req.params.subId);
    if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' });

    // Check for duplicate value within this category (excluding self)
    const duplicate = category.subcategories.some(
      s => s.value === value.trim() && s._id.toString() !== req.params.subId
    );
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'A subcategory with this value already exists in this category.' });
    }

    if (label !== undefined) sub.label = label.trim();
    if (value !== undefined) sub.value = value.trim();
    if (order !== undefined) sub.order = order;
    if (isActive !== undefined) sub.isActive = isActive;

    await category.save();
    res.json({ success: true, subcategory: sub });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/categories/:id/subcategories/:subId — admin only
router.delete('/:id/subcategories/:subId', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const sub = category.subcategories.id(req.params.subId);
    if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' });

    sub.deleteOne();
    await category.save();
    res.json({ success: true, message: 'Subcategory deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/categories/:id/subcategories-order — admin only, reorder subcategories
router.put('/:id/subcategories-order', protect, async (req, res) => {
  try {
    const { order } = req.body; // array of { _id, order }
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'order must be an array.' });
    }
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    order.forEach(item => {
      const sub = category.subcategories.id(item._id);
      if (sub) sub.order = item.order;
    });
    await category.save();
    res.json({ success: true, message: 'Subcategory order saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SUB-SUBCATEGORY ROUTES (3rd level, e.g. Women → Lehengas → Bridal Lehengas) ──

// POST /api/categories/:id/subcategories/:subId/children — admin only
router.post('/:id/subcategories/:subId/children', protect, async (req, res) => {
  try {
    const { label, value, order, isActive } = req.body;
    if (!label || !value) {
      return res.status(400).json({ success: false, message: 'Label and value are required.' });
    }
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const sub = category.subcategories.id(req.params.subId);
    if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' });

    const exists = sub.subcategories.some(g => g.value === value.trim());
    if (exists) {
      return res.status(400).json({ success: false, message: 'An item with this value already exists here.' });
    }

    sub.subcategories.push({
      label: label.trim(),
      value: value.trim(),
      order: order !== undefined ? order : sub.subcategories.length,
      isActive: isActive !== undefined ? isActive : true
    });
    await category.save();
    const newChild = sub.subcategories[sub.subcategories.length - 1];
    res.status(201).json({ success: true, child: newChild });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/categories/:id/subcategories/:subId/children/:childId — admin only
router.put('/:id/subcategories/:subId/children/:childId', protect, async (req, res) => {
  try {
    const { label, value, order, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const sub = category.subcategories.id(req.params.subId);
    if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' });

    const child = sub.subcategories.id(req.params.childId);
    if (!child) return res.status(404).json({ success: false, message: 'Item not found' });

    const duplicate = sub.subcategories.some(
      g => g.value === value.trim() && g._id.toString() !== req.params.childId
    );
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'An item with this value already exists here.' });
    }

    if (label !== undefined) child.label = label.trim();
    if (value !== undefined) child.value = value.trim();
    if (order !== undefined) child.order = order;
    if (isActive !== undefined) child.isActive = isActive;

    await category.save();
    res.json({ success: true, child });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/categories/:id/subcategories/:subId/children/:childId — admin only
router.delete('/:id/subcategories/:subId/children/:childId', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const sub = category.subcategories.id(req.params.subId);
    if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' });

    const child = sub.subcategories.id(req.params.childId);
    if (!child) return res.status(404).json({ success: false, message: 'Item not found' });

    child.deleteOne();
    await category.save();
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;