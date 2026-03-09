/* ══════════════════════════════════════════
   BTS NUTRITION — shop.js  (index page)
   ══════════════════════════════════════════ */

const EMOJI_MAP   = { protein:'🥛', 'pre-workout':'⚡', vitamins:'💊', recovery:'🔄' };
const CAT_COLORS  = { protein:'#e8ff00', 'pre-workout':'#ff4d1c', vitamins:'#00e5b0', recovery:'#a78bfa' };
const BADGE_CLASS = { 'Bestseller':'badge-bestseller', 'Neu':'badge-neu', 'Top Rated':'badge-top' };

let activeCategory = '';
let searchTimeout;

async function fetchCategories() {
  const res  = await fetch('/api/categories');
  const data = await res.json();
  const cont = document.getElementById('categoryFilters');
  data.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.cat = cat.id;
    btn.innerHTML = `<span class="dot" style="background:${cat.color}"></span>${cat.label} <span style="opacity:.5;font-size:.55rem">${cat.count}</span>`;
    btn.addEventListener('click', () => setCategory(cat.id));
    cont.appendChild(btn);
  });
}

function setCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  loadProducts();
}

async function loadProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const sk = document.createElement('div');
    sk.className = 'product-card';
    sk.innerHTML = `<div class="card-visual skeleton" style="aspect-ratio:1/1;border-radius:24px 24px 0 0"></div>
      <div class="card-body">
        <div class="skeleton" style="height:1rem;width:60%;margin-bottom:.75rem"></div>
        <div class="skeleton" style="height:2rem;width:85%;margin-bottom:.5rem"></div>
        <div class="skeleton" style="height:.75rem;width:50%"></div>
      </div>`;
    grid.appendChild(sk);
  }

  const search = document.getElementById('searchInput').value;
  const sort   = document.getElementById('sortSelect').value;
  const params = new URLSearchParams();
  if (activeCategory) params.set('category', activeCategory);
  if (search)         params.set('search', search);
  if (sort !== 'default') params.set('sort', sort);

  const res  = await fetch(`/api/products?${params}`);
  const data = await res.json();
  document.getElementById('resultsCount').innerHTML = `<span>${data.total}</span> Produkte`;
  grid.innerHTML = '';

  if (!data.products.length) {
    grid.innerHTML = `<div class="empty-state"><span class="empty-icon">🔍</span><p>Keine Produkte gefunden</p></div>`;
    return;
  }
  data.products.forEach((p, i) => grid.appendChild(makeCard(p, i)));
}

function makeCard(p, idx) {
  const card  = document.createElement('a');
  card.href   = `/produkt/${p.id}`;
  card.className = 'product-card fade-up';
  card.style.animationDelay = `${idx * 0.06}s`;

  const emoji  = EMOJI_MAP[p.category] || '⭐';
  const color  = CAT_COLORS[p.category] || '#e8ff00';
  const bClass = BADGE_CLASS[p.badge]  || '';
  const stars  = '★'.repeat(Math.min(5, Math.round(p.rating))) + '☆'.repeat(Math.max(0, 5 - Math.round(p.rating)));
  const tags   = (p.tags || []).slice(0,3).map(t => `<span class="tag">${t}</span>`).join('');

  card.innerHTML = `
    <div class="card-visual">
      <div class="card-glow" style="background:radial-gradient(circle at 50% 60%,${color}22,transparent 70%)"></div>
      <div class="card-visual-inner"><span style="filter:drop-shadow(0 0 24px ${color}55)">${emoji}</span></div>
      ${p.badge ? `<span class="card-badge ${bClass}">${p.badge}</span>` : ''}
    </div>
    <div class="card-body">
      <div class="card-category">${p.category_meta?.label || p.category}</div>
      <div class="card-name">${p.name}</div>
      <div class="card-subtitle">${p.subtitle}</div>
      <div class="card-tags">${tags}</div>
      <div class="card-macros">
        <div class="macro-item"><span class="macro-val" style="color:${color}">${p.macros?.protein ?? 0}g</span><span class="macro-label">Protein</span></div>
        <div class="macro-item"><span class="macro-val">${p.macros?.carbs ?? 0}g</span><span class="macro-label">Carbs</span></div>
        <div class="macro-item"><span class="macro-val">${p.macros?.fat ?? 0}g</span><span class="macro-label">Fett</span></div>
        <div class="macro-item"><span class="macro-val">${p.macros?.calories ?? 0}</span><span class="macro-label">kcal</span></div>
      </div>
      <div class="card-footer">
        <div class="card-price-wrap">
          <div class="card-price">${p.price.toFixed(2).replace('.',',')}€</div>
          <div class="card-weight">${p.weight}</div>
        </div>
        <div class="card-rating"><span class="stars">${stars}</span><span style="color:var(--muted)">${p.rating}</span></div>
      </div>
      <button class="add-btn" onclick="event.preventDefault();addToCart('${p.id}','${p.name.replace(/'/g,"\\'")}',${p.price},'${p.category}')">+ In den Warenkorb</button>
    </div>`;
  return card;
}

document.addEventListener('DOMContentLoaded', () => {
  fetchCategories();
  loadProducts();
  document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadProducts, 350);
  });
  document.getElementById('sortSelect').addEventListener('change', loadProducts);
});