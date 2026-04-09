/**
 * shopping-cart-page.js — renders the cart table on shopping-cart.html
 */
(function () {
  'use strict';

  async function renderCart() {
    const tbody = document.querySelector('.shop-table tbody, table.cart tbody');
    if (!tbody) return;
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();

      if (!data.success || !data.cart.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:60px;font-family:Montserrat,sans-serif;font-size:12px;letter-spacing:2px;color:#aaa;">
          YOUR CART IS EMPTY — <a href="/shop-fullwidth.html" style="color:#1a1a1a;text-decoration:underline;">CONTINUE SHOPPING</a></td></tr>`;
        updateTotals(0);
        return;
      }

      tbody.innerHTML = data.cart.map(item => `
        <tr class="cart_item">
          <td class="product-remove"><a href="#" class="remove remove-item" data-id="${item.productId}"><i class="fa fa-times"></i></a></td>
          <td class="product-thumbnail">
            <a href="/single-product.html?id=${item.productId}">
              <img class="img-responsive" src="${item.image}" style="width:60px;"
                onerror="this.src='/assets/images/small-product-1.jpg'" alt="${item.name}"/>
            </a>
          </td>
          <td class="product-name"><a href="/single-product.html?id=${item.productId}">${item.name}</a></td>
          <td class="product-price"><span class="amount">${item.price.toFixed(2)} USD</span></td>
          <td class="product-quantity">
            <div class="quantity">
              <button class="minus-btn qty-btn" data-id="${item.productId}" data-action="minus"><i class="fa fa-minus"></i></button>
              <input type="text" class="qty-input" value="${item.quantity}" data-id="${item.productId}"/>
              <button class="plus-btn qty-btn" data-id="${item.productId}" data-action="plus"><i class="fa fa-plus"></i></button>
            </div>
          </td>
          <td class="product-subtotal"><span class="amount">${item.subtotal.toFixed(2)} USD</span></td>
        </tr>`).join('') + `
        <tr class="cart-action">
          <td colspan="3">
            <div class="wrap-coupon">
              <input class="input-form" type="text" placeholder="ENTER COUPON CODE"/>
              <button class="apply-coupon-btn">APPLY COUPON</button>
            </div>
          </td>
          <td></td>
          <td colspan="2">
            <button class="update-cart-btn" onclick="window.location.reload()">UPDATE CART</button>
            <button class="checkout-btn" onclick="location.href='/check-out.html'">PROCEED TO CHECKOUT</button>
          </td>
        </tr>`;

      updateTotals(data.total);
      bindCartEvents();
    } catch (err) { console.error('Cart error:', err); }
  }

  function updateTotals(total) {
    var formatted = parseFloat(total || 0).toFixed(2) + ' USD';
    var subtotalEl = document.querySelector('.cart-subtotal');
    var orderEl    = document.querySelector('.order-total');
    if (subtotalEl) subtotalEl.textContent = formatted;
    if (orderEl)    orderEl.textContent    = formatted;
  }

  function bindCartEvents() {
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', async function (e) {
        e.preventDefault();
        await fetch('/api/cart/remove', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: this.dataset.id })
        });
        renderCart();
        if (window.Cart) Cart.updateCounts();
      });
    });

    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', async function () {
        const pid = this.dataset.id;
        const input = document.querySelector(`.qty-input[data-id="${pid}"]`);
        if (!input) return;
        let qty = parseInt(input.value) || 1;
        qty = this.dataset.action === 'plus' ? qty + 1 : Math.max(1, qty - 1);
        input.value = qty;
        await fetch('/api/cart/update', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: pid, quantity: qty })
        });
        renderCart();
        if (window.Cart) Cart.updateCounts();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.shop-table, table.cart')) renderCart();
  });
})();