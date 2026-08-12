const mongoose = require('mongoose');

// Level 3 (leaf) — e.g. "Bridal Lehengas" under "Lehengas" under "Women"
const childCategorySchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Sub-subcategory label is required'],
    trim: true
  },
  value: {
    type: String,
    required: [true, 'Sub-subcategory value is required'],
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const subcategorySchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Subcategory label is required'],
    trim: true
  },
  value: {
    type: String,
    required: [true, 'Subcategory value is required'],
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Level 3 — optional. Only categories like "Women" → "Lehengas" use this;
  // most subcategories (e.g. "Shop by Occasion" → "Haldi") leave it empty.
  subcategories: {
    type: [childCategorySchema],
    default: []
  }
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Label is required'],
    trim: true
  },
  value: {
    type: String,
    required: [true, 'Value is required'],
    trim: true,
    unique: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subcategories: {
    type: [subcategorySchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);