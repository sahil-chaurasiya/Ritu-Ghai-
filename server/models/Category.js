const mongoose = require('mongoose');

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
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);