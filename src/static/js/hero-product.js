/* ══════════════════════════════════════════
   BTS NUTRITION — hero-product.js
   Renders featured product as full-screen hero
   ══════════════════════════════════════════ */

const EMOJI_MAP = {
  protein:'🥛', 'pre-workout':'⚡',
  vitamins:'💊', recovery:'🔄'
};
const CAT_COLORS = {
  protein:'#e8ff00', 'pre-workout':'#ff4d1c',
  vitamins:'#00e5b0', recovery:'#a78bfa'
};

async function renderProductHero() {
  const res = await fetch('/api/products');
  const data = await res.json();

  if (!data.products || data.products.length === 0) {
    document.getElementById('productHero').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem;text-align:center">
        <div style="max-width:560px">
          <div style="font-size:4rem;margin-bottom:1.5rem;opacity:0.3">📦</div>
          <h2 style="font-family:var(--font-display);font-size:2.5rem;margin-bottom:1rem">Keine Produkte verfügbar</h2>
          <p style="color:var(--muted)">Bitte füge JSON-Dateien im <code>products/</code> Ordner hinzu.</p>
        </div>
      </div>`;
    return;
  }

  const featured = data.products[0];
  const emoji = EMOJI_MAP[featured.category] || '⭐';
  const color = CAT_COLORS[featured.category] || '#e8ff00';
  const stars = '★'.repeat(Math.min(5, Math.round(featured.rating))) +
                '☆'.repeat(Math.max(0, 5 - Math.round(featured.rating)));

  const heroHTML = `
    <div class="hero-bg" style="background:radial-gradient(ellipse 80% 60% at 50% 40%, ${color}15, transparent 70%)"></div>
    <div class="hero-grid"></div>

    <div class="hero-wrapper">
      <!-- Left: Product Info -->
      <div class="hero-content fade-up">
        <div class="hero-eyebrow">${featured.category.toUpperCase()}</div>
        <h1 class="hero-product-name">${featured.name}</h1>
        <p class="hero-subtitle">${featured.subtitle}</p>

        <div class="hero-rating">
          <span class="stars">${stars}</span>
          <span>${featured.rating}</span>
          <span style="color:var(--muted)">(${featured.reviews} Bewertungen)</span>
        </div>

        <p class="hero-desc">${featured.description}</p>

        <!-- Macros -->
        <div class="hero-macros">
          <div class="hero-macro">
            <span class="macro-val" style="color:${color}">${featured.macros.protein}g</span>
            <span class="macro-label">Protein</span>
          </div>
          <div class="hero-macro">
            <span class="macro-val">${featured.macros.carbs}g</span>
            <span class="macro-label">Carbs</span>
          </div>
          <div class="hero-macro">
            <span class="macro-val">${featured.macros.fat}g</span>
            <span class="macro-label">Fett</span>
          </div>
          <div class="hero-macro">
            <span class="macro-val">${featured.macros.calories}</span>
            <span class="macro-label">kcal</span>
          </div>
        </div>

        <!-- Benefits -->
        <div class="hero-benefits">
          ${featured.benefits.slice(0, 3).map(b => `<div class="benefit"><span>✓</span> ${b}</div>`).join('')}
        </div>

        <!-- CTA -->
        <div class="hero-cta">
          <button class="btn-primary" onclick="addToCart('${featured.id}','${featured.name.replace(/'/g,"\\'")}',${featured.price},'${featured.category}')">
            🛒 ${featured.price.toFixed(2).replace('.',',')}€ — In den Warenkorb
          </button>
          <a href="/produkt/${featured.id}" class="btn-ghost">Details ansehen</a>
        </div>

        <p class="hero-meta">
          ${featured.weight} · ${featured.servings} Servings ·
          <span style="color:var(--green)">● Auf Lager</span> ·
          <span style="color:var(--accent)">30 Tage Rückgabe</span>
        </p>
      </div>

      <!-- Right: Visual -->
      <div class="hero-visual fade-up" style="animation-delay:0.15s">
        <div class="visual-inner" style="background:radial-gradient(circle at 50% 60%, ${color}12, var(--bg3) 70%)">
          <span class="product-emoji" style="font-size:clamp(6rem,15vw,12rem);filter:drop-shadow(0 0 40px ${color}66)">${emoji}</span>
        </div>
        ${featured.badge ? `<span class="product-badge">${featured.badge}</span>` : ''}
      </div>
    </div>
  `;

  document.getElementById('productHero').innerHTML = heroHTML;

  // Show additional products section if more than 1 product
  if (data.products.length > 1) {
    renderAdditionalProducts(data.products.slice(1));
  }
}

function renderAdditionalProducts(products) {
  const grid = document.getElementById('additionalGrid');
  grid.innerHTML = products.map((p, i) => {
    const emoji = EMOJI_MAP[p.category] || '⭐';
    const color = CAT_COLORS[p.category] || '#e8ff00';
    const stars = '★'.repeat(Math.min(5, Math.round(p.rating))) +
                  '☆'.repeat(Math.max(0, 5 - Math.round(p.rating)));

    return `
      <a href="/produkt/${p.id}" class="product-card fade-up" style="animation-delay:${i * 0.08}s">
        <div class="card-visual">
          <div style="background:radial-gradient(circle at 50% 60%, ${color}12, var(--bg3) 70%)" class="card-visual-inner">
            <span style="font-size:4rem;filter:drop-shadow(0 0 24px ${color}55)">${emoji}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="card-name">${p.name}</div>
          <div class="card-subtitle">${p.subtitle}</div>
          <div class="card-macros">
            <div class="macro-item"><span class="macro-val" style="color:${color}">${p.macros.protein}g</span><span class="macro-label">Protein</span></div>
            <div class="macro-item"><span class="macro-val">${p.macros.carbs}g</span><span class="macro-label">Carbs</span></div>
          </div>
          <div class="card-footer">
            <div class="card-price">${p.price.toFixed(2).replace('.',',')}€</div>
            <div class="card-rating"><span class="stars">${stars}</span></div>
          </div>
        </div>
      </a>
    `;
  }).join('');

  document.getElementById('additionalProducts').style.display = '';
}

document.addEventListener('DOMContentLoaded', renderProductHero);