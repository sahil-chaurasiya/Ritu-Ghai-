/**
 * navbar.js — Injects a shared, dynamic navbar + footer into every page.
 * Categories (and their subcategories) are loaded dynamically from /api/categories
 * so the admin can add, edit, or remove them from the admin panel at any time.
 */
(function () {
  'use strict';

  // Fallback categories shown instantly while the API call resolves,
  // and used if the API fails (keeps the nav functional offline / on error).
  // Mirrors the seeded categories (see server/utils/seedCategories.js) so
  // the nav looks the same whether it's serving fallback or live data.
  const FALLBACK_CATEGORIES = [
    { label: 'NEW ARRIVALS', value: 'New Arrivals', subcategories: [
      { label: 'Just In', value: 'Just In', isActive: true },
      { label: 'Trending Now', value: 'Trending Now', isActive: true },
      { label: 'Best Sellers', value: 'Best Sellers', isActive: true }
    ] },
    { label: 'WOMEN', value: 'Women', subcategories: [
      { label: 'Lehengas', value: 'Lehengas', isActive: true },
      { label: 'Sarees', value: 'Sarees', isActive: true },
      { label: 'Suit Sets', value: 'Suit Sets', isActive: true },
      { label: 'Indo-Western', value: 'Indo-Western', isActive: true },
      { label: 'Kurtas & Kurtis', value: 'Kurtas & Kurtis', isActive: true },
      { label: 'Dresses & Gowns', value: 'Dresses & Gowns', isActive: true },
      { label: 'Co-ord Sets', value: 'Co-ord Sets', isActive: true },
      { label: 'Kaftans', value: 'Kaftans', isActive: true },
      { label: 'Tops & Tunics', value: 'Tops & Tunics', isActive: true },
      { label: 'Bottom Wear', value: 'Bottom Wear', isActive: true },
      { label: 'Dupattas', value: 'Dupattas', isActive: true },
      { label: 'Jackets', value: 'Jackets', isActive: true }
    ] },
    { label: 'SHOP BY OCCASION', value: 'Shop by Occasion', subcategories: [
      { label: 'Bridal Collection', value: 'Bridal Collection', isActive: true },
      { label: 'Wedding Guest', value: 'Wedding Guest', isActive: true },
      { label: 'Engagement', value: 'Engagement', isActive: true },
      { label: 'Reception', value: 'Reception', isActive: true },
      { label: 'Haldi', value: 'Haldi', isActive: true },
      { label: 'Mehendi', value: 'Mehendi', isActive: true },
      { label: 'Sangeet', value: 'Sangeet', isActive: true },
      { label: 'Cocktail Party', value: 'Cocktail Party', isActive: true },
      { label: 'Festive Wear', value: 'Festive Wear', isActive: true },
      { label: 'Pooja Collection', value: 'Pooja Collection', isActive: true },
      { label: 'Summer Brunch', value: 'Summer Brunch', isActive: true },
      { label: 'Office Wear', value: 'Office Wear', isActive: true },
      { label: 'Vacation Edit', value: 'Vacation Edit', isActive: true }
    ] },
    { label: 'COLLECTIONS', value: 'Collections', subcategories: [
      { label: 'Wedding Collection', value: 'Wedding Collection', isActive: true },
      { label: 'Festive Collection', value: 'Festive Collection', isActive: true },
      { label: 'Heritage Collection', value: 'Heritage Collection', isActive: true },
      { label: 'Summer Collection', value: 'Summer Collection', isActive: true },
      { label: 'Luxury Collection', value: 'Luxury Collection', isActive: true },
      { label: 'Designer Edit', value: 'Designer Edit', isActive: true }
    ] },
    { label: 'READY TO SHIP', value: 'Ready to Ship', subcategories: [
      { label: '48 Hours Dispatch', value: '48 Hours Dispatch', isActive: true },
      { label: 'Ready to Wear', value: 'Ready to Wear', isActive: true }
    ] },
    { label: 'ACCESSORIES', value: 'Accessories', subcategories: [
      { label: 'Dupattas', value: 'Dupattas', isActive: true },
      { label: 'Potli Bags', value: 'Potli Bags', isActive: true },
      { label: 'Belts', value: 'Belts', isActive: true },
      { label: 'Jewellery', value: 'Jewellery', isActive: true }
    ] },
    { label: 'SALE', value: 'Sale', subcategories: [
      { label: 'Up to 30% Off', value: 'Up to 30% Off', isActive: true },
      { label: 'Up to 50% Off', value: 'Up to 50% Off', isActive: true },
      { label: 'Clearance', value: 'Clearance', isActive: true }
    ] }
  ];

  // ─── SUBCATEGORY DROPDOWN STYLES (injected once) ─────────────────────────────
  const SUBCATEGORY_STYLES = `
    /* ── Subcategory dropdown in navbar ── */
    #main-menu > li.has-subcats { position: relative; }
    #main-menu > li.has-subcats > a::after {
      content: ' ▾';
      font-size: 10px;
      opacity: 0.6;
      margin-left: 2px;
    }
    #main-menu > li.has-subcats .subcat-dropdown {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 200px;
      background: #fff;
      border-top: 2px solid #44332B;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      z-index: 9000;
      padding: 6px 0;
      list-style: none;
      margin: 0;
    }
    #main-menu > li.has-subcats:hover .subcat-dropdown,
    #main-menu > li.has-subcats:focus-within .subcat-dropdown {
      display: block;
    }
    #main-menu > li.has-subcats .subcat-dropdown li {
      display: block;
    }
    #main-menu > li.has-subcats .subcat-dropdown li a {
      display: block;
      padding: 9px 18px;
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #333;
      white-space: nowrap;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    #main-menu > li.has-subcats .subcat-dropdown li a:hover {
      background: #faf6f3;
      color: #44332B;
    }
    #main-menu > li.has-subcats .subcat-dropdown .subcat-view-all a {
      border-bottom: 1px solid #f0ece8;
      margin-bottom: 4px;
      color: #44332B;
      font-weight: 700;
    }
    /* Mobile: subcats as indented items (minimal-menu handles toggling) */
    @media (max-width: 991px) {
      #main-menu > li.has-subcats .subcat-dropdown {
        display: block;
        position: static;
        box-shadow: none;
        border-top: none;
        border-left: 2px solid #f0ece8;
        margin-left: 16px;
        padding: 0;
      }
      #main-menu > li.has-subcats > a::after { display: none; }
    }

    /* ── Keep the whole main menu on a single row (like Aura by Anamika) ── */
    @media (min-width: 768px) {
      nav.main-nav #main-menu {
        display: flex !important;
        flex-wrap: nowrap !important;
        justify-content: center;
        align-items: center;
        white-space: nowrap;
        max-width: 100%;
        overflow-x: auto;
        overflow-y: visible;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      nav.main-nav #main-menu::-webkit-scrollbar { display: none; }
      nav.main-nav #main-menu > li {
        flex: 0 0 auto;
        margin: 0 10px !important;
      }
      nav.main-nav #main-menu > li > a {
        padding: 0 0 8px !important;
        font-size: 11px !important;
        letter-spacing: 1px !important;
      }
    }
  `;

  // ─── BUILD NAV HTML ─────────────────────────────────────────────────────────
  function buildCategoryNavItems(categories) {
    return categories.map(cat => {
      const subs = (cat.subcategories || []).filter(s => s.isActive !== false);
      const hasSubs = subs.length > 0;
      const catUrl = `/shop-fullwidth.html?category=${encodeURIComponent(cat.value)}`;
      const pageKey = `shop-${cat.value.replace(/\s+/g, '-').toLowerCase()}`;

      if (!hasSubs) {
        return `<li data-page="${pageKey}" data-category="${cat.value}">
          <a href="${catUrl}">${cat.label}</a>
        </li>`;
      }

      // Category with subcategories — render dropdown
      const subItems = subs.map(s =>
        `<li><a href="/shop-fullwidth.html?category=${encodeURIComponent(cat.value)}&subcategory=${encodeURIComponent(s.value)}">${s.label}</a></li>`
      ).join('');

      return `<li class="has-subcats" data-page="${pageKey}" data-category="${cat.value}">
        <a href="${catUrl}">${cat.label}</a>
        <ul class="subcat-dropdown">
          <li class="subcat-view-all"><a href="${catUrl}">All ${cat.label}</a></li>
          ${subItems}
        </ul>
      </li>`;
    }).join('');
  }

  function buildCategoryFooterItems(categories) {
    return categories.map(cat =>
      `<li><a href="/shop-fullwidth.html?category=${encodeURIComponent(cat.value)}">${cat.label}</a></li>`
    ).join('');
  }

  function buildNavbarHTML(categories) {
    return `
    <style id="subcat-nav-styles">${SUBCATEGORY_STYLES}</style>
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
            <li><a href="https://youtube.com" target="_blank" rel="noopener" class="youtube"><i class="fa fa-youtube-play"></i></a></li>
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
              ${buildCategoryNavItems(categories)}
              <li data-page="blog"><a href="/blog.html">BLOG</a></li>
              <li data-page="about"><a href="/about-company.html">ABOUT</a></li>
              <li data-page="contact"><a href="/contact1.html">CONTACT</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </header>`;
  }

  function buildFooterHTML(categories) {
    return `
    <footer>
      <div class="container">
        <div class="row">
          <div class="col-md-3 col-sm-6">
            <h3>LOCATION</h3>
            <div class="address">
              Shahpur Jat, Siri Fort<br/>
              New Delhi – 110017<br/>
              <a href="tel:+919999999999" style="color:#44332B;font-size:13px;letter-spacing:1px;">
                <i class="fa fa-phone" style="margin-right:6px;"></i>Call Us
              </a>
            </div>
            <ul class="list-social">
              <li><a href="#" class="facebook"><i class="fa fa-facebook"></i></a></li>
              <li><a href="#" class="instagram"><i class="fa fa-instagram"></i></a></li>
            </ul>
          </div>
          <div class="col-md-3 col-sm-6">
            <h3>SHOP</h3>
            <ul class="list-link">
              ${buildCategoryFooterItems(categories)}
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
            <li><a href="#"><img src="/assets/images/upi.svg" alt="UPI" style="height:24px;width:auto;vertical-align:middle;"/></a></li>
          </ul>
        </div>
      </div>
    </footer>`;
  }

  // ─── WHATSAPP FLOATING WIDGET ────────────────────────────────────────────────
  const WA_PHONE   = '919999999999'; // ← replace with actual WhatsApp number
  const WA_MESSAGE = encodeURIComponent('Hi! I found you on your website and would like to know more.');

  const WA_STYLES = `
    /* ── WhatsApp Widget ── */
    #rg-wa-widget {
      position: fixed;
      bottom: 28px;
      right: 24px;
      z-index: 9999;
      font-family: 'Montserrat', sans-serif;
    }
    #rg-wa-popup {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 280px;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      overflow: hidden;
      transform: scale(0.7) translateY(20px);
      transform-origin: bottom right;
      opacity: 0;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), opacity 0.25s ease;
    }
    #rg-wa-popup.rg-wa-open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    #rg-wa-popup .rg-wa-header {
      background: #25282c;
      padding: 18px 18px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    #rg-wa-popup .rg-wa-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #44332B;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 20px;
      color: #fff;
    }
    #rg-wa-popup .rg-wa-info h4 {
      margin: 0 0 2px;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    #rg-wa-popup .rg-wa-info p {
      margin: 0;
      color: #aaa;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    #rg-wa-popup .rg-wa-online {
      width: 8px; height: 8px;
      background: #25d366;
      border-radius: 50%;
      display: inline-block;
      margin-right: 5px;
    }
    #rg-wa-popup .rg-wa-close {
      margin-left: auto;
      background: none;
      border: none;
      color: #aaa;
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
      padding: 0 0 0 8px;
    }
    #rg-wa-popup .rg-wa-close:hover { color: #fff; }
    #rg-wa-popup .rg-wa-body {
      padding: 18px 16px;
      background: #f0ece8;
    }
    #rg-wa-popup .rg-wa-bubble {
      background: #fff;
      border-radius: 0 10px 10px 10px;
      padding: 12px 14px;
      font-size: 13px;
      color: #333;
      line-height: 1.5;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      position: relative;
    }
    #rg-wa-popup .rg-wa-bubble::before {
      content: '';
      position: absolute;
      top: 0; left: -8px;
      border: 8px solid transparent;
      border-right-color: #fff;
      border-top-color: #fff;
      border-top-left-radius: 2px;
    }
    #rg-wa-popup .rg-wa-bubble .rg-wa-time {
      font-size: 10px;
      color: #aaa;
      text-align: right;
      margin-top: 6px;
    }
    #rg-wa-popup .rg-wa-cta {
      display: block;
      margin: 0 16px 16px;
      background: #25d366;
      color: #fff !important;
      text-align: center;
      padding: 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-decoration: none !important;
      transition: background 0.2s;
    }
    #rg-wa-popup .rg-wa-cta:hover { background: #1ebe5d; }
    #rg-wa-popup .rg-wa-cta i { margin-right: 7px; font-size: 15px; }
    #rg-wa-fab {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #25d366;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(37,211,102,0.45);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    #rg-wa-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 22px rgba(37,211,102,0.55);
    }
    #rg-wa-fab svg { width: 28px; height: 28px; }
    #rg-wa-fab::before {
      content: '';
      position: absolute;
      width: 100%; height: 100%;
      border-radius: 50%;
      background: rgba(37,211,102,0.4);
      animation: rg-wa-pulse 2s ease-out infinite;
    }
    @keyframes rg-wa-pulse {
      0%   { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(1.9); opacity: 0; }
    }
    #rg-wa-notif {
      position: absolute;
      top: 2px; right: 2px;
      width: 14px; height: 14px;
      background: #44332B;
      border-radius: 50%;
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: #fff;
      font-weight: 700;
    }
    @media (max-width: 575px) {
      #rg-wa-widget { bottom: 18px; right: 14px; }
      #rg-wa-popup  { width: 250px; }
    }
  `;

  const WA_HTML = `
    <style>${WA_STYLES}</style>
    <div id="rg-wa-widget">
      <div id="rg-wa-popup" role="dialog" aria-label="Chat with us on WhatsApp">
        <div class="rg-wa-header">
          <div class="rg-wa-avatar">
            <i class="fa fa-whatsapp"></i>
          </div>
          <div class="rg-wa-info">
            <h4>Ritu Ghai</h4>
            <p><span class="rg-wa-online"></span>Typically replies in minutes</p>
          </div>
          <button class="rg-wa-close" id="rg-wa-close-btn" aria-label="Close">&times;</button>
        </div>
        <div class="rg-wa-body">
          <div class="rg-wa-bubble">
            Hi there! 👋 How can we help you today? Feel free to ask about our collections, orders, or anything else.
            <div class="rg-wa-time">Just now</div>
          </div>
        </div>
        <a class="rg-wa-cta" href="https://wa.me/${WA_PHONE}?text=${WA_MESSAGE}" target="_blank" rel="noopener">
          <i class="fa fa-whatsapp"></i> Chat on WhatsApp
        </a>
      </div>
      <button id="rg-wa-fab" aria-label="Chat with us on WhatsApp">
        <span id="rg-wa-notif">1</span>
        <svg viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.001 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.418A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.524 2 12.001 2zm0 1.5a8.5 8.5 0 110 17 8.5 8.5 0 010-17zm-2.4 4.05c-.2 0-.52.075-.79.375-.27.3-1.03 1.005-1.03 2.45 0 1.446 1.055 2.842 1.2 3.042.146.2 2.056 3.19 5.036 4.345 2.484.98 2.985.785 3.525.735.54-.05 1.74-.71 1.985-1.395.245-.685.245-1.27.17-1.395-.073-.123-.27-.2-.57-.35-.298-.15-1.76-.87-2.033-.97-.27-.098-.468-.147-.666.15-.2.297-.767.97-.94 1.17-.172.198-.344.223-.64.074-.297-.15-1.254-.463-2.39-1.475-.883-.79-1.48-1.764-1.653-2.062-.173-.298-.018-.46.13-.608.133-.133.297-.347.447-.52.148-.175.197-.3.297-.5.1-.2.05-.373-.025-.52-.075-.15-.662-1.608-.913-2.2-.24-.573-.484-.495-.666-.504l-.57-.01z"/>
        </svg>
      </button>
    </div>
  `;

  // This runs synchronously when the script tag is parsed — before the browser
  // paints — so the old hardcoded topbar/header/footer are never visible.
  (function hideStaticNav() {
    var style = document.createElement('style');
    style.id = 'navbar-flash-fix';
    style.textContent = [
      'body > .topbar { display: none !important; }',
      'body > hr.gray-line { display: none !important; }',
      'body > header { display: none !important; }',
      'body > footer { display: none !important; }'
    ].join(' ');
    var head = document.head || document.getElementsByTagName('head')[0];
    if (head) head.insertBefore(style, head.firstChild);
  })();

  // ─── INJECT ──────────────────────────────────────────────────────────────────
  function injectNavbar(categories) {
    const body = document.body;
    ['topbar', 'header', 'footer'].forEach(sel => {
      const el = document.querySelector(sel + ', .' + sel);
      if (el) el.remove();
    });
    const hr = document.querySelector('hr.gray-line');
    if (hr) hr.remove();

    const flashFix = document.getElementById('navbar-flash-fix');
    if (flashFix) flashFix.remove();

    const existing = document.getElementById('zorka-navbar');
    if (existing) existing.remove();

    const navDiv = document.createElement('div');
    navDiv.id = 'zorka-navbar';
    navDiv.innerHTML = buildNavbarHTML(categories);
    body.insertBefore(navDiv, body.firstChild);

    // Footer
    let footerDiv = document.getElementById('zorka-footer');
    if (!footerDiv) {
      footerDiv = document.createElement('div');
      footerDiv.id = 'zorka-footer';
      body.appendChild(footerDiv);
    }
    footerDiv.innerHTML = buildFooterHTML(categories);

    // WhatsApp widget (inject once)
    if (!document.getElementById('rg-wa-widget')) {
      const waDiv = document.createElement('div');
      waDiv.innerHTML = WA_HTML;
      body.appendChild(waDiv);

      const waFab   = document.getElementById('rg-wa-fab');
      const waPopup = document.getElementById('rg-wa-popup');
      const waClose = document.getElementById('rg-wa-close-btn');
      const waNotif = document.getElementById('rg-wa-notif');

      function openPopup()  { waPopup.classList.add('rg-wa-open'); if (waNotif) waNotif.style.display = 'none'; }
      function closePopup() { waPopup.classList.remove('rg-wa-open'); }

      if (waFab)   waFab.addEventListener('click', function () {
        waPopup.classList.contains('rg-wa-open') ? closePopup() : openPopup();
      });
      if (waClose) waClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closePopup();
      });

      if (!sessionStorage.getItem('rg_wa_seen')) {
        setTimeout(function () {
          openPopup();
          sessionStorage.setItem('rg_wa_seen', '1');
        }, 4000);
      }
    }

    setActiveNavItem();
  }

  function setActiveNavItem() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const urlParams = new URLSearchParams(window.location.search);
    const urlCat = urlParams.get('category');
    const urlSub = urlParams.get('subcategory');

    document.querySelectorAll('#main-menu > li').forEach(li => {
      li.classList.remove('current-menu-item');
      const datePage = li.dataset.page || '';
      const dataCat  = li.dataset.category || '';
      if (dataCat && urlCat && dataCat === urlCat) {
        li.classList.add('current-menu-item');
      } else if (!dataCat && (datePage === page || (datePage.length > 3 && page.includes(datePage)))) {
        li.classList.add('current-menu-item');
      }
    });

    // Also highlight the active subcategory link
    if (urlSub) {
      document.querySelectorAll('.subcat-dropdown li a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href.includes('subcategory=' + encodeURIComponent(urlSub))) {
          a.style.color = '#44332B';
          a.style.fontWeight = '700';
        }
      });
    }
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
      // Wire subcat-dropdowns as mobile sub-menus
      $menu.find('ul.subcat-dropdown').parent().addClass('submenu');
      $menu.find('ul.sub-menu, ul.subcat-dropdown').before('<input class="show-submenu" type="checkbox" />');
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

  // ─── FETCH CATEGORIES & BOOT ──────────────────────────────────────────────
  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        return data.categories;
      }
    } catch (e) { /* fall through to fallback */ }
    return FALLBACK_CATEGORIES;
  }

  document.addEventListener('DOMContentLoaded', async function () {
    // Inject immediately with fallback so nav appears with zero flicker
    injectNavbar(FALLBACK_CATEGORIES);
    reinitMinimalMenu();
    updateCounts();

    // Then fetch real categories (with subcategories) and re-inject
    const categories = await fetchCategories();
    const fallbackValues = FALLBACK_CATEGORIES.map(c => c.value).join(',');
    const fetchedValues  = categories.map(c => c.value).join(',');
    // Always re-inject after fetch to pick up subcategories even if top-level cats match
    injectNavbar(categories);
    reinitMinimalMenu();
  });

  window.NavBar = { updateCounts };
})();