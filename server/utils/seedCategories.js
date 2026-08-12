/**
 * Standalone seed script for the storefront navbar categories.
 *
 * Wipes the Category collection and recreates it from the shared list in
 * server/data/defaultCategories.js (kept in sync with server.js's
 * auto-seed — see that file for why this matters).
 *
 * Home, Blog, About and Contact are NOT part of this seed — they stay
 * exactly where they already are, hard-coded in navbar.js.
 *
 * ⚠️  THIS DELETES ALL EXISTING CATEGORIES in whatever database MONGO_URI
 * points to. If you've added categories by hand in the admin panel
 * (e.g. "Women's Ethnic Wear", "Kids", "Designer Sharara Suit Set", etc.)
 * running this WILL permanently remove them and replace them with the
 * Aura-style list below. Make sure that's what you want before running it
 * against your production database.
 *
 * Run with:   npm run seed:categories   (from project root)
 * or:         node server/utils/seedCategories.js
 */
const path = require('path');
// Resolve .env relative to the PROJECT ROOT (same place server.js loads it
// from), not this file's folder — this project keeps .env at the repo root
// (zorka-app/.env), not inside server/.
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const categories = require('../data/defaultCategories');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zorka_shop';

const seedCategories = async () => {
  console.log('🔌 Connecting using MONGO_URI:', MONGO_URI);
  const conn = await mongoose.connect(MONGO_URI);
  console.log(`✅ Connected to MongoDB — host: ${conn.connection.host}, db: ${conn.connection.name}`);
  console.log('   👆 Double-check this is the SAME database your live site/admin panel uses.');
  console.log('   If your site is deployed (Render/Railway/Vercel/etc.), MONGO_URI there is set');
  console.log('   in that host\'s dashboard, NOT from the .env file on your machine — running this');
  console.log('   script locally without that same value will seed a database nobody is reading from.');

  const existingCount = await Category.countDocuments();
  console.log(`\n🗑️  Deleting ${existingCount} existing categor${existingCount === 1 ? 'y' : 'ies'}...`);
  await Category.deleteMany({});
  await Category.insertMany(categories);

  console.log(`🧭 Seeded ${categories.length} categories (New Arrivals → Sale) with their sub-categories.`);
  console.log('   Home, Blog, About and Contact were left untouched in navbar.js.');
  console.log('\n✅ Category seeding complete! Visit /admin/categories.html to edit further.');
  console.log('   (If the admin panel or live navbar still show old data after this, hard-refresh');
  console.log('   the page — Ctrl/Cmd+Shift+R — and confirm the running server was restarted after');
  console.log('   the seed finished.)');
  process.exit(0);
};

seedCategories().catch(err => {
  console.error('❌ Category seed failed:', err);
  process.exit(1);
});