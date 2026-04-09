/**
 * cart.js — Cart & Wishlist utilities for Zorka Shop
 */
const Cart = (() => {
  function showToast(msg, type = 'success') {
    let toast = document.getElementById('zorka-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'zorka-toast';
      toast.style.cssText = 'position:fixed;bottom:30px;right:30px;z-index:99999;padding:14px 24px;border-radius:3px;color:#fff;font-size:13px;font-family:Montserrat,sans-serif;letter-spacing:1px;opacity:0;transition:opacity .3s;pointer-events:none;min-width:200px;text-align:center;';
      document.body.appendChild(toast);
    }
    toast.style.background = type === 'error' ? '#c0392b' : '#1a1a1a';
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
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
    } catch (e) {}
  }

  async function addToCart(productId, qty = 1) {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: qty })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Added to cart!');
        updateCounts();
      } else {
        showToast(data.message || 'Error adding to cart', 'error');
      }
    } catch (e) { showToast('Network error', 'error'); }
  }

  async function addToWishlist(productId) {
    try {
      const res = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Added to wishlist!');
        updateCounts();
      } else {
        showToast(data.message || 'Error', 'error');
      }
    } catch (e) { showToast('Network error', 'error'); }
  }

  document.addEventListener('DOMContentLoaded', () => setTimeout(updateCounts, 400));
  return { updateCounts, addToCart, addToWishlist, showToast };
})();
