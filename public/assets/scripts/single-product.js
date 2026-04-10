/**
 * single-product.js — loads a single product by ?id= and wires all UI
 */
(function () {
  'use strict';

  var PRODUCT_ID = new URLSearchParams(window.location.search).get('id');

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
  }

  function starsHtml(score) {
    var s = Math.round(Number(score));
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<i class="fa fa-star' + (i <= s ? '' : '-o') + '" style="color:#ca7379;font-size:13px;margin-right:2px;"></i>';
    }
    return html;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── TABS ──────────────────────────────────────
  // Override easyResponsiveTabs stacking with our own click-to-switch
  function initTabs() {
    var root      = document.getElementById('sp-tabs');
    if (!root) return;
    var tabItems  = root.querySelectorAll('.resp-tabs-list.hor_1 li');
    var tabPanels = root.querySelectorAll('.resp-tabs-container.hor_1 > div');
    if (!tabItems.length || !tabPanels.length) return;

    // Show only first panel
    tabPanels.forEach(function(p, i) { p.style.display = i === 0 ? 'block' : 'none'; });
    tabItems[0].classList.add('resp-tab-active');

    tabItems.forEach(function(tab, idx) {
      tab.style.cursor = 'pointer';
      tab.addEventListener('click', function() {
        tabItems.forEach(function(t) { t.classList.remove('resp-tab-active'); });
        tabPanels.forEach(function(p) { p.style.display = 'none'; });
        tab.classList.add('resp-tab-active');
        if (tabPanels[idx]) tabPanels[idx].style.display = 'block';
      });
    });
  }

  // ── REVIEWS ───────────────────────────────────
  function renderReviews(reviews) {
    var list        = document.getElementById('review-list');
    var countLabel  = document.getElementById('review-count-label');
    var tabLabel    = document.getElementById('tab-reviews-label');
    var headerCount = document.querySelector('.product-statistic .review-count');
    var n = reviews.length;

    if (countLabel)  countLabel.textContent = n + (n === 1 ? ' COMMENT' : ' COMMENTS');
    if (tabLabel)    tabLabel.textContent   = 'REVIEWS (' + n + ')';
    if (headerCount) headerCount.textContent = n + (n === 1 ? ' REVIEW' : ' REVIEWS');

    if (!list) return;

    if (!n) {
      list.innerHTML = '<li style="list-style:none;padding:20px 0;color:#aaa;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:2px;">NO REVIEWS YET. BE THE FIRST!</li>';
      return;
    }

    list.innerHTML = reviews.map(function(r) {
      return '<li class="comment">'
        + '<article class="comment-body media">'
        + '<div class="media-left"><span style="display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:#f0e8e9;color:#ca7379;font-family:Montserrat,sans-serif;font-weight:700;font-size:16px;text-transform:uppercase;">'
        + escapeHtml(r.name.charAt(0))
        + '</span></div>'
        + '<div class="media-body">'
        + '<div class="comment-content">' + escapeHtml(r.body) + '</div>'
        + '<div class="comment-info">'
        + '<h5>' + escapeHtml(r.name.toUpperCase()) + '</h5>'
        + '<div class="comment-date"><i class="pe-7s-clock"></i>' + formatDate(r.createdAt) + '</div>'
        + '<div style="margin-top:4px;">' + starsHtml(r.rating) + '</div>'
        + '</div>'
        + '</div>'
        + '</article></li>';
    }).join('');
  }

  async function loadReviews(productId) {
    try {
      var res  = await fetch('/api/products/' + productId + '/reviews');
      var data = await res.json();
      if (data.success) renderReviews(data.reviews);
    } catch(e) { console.error('loadReviews:', e); }
  }

  function initReviewForm(productId) {
    var form        = document.getElementById('review-form');
    var msgEl       = document.getElementById('review-msg');
    var ratingInput = document.getElementById('review-rating-val');
    var starSpan    = document.getElementById('review-star-input');

    // ── interactive star picker (plain, no raty dependency) ──
    if (starSpan) {
      var picked = 0;
      starSpan.innerHTML = '';
      for (var i = 1; i <= 5; i++) {
        (function(val) {
          var star = document.createElement('i');
          star.className = 'fa fa-star-o';
          star.style.cssText = 'color:#ca7379;font-size:20px;margin-right:5px;cursor:pointer;transition:transform 0.1s;';
          star.addEventListener('mouseover', function() { paintStars(starSpan, val); });
          star.addEventListener('mouseout',  function() { paintStars(starSpan, picked); });
          star.addEventListener('click',     function() {
            picked = val;
            if (ratingInput) ratingInput.value = val;
            paintStars(starSpan, val);
          });
          starSpan.appendChild(star);
        })(i);
      }
    }

    function paintStars(container, n) {
      container.querySelectorAll('i').forEach(function(s, idx) {
        s.className = idx < n ? 'fa fa-star' : 'fa fa-star-o';
        s.style.cssText = 'color:#ca7379;font-size:20px;margin-right:5px;cursor:pointer;';
      });
    }

    function showMsg(text, color) {
      if (!msgEl) return;
      msgEl.textContent = text;
      msgEl.style.color = color || '#333';
    }

    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      var bodyEl  = document.getElementById('review-body');
      var nameEl  = document.getElementById('review-name');
      var emailEl = document.getElementById('review-email');
      var rating  = ratingInput ? Number(ratingInput.value) : 0;

      if (!rating || rating < 1) { showMsg('Please select a star rating.', '#c0392b'); return; }
      if (!bodyEl  || !bodyEl.value.trim())  { showMsg('Please write your review.', '#c0392b'); return; }
      if (!nameEl  || !nameEl.value.trim())  { showMsg('Please enter your name.', '#c0392b'); return; }
      if (!emailEl || !emailEl.value.trim()) { showMsg('Please enter your email.', '#c0392b'); return; }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'SUBMITTING…'; }

      try {
        var res  = await fetch('/api/products/' + productId + '/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nameEl.value.trim(), email: emailEl.value.trim(), rating: rating, body: bodyEl.value.trim() })
        });
        var data = await res.json();
        if (data.success) {
          showMsg('Review submitted! Thank you.', '#27ae60');
          form.reset();
          if (ratingInput) ratingInput.value = 0;
          if (starSpan) paintStars(starSpan, 0);
          await loadReviews(productId);
        } else {
          showMsg(data.message || 'Error submitting review.', '#c0392b');
        }
      } catch(err) {
        showMsg('Network error. Please try again.', '#c0392b');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'ADD REVIEW'; }
      }
    });
  }

  // ── MAIN PRODUCT LOAD ─────────────────────────
  async function loadProduct() {
    try {
      var res  = await fetch('/api/products/' + PRODUCT_ID);
      var data = await res.json();
      if (!data.success) return;
      var p = data.product;

      document.title = p.name + ' — Zorka Shop';

      var nameEl = document.querySelector('h2.product-name');
      if (nameEl) { nameEl.textContent = p.name; nameEl.style.color = ''; nameEl.style.minHeight = ''; }

      var breadEl = document.querySelector('nav.breadcrumb span');
      if (breadEl) breadEl.textContent = p.name;

      var priceEl = document.querySelector('.summary .price, .product .price');
      if (priceEl) {
        if (p.originalPrice && p.originalPrice > p.price) {
          priceEl.innerHTML = '<ins>' + p.price.toFixed(2) + ' USD</ins> <del style="color:#aaa;font-size:0.8em">' + p.originalPrice.toFixed(2) + ' USD</del>';
        } else {
          priceEl.textContent = p.price.toFixed(2) + ' USD';
        }
      }

      // ── Description tab ──
      var descEl = document.getElementById('tab-description');
      if (descEl) {
        descEl.innerHTML = p.description
          ? '<p>' + escapeHtml(p.description).replace(/\n/g, '<br>') + '</p>'
          : '<p style="color:#aaa;font-style:italic;">No description provided.</p>';
      }

      // ── Additional info tab ──
      var addEl = document.getElementById('tab-additional-info');
      if (addEl) {
        addEl.innerHTML = p.additionalInfo
          ? '<p>' + escapeHtml(p.additionalInfo).replace(/\n/g, '<br>') + '</p>'
          : '<p style="color:#aaa;font-style:italic;">No additional information provided.</p>';
      }

      // ── Stock / Category ──
      var skuEl = document.querySelector('.ul-product li:first-child');
      if (skuEl) skuEl.innerHTML = 'Stock: <strong>' + (p.stock > 0 ? p.stock + ' available' : '<span style="color:#c0392b">Out of Stock</span>') + '</strong>';
      var catEl = document.querySelectorAll('.ul-product li')[1];
      if (catEl) catEl.innerHTML = 'Category: <a href="/shop-fullwidth.html?category=' + encodeURIComponent(p.category) + '">' + escapeHtml(p.category) + '</a>';

      // ── Images ──
      if (p.images && p.images.length > 0) {
        var mainImg = document.querySelector('#product-showcase .gallery .full img');
        if (mainImg) { mainImg.src = p.images[0]; mainImg.alt = p.name; }

        var previewsBox = document.querySelector('#product-showcase .gallery .previews .box-content');
        if (previewsBox) {
          if (typeof $ !== 'undefined' && $.fn.owlCarousel) {
            try {
              var $pb = $(previewsBox);
              if ($pb.data('owl.carousel')) { $pb.trigger('destroy.owl.carousel'); $pb.removeClass('owl-carousel owl-loaded owl-drag'); }
            } catch(e) {}
          }

          previewsBox.innerHTML = p.images.map(function(imgSrc, i) {
            return '<div><img ' + (i === 0 ? 'class="selected" ' : '') + 'data-full="' + imgSrc + '" src="' + imgSrc + '" onerror="this.src=\'/assets/images/small-product-1.jpg\'" alt="' + escapeHtml(p.name) + ' ' + (i + 1) + '"/></div>';
          }).join('');

          var previewsWrapper = document.querySelector('#product-showcase .gallery .previews');
          if (previewsWrapper) {
            previewsWrapper.addEventListener('click', function(e) {
              var thumb = e.target.closest('img[data-full]');
              if (!thumb) return;
              var mImg = document.querySelector('#product-showcase .gallery .full img');
              if (mImg) mImg.src = thumb.dataset.full || thumb.src;
              previewsBox.querySelectorAll('img').forEach(function(t) { t.classList.remove('selected'); });
              thumb.classList.add('selected');
            });
          }

          setTimeout(function() {
            if (typeof $ !== 'undefined' && $.fn.owlCarousel) {
              var $pb2 = $(previewsBox);
              $pb2.owlCarousel({ margin: 0, smartSpeed: 1000, dots: false, responsive: { 0: {items:3}, 480: {items:4}, 768: {items:5}, 1200: {items:6} } });
              $('.gallery .previews .next').off('click.sp').on('click.sp', function() { $pb2.trigger('next.owl.carousel'); });
              $('.gallery .previews .prev').off('click.sp').on('click.sp', function() { $pb2.trigger('prev.owl.carousel'); });
            }
          }, 0);
        }
      }

      // ── Cart / wishlist buttons ──
      var atcBtn = document.querySelector('.add-to-cart-btn, button.add-to-cart');
      if (atcBtn) {
        atcBtn.addEventListener('click', function(e) {
          e.preventDefault();
          var qtyInput = document.querySelector('.product-action .quantity input');
          var qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
          if (typeof Cart !== 'undefined') Cart.addToCart(p._id, qty);
        });
      }
      var minusBtn = document.querySelector('.product-action .minus-btn');
      var plusBtn  = document.querySelector('.product-action .plus-btn');
      var qtyInput = document.querySelector('.product-action .quantity input');
      if (minusBtn && qtyInput) minusBtn.addEventListener('click', function() { var v = parseInt(qtyInput.value)||1; if(v>1) qtyInput.value=v-1; });
      if (plusBtn  && qtyInput) plusBtn.addEventListener('click',  function() { var v = parseInt(qtyInput.value)||1; qtyInput.value=v+1; });

      var wishBtn = document.querySelector('.wishlist-link, a.wishlist-link');
      if (wishBtn) wishBtn.addEventListener('click', function(e) { e.preventDefault(); if (typeof Cart !== 'undefined') Cart.addToWishlist(p._id); });

      // ── Reviews ──
      await loadReviews(PRODUCT_ID);
      initReviewForm(PRODUCT_ID);

      // ── Related products ──
      loadRelatedProducts(p.category, p._id);

    } catch (err) {
      console.error('Error loading product:', err);
    }
  }

  // ── RELATED PRODUCTS ──────────────────────────
  async function loadRelatedProducts(category, excludeId) {
    var container = document.querySelector('.related-products .box-product.row, .related .box-product, .related-products .box-product');
    if (!container) return;
    try {
      var res  = await fetch('/api/products?category=' + encodeURIComponent(category));
      var data = await res.json();
      if (!data.success) return;
      var related = data.products.filter(function(p) { return p._id.toString() !== excludeId; }).slice(0, 4);
      if (!related.length) return;

      container.innerHTML = related.map(function(p) {
        var img  = p.images && p.images[0] ? p.images[0] : '/assets/images/product-img-1.jpg';
        var img2 = p.images && p.images[1] ? p.images[1] : img;
        return '<div class="col-lg-3 col-md-4 col-sm-6">'
          + '<div class="product-item"><div class="product-thumb">'
          + '<div class="main-img"><a href="/single-product.html?id=' + p._id + '"><img class="img-responsive" src="' + img + '" alt="' + escapeHtml(p.name) + '" onerror="this.src=\'/assets/images/product-img-1.jpg\'"/></a></div>'
          + '<div class="overlay-img"><a href="/single-product.html?id=' + p._id + '"><img class="img-responsive" src="' + img2 + '" alt="' + escapeHtml(p.name) + '" onerror="this.src=\'/assets/images/product-img-1.jpg\'"/></a></div>'
          + '<a href="/single-product.html?id=' + p._id + '" class="details"><i class="pe-7s-search"></i></a>'
          + '</div>'
          + '<h4 class="product-name"><a href="/single-product.html?id=' + p._id + '">' + escapeHtml(p.name) + '</a></h4>'
          + '<p class="product-price">' + p.price.toFixed(2) + ' USD</p>'
          + '<div class="group-buttons">'
          + '<button type="button" class="add-to-cart btn-cart" data-id="' + p._id + '" data-toggle="tooltip" title="Add to Cart"><span>Add to Cart</span></button>'
          + '<button type="button" class="btn-wishlist" data-id="' + p._id + '" data-toggle="tooltip" title="Add to Wishlist"><i class="pe-7s-like"></i></button>'
          + '</div></div></div>';
      }).join('');

      container.querySelectorAll('.btn-cart').forEach(function(b) { b.addEventListener('click', function() { if (typeof Cart !== 'undefined') Cart.addToCart(this.dataset.id); }); });
      container.querySelectorAll('.btn-wishlist').forEach(function(b) { b.addEventListener('click', function() { if (typeof Cart !== 'undefined') Cart.addToWishlist(this.dataset.id); }); });

      if (typeof $ !== 'undefined' && $.fn.owlCarousel) {
        setTimeout(function() {
          var $rel = $('.related-products .box-content');
          if ($rel.length) {
            try { if ($rel.data('owl.carousel')) { $rel.trigger('destroy.owl.carousel'); $rel.removeClass('owl-carousel owl-loaded owl-drag'); } } catch(e) {}
            $rel.owlCarousel({ loop: true, items: 1, dots: false, autoHeight: true, rtl: false });
            $('.related-products .next').off('click.rp').on('click.rp', function() { $rel.trigger('next.owl.carousel'); });
            $('.related-products .prev').off('click.rp').on('click.rp', function() { $rel.trigger('prev.owl.carousel'); });
          }
        }, 0);
      }
      if (typeof $ !== 'undefined' && $.fn.tooltip) { $(container).find('[data-toggle="tooltip"]').tooltip(); }
    } catch(e) {}
  }

  // ── BOOT ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    if (PRODUCT_ID) loadProduct();
  });

})();