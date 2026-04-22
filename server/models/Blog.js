const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  excerpt: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  coverImage: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  author: {
    type: String,
    default: 'Admin'
  },
  published: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Auto-generate slug from title before saving
blogSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);