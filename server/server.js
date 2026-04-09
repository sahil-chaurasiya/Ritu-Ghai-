require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

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

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// API Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/admin', require('./routes/authRoutes'));

// Seed default admin on first run
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

// Serve admin panel
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../admin/login.html')));
app.get('/admin/*', (req, res) => {
  const file = req.path.replace('/admin/', '');
  const filePath = path.join(__dirname, '../admin', file);
  if (fs.existsSync(filePath)) res.sendFile(filePath);
  else res.status(404).send('Not found');
});

// Fallback: serve public HTML pages
app.get('*.html', (req, res) => {
  const filePath = path.join(__dirname, '../public', req.path);
  if (fs.existsSync(filePath)) res.sendFile(filePath);
  else res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

app.listen(PORT, async () => {
  console.log(`\n🚀 Zorka Shop running at http://localhost:${PORT}`);
  console.log(`📦 Admin Panel: http://localhost:${PORT}/admin`);
  await seedAdmin();
});
