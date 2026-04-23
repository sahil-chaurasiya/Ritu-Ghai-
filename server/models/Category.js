const mongoose = require('mongoose');

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
