/* ══════════════════════════════════════════
   BTS NUTRITION — main.js
   ══════════════════════════════════════════ */

/* ── Cart (localStorage) ── */
function getCart() {
  try { return JSON.parse(localStorage.getItem('bts_cart') || '[]'); }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('bts_cart', JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
}
function addToCart(id, name, price, category) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.qty++; }
  else { cart.push({ id, name, price, category, qty: 1 }); }
  saveCart(cart);
  showToast('✓ ' + name + ' hinzugefügt');
}

/* ── Toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ── Mobile Nav ── */
function openMobileNav() {
  document.getElementById('mobileNav').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
});