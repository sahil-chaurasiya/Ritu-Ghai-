/**
 * Standalone seed script for the storefront navbar categories.
 *
 * Mirrors the "Aura by Anamika" navbar structure (New Arrivals, Women,
 * Shop by Occasion, Collections, Ready to Ship, Accessories, Sale) into
 * Ritu Ghai's Category collection, which navbar.js reads from
 * (GET /api/categories) to build the main menu.
 *
 * Home, Blog, About and Contact are NOT part of this seed — they stay
 * exactly where they already are, hard-coded in navbar.js.
 *
 * Note: Ritu Ghai's Category schema only supports two levels
 * (category -> subcategories), while Aura's "Women" menu item has a
 * third level (e.g. Lehengas -> Bridal Lehengas). To fit this schema,
 * each of Aura's second-level items becomes a Ritu subcategory and the
 * third level is not carried over.
 *
 * Run with:   npm run seed:categories   (from project root)
 * or:         node server/utils/seedCategories.js
 */
const path = require('path');
// Resolve .env relative to THIS file's location (server/.env), not the
// current working directory -- avoids silently connecting to the wrong
// database when the script is run from a different folder.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zorka_shop';

// Helper to quickly build a subcategory
const sub = (label, order) => ({ label, value: label, order, isActive: true });

// Helper to build a category with its subcategories
const cat = (label, order, subLabels = []) => ({
  label,
  value: label,
  order,
  isActive: true,
  subcategories: subLabels.map((s, i) => sub(s, i)),
});

const categories = [
  cat('New Arrivals', 0, ['Just In', 'Trending Now', 'Best Sellers']),

  cat('Women', 1, [
    'Lehengas',
    'Sarees',
    'Suit Sets',
    'Indo-Western',
    'Kurtas & Kurtis',
    'Dresses & Gowns',
    'Co-ord Sets',
    'Kaftans',
    'Tops & Tunics',
    'Bottom Wear',
    'Dupattas',
    'Jackets',
  ]),

  cat('Shop by Occasion', 2, [
    'Bridal Collection',
    'Wedding Guest',
    'Engagement',
    'Reception',
    'Haldi',
    'Mehendi',
    'Sangeet',
    'Cocktail Party',
    'Festive Wear',
    'Pooja Collection',
    'Summer Brunch',
    'Office Wear',
    'Vacation Edit',
  ]),

  cat('Collections', 3, [
    'Wedding Collection',
    'Festive Collection',
    'Heritage Collection',
    'Summer Collection',
    'Luxury Collection',
    'Designer Edit',
  ]),

  cat('Ready to Ship', 4, ['48 Hours Dispatch', 'Ready to Wear']),

  cat('Accessories', 5, ['Dupattas', 'Potli Bags', 'Belts', 'Jewellery']),

  cat('Sale', 6, ['Up to 30% Off', 'Up to 50% Off', 'Clearance']),
];

const seedCategories = async () => {
  console.log('🔌 Connecting using MONGO_URI:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Wipe and recreate so any stale/old categories don't linger mixed in
  // with the new set.
  await Category.deleteMany({});
  await Category.insertMany(categories);

  console.log(`🧭 Seeded ${categories.length} categories (New Arrivals → Sale) with their sub-categories.`);
  console.log('   Home, Blog, About and Contact were left untouched in navbar.js.');
  console.log('\n✅ Category seeding complete! Visit /admin/categories.html to edit further.');
  process.exit(0);
};

seedCategories().catch(err => {
  console.error('❌ Category seed failed:', err);
  process.exit(1);
});