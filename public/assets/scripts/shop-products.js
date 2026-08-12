/**
 * shop-products.js — dynamic product loading for shop-fullwidth.html and shop-with-sidebar.html
 * Supports filtering by category AND subcategory via URL params and sidebar.
 */
(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────────────────────
  var state = {
    category: 'all',
    subcategory: 'all',
    sort: '',
    minPrice: null,
    maxPrice: null,
    sizes: [],
    search: '',
    allProducts: [],
    filtered: []
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function productCardHtml(p) {
    var img  = p.images && p.images[0] ? p.images[0] : '/assets/images/product-img-1.jpg';
    var img2 = p.images && p.images[1] ? p.images[1] : img;
    var badgeHtml = '';
    if (p.badge === 'sale')      badgeHtml = '<div class="product-sale">SALE</div>';
    else if (p.badge === 'new')  badgeHtml = '<div class="product-new">NEW</div>';

    var priceHtml = '';
    if (p.originalPrice && p.originalPrice > p.price) {
      priceHtml = '<ins><span class="amount">' + p.price.toFixed(2) + ' INR</span></ins> '
                + '<del><span class="amount">' + p.originalPrice.toFixed(2) + ' INR</span></del>';
    } else {
      priceHtml = p.price.toFixed(2) + ' INR';
    }

    return '<div class="col-lg-3 col-md-4 col-sm-6">'
      + '<div class="product-item' + (p.badge ? ' has-deal' : '') + '" style="display:block;width:100%;overflow:visible;">'
      + '<div class="product-thumb">'
      + '<div class="main-img"><a href="/single-product.html?id=' + p._id + '">'
      + '<img class="img-responsive" src="' + escapeHtml(img) + '" alt="' + escapeHtml(p.name) + '" onerror="this.src=\'/assets/images/product-img-1.jpg\'"/>'
      + '</a></div>'
      + '<div class="overlay-img"><a href="/single-product.html?id=' + p._id + '">'
      + '<img class="img-responsive" src="' + escapeHtml(img2) + '" alt="' + escapeHtml(p.name) + '" onerror="this.src=\'/assets/images/product-img-1.jpg\'"/>'
      + '</a></div>'
      + badgeHtml
      + '<a href="/single-product.html?id=' + p._id + '" class="details"><i class="pe-7s-search"></i></a>'
      + '</div>'
      + '<h4 class="product-name"><a href="/single-product.html?id=' + p._id + '">' + escapeHtml(p.name) + '</a></h4>'
      + '<p class="product-price">' + priceHtml + '</p>'
      + '<div class="group-buttons">'
      + '<button type="button" class="add-to-cart btn-add-cart" data-id="' + p._id + '" data-toggle="tooltip" data-placement="top" title="Add to Cart"><span>Add to Cart</span></button>'
      + '<button type="button" class="btn-wishlist" data-id="' + p._id + '" data-toggle="tooltip" data-placement="top" title="Add to Wishlist"><i class="pe-7s-like"></i></button>'
      + '</div>'
      + '</div></div>';
  }

  function renderProducts(products) {
    var container = document.querySelector('.box-product.row');
    if (!container) return;

    var resultEl = document.querySelector('.showing-results');

    if (!products || !products.length) {
      container.innerHTML = '<div style="padding:60px 15px;font-family:Montserrat,sans-serif;font-size:12px;letter-spacing:2px;color:#aaa;width:100%;text-align:center;">NO PRODUCTS FOUND</div>';
      if (resultEl) resultEl.textContent = 'SHOWING 0 RESULTS';
      return;
    }

    container.innerHTML = products.map(productCardHtml).join('');
    if (resultEl) resultEl.textContent = 'SHOWING 1–' + products.length + ' OF ' + products.length + ' RESULTS';

    // Wire cart & wishlist buttons
    container.querySelectorAll('.btn-add-cart').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (typeof Cart !== 'undefined') Cart.addToCart(this.dataset.id);
      });
    });
    container.querySelectorAll('.btn-wishlist').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (typeof Cart !== 'undefined') Cart.addToWishlist(this.dataset.id);
      });
    });

    if (typeof $ !== 'undefined' && $.fn.tooltip) {
      $(container).find('[data-toggle="tooltip"]').tooltip();
    }
  }

  // ── Apply filters client-side ────────────────────────────────────────────
  function applyFilters() {
    var products = state.allProducts.slice();

    // Category filter
    if (state.category && state.category !== 'all') {
      products = products.filter(function (p) { return p.category === state.category; });
    }

    // Subcategory filter
    if (state.subcategory && state.subcategory !== 'all') {
      products = products.filter(function (p) { return p.subcategory === state.subcategory; });
    }

    // Price
    if (state.minPrice !== null) {
      products = products.filter(function (p) { return p.price >= state.minPrice; });
    }
    if (state.maxPrice !== null) {
      products = products.filter(function (p) { return p.price <= state.maxPrice; });
    }

    // Sizes
    if (state.sizes.length > 0) {
      products = products.filter(function (p) {
        if (!p.sizes || !p.sizes.length) return false;
        return state.sizes.some(function (s) { return p.sizes.indexOf(s) !== -1; });
      });
    }

    // Free-text search — matches against name, description, additional
    // info, category, subcategory, sizes and badge, so a search for a
    // colour ("red"), a size ("medium"), a fabric, an occasion, etc. all
    // work as long as that word appears anywhere in the product's text.
    // (There's no dedicated "colour" field in the product data yet — this
    // searches whatever text the product actually has.)
    if (state.search && state.search.trim()) {
      var terms = state.search.trim().toLowerCase().split(/\s+/);
      products = products.filter(function (p) {
        var haystack = [
          p.name, p.description, p.additionalInfo, p.category, p.subcategory,
          (p.sizes || []).join(' '), p.badge
        ].join(' ').toLowerCase();
        return terms.every(function (t) { return haystack.indexOf(t) !== -1; });
      });
    }

    // Sort
    if (state.sort === 'price_asc') {
      products.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sort === 'price_desc') {
      products.sort(function (a, b) { return b.price - a.price; });
    }

    state.filtered = products;
    renderProducts(products);
  }

  // ── Fetch all products once ───────────────────────────────────────────────
  async function fetchAllProducts() {
    var container = document.querySelector('.box-product.row');
    if (container) container.innerHTML = '<div style="padding:60px 15px;font-family:Montserrat,sans-serif;font-size:12px;letter-spacing:2px;color:#aaa;width:100%;text-align:center;">LOADING...</div>';

    try {
      var res  = await fetch('/api/products');
      var data = await res.json();
      if (data.success) {
        state.allProducts = data.products;
        updateSizeCounts();
        applyFilters();
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      if (container) container.innerHTML = '<div style="padding:60px 15px;text-align:center;color:#c0392b;">Failed to load products. Please refresh.</div>';
    }
  }

  // ── Categories & Subcategories sidebar ────────────────────────────────────
  async function loadCategories() {
    var catList = document.getElementById('sidebar-categories');
    if (!catList) return;

    try {
      // Use the full /api/categories endpoint which includes subcategories
      var res  = await fetch('/api/categories');
      var data = await res.json();
      if (!data.success || !data.categories) return;

      var cats = data.categories;

      // Build: All Products + each category + its subcategories indented
      var html = '<li><a href="#" data-category="all" data-subcategory="all" class="active">ALL PRODUCTS</a></li>';

      cats.forEach(function (c) {
        var subs = (c.subcategories || []).filter(function (s) { return s.isActive !== false; });
        var isCatActive = state.category === c.value;

        html += '<li>'
          + '<a href="#" data-category="' + escapeHtml(c.value) + '" data-subcategory="all"'
          + (isCatActive && state.subcategory === 'all' ? ' class="active"' : '') + '>'
          + escapeHtml(c.label)
          + '</a>';

        if (subs.length > 0) {
          html += '<ul style="list-style:none;padding-left:14px;margin:4px 0;">';
          subs.forEach(function (s) {
            var isSubActive = isCatActive && state.subcategory === s.value;
            html += '<li><a href="#" data-category="' + escapeHtml(c.value) + '" data-subcategory="' + escapeHtml(s.value) + '"'
              + (isSubActive ? ' class="active"' : '')
              + ' style="font-size:10px;letter-spacing:1px;">'
              + '↳ ' + escapeHtml(s.label)
              + '</a></li>';
          });
          html += '</ul>';
        }

        html += '</li>';
      });

      catList.innerHTML = html;

      // Wire all category/subcategory links
      catList.querySelectorAll('a[data-category]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          catList.querySelectorAll('a').forEach(function (x) { x.classList.remove('active'); });
          this.classList.add('active');
          state.category    = this.dataset.category;
          state.subcategory = this.dataset.subcategory || 'all';
          applyFilters();
          // Update page title to reflect active subcategory/category
          updatePageHeading();
        });
      });

    } catch (e) {
      // Fallback to simple product category list
      try {
        var r2   = await fetch('/api/products/categories/list');
        var d2   = await r2.json();
        if (!d2.success) return;
        catList.innerHTML = '<li><a href="#" data-category="all" data-subcategory="all" class="active">ALL PRODUCTS</a></li>'
          + d2.categories.map(function (c) {
              return '<li><a href="#" data-category="' + escapeHtml(c) + '" data-subcategory="all">' + escapeHtml(c.toUpperCase()) + '</a></li>';
            }).join('');
        catList.querySelectorAll('a').forEach(function (a) {
          a.addEventListener('click', function (e) {
            e.preventDefault();
            catList.querySelectorAll('a').forEach(function (x) { x.classList.remove('active'); });
            this.classList.add('active');
            state.category    = this.dataset.category;
            state.subcategory = 'all';
            applyFilters();
          });
        });
      } catch (e2) {}
    }
  }

  // ── Update the page H1 heading when subcategory changes ──────────────────
  function updatePageHeading() {
    var h1 = document.querySelector('.header-page h1');
    if (!h1) return;
    if (state.search && state.search.trim()) {
      h1.textContent = 'SEARCH RESULTS FOR "' + state.search.trim().toUpperCase() + '"';
      document.title = 'Search: ' + state.search.trim() + ' — Ritu Ghai';
    } else if (state.subcategory && state.subcategory !== 'all') {
      h1.textContent = state.subcategory.toUpperCase();
      document.title = state.subcategory + ' — Ritu Ghai';
    } else if (state.category && state.category !== 'all') {
      h1.textContent = state.category.toUpperCase();
      document.title = state.category + ' — Ritu Ghai';
    } else {
      h1.textContent = 'SHOP';
      document.title = 'Shop — Ritu Ghai';
    }
  }

  // ── Price slider ──────────────────────────────────────────────────────────
  function initPriceSlider() {
    var slider = document.getElementById('price-slider');
    var amountInput = document.getElementById('amount');
    var filterBtn = document.querySelector('.filter-price-btn');
    if (!slider || typeof $ === 'undefined' || !$.fn.slider) return;

    var min = 0, max = 1000;

    $(slider).slider({
      range: true,
      min: min,
      max: max,
      values: [min, max],
      slide: function (event, ui) {
        if (amountInput) amountInput.value = '$' + ui.values[0] + ' — $' + ui.values[1];
      }
    });

    if (amountInput) amountInput.value = '$' + min + ' — $' + max;

    if (filterBtn) {
      filterBtn.addEventListener('click', function () {
        var vals = $(slider).slider('values');
        state.minPrice = vals[0];
        state.maxPrice = vals[1];
        applyFilters();
      });
    }
  }

  // ── Size filter checkboxes ────────────────────────────────────────────────
  var SIZE_ORDER = ['One Size Fit All', 'Extra Small', 'Small', 'Medium', 'Large', 'Extra Large'];

  function updateSizeCounts() {
    var sizeList = document.getElementById('sidebar-sizes');
    if (!sizeList) return;

    var counts = {};
    SIZE_ORDER.forEach(function (s) { counts[s] = 0; });
    state.allProducts.forEach(function (p) {
      if (p.sizes && p.sizes.length) {
        p.sizes.forEach(function (s) {
          if (counts.hasOwnProperty(s)) counts[s]++;
        });
      }
    });

    var checked = [];
    sizeList.querySelectorAll('input[type="checkbox"]:checked').forEach(function (c) {
      checked.push(c.value);
    });

    sizeList.innerHTML = SIZE_ORDER.map(function (size) {
      var isChecked = checked.indexOf(size) !== -1 ? ' checked' : '';
      return '<li style="padding:5px 0;">'
        + '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:1px;font-weight:400;margin:0;">'
        + '<input type="checkbox" value="' + escapeHtml(size) + '" style="accent-color:#1a1a1a;width:14px;height:14px;"' + isChecked + ' />'
        + escapeHtml(size) + ' <span style="margin-left:auto;color:#aaa;">(' + counts[size] + ')</span>'
        + '</label></li>';
    }).join('');

    sizeList.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var selected = [];
        sizeList.querySelectorAll('input[type="checkbox"]:checked').forEach(function (c) {
          selected.push(c.value);
        });
        state.sizes = selected;
        applyFilters();
      });
    });
  }

  function initSizeFilter() {
    var sizeList = document.getElementById('sidebar-sizes');
    if (!sizeList) return;
    // Counts populated after products load via updateSizeCounts()
  }

  // ── Sort dropdown ─────────────────────────────────────────────────────────
  function initSortDropdown() {
    var sel = document.querySelector('.sortby .custom-select');
    if (!sel) return;
    sel.addEventListener('change', function () {
      var v = this.value;
      if (v === '1') state.sort = 'price_asc';
      else if (v === '2') state.sort = 'price_desc';
      else state.sort = '';
      applyFilters();
    });
  }

  // ── Boot ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var urlParams = new URLSearchParams(window.location.search);
    var urlCat = urlParams.get('category');
    var urlSub = urlParams.get('subcategory');
    var urlSearch = urlParams.get('search');

    if (urlCat) state.category = urlCat;
    if (urlSub) state.subcategory = urlSub;
    if (urlSearch) state.search = urlSearch;

    // Update heading from URL params immediately
    updatePageHeading();

    loadCategories();
    initPriceSlider();
    initSizeFilter();
    initSortDropdown();
    fetchAllProducts();
  });

})();