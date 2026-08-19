const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Desktop image is required']
  },
  mobileImage: {
    type: String,
    default: '' // falls back to `image` on the frontend if empty
  },
  alt: {
    type: String,
    trim: true,
    default: 'Banner'
  },
  link: {
    type: String,
    trim: true,
    default: '' // optional — if set, the slide becomes clickable
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

module.exports = mongoose.model('Banner', bannerSchema);