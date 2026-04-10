/**
 * index-products.js — dynamically loads all product sections on index.html
 * Targets: #carousel-1 (trending tabs), #carousel-2 (sale off), custom-blocks
 */
(function () {
  'use strict';

  const FALLBACK_IMG = '/assets/images/product-img-1.jpg';
  const MINI_FALLBACK = '/assets/images/new-in-img-1.jpg';

  function img(p) { return (p.images && p.images[0]) ? p.images[0] : FALLBACK_IMG; }
  function img2(p) { return (p.images && p.images[1]) ? p.images[1] : img(p); }

  /* ── LARGE PRODUCT CARD — matches old hardcoded HTML exactly ── */
  function bigCard(p) {
    const hasDeal = p.originalPrice && p.originalPrice > p.price;
    const discount = hasDeal ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const priceHtml = hasDeal
      ? '<ins><span class="amount">' + p.price.toFixed(2) + ' USD</span></ins> <del><span class="amount">' + p.originalPrice.toFixed(2) + ' USD</span></del>'
      : p.price.toFixed(2) + ' USD';
    const badge = p.badge === 'new'
      ? '<div class="product-new">NEW</div>'
      : (p.badge === 'sale' || hasDeal) ? '<div class="product-sale">-' + discount + '%</div>' : '';

    return '<div class="col-lg-3 col-md-4 col-sm-6">'
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
    return '<div class="col-md-12 col-sm-6">'
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

  /**
   * Fill each .showcase inside a carousel with products.
   * HTML: .showcase > .row > .box-product  — cards go inside .box-product
   */
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

  /* ── CUSTOM BLOCKS (new-in / featured / top-rated) ── */
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

  /* ── REINIT OWL after dynamic content ── */
  function reinitOwl() {
    if (typeof $ === 'undefined' || !$.fn.owlCarousel) return;

    function initOwl1() {
      var owl1el = $('#carousel-1 .box-content');
      if (!owl1el.length) return;
      try {
        if (owl1el.data('owl.carousel')) { owl1el.trigger('destroy.owl.carousel'); }
      } catch(e) {}
      owl1el.owlCarousel({ loop: true, items: 1, dots: false, autoHeight: true, rtl: false });

      var tabHeading_1 = $('#carousel-1 .tab-heading span');
      tabHeading_1.first().addClass('active');
      owl1el.on('changed.owl.carousel', function (e) {
        var tabIdx = e.item.index % e.item.count - 2;
        tabHeading_1.removeClass('active').eq(tabIdx).addClass('active');
      });
      tabHeading_1.off('touchstart mousedown').on('touchstart mousedown', function (e) {
        e.preventDefault();
        owl1el.trigger('to.owl.carousel', [$(this).index(), 300, true]);
      });
    }

    function initOwl2() {
      var owl2el = $('#carousel-2 .box-content');
      if (!owl2el.length) return;
      try {
        if (owl2el.data('owl.carousel')) { owl2el.trigger('destroy.owl.carousel'); }
      } catch(e) {}
      owl2el.owlCarousel({ loop: true, items: 1, dots: false, autoHeight: true, rtl: false, smartSpeed: 1500 });
      $('#carousel-2 .next').off('click').click(function () { owl2el.trigger('next.owl.carousel'); });
      $('#carousel-2 .prev').off('click').click(function () { owl2el.trigger('prev.owl.carousel'); });
    }

    // Wait for all product images to load before init so autoHeight measures correctly
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

      fillCarousel('carousel-1', all, 4);
      fillCarousel('carousel-2', saleProducts.length >= 4 ? saleProducts : all, 4);
      fillCustomBlocks(all);

      reinitOwl();

    } catch (err) {
      console.error('index-products error:', err);
      reinitOwl();
    }
  }

  document.addEventListener('DOMContentLoaded', loadHomepageProducts);
})();