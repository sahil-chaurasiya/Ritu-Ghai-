/**
 * admin-mobile.js
 * Injects a hamburger button + overlay for mobile sidebar navigation.
 * Runs after DOM is ready; does NOT interfere with any existing JS.
 */
(function () {
  function init() {
    var sidebar  = document.querySelector('.sidebar');
    var mainContent = document.querySelector('.main-content');
    if (!sidebar) return;

    /* ── Overlay ── */
    var overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    /* ── Hamburger button ── */
    var btn = document.createElement('button');
    btn.className = 'hamburger';
    btn.setAttribute('aria-label', 'Toggle navigation');
    btn.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
        '<line x1="3" y1="6"  x2="21" y2="6"/>' +
        '<line x1="3" y1="12" x2="21" y2="12"/>' +
        '<line x1="3" y1="18" x2="21" y2="18"/>' +
      '</svg>';

    /* Insert hamburger as the first child of topbar (before the h2) */
    var topbar = document.querySelector('.topbar');
    if (topbar) {
      topbar.insertBefore(btn, topbar.firstChild);
    }

    /* ── Toggle helpers ── */
    function openSidebar() {
      sidebar.classList.add('open');
      overlay.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function () {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    overlay.addEventListener('click', closeSidebar);

    /* Close sidebar when a nav link is tapped on mobile */
    sidebar.querySelectorAll('.sidebar-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) closeSidebar();
      });
    });

    /* Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSidebar();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();