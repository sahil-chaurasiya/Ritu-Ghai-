require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const multer = require('multer');
const Admin = require('./models/Admin');
const Category = require('./models/Category');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zorka_shop';

// Connect to MongoDB
connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'zorka_session_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

// ── API Routes (must come BEFORE static middleware) ──────────────────────────
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/products/:productId/reviews', require('./routes/reviewRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/admin', require('./routes/authRoutes'));
app.use('/api/customer-diaries', require('./routes/customerDiaryRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/blogs',  require('./routes/blogRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

// ── Static files ─────────────────────────────────────────────────────────────
// Admin panel: /admin/anything.html  →  ../admin/anything.html
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// Public site: /anything  →  ../public/anything
app.use(express.static(path.join(__dirname, '../public')));

// ── Seed default admin on first run ──────────────────────────────────────────
const seedAdmin = async () => {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      await Admin.create({ username: 'admin', password: 'admin123' });
      console.log('Default admin created: admin / admin123');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

// ── Seed default categories on first run ─────────────────────────────────────
// Uses the SAME list as `npm run seed:categories` (server/data/defaultCategories.js)
// so a brand-new/empty database and a manually-reseeded one never disagree.
const defaultCategories = require('./data/defaultCategories');
const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(defaultCategories);
      console.log(`Default categories seeded (${defaultCategories.length}).`);
    }
  } catch (err) {
    console.error('Category seed error:', err.message);
  }
};

// ── Named page routes (fallback for extensionless or root admin redirect) ────
// /admin  →  login page
app.get('/admin', (req, res) =>
  res.sendFile(path.join(__dirname, '../admin/login.html'))
);

// ── 404 fallback for public pages ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// ── Global error handler ──────────────────────────────────────────────────────
// Without this, errors thrown by Multer (e.g. file too large) or anything else
// that happens before a route's own try/catch runs would fall through to
// Express's default handler, which sends back an HTML error page. Every admin
// fetch() call does `await res.json()`, so an HTML response makes that throw a
// SyntaxError — which then gets swallowed by the page's generic catch block and
// shown to the user as "Network error", hiding the real problem. This handler
// guarantees every error response is JSON with a real message instead.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof multer.MulterError) {
    let message = err.message;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Each file must be under 10MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded.';
    }
    return res.status(400).json({ success: false, message });
  }

  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server.'
  });
});

app.listen(PORT, async () => {
  console.log(`\n🚀 Ritu Ghai Shop running at http://localhost:${PORT}`);
  console.log(`📦 Admin Panel: http://localhost:${PORT}/admin`);
  await seedAdmin();
  await seedCategories();
});