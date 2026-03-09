/* ══════════════════════════════════════════
   BTS NUTRITION — cart.js
   ══════════════════════════════════════════ */

const EMOJI_MAP = { protein:'🥛', 'pre-workout':'⚡', vitamins:'💊', recovery:'🔄' };

function renderCart() {
  const cart      = getCart();
  const itemsDiv  = document.getElementById('cartItems');
  const summaryDiv= document.getElementById('cartSummary');

  if (!cart.length) {
    itemsDiv.innerHTML = `<div class="cart-empty"><span class="empty-icon">🛒</span><p style="font-family:var(--font-mono);font-size:.8rem;color:var(--muted);margin-bottom:1.5rem">Dein Warenkorb ist leer</p><a href="/" class="btn-primary">Jetzt shoppen</a></div>`;
    summaryDiv.style.display = 'none';
    return;
  }

  summaryDiv.style.display = '';
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total    = subtotal + shipping;

  itemsDiv.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-img">${EMOJI_MAP[item.category] || '📦'}</div>
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-sub">${item.category}</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
          <button class="btn-danger" onclick="removeItem('${item.id}')" style="margin-left:.5rem">Entfernen</button>
        </div>
      </div>
      <div class="cart-item-price">${(item.price * item.qty).toFixed(2).replace('.',',')}€</div>
    </div>`).join('');

  document.getElementById('summarySubtotal').textContent = subtotal.toFixed(2).replace('.',',') + '€';
  document.getElementById('summaryShipping').textContent = shipping === 0 ? 'Kostenlos 🎉' : shipping.toFixed(2).replace('.',',') + '€';
  document.getElementById('summaryTotal').textContent    = total.toFixed(2).replace('.',',') + '€';
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}

document.addEventListener('DOMContentLoaded', renderCart);