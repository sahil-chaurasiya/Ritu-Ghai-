/**
 * index-products.js — dynamically loads all product sections on index.html
 * + loads customer diaries section from /api/customer-diaries
 */
(function () {
  'use strict';

  const FALLBACK_IMG = '/assets/images/product-img-1.jpg';
  const MINI_FALLBACK = '/assets/images/new-in-img-1.jpg';

  function img(p) { return (p.images && p.images[0]) ? p.images[0] : FALLBACK_IMG; }
  function img2(p) { return (p.images && p.images[1]) ? p.images[1] : img(p); }

  /* ── LARGE PRODUCT CARD ── */
  function bigCard(p) {
    const hasDeal = p.originalPrice && p.originalPrice > p.price;
    const discount = hasDeal ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const priceHtml = hasDeal
      ? '<ins><span class="amount">' + p.price.toFixed(2) + ' USD</span></ins> <del><span class="amount">' + p.originalPrice.toFixed(2) + ' USD</span></del>'
      : p.price.toFixed(2) + ' USD';
    const badge = p.badge === 'new'
      ? '<div class="product-new">NEW</div>'
      : (p.badge === 'sale' || hasDeal) ? '<div class="product-sale">-' + discount + '%</div>' : '';

    return '<div class="col-lg-3 col-md-4 col-sm-6 col-xs-6">'
      + '<div class="product-item' + (hasDeal ? ' has-deal' : '') + '" style="overflow:visible;display:block;">'
      + '<div class="product-thumb" style="display:block;position:relative;width:100%;overflow:visible;">'
      + '<div class="main-img" style="display:block;width:100%;"><a href="/single-product.html?id=' + p._id + '">'
      + '<img class="img-responsive" src="' + img(p) + '" alt="' + p.name + '" style="width:100%;height:auto;display:block;" onerror="this.src=\'' + FALLBACK_IMG + '\'"/>'
      + '</a></div>'
      + '<div class="overlay-img"><a href="/single-product.html?id=' + p._id + '">'
      + '<img class="img-responsive" src="' + img2(p) + '" alt="' + p.name + '" style="width:100%;height:auto;display:block;" onerror="this.src=\'' + FALLBACK_IMG + '\'"/>'
      + '</a></div>'
      + badge
      + '<a href="/single-product.html?id=' + p._id + '" class="details"><i class="pe-7s-search"></i></a>'
      + '</div>'
      + '<h4 class="product-name" style="display:block;"><a href="/single-product.html?id=' + p._id + '">' + p.name + '</a></h4>'
      + '<p class="product-price" style="display:block;">' + priceHtml + '</p>'
      + '<div class="group-buttons" style="display:block;">'
      + '<button type="button" class="add-to-cart btn-dyn-cart" data-id="' + p._id + '" data-toggle="tooltip" data-placement="top" title="Add to Cart"><span>Add to Cart</span></button>'
      + '<button type="button" class="btn-dyn-wish" data-id="' + p._id + '" data-toggle="tooltip" data-placement="top" title="Add to Wishlist"><i class="pe-7s-like"></i></button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  /* ── MINI PRODUCT CARD ── */
  function miniCard(p) {
    return '<div class="col-md-12 col-sm-6 col-xs-6">'
      + '<div class="media">'
      + '<div class="media-left"><div class="block-thumb">'
      + '<div class="main-img"><a href="/single-product.html?id=' + p._id + '">'
      + '<img class="img-responsive" src="' + img(p) + '" alt="' + p.name + '" onerror="this.src=\'' + MINI_FALLBACK + '\'" style="width:80px;height:80px;object-fit:cover;"/>'
      + '</a></div>'
      + '<div class="overlay-img"><a href="/single-product.html?id=' + p._id + '">'
      + '<img class="img-responsive" src="' + img2(p) + '" alt="' + p.name + '" onerror="this.src=\'' + MINI_FALLBACK + '\'" style="width:80px;height:80px;object-fit:cover;"/>'
      + '</a></div>'
      + '</div></div>'
      + '<div class="media-body">'
      + '<h4><a href="/single-product.html?id=' + p._id + '">' + p.name + '</a></h4>'
      + '<p class="price">' + p.price.toFixed(2) + ' USD</p>'
      + '<div class="group-buttons">'
      + '<button type="button" class="btn-dyn-cart" data-id="' + p._id + '" data-toggle="tooltip" data-placement="top" title="Add to Cart"><i class="pe-7s-cart"></i></button>'
      + '<button type="button" class="btn-dyn-wish" data-id="' + p._id + '" data-toggle="tooltip" data-placement="top" title="Add to Wishlist"><i class="pe-7s-like"></i></button>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  /* ── BIND CART/WISH BUTTONS ── */
  function bind(el) {
    if (!el) return;
    el.querySelectorAll('.btn-dyn-cart').forEach(function(b) {
      b.addEventListener('click', function () {
        if (typeof Cart !== 'undefined') Cart.addToCart(this.dataset.id);
      });
    });
    el.querySelectorAll('.btn-dyn-wish').forEach(function(b) {
      b.addEventListener('click', function () {
        if (typeof Cart !== 'undefined') Cart.addToWishlist(this.dataset.id);
      });
    });
    if (typeof $ !== 'undefined' && $.fn.tooltip) {
      $(el).find('[data-toggle="tooltip"]').tooltip();
    }
  }

  function fillCarousel(carouselId, products, countPerTab) {
    var carousel = document.getElementById(carouselId);
    if (!carousel) return;
    var showcases = carousel.querySelectorAll('.showcase');
    showcases.forEach(function(showcase, tabIndex) {
      var boxProduct = showcase.querySelector('.box-product');
      if (!boxProduct) return;
      var start = (tabIndex * countPerTab) % products.length;
      var slice = [];
      for (var i = 0; i < countPerTab; i++) {
        slice.push(products[(start + i) % products.length]);
      }
      boxProduct.innerHTML = slice.map(bigCard).join('');
      bind(boxProduct);
    });
  }

  /* ── TRENDING CAROUSEL ──────────────────────────────────────────────────────
   * OWL handles 4-tab switching inside #carousel-1 .box-content.
   * Each tab's .box-product gets 8 products (2 rows of 4) — always fully rendered,
   * no hiding, so OWL autoHeight works perfectly.
   *
   * Extra products + Load More button live in #tc-loadmore OUTSIDE OWL.
   * There are 4 .tc-extra-panel divs (one per tab). Only the active tab's
   * panel is visible. OWL's changed event keeps them in sync.
   * ───────────────────────────────────────────────────────────────────────── */
  function fillTrendingCarousel(products) {
    var carousel = document.getElementById('carousel-1');
    if (!carousel) return;
    var showcases = carousel.querySelectorAll('.showcase');
    var panels    = document.querySelectorAll('#tc-loadmore .tc-extra-panel');

    function getSlice(startIdx, count) {
      var slice = [];
      for (var i = 0; i < count; i++) {
        slice.push(products[(startIdx + i) % products.length]);
      }
      return slice;
    }

    showcases.forEach(function(showcase, tabIndex) {
      var boxProduct = showcase.querySelector('.box-product');
      var panel      = panels[tabIndex];
      if (!boxProduct || !panel) return;

      var offset = (tabIndex * 4) % products.length;

      // ── OWL slide: always shows 8 products (row1 + row2) ──
      var visible8 = getSlice(offset, 8);
      boxProduct.innerHTML = visible8.map(bigCard).join('');
      bind(boxProduct);

      // ── Extra panel outside OWL: starts with row3 (next 8) ──
      var poolStart = offset + 8;
      var poolUsed  = 0;

      function renderExtraRow(prods) {
        // Wrap in .box-product so ALL existing product CSS applies correctly
        var wrap = document.createElement('div');
        wrap.className = 'box-product tc-extra-row';
        var row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = prods.map(bigCard).join('');
        wrap.appendChild(row);
        // Insert before the button
        var btn = panel.querySelector('.tc-load-more-btn');
        if (btn) panel.insertBefore(wrap, btn);
        else panel.appendChild(wrap);
        bind(wrap);
      }

      function buildPanel() {
        panel.innerHTML = '';

        var btn = document.createElement('button');
        btn.className = 'tc-load-more-btn';
        btn.type = 'button';
        btn.textContent = 'LOAD MORE';
        panel.appendChild(btn);

        btn.addEventListener('click', function() {
          var batch = getSlice((poolStart + poolUsed) % products.length, 8);
          poolUsed += 8;
          renderExtraRow(batch);
          // Never hide the button — site owner may add more products later
          // (cycling through existing ones is fine for UX)
        });
      }

      buildPanel();

      // show tab 0 panel by default, hide rest
      panel.style.display = (tabIndex === 0) ? 'block' : 'none';
    });

    // ── Sync panels when OWL tab changes ──
    // Store callback so initOwl1 can hook into it after OWL is ready
    carousel._onTabChange = function(activeTabIdx) {
      panels.forEach(function(p, i) {
        p.style.display = (i === activeTabIdx) ? 'block' : 'none';
      });
    };
  }


  function fillCustomBlocks(products) {
    var blocks = document.querySelectorAll('.custom-blocks .block-item');
    if (!blocks.length) return;
    blocks.forEach(function(block, i) {
      var rowEl = block.querySelector('.row');
      if (!rowEl) return;
      var start = (i * 2) % products.length;
      var items = [products[start % products.length], products[(start + 1) % products.length]];
      rowEl.innerHTML = items.map(miniCard).join('');
      bind(rowEl);
    });
  }

  function reinitOwl() {
    if (typeof $ === 'undefined' || !$.fn.owlCarousel) return;

    function initOwl1() {
      var owl1el = $('#carousel-1 .box-content');
      if (!owl1el.length) return;
      try { if (owl1el.data('owl.carousel')) { owl1el.trigger('destroy.owl.carousel'); } } catch(e) {}
      owl1el.owlCarousel({ loop: true, items: 1, dots: false, autoHeight: true, rtl: false });
      var tabHeading_1 = $('#carousel-1 .tab-heading span');
      tabHeading_1.first().addClass('active');
      owl1el.on('changed.owl.carousel', function (e) {
        var tabIdx = e.item.index % e.item.count - 2;
        tabHeading_1.removeClass('active').eq(tabIdx).addClass('active');
        // sync the extra-panel visibility outside OWL
        var c1 = document.getElementById('carousel-1');
        if (c1 && typeof c1._onTabChange === 'function') { c1._onTabChange(tabIdx); }
      });
      tabHeading_1.off('touchstart mousedown').on('touchstart mousedown', function (e) {
        e.preventDefault();
        owl1el.trigger('to.owl.carousel', [$(this).index(), 300, true]);
      });
    }

    function initOwl2() {
      var owl2el = $('#carousel-2 .box-content');
      if (!owl2el.length) return;
      try { if (owl2el.data('owl.carousel')) { owl2el.trigger('destroy.owl.carousel'); } } catch(e) {}
      owl2el.owlCarousel({ loop: true, items: 1, dots: false, autoHeight: true, rtl: false, smartSpeed: 1500 });
      $('#carousel-2 .next').off('click').click(function () { owl2el.trigger('next.owl.carousel'); });
      $('#carousel-2 .prev').off('click').click(function () { owl2el.trigger('prev.owl.carousel'); });
    }

    var allImgs = document.querySelectorAll('#carousel-1 img, #carousel-2 img');
    var total = allImgs.length;
    if (total === 0) { initOwl1(); initOwl2(); return; }
    var loaded = 0;
    function onLoad() {
      loaded++;
      if (loaded >= total) { initOwl1(); initOwl2(); }
    }
    allImgs.forEach(function(img) {
      if (img.complete) { onLoad(); }
      else { img.addEventListener('load', onLoad); img.addEventListener('error', onLoad); }
    });
  }

  /* ── CUSTOMER DIARIES ── */
  async function loadCustomerDiaries() {
    var track = document.getElementById('customer-diaries-track');
    if (!track) return;
    try {
      var res = await fetch('/api/customer-diaries');
      var data = await res.json();

      if (!data.success || !data.photos || !data.photos.length) {
        track.innerHTML = '<div class="cd-no-photos">No customer photos yet — upload some from the admin panel!</div>';
        return;
      }

      track.innerHTML = data.photos.map(function(photo) {
        return '<div class="cd-photo-item">'
          + '<img src="' + photo.url + '" alt="' + (photo.caption || 'Customer photo') + '" onerror="this.parentElement.style.display=\'none\'"/>'
          + (photo.caption ? '<div class="cd-caption">' + photo.caption + '</div>' : '')
          + '</div>';
      }).join('');
      // Duplicate items for seamless infinite marquee loop
      track.innerHTML += track.innerHTML;
    } catch(e) {
      track.innerHTML = '<div class="cd-no-photos">No customer photos yet — add them from the admin panel.</div>';
    }
  }

  /* ── MAIN ── */
  async function loadHomepageProducts() {
    try {
      var res = await fetch('/api/products');
      var data = await res.json();

      if (!data.success || !data.products.length) {
        ['carousel-1', 'carousel-2'].forEach(function(id) {
          var el = document.getElementById(id);
          if (!el) return;
          el.querySelectorAll('.showcase .box-product').forEach(function(box) {
            box.innerHTML = '<div class="col-xs-12" style="text-align:center;padding:40px;color:#aaa;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:2px;">NO PRODUCTS YET — <a href="/admin/add-product.html" style="color:#1a1a1a;text-decoration:underline;">ADD PRODUCTS IN ADMIN</a></div>';
          });
        });
        reinitOwl();
        return;
      }

      var all = data.products;
      var saleProducts = all.filter(function(p) {
        return p.badge === 'sale' || (p.originalPrice && p.originalPrice > p.price);
      });

      fillTrendingCarousel(all);
      fillCarousel('carousel-2', saleProducts.length >= 4 ? saleProducts : all, 4);
      fillCustomBlocks(all);
      reinitOwl();

    } catch (err) {
      console.error('index-products error:', err);
      reinitOwl();
    }
  }

  /* ── VIDEOS ── */
  async function loadVideos() {
    var track = document.getElementById('videos-track');
    if (!track) return;
    try {
      var res  = await fetch('/api/videos');
      var data = await res.json();

      if (!data.success || !data.videos || !data.videos.length) {
        track.closest('.videos-section').style.display = 'none';
        return;
      }

      // Build video items
      var itemsHTML = data.videos.map(function(v) {
        return '<a href="' + v.linkUrl + '" target="_blank" rel="noopener" class="vid-inline-item">'
          + '<video src="' + v.videoUrl + '" muted playsinline loop preload="auto"></video>'
          + (v.caption ? '<div class="cd-caption">' + v.caption + '</div>' : '')
          + '</a>';
      }).join('');

      // Duplicate for seamless infinite marquee
      track.innerHTML = itemsHTML + itemsHTML;

      // IntersectionObserver — play when visible, pause when not
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          var video = entry.target.querySelector('video');
          if (!video) return;
          if (entry.isIntersecting) {
            video.play().catch(function(){});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.2 });

      track.querySelectorAll('.vid-inline-item').forEach(function(item) {
        observer.observe(item);
      });

    } catch(e) {
      var section = document.querySelector('.videos-section');
      if (section) section.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    loadHomepageProducts();
    loadCustomerDiaries();
    loadVideos();
  });
})();