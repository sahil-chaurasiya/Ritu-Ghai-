/**
 * navbar.js — Injects a shared, dynamic navbar + footer into every page.
 * Handles: cart count, wishlist count, active link highlighting, category mega-menu.
 */
(function () {
  'use strict';

  // ─── NAVBAR HTML ────────────────────────────────────────────────────────────
  const NAVBAR_HTML = `
    <div class="topbar">
      <div class="container">
        <div class="left-topbar">
          WELCOME TO ZORKA SHOP
        </div>
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
          <img src="/assets/images/logo.png" alt="Zorka" style="width:200px; height:auto;" />
        </a>
        <div class="header-social">
          <ul class="list-social">
            <li><a href="#" class="facebook"><i class="fa fa-facebook"></i></a></li>
            <li><a href="#" class="twitter"><i class="fa fa-twitter"></i></a></li>
            <li><a href="#" class="instagram"><i class="fa fa-instagram"></i></a></li>
            <li><a href="#" class="vk"><i class="fa fa-vk"></i></a></li>
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
              <li data-page="shop">
                <a href="/shop-fullwidth.html">SHOP</a>
                <div class="menu-wrapper">
                  <div class="col-lg-3 col-md-6 col-sm-6">
                    <h3>MEN'S CLOTHING</h3><hr/>
                    <p>Discover our latest men's collection.</p>
                    <div class="media">
                      <div class="media-left">
                        <a href="/shop-fullwidth.html">
                          <img class="img-responsive" src="/assets/images/small-product-img-1.jpg" alt="Men" onerror="this.style.display='none'"/>
                        </a>
                      </div>
                      <div class="media-body">
                        <ul id="nav-men-cats">
                          <li><a href="/shop-fullwidth.html">All Men's</a></li>
                          <li><a href="/shop-fullwidth.html">Jackets &amp; Coats</a></li>
                          <li><a href="/shop-fullwidth.html">T-Shirts</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-6 col-sm-6">
                    <h3>WOMEN'S CLOTHING</h3><hr/>
                    <p>Explore our women's fashion range.</p>
                    <div class="media">
                      <div class="media-left">
                        <a href="/shop-fullwidth.html">
                          <img class="img-responsive" src="/assets/images/small-product-img-3.jpg" alt="Women" onerror="this.style.display='none'"/>
                        </a>
                      </div>
                      <div class="media-body">
                        <ul id="nav-women-cats">
                          <li><a href="/shop-fullwidth.html">All Women's</a></li>
                          <li><a href="/shop-fullwidth.html">Dresses</a></li>
                          <li><a href="/shop-fullwidth.html">Tops</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-6 col-sm-6">
                    <h3>QUICK LINKS</h3><hr/>
                    <ul>
                      <li><a href="/shop-fullwidth.html">All Products</a></li>
                      <li><a href="/shop-with-sidebar.html">Shop with Sidebar</a></li>
                      <li><a href="/shopping-cart.html">Shopping Cart</a></li>
                      <li><a href="/wishlist.html">My Wishlist</a></li>
                      <li><a href="/check-out.html">Checkout</a></li>
                    </ul>
                  </div>
                  <div class="col-lg-3 col-md-6 col-sm-6" id="nav-featured-col">
                    <h3>FEATURED</h3><hr/>
                    <div id="nav-featured-product"></div>
                  </div>
                </div>
              </li>
              <li data-page="blog">
                <a href="/blog.html">BLOG</a>
                <ul class="sub-menu">
                  <li><a href="/blog.html">All Posts</a></li>
                  <li><a href="/blog-post.html">Single Post</a></li>
                </ul>
              </li>
              <li data-page="pages">
                <a href="/about-company.html">PAGES</a>
                <ul class="sub-menu">
                  <li><a href="/about-company.html">About Us</a></li>
                  <li><a href="/contact1.html">Contact</a></li>
                  <li><a href="/services.html">Services</a></li>
                  <li><a href="/our-team.html">Our Team</a></li>
                  <li><a href="/faq.html">FAQ</a></li>
                  <li><a href="/hiring.html">Careers</a></li>
                </ul>
              </li>
              <li data-page="portfolio">
                <a href="/portfolio.html">PORTFOLIO</a>
                <ul class="sub-menu">
                  <li><a href="/portfolio.html">Portfolio</a></li>
                  <li><a href="/portfolio-4-col.html">Portfolio 4 Col</a></li>
                  <li><a href="/single-portfolio.html">Single Portfolio</a></li>
                </ul>
              </li>
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
            <div class="address">580, BROADWAY, 10012 - NEW YORK<br/>NY - USA</div>
            <p>Tel. <a href="tel:12123431725">+1 212 343 1725</a></p>
            <p>Email. <a href="mailto:info@zorka.com">info@zorka.com</a></p>
            <ul class="list-social">
              <li><a href="#" class="facebook"><i class="fa fa-facebook"></i></a></li>
              <li><a href="#" class="twitter"><i class="fa fa-twitter"></i></a></li>
              <li><a href="#" class="instagram"><i class="fa fa-instagram"></i></a></li>
            </ul>
          </div>
          <div class="col-md-3 col-sm-6">
            <h3>SHOP</h3>
            <ul class="list-link">
              <li><a href="/shop-fullwidth.html">ALL PRODUCTS</a></li>
              <li><a href="/shopping-cart.html">SHOPPING CART</a></li>
              <li><a href="/wishlist.html">MY WISHLIST</a></li>
              <li><a href="/check-out.html">CHECKOUT</a></li>
              <li><a href="/track-your-order.html">TRACK ORDER</a></li>
            </ul>
          </div>
          <div class="col-md-3 col-sm-6">
            <h3>COMPANY</h3>
            <ul class="list-link">
              <li><a href="/about-company.html">ABOUT US</a></li>
              <li><a href="/services.html">SERVICES</a></li>
              <li><a href="/our-team.html">OUR TEAM</a></li>
              <li><a href="/contact1.html">CONTACT</a></li>
              <li><a href="/hiring.html">CAREERS</a></li>
              <li><a href="/faq.html">FAQ</a></li>
            </ul>
          </div>
          <div class="col-md-3 col-sm-6">
            <h3>POLICIES</h3>
            <ul class="list-link">
              <li><a href="/page-with-sidebar.html">PRIVACY POLICY</a></li>
              <li><a href="/page-with-sidebar.html">RETURNS &amp; EXCHANGES</a></li>
              <li><a href="/page-with-sidebar.html">SHIPPING INFO</a></li>
              <li><a href="/page-with-sidebar.html">PAYMENT OPTIONS</a></li>
              <li><a href="/page-with-sidebar.html">TERMS &amp; CONDITIONS</a></li>
            </ul>
          </div>
        </div>
        <div class="bottom-footer">
          <div class="copyright">&copy;COPYRIGHT 2025. ZORKA SHOP</div>
          <ul class="list-payment">
            <li><a href="#"><img src="/assets/images/visa.png" alt="Visa"/></a></li>
            <li><a href="#"><img src="/assets/images/paypal.png" alt="PayPal"/></a></li>
            <li><a href="#"><img src="/assets/images/ae.png" alt="AE"/></a></li>
            <li><a href="#"><img src="/assets/images/skrill.png" alt="Skrill"/></a></li>
          </ul>
        </div>
      </div>
    </footer>`;

  // ─── INJECT ──────────────────────────────────────────────────────────────────
  function injectNavbar() {
    const body = document.body;

    // Remove old static topbar, hr.gray-line and header if present
    const existing = document.querySelector('.topbar');
    const existingHr = document.querySelector('hr.gray-line');
    const existingHeader = document.querySelector('header');
    const existingFooter = document.querySelector('footer');

    if (existing) existing.remove();
    if (existingHr) existingHr.remove();
    if (existingHeader) existingHeader.remove();
    if (existingFooter) existingFooter.remove();

    // Inject navbar at top of body
    const navDiv = document.createElement('div');
    navDiv.id = 'zorka-navbar';
    navDiv.innerHTML = NAVBAR_HTML;
    body.insertBefore(navDiv, body.firstChild);

    // Inject footer before closing body
    const footerDiv = document.createElement('div');
    footerDiv.innerHTML = FOOTER_HTML;
    body.appendChild(footerDiv);

    // Set active nav item
    setActiveNavItem();
  }

  function setActiveNavItem() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#main-menu > li').forEach(li => {
      li.classList.remove('current-menu-item');
      const datePage = li.dataset.page || '';
      if (datePage === page || (datePage !== 'index.html' && datePage.length > 1 && page.includes(datePage))) {
        li.classList.add('current-menu-item');
      }
    });
  }

  // ─── REINIT MINIMAL MENU after injection ─────────────────────────────────────
  function reinitMinimalMenu() {
    // Use the shared helper exposed by functions.js
    if (typeof window._initMinimalMenu === 'function') {
      window._initMinimalMenu();
    } else if (typeof $ !== 'undefined') {
      // Fallback if functions.js hasn't loaded yet
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

  // ─── DYNAMIC COUNTS ─────────────────────────────────────────────────────────
  async function updateCounts() {
    try {
      const [cartRes, wishRes] = await Promise.all([
        fetch('/api/cart'),
        fetch('/api/wishlist')
      ]);
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

  // ─── DYNAMIC CATEGORIES IN MEGA-MENU ────────────────────────────────────────
  async function loadNavCategories() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (!data.success || !data.products.length) return;

      const cats = [...new Set(data.products.map(p => p.category))];

      // Split categories into men/women roughly by name, or just populate quick links
      const menCats = document.getElementById('nav-men-cats');
      const womenCats = document.getElementById('nav-women-cats');

      if (menCats && cats.length > 0) {
        const menLinks = cats.filter(c => /men|shirt|jacket|coat|pants|trouser/i.test(c));
        const displayCats = menLinks.length ? menLinks : cats.slice(0, 3);
        menLinks.length || (menCats.innerHTML = ''); // reset if no match
        displayCats.slice(0, 4).forEach(c => {
          const li = document.createElement('li');
          li.innerHTML = '<a href="/shop-fullwidth.html?category=' + encodeURIComponent(c) + '">' + c + '</a>';
          menCats.appendChild(li);
        });
      }

      if (womenCats && cats.length > 0) {
        const womenLinks = cats.filter(c => /women|dress|top|skirt|blouse/i.test(c));
        const displayCats = womenLinks.length ? womenLinks : cats.slice(0, 3);
        womenLinks.length || (womenCats.innerHTML = '');
        displayCats.slice(0, 4).forEach(c => {
          const li = document.createElement('li');
          li.innerHTML = '<a href="/shop-fullwidth.html?category=' + encodeURIComponent(c) + '">' + c + '</a>';
          womenCats.appendChild(li);
        });
      }

      // Featured product in nav
      const featured = data.products[0];
      const featuredEl = document.getElementById('nav-featured-product');
      if (featuredEl && featured) {
        const img = featured.images && featured.images[0] ? featured.images[0] : '/assets/images/product-img-1.jpg';
        featuredEl.innerHTML =
          '<a href="/single-product.html?id=' + featured._id + '">'
          + '<img src="' + img + '" style="width:100%;max-width:140px;height:auto;margin-bottom:8px;" onerror="this.src=\'/assets/images/product-img-1.jpg\'"/>'
          + '<p style="font-size:11px;letter-spacing:1px;">' + featured.name + '</p>'
          + '<p style="font-size:12px;font-weight:700;">' + featured.price.toFixed(2) + ' USD</p>'
          + '</a>';
      }
    } catch (e) { /* silent */ }
  }

  // ─── INIT ────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    // Inject navbar HTML into DOM first
    injectNavbar();
    // Now call reinitMinimalMenu — functions.js has already run its
    // DOMContentLoaded handler (it loaded before navbar.js), so
    // window._initMinimalMenu is defined and the menu is in the DOM.
    reinitMinimalMenu();

    updateCounts();
    loadNavCategories();
  });

  // Expose for other scripts
  window.NavBar = { updateCounts };
})();