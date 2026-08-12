/**
 * Single source of truth for the storefront navbar categories.
 *
 * Mirrors the "Aura by Anamika" navbar structure EXACTLY — same categories,
 * same subcategories, same third-level items under Women, in the same
 * order (see server/utils/seedMenu.js in the aura-byAnamika project, which
 * is the original source this was copied from).
 *
 * This is imported by BOTH:
 *   - server/utils/seedCategories.js  (manual "npm run seed:categories")
 *   - server/server.js                (auto-seed on a brand-new/empty DB)
 * so the two can never drift out of sync again.
 *
 * Structure is 3 levels deep:
 *   Category (e.g. "Women")
 *     └─ Subcategory (e.g. "Lehengas")
 *          └─ Sub-subcategory (e.g. "Bridal Lehengas")
 * Only "Women" actually uses the third level, matching Aura — every other
 * category's subcategories have no children, same as the source.
 *
 * Note: Aura's "Women" mega-menu also has a decorative promo banner
 * ("Bridal Edit" image + caption). That's a page-layout/marketing feature,
 * not a category or subcategory, and Ritu Ghai's Category schema/admin
 * panel has no concept of it — it was intentionally left out here. If you
 * want that banner too, it'd need to be added as a separate feature.
 */

// Helper to build a leaf sub-subcategory (level 3)
const child = (label, order) => ({ label, value: label, order, isActive: true });

// Helper to build a subcategory (level 2), with optional level-3 children
const sub = (label, order, childLabels = []) => ({
  label,
  value: label,
  order,
  isActive: true,
  subcategories: childLabels.map((c, i) => child(c, i)),
});

// Helper to build a top-level category (level 1)
const cat = (label, order, subLabels = []) => ({
  label,
  value: label,
  order,
  isActive: true,
  subcategories: subLabels.map((s, i) =>
    Array.isArray(s) ? sub(s[0], i, s[1]) : sub(s, i)
  ),
});

const defaultCategories = [
  cat('New Arrivals', 0, ['Just In', 'Trending Now', 'Best Sellers']),

  cat('Women', 1, [
    ['Lehengas', ['Bridal Lehengas', 'Bridesmaid Lehengas', 'Designer Lehengas', 'Festive Lehengas', 'Reception Lehengas']],
    ['Sarees', ['Banarasi Sarees', 'Chanderi Sarees', 'Silk Sarees', 'Organza Sarees', 'Tissue Sarees', 'Designer Sarees', 'Printed Sarees', 'Everyday Sarees']],
    ['Suit Sets', ['Kurta Sets', 'Anarkali Sets', 'Sharara Sets', 'Gharara Sets', 'Palazzo Sets', 'Straight Suit Sets']],
    ['Indo-Western', ['Indo-Western Gowns', 'Draped Dresses', 'Jacket Sets', 'Fusion Wear', 'Salwar Suits']],
    ['Kurtas & Kurtis', ['Designer Kurtis', 'Short Kurtis', 'Long Kurtis', 'Printed Kurtis', 'Embroidered Kurtis']],
    ['Dresses & Gowns', ['Evening Gowns', 'Party Dresses', 'Maxi Dresses']],
    'Co-ord Sets',
    'Kaftans',
    ['Tops & Tunics', ['Tops', 'Tunics', 'Shirts']],
    ['Bottom Wear', ['Pants', 'Palazzo', 'Skirts', 'Sharara', 'Cigarette Pants']],
    ['Dupattas', ['Wedding Collection', 'Banarasi Dupattas', 'Organza Dupattas', 'Chanderi Dupattas', 'Embroidered Dupattas']],
    ['Jackets', ['Ethnic Jackets', 'Cape Jackets']],
  ]),

  cat('Shop by Occasion', 2, [
    'Bridal Collection', 'Wedding Guest', 'Engagement', 'Reception', 'Haldi',
    'Mehendi', 'Sangeet', 'Cocktail Party', 'Festive Wear', 'Pooja Collection',
    'Summer Brunch', 'Office Wear', 'Vacation Edit',
  ]),

  cat('Collections', 3, [
    'Wedding Collection', 'Festive Collection', 'Heritage Collection',
    'Summer Collection', 'Luxury Collection', 'Designer Edit',
  ]),

  cat('Ready to Ship', 4, ['48 Hours Dispatch', 'Ready to Wear']),

  cat('Accessories', 5, ['Dupattas', 'Potli Bags', 'Belts', 'Jewellery']),

  cat('Sale', 6, ['Up to 30% Off', 'Up to 50% Off', 'Clearance']),

  cat('Custom Services', 7, ['Custom Stitching', 'Size Guide', 'Bridal Consultation', 'Personal Styling']),
];

module.exports = defaultCategories;