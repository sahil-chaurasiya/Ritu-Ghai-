/**
 * wishlist-page.js — renders the wishlist on wishlist.html
 */
(function () {
  async function renderWishlist() {
    const tbody = document.querySelector('.shop-table tbody, table.shop-table tbody');
    if (!tbody) return;
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      if (!data.success || !data.wishlist.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:60px;font-family:Montserrat,sans-serif;font-size:12px;letter-spacing:2px;color:#aaa;">
          YOUR WISHLIST IS EMPTY — <a href="/shop-fullwidth.html" style="color:#1a1a1a;text-decoration:underline;">SHOP NOW</a></td></tr>`;
        return;
      }
      tbody.innerHTML = data.wishlist.map(item => `
        <tr class="cart_item" data-product-id="${item.productId}">
          <td class="product-remove">
            <a href="#" class="remove remove-wish" data-id="${item.productId}"><i class="fa fa-times"></i></a>
          </td>
          <td class="product-thumbnail">
            <a href="/single-product.html?id=${item.productId}">
              <img class="img-responsive" src="${item.image}" style="width:60px;"
                onerror="this.src='/assets/images/small-product-1.jpg'" alt="${item.name}"/>
            </a>
          </td>
          <td class="product-name">
            <a href="/single-product.html?id=${item.productId}">${item.name}</a>
          </td>
          <td class="product-price">${item.price.toFixed(2)} USD</td>
          <td class="product-stock">
            <span class="${item.stock > 0 ? 'highlight' : ''}">${item.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}</span>
          </td>
          <td class="product-add">
            <button class="add-to-cart-btn btn-move-cart" data-id="${item.productId}">ADD TO CART</button>
          </td>
        </tr>`).join('');

      tbody.querySelectorAll('.remove-wish').forEach(btn => {
        btn.addEventListener('click', async function(e) {
          e.preventDefault();
          await fetch('/api/wishlist/remove', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: this.dataset.id })
          });
          renderWishlist();
          Cart.updateCounts();
        });
      });

      tbody.querySelectorAll('.btn-move-cart').forEach(btn => {
        btn.addEventListener('click', function() {
          Cart.addToCart(this.dataset.id, 1);
        });
      });
    } catch(e) { console.error(e); }
  }

  document.addEventListener('DOMContentLoaded', renderWishlist);
})();
