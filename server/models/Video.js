const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoUrl:  { type: String, required: [true, 'Video file is required'] },
  linkUrl:   { type: String, required: [true, 'Click-through link is required'] },
  caption:   { type: String, default: '' },
  order:     { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);