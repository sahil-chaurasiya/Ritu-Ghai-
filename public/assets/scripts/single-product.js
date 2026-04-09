/**
 * single-product.js — loads a single product by ?id= and wires all buttons
 */
(function () {
  'use strict';

  async function loadProduct() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return; // no id = hardcoded page, leave it alone

    try {
      const res = await fetch('/api/products/' + id);
      const data = await res.json();
      if (!data.success) return;
      const p = data.product;

      document.title = p.name + ' — Zorka Shop';

      // ── NAME ──
      const nameEl = document.querySelector('h2.product-name');
      if (nameEl) nameEl.textContent = p.name;

      // ── BREADCRUMB ──
      const breadEl = document.querySelector('nav.breadcrumb span');
      if (breadEl) breadEl.textContent = p.name;

      // ── PRICE ──
      const priceEl = document.querySelector('.summary .price, .product .price');
      if (priceEl) {
        if (p.originalPrice && p.originalPrice > p.price) {
          priceEl.innerHTML = '<ins>' + p.price.toFixed(2) + ' USD</ins> <del style="color:#aaa;font-size:0.8em">' + p.originalPrice.toFixed(2) + ' USD</del>';
        } else {
          priceEl.textContent = p.price.toFixed(2) + ' USD';
        }
      }

      // ── DESCRIPTION ──
      const tabContainer = document.querySelector('.resp-tabs-container .hor_1');
      if (tabContainer && p.description) {
        const firstTab = tabContainer.querySelector('div');
        if (firstTab) firstTab.textContent = p.description;
      }
      const shortDesc = document.querySelector('.short-desc');
      if (shortDesc && p.description) shortDesc.textContent = p.description;

      // ── STOCK / CATEGORY ──
      const skuEl = document.querySelector('.ul-product li:first-child');
      if (skuEl) skuEl.innerHTML = 'Stock: <strong>' + (p.stock > 0 ? p.stock + ' available' : '<span style="color:#c0392b">Out of Stock</span>') + '</strong>';
      const catEl = document.querySelectorAll('.ul-product li')[1];
      if (catEl) catEl.innerHTML = 'Category: <a href="/shop-fullwidth.html?category=' + encodeURIComponent(p.category) + '">' + p.category + '</a>';

      // ── IMAGES ──
      if (p.images && p.images.length > 0) {
        const mainImg = document.querySelector('#product-showcase .gallery .full img');
        if (mainImg) {
          mainImg.src = p.images[0];
          mainImg.alt = p.name;
        }

        const previewsBox = document.querySelector('#product-showcase .gallery .previews .box-content');
        if (previewsBox) {
          // Build thumbnail items — use same image as both thumb and full for dynamic products
          previewsBox.innerHTML = p.images.map(function(imgSrc, i) {
            return '<div><img '
              + (i === 0 ? 'class="selected" ' : '')
              + 'data-full="' + imgSrc + '" src="' + imgSrc + '"'
              + ' onerror="this.src=\'/assets/images/small-product-1.jpg\'"'
              + ' alt="' + p.name + ' ' + (i + 1) + '"/></div>';
          }).join('');

          // Bind click handler for gallery thumbnails
          previewsBox.querySelectorAll('img').forEach(function(thumb) {
            thumb.style.cursor = 'pointer';
            thumb.addEventListener('click', function () {
              const full = this.dataset.full || this.src;
              if (mainImg) mainImg.src = full;
              previewsBox.querySelectorAll('img').forEach(function(t) { t.classList.remove('selected'); });
              this.classList.add('selected');
            });
          });

          // Reinitialize OWL carousel on the preview thumbnails
          if (typeof $ !== 'undefined' && $.fn.owlCarousel) {
            var $previewsBox = $(previewsBox);
            try {
              if ($previewsBox.data('owl.carousel')) {
                $previewsBox.trigger('destroy.owl.carousel');
              }
            } catch(e) {}
            $previewsBox.owlCarousel({
              margin: 0,
              smartSpeed: 1000,
              dots: false,
              responsive: {
                0: { items: 3 },
                480: { items: 4 },
                768: { items: 5 },
                1200: { items: 6 }
              }
            });
            // Rebind next/prev for preview carousel
            $(".gallery .previews .next").off('click').click(function () {
              $previewsBox.trigger('next.owl.carousel');
            });
            $(".gallery .previews .prev").off('click').click(function () {
              $previewsBox.trigger('prev.owl.carousel');
            });
          }
        }
      }

      // ── ADD TO CART ──
      const atcBtn = document.querySelector('.add-to-cart-btn, button.add-to-cart');
      if (atcBtn) {
        atcBtn.addEventListener('click', function (e) {
          e.preventDefault();
          const qtyInput = document.querySelector('.product-action .quantity input');
          const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
          if (typeof Cart !== 'undefined') Cart.addToCart(p._id, qty);
        });
      }

      // ── QUANTITY BUTTONS ──
      const minusBtn = document.querySelector('.product-action .minus-btn');
      const plusBtn = document.querySelector('.product-action .plus-btn');
      const qtyInput = document.querySelector('.product-action .quantity input');
      if (minusBtn && qtyInput) {
        minusBtn.addEventListener('click', function() {
          const v = parseInt(qtyInput.value) || 1;
          if (v > 1) qtyInput.value = v - 1;
        });
      }
      if (plusBtn && qtyInput) {
        plusBtn.addEventListener('click', function() {
          const v = parseInt(qtyInput.value) || 1;
          qtyInput.value = v + 1;
        });
      }

      // ── ADD TO WISHLIST ──
      const wishBtn = document.querySelector('.wishlist-link, a.wishlist-link');
      if (wishBtn) {
        wishBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (typeof Cart !== 'undefined') Cart.addToWishlist(p._id);
        });
      }

      // ── RELATED PRODUCTS ──
      loadRelatedProducts(p.category, p._id);

    } catch (err) {
      console.error('Error loading product:', err);
    }
  }

  async function loadRelatedProducts(category, excludeId) {
    const container = document.querySelector('.related-products .box-product.row, .related .box-product, .related-products .box-product');
    if (!container) return;
    try {
      const res = await fetch('/api/products?category=' + encodeURIComponent(category));
      const data = await res.json();
      if (!data.success) return;
      const related = data.products.filter(function(p) {
        return p._id.toString() !== excludeId;
      }).slice(0, 4);
      if (!related.length) return;

      container.innerHTML = related.map(function(p) {
        const img = p.images && p.images[0] ? p.images[0] : '/assets/images/product-img-1.jpg';
        const img2 = p.images && p.images[1] ? p.images[1] : img;
        return '<div class="col-lg-3 col-md-4 col-sm-6">'
          + '<div class="product-item">'
          + '<div class="product-thumb">'
          + '<div class="main-img"><a href="/single-product.html?id=' + p._id + '">'
          + '<img class="img-responsive" src="' + img + '" alt="' + p.name + '" onerror="this.src=\'/assets/images/product-img-1.jpg\'"/>'
          + '</a></div>'
          + '<div class="overlay-img"><a href="/single-product.html?id=' + p._id + '">'
          + '<img class="img-responsive" src="' + img2 + '" alt="' + p.name + '" onerror="this.src=\'/assets/images/product-img-1.jpg\'"/>'
          + '</a></div>'
          + '<a href="/single-product.html?id=' + p._id + '" class="details"><i class="pe-7s-search"></i></a>'
          + '</div>'
          + '<h4 class="product-name"><a href="/single-product.html?id=' + p._id + '">' + p.name + '</a></h4>'
          + '<p class="product-price">' + p.price.toFixed(2) + ' USD</p>'
          + '<div class="group-buttons">'
          + '<button type="button" class="add-to-cart btn-cart" data-id="' + p._id + '" data-toggle="tooltip" data-placement="top" title="Add to Cart"><span>Add to Cart</span></button>'
          + '<button type="button" class="btn-wishlist" data-id="' + p._id + '" data-toggle="tooltip" data-placement="top" title="Add to Wishlist"><i class="pe-7s-like"></i></button>'
          + '</div>'
          + '</div>'
          + '</div>';
      }).join('');

      container.querySelectorAll('.btn-cart').forEach(function(b) {
        b.addEventListener('click', function() {
          if (typeof Cart !== 'undefined') Cart.addToCart(this.dataset.id);
        });
      });
      container.querySelectorAll('.btn-wishlist').forEach(function(b) {
        b.addEventListener('click', function() {
          if (typeof Cart !== 'undefined') Cart.addToWishlist(this.dataset.id);
        });
      });

      // Reinit related products OWL carousel if present
      if (typeof $ !== 'undefined' && $.fn.owlCarousel) {
        var $related = $('.related-products .box-content');
        if ($related.length) {
          try {
            if ($related.data('owl.carousel')) $related.trigger('destroy.owl.carousel');
          } catch(e) {}
          $related.owlCarousel({
            loop: true, items: 1, dots: false, autoHeight: true, rtl: false
          });
          $(".related-products .next").off('click').click(function() { $related.trigger('next.owl.carousel'); });
          $(".related-products .prev").off('click').click(function() { $related.trigger('prev.owl.carousel'); });
        }
      }

      if (typeof $ !== 'undefined' && $.fn.tooltip) {
        $(container).find('[data-toggle="tooltip"]').tooltip();
      }
    } catch(e) {}
  }

  document.addEventListener('DOMContentLoaded', loadProduct);
})();