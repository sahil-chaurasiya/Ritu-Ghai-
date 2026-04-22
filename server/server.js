require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
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
const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      const defaults = [
        { label: 'LEHENGA',       value: 'Lehenga',       order: 1 },
        { label: 'SAREES',        value: 'Sarees',        order: 2 },
        { label: 'STITCHED SUIT', value: 'Stitched Suit', order: 3 },
        { label: 'INDO WESTERN',  value: 'Indo Western',  order: 4 },
        { label: 'GOWNS',         value: 'Gowns',         order: 5 },
        { label: 'KURTI',         value: 'Kurti',         order: 6 },
      ];
      await Category.insertMany(defaults);
      console.log('Default categories seeded.');
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

app.listen(PORT, async () => {
  console.log(`\n🚀 Ritu Ghai Shop running at http://localhost:${PORT}`);
  console.log(`📦 Admin Panel: http://localhost:${PORT}/admin`);
  await seedAdmin();
  await seedCategories();
});