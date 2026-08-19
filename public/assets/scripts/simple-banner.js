/**
 * simple-banner.js — Plain CSS fade slideshow. No fancy library.
 *
 * Banner slides are managed from the admin panel (Admin → Banners) and
 * served from GET /api/banners. On page load we try to fetch them and,
 * if any are returned, replace the slides/dots already in the HTML with
 * them. If the request fails (offline, brand-new empty database, etc.)
 * the slides already written into index.html are left untouched, so the
 * banner is never blank.
 */
(function () {
  'use strict';

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderBanners(banners) {
    var inner = document.getElementById('simple-banner-inner');
    var dotsWrap = document.getElementById('banner-dots');
    if (!inner || !dotsWrap || !banners.length) return;

    var slidesHtml = banners.map(function (b, i) {
      var desktopSrc = esc(b.image);
      var mobileSrc = esc(b.mobileImage || b.image);
      var alt = esc(b.alt || 'Banner');
      var imgs =
        '<img class="banner-img-desktop" src="' + desktopSrc + '" alt="' + alt + '" />' +
        '<img class="banner-img-mobile" src="' + mobileSrc + '" alt="' + alt + '" />';

      var slideInner = b.link
        ? '<a href="' + esc(b.link) + '">' + imgs + '</a>'
        : imgs;

      return '<div class="banner-slide' + (i === 0 ? ' active' : '') + '">' + slideInner + '</div>';
    }).join('');

    var dotsHtml = banners.map(function (b, i) {
      return '<span class="dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '"></span>';
    }).join('');

    inner.innerHTML = slidesHtml;
    dotsWrap.innerHTML = dotsHtml;
  }

  function initSlideshow() {
    var slides = document.querySelectorAll('.banner-slide');
    var dots   = document.querySelectorAll('.banner-dots .dot');
    if (!slides.length) return;

    var current = 0;
    var interval;

    function goTo(index) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function next() { goTo(current + 1); }

    function startAuto() {
      clearInterval(interval);
      if (slides.length > 1) interval = setInterval(next, 4000);
    }

    // Dot clicks
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(this.dataset.index, 10));
        startAuto();
      });
    });

    startAuto();
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/banners')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success && Array.isArray(data.banners) && data.banners.length) {
          renderBanners(data.banners);
        }
      })
      .catch(function () {
        // Fall through silently — the fallback slides already in the HTML stay put.
      })
      .then(initSlideshow);
  });
})();