/**
 * simple-banner.js — Plain CSS fade slideshow. No fancy library.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
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
      interval = setInterval(next, 4000);
    }

    // Dot clicks
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(this.dataset.index, 10));
        startAuto();
      });
    });

    startAuto();
  });
})();
