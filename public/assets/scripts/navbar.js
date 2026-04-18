/**
 * navbar.js — Injects a shared, dynamic navbar + footer into every page.
 * Updated: new categories, simple slide transition, no mega-menu.
 */
(function () {
  'use strict';

  const CATEGORIES = [
    { label: 'LEHENGA',       value: 'Lehenga' },
    { label: 'SAREES',        value: 'Sarees' },
    { label: 'STITCHED SUIT', value: 'Stitched Suit' },
    { label: 'INDO WESTERN',  value: 'Indo Western' },
    { label: 'GOWNS',         value: 'Gowns' },
    { label: 'KURTI',         value: 'Kurti' }
  ];

  // ─── NAVBAR HTML ────────────────────────────────────────────────────────────
  const NAVBAR_HTML = `
    <div class="topbar">
      <div class="container">
        <div class="left-topbar">WELCOME TO RITU GHAI</div>
        <div class="right-topbar">
          <ul class="list-inline">
            <li>
              <div class="btn-group">
                <button class="dropdown dropdown-toggle" data-toggle="dropdown">
                  <span>My Account</span><i class="pe-7s-angle-down"></i>
                </button>
                <ul class="dropdown-menu">
                  <li><a href="/wishlist.html"><i class="fa fa-heart"></i> Wish List (<span id="nav-wishlist-count">0</span>)</a></li>
                  <li><a href="/shopping-cart.html"><i class="fa fa-shopping-cart"></i> Shopping Cart</a></li>
                  <li><a href="/check-out.html"><i class="fa fa-share"></i> Checkout</a></li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <hr class="gray-line"/>
    <header>
      <div class="container">
        <a class="logo" href="/index.html">
          <img src="/assets/images/logo.png" alt="Ritu Ghai" style="width:200px;height:auto;" />
        </a>
        <div class="header-social">
          <ul class="list-social">
            <li><a href="#" class="facebook"><i class="fa fa-facebook"></i></a></li>
            <li><a href="#" class="twitter"><i class="fa fa-twitter"></i></a></li>
            <li><a href="#" class="instagram"><i class="fa fa-instagram"></i></a></li>
          </ul>
        </div>
        <div class="top-cart">
          <a href="/shopping-cart.html">
            <i class="pe-7s-cart"></i>
            <span id="nav-cart-count">0</span>
          </a>
        </div>
        <nav class="main-nav">
          <div class="minimal-menu">
            <ul class="menu" id="main-menu">
              <li data-page="index.html"><a href="/index.html">HOME</a></li>
              ${CATEGORIES.map(cat =>
                `<li data-page="shop-${cat.value.replace(/\s+/g,'-').toLowerCase()}" data-category="${cat.value}">
                  <a href="/shop-fullwidth.html?category=${encodeURIComponent(cat.value)}">${cat.label}</a>
                </li>`
              ).join('')}
              <li data-page="blog"><a href="/blog.html">BLOG</a></li>
              <li data-page="about"><a href="/about-company.html">ABOUT</a></li>
              <li data-page="contact"><a href="/contact1.html">CONTACT</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </header>`;

  // ─── FOOTER HTML ────────────────────────────────────────────────────────────
  const FOOTER_HTML = `
    <footer>
      <div class="container">
        <div class="row">
          <div class="col-md-3 col-sm-6">
            <h3>LOCATION</h3>
            <div class="address">Your Store Address Here</div>
            <ul class="list-social">
              <li><a href="#" class="facebook"><i class="fa fa-facebook"></i></a></li>
              <li><a href="#" class="instagram"><i class="fa fa-instagram"></i></a></li>
            </ul>
          </div>
          <div class="col-md-3 col-sm-6">
            <h3>SHOP</h3>
            <ul class="list-link">
              ${CATEGORIES.map(cat =>
                `<li><a href="/shop-fullwidth.html?category=${encodeURIComponent(cat.value)}">${cat.label}</a></li>`
              ).join('')}
            </ul>
          </div>
          <div class="col-md-3 col-sm-6">
            <h3>COMPANY</h3>
            <ul class="list-link">
              <li><a href="/about-company.html">ABOUT US</a></li>
              <li><a href="/contact1.html">CONTACT</a></li>
              <li><a href="/blog.html">BLOG</a></li>
            </ul>
          </div>
          <div class="col-md-3 col-sm-6">
            <h3>POLICIES</h3>
            <ul class="list-link">
              <li><a href="/page-with-sidebar.html">PRIVACY POLICY</a></li>
              <li><a href="/page-with-sidebar.html">RETURNS &amp; EXCHANGES</a></li>
              <li><a href="/page-with-sidebar.html">SHIPPING INFO</a></li>
              <li><a href="/page-with-sidebar.html">TERMS &amp; CONDITIONS</a></li>
            </ul>
          </div>
        </div>
        <div class="bottom-footer">
          <div class="copyright">&copy;COPYRIGHT 2025. RITU GHAI</div>
          <ul class="list-payment">
            <li><a href="#"><img src="/assets/images/visa.png" alt="Visa"/></a></li>
            <li><a href="#"><img src="/assets/images/paypal.png" alt="PayPal"/></a></li>
          </ul>
        </div>
      </div>
    </footer>`;

  // ─── INJECT ──────────────────────────────────────────────────────────────────
  function injectNavbar() {
    const body = document.body;
    ['topbar', 'header', 'footer'].forEach(sel => {
      const el = document.querySelector(sel + ', .' + sel);
      if (el) el.remove();
    });
    const hr = document.querySelector('hr.gray-line');
    if (hr) hr.remove();

    const navDiv = document.createElement('div');
    navDiv.id = 'zorka-navbar';
    navDiv.innerHTML = NAVBAR_HTML;
    body.insertBefore(navDiv, body.firstChild);

    const footerDiv = document.createElement('div');
    footerDiv.innerHTML = FOOTER_HTML;
    body.appendChild(footerDiv);

    setActiveNavItem();
  }

  function setActiveNavItem() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const urlParams = new URLSearchParams(window.location.search);
    const urlCat = urlParams.get('category');

    document.querySelectorAll('#main-menu > li').forEach(li => {
      li.classList.remove('current-menu-item');
      const datePage = li.dataset.page || '';
      const dataCat = li.dataset.category || '';
      if (dataCat && urlCat && dataCat === urlCat) {
        li.classList.add('current-menu-item');
      } else if (!dataCat && (datePage === page || (datePage.length > 3 && page.includes(datePage)))) {
        li.classList.add('current-menu-item');
      }
    });
  }

  function reinitMinimalMenu() {
    if (typeof window._initMinimalMenu === 'function') {
      window._initMinimalMenu();
    } else if (typeof $ !== 'undefined') {
      var $menu = $('nav.main-nav .minimal-menu');
      if (!$menu.length) return;
      $menu.prev('.minimal-menu-button').remove();
      $menu.prev('input.minimal-menu-button').remove();
      $menu.find('input.show-submenu').remove();
      $menu.before('<label class="minimal-menu-button" for="mobile-nav"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></label><input class="minimal-menu-button" type="checkbox" id="mobile-nav" name="mobile-nav" />');
      $menu.find('ul.sub-menu').parent().addClass('submenu');
      $menu.find('div.menu-wrapper').parent().addClass('megamenu submenu');
      $menu.find('ul.sub-menu').before('<input class="show-submenu" type="checkbox" />');
      $menu.find('div.menu-wrapper').before('<input class="show-submenu" type="checkbox" />');
    }
  }

  async function updateCounts() {
    try {
      const [cartRes, wishRes] = await Promise.all([fetch('/api/cart'), fetch('/api/wishlist')]);
      const cartData = await cartRes.json();
      const wishData = await wishRes.json();
      const cartCount = cartData.cart ? cartData.cart.reduce((s, i) => s + i.quantity, 0) : 0;
      const wishCount = wishData.wishlist ? wishData.wishlist.length : 0;
      const cartEl = document.getElementById('nav-cart-count');
      const wishEl = document.getElementById('nav-wishlist-count');
      if (cartEl) cartEl.textContent = cartCount;
      if (wishEl) wishEl.textContent = wishCount;
    } catch (e) { /* silent */ }
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectNavbar();
    reinitMinimalMenu();
    updateCounts();
  });

  window.NavBar = { updateCounts };
})();
