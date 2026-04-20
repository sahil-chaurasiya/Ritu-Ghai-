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
            <li><a href="#"><img src="/assets/images/upi.svg" alt="UPI" style="height:24px;width:auto;vertical-align:middle;"/></a></li>
          </ul>
        </div>
      </div>
    </footer>`;

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
    /* Popup card */
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
    /* Popup header */
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
    /* Message bubble */
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
    /* CTA button */
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
    /* Floating FAB */
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
    /* Pulse ring */
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
    /* Notification dot */
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
        <!-- WhatsApp SVG icon -->
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
  function injectNavbar() {
    const body = document.body;
    ['topbar', 'header', 'footer'].forEach(sel => {
      const el = document.querySelector(sel + ', .' + sel);
      if (el) el.remove();
    });
    const hr = document.querySelector('hr.gray-line');
    if (hr) hr.remove();

    // Remove the flash-fix style now that old elements are gone
    const flashFix = document.getElementById('navbar-flash-fix');
    if (flashFix) flashFix.remove();

    const navDiv = document.createElement('div');
    navDiv.id = 'zorka-navbar';
    navDiv.innerHTML = NAVBAR_HTML;
    body.insertBefore(navDiv, body.firstChild);

    const footerDiv = document.createElement('div');
    footerDiv.innerHTML = FOOTER_HTML;
    body.appendChild(footerDiv);

    // Inject WhatsApp widget
    const waDiv = document.createElement('div');
    waDiv.innerHTML = WA_HTML;
    body.appendChild(waDiv);

    // Wire up WhatsApp toggle
    const waFab   = document.getElementById('rg-wa-fab');
    const waPopup = document.getElementById('rg-wa-popup');
    const waClose = document.getElementById('rg-wa-close-btn');
    const waNotif = document.getElementById('rg-wa-notif');

    function openPopup() {
      waPopup.classList.add('rg-wa-open');
      if (waNotif) waNotif.style.display = 'none';
    }
    function closePopup() {
      waPopup.classList.remove('rg-wa-open');
    }

    if (waFab)   waFab.addEventListener('click', function() {
      waPopup.classList.contains('rg-wa-open') ? closePopup() : openPopup();
    });
    if (waClose) waClose.addEventListener('click', function(e) {
      e.stopPropagation();
      closePopup();
    });

    // Auto-open after 4s on first visit
    if (!sessionStorage.getItem('rg_wa_seen')) {
      setTimeout(function() {
        openPopup();
        sessionStorage.setItem('rg_wa_seen', '1');
      }, 4000);
    }

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