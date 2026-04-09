/**
 * shop-products.js — dynamic product loading for shop-fullwidth.html and shop-with-sidebar.html
 */
(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────────────────────
  var state = {
    category: 'all',
    sort: '',
    minPrice: null,
    maxPrice: null,
    sizes: [],
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
      priceHtml = '<ins><span class="amount">' + p.price.toFixed(2) + ' USD</span></ins> '
                + '<del><span class="amount">' + p.originalPrice.toFixed(2) + ' USD</span></del>';
    } else {
      priceHtml = p.price.toFixed(2) + ' USD';
    }

    return '<div class="col-lg-3 col-md-4 col-sm-6">'
      + '<div class="product-item' + (p.badge ? ' has-deal' : '') + '">'
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

    // Category
    if (state.category && state.category !== 'all') {
      products = products.filter(function (p) { return p.category === state.category; });
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

    // Sort
    if (state.sort === 'price_asc') {
      products.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sort === 'price_desc') {
      products.sort(function (a, b) { return b.price - a.price; });
    } else {
      // default: newest first (already sorted from API)
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

  // ── Categories sidebar ────────────────────────────────────────────────────
  async function loadCategories() {
    var catList = document.getElementById('sidebar-categories');
    if (!catList) return;
    try {
      var res  = await fetch('/api/products/categories/list');
      var data = await res.json();
      if (!data.success) return;

      var cats = data.categories;
      catList.innerHTML = '<li><a href="#" data-category="all" class="active">ALL PRODUCTS</a></li>'
        + cats.map(function (c) {
            return '<li><a href="#" data-category="' + escapeHtml(c) + '">' + escapeHtml(c.toUpperCase()) + '</a></li>';
          }).join('');

      catList.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          catList.querySelectorAll('a').forEach(function (x) { x.classList.remove('active'); });
          this.classList.add('active');
          state.category = this.dataset.category;
          applyFilters();
        });
      });
    } catch (e) {}
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

    // Count from full unfiltered product set
    var counts = {};
    SIZE_ORDER.forEach(function (s) { counts[s] = 0; });
    state.allProducts.forEach(function (p) {
      if (p.sizes && p.sizes.length) {
        p.sizes.forEach(function (s) {
          if (counts.hasOwnProperty(s)) counts[s]++;
        });
      }
    });

    // Preserve currently checked state
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

    // Re-bind change events after re-render
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
    // Counts will be populated after products load via updateSizeCounts()
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
    // Read category from URL query param (e.g. ?category=Jackets)
    var urlParams = new URLSearchParams(window.location.search);
    var urlCat = urlParams.get('category');
    if (urlCat) state.category = urlCat;

    loadCategories();
    initPriceSlider();
    initSizeFilter();
    initSortDropdown();
    fetchAllProducts();
  });

})();