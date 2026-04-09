/**
 * products.js — Dynamic product grid for shop pages
 */
(function () {
  'use strict';

  function buildProductCard(p) {
    const img = p.images && p.images[0] ? p.images[0] : '/assets/images/product-img-1.jpg';
    const imgHover = p.images && p.images[1] ? p.images[1] : img;
    const hasDeal = p.originalPrice && p.originalPrice > p.price;
    const discount = hasDeal ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const badgeHtml = p.badge === 'new' ? '<div class="product-new">NEW</div>'
      : p.badge === 'sale' ? `<div class="product-sale">-${discount}%</div>` : '';
    const priceHtml = hasDeal
      ? `<ins><span class="amount">${p.price.toFixed(2)} USD</span></ins> <del><span class="amount">${p.originalPrice.toFixed(2)} USD</span></del>`
      : `${p.price.toFixed(2)} USD`;

    return `
      <div class="col-lg-3 col-md-4 col-sm-6">
        <div class="product-item${hasDeal ? ' has-deal' : ''}">
          <div class="product-thumb">
            <div class="main-img">
              <a href="/single-product.html?id=${p._id}">
                <img class="img-responsive" src="${img}" alt="${p.name}" onerror="this.src='/assets/images/product-img-1.jpg'"/>
              </a>
            </div>
            <div class="overlay-img">
              <a href="/single-product.html?id=${p._id}">
                <img class="img-responsive" src="${imgHover}" alt="${p.name}" onerror="this.src='/assets/images/product-img-1.jpg'"/>
              </a>
            </div>
            ${badgeHtml}
            <a href="/single-product.html?id=${p._id}" class="details"><i class="pe-7s-search"></i></a>
          </div>
          <h4 class="product-name"><a href="/single-product.html?id=${p._id}">${p.name}</a></h4>
          <p class="product-price">${priceHtml}</p>
          <div class="group-buttons">
            <button type="button" class="add-to-cart btn-cart" data-id="${p._id}"
              data-toggle="tooltip" data-placement="top" title="Add to Cart">
              <span>Add to Cart</span>
            </button>
            <button type="button" class="btn-wishlist" data-id="${p._id}"
              data-toggle="tooltip" data-placement="top" title="Add to Wishlist">
              <i class="pe-7s-like"></i>
            </button>
          </div>
        </div>
      </div>`;
  }

  function showLoading(container) {
    container.innerHTML = `<div class="col-xs-12" style="text-align:center;padding:60px 0;">
      <i class="fa fa-spinner fa-spin" style="font-size:36px;color:#ccc;"></i>
      <p style="margin-top:12px;color:#aaa;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:3px;">LOADING PRODUCTS...</p>
    </div>`;
  }

  function showEmpty(container) {
    container.innerHTML = `<div class="col-xs-12" style="text-align:center;padding:60px 0;">
      <i class="pe-7s-box1" style="font-size:48px;color:#ccc;"></i>
      <p style="margin-top:16px;color:#aaa;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:3px;">NO PRODUCTS FOUND</p>
      <a href="/shop-fullwidth.html" style="font-size:11px;letter-spacing:2px;color:#1a1a1a;text-decoration:underline;">VIEW ALL PRODUCTS</a>
    </div>`;
  }

  function bindButtons(container) {
    container.querySelectorAll('.btn-cart').forEach(btn => {
      btn.addEventListener('click', function () {
        Cart.addToCart(this.dataset.id, 1);
      });
    });
    container.querySelectorAll('.btn-wishlist').forEach(btn => {
      btn.addEventListener('click', function () {
        Cart.addToWishlist(this.dataset.id);
      });
    });
    if (typeof $ !== 'undefined' && $.fn.tooltip) {
      $(container).find('[data-toggle="tooltip"]').tooltip();
    }
  }

  async function loadProducts(container, params = {}) {
    showLoading(container);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch('/api/products' + (qs ? '?' + qs : ''));
      const data = await res.json();
      if (!data.success || !data.products.length) { showEmpty(container); return; }
      container.innerHTML = data.products.map(buildProductCard).join('');
      const resultsEl = document.querySelector('.showing-results');
      if (resultsEl) resultsEl.textContent = `SHOWING ${data.products.length} RESULTS`;
      bindButtons(container);
    } catch (err) {
      container.innerHTML = `<div class="col-xs-12" style="text-align:center;padding:40px;color:#c0392b;">Failed to load products.</div>`;
    }
  }

  // Expose for sidebar
  window._loadProducts = loadProducts;

  document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.box-product.row, .box-product');
    if (!container) return;

    // Check URL params for initial category/sort
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    if (urlParams.get('category')) params.category = urlParams.get('category');
    if (urlParams.get('sort')) params.sort = urlParams.get('sort');

    loadProducts(container, params);

    // Category sidebar filters
    document.querySelectorAll('.widget-categories a[data-category], a[data-category]').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('a[data-category]').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        const cat = this.dataset.category;
        loadProducts(container, cat && cat !== 'all' ? { category: cat } : {});
      });
    });

    // Sort dropdown
    const sortSel = document.querySelector('.sortby .custom-select, .sortby select');
    if (sortSel) {
      sortSel.addEventListener('change', function () {
        const sortMap = { '1': 'price_asc', '2': 'price_desc' };
        const params = {};
        if (sortMap[this.value]) params.sort = sortMap[this.value];
        loadProducts(container, params);
      });
    }
  });
})();

// Auto-load sidebar categories from API
(function() {
  async function loadSidebarCategories() {
    const catList = document.getElementById('sidebar-categories');
    if (!catList) return;
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (!data.success) return;
      const cats = [...new Set(data.products.map(p => p.category))];
      const allLink = catList.querySelector('a[data-category="all"]');
      cats.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" data-category="${cat}">${cat.toUpperCase()}</a>`;
        catList.appendChild(li);
      });
      // Bind
      catList.querySelectorAll('a[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          catList.querySelectorAll('a').forEach(l => l.classList.remove('active'));
          this.classList.add('active');
          const container = document.querySelector('.box-product.row, .box-product');
          if (container) {
            const cat = this.dataset.category;
            window._loadProducts(container, cat && cat !== 'all' ? { category: cat } : {});
          }
        });
      });
    } catch(e) {}
  }
  document.addEventListener('DOMContentLoaded', loadSidebarCategories);
})();
