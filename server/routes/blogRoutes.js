const express = require('express');
const router  = express.Router();
const Blog    = require('../models/Blog');
const { protect } = require('../middleware/auth');
const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary config (reads CLOUDINARY_* from .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer-Cloudinary storage: images go to the 'ritu-ghai/blogs' folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ritu-ghai/blogs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// GET /api/blogs  — list all published blogs (newest first)
router.get('/', async (req, res) => {
  try {
    const { tag, limit = 20, page = 1 } = req.query;
    const filter = { published: true };
    if (tag) filter.tags = tag;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title slug excerpt coverImage tags author createdAt');

    res.json({ success: true, total, page: parseInt(page), blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN-PROTECTED ROUTES ───────────────────────────────────────────────────

// GET /api/blogs/admin/all  — all posts including drafts
// IMPORTANT: this must be defined BEFORE /:slug or Express will treat "admin" as a slug value
router.get('/admin/all', protect, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/blogs/:slug  — single post by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN WRITE ROUTES ───────────────────────────────────────────────────────

// POST /api/blogs  — create new post
router.post('/', protect, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, excerpt, content, tags, author, published } = req.body;
    const coverImage = req.file ? req.file.path : '';

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      coverImage,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      author: author || 'Admin',
      published: published === 'false' ? false : true
    });

    res.status(201).json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/blogs/:id  — update post
router.put('/:id', protect, upload.single('coverImage'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Post not found' });

    const { title, excerpt, content, tags, author, published } = req.body;
    if (title)   { blog.title = title; }
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (content) blog.content = content;
    if (tags !== undefined) blog.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (author)  blog.author = author;
    if (published !== undefined) blog.published = published === 'true' || published === true;
    if (req.file) blog.coverImage = req.file.path;

    await blog.save();
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/blogs/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;