/******************************
 * NAV: menú móvil (hamburger)
 ******************************/
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav]');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
  });
}

/******************************
 * TEMA: modo oscuro persistente
 ******************************/
const root = document.documentElement;
const THEME_KEY = 'gpu-theme';
const themeBtn = document.querySelector('[data-theme-toggle]');

function applyTheme(t) { root.setAttribute('data-theme', t); }

(() => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) applyTheme(saved);
  else {
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(prefers);
  }
})();
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

/******************************
 * BUSCADOR en vivo (tabla/box)
 ******************************/
function liveFilter() {
  const q = document.querySelector('#q');
  if (!q) return;

  const cards = [...document.querySelectorAll('.card[data-name]')];
  const rows  = [...document.querySelectorAll('tbody tr[data-name]')];

  const run = () => {
    const needle = q.value.trim().toLowerCase();
    const match = (txt) => txt.toLowerCase().includes(needle);
    cards.forEach(c => c.style.display = match(c.dataset.name || '') ? '' : 'none');
    rows.forEach(r  => r.style.display = match(r.dataset.name  || '') ? '' : 'none');
  };
  q.addEventListener('input', run);
  run();
}
liveFilter();

/******************************
 * CATÁLOGO
 ******************************/
const CATALOG = {
  rtx4060: {
    id: "rtx4060",
    name: "NVIDIA GeForce RTX 4060 — 8 GB",
    brand: "NVIDIA",
    sku: "RTX4060-8G",
    price: 529000,
    img: "img/rtx4060.jpg",
    specs: [
      "Memoria: 8 GB GDDR6",
      "Salidas: HDMI 2.1 / DisplayPort",
      "Tecnologías: Ray Tracing, DLSS",
      "Fuente recomendada: 550 W",
    ],
  },
  rtx4070ti: {
    id: "rtx4070ti",
    name: "NVIDIA GeForce RTX 4070 Ti — 12 GB",
    brand: "NVIDIA",
    sku: "RTX4070Ti-12G",
    price: 899000,
    img: "img/rtx4070ti.png",
    specs: [
      "Memoria: 12 GB GDDR6X",
      "Salidas: HDMI 2.1 / DisplayPort",
      "Tecnologías: Ray Tracing, DLSS 3",
      "Fuente recomendada: 700 W",
    ],
  },
  rx6800xt: {
    id: "rx6800xt",
    name: "AMD Radeon RX 6800 XT — 16 GB",
    brand: "AMD",
    sku: "RX6800XT-16G",
    price: 799000,
    img: "img/rx6800xt.jpg",
    specs: [
      "Memoria: 16 GB GDDR6",
      "Salidas: HDMI 2.1 / DisplayPort",
      "Tecnologías: Ray Tracing, SAM",
      "Fuente recomendada: 750 W",
    ],
  },
  rx7700xt: {
    id: "rx7700xt",
    name: "AMD Radeon RX 7700 XT — 12 GB",
    brand: "AMD",
    sku: "RX7700XT-12G",
    price: 589000,
    img: "img/rx7700xt.png", // asegurate que el archivo exista con ese nombre/extensión
    specs: [
      "Memoria: 12 GB GDDR6",
      "Salidas: HDMI 2.1 / DisplayPort",
      "Tecnologías: Ray Tracing, RDNA 3",
      "Fuente recomendada: 650 W",
    ],
  },
};

const fmtARS  = (n) => new Intl.NumberFormat('es-AR').format(n);
const getParam = (k) => new URLSearchParams(location.search).get(k);

/******************************
 * FICHA DINÁMICA (producto.html)
 ******************************/
function renderProductPage() {
  if (!document.body.classList.contains('page-producto')) return;

  const id = getParam('id');
  const data = (id && CATALOG[id]) ? CATALOG[id] : CATALOG['rtx4060'];

  const $name  = document.querySelector('[data-name]');
  const $price = document.querySelector('[data-price]');
  const $brand = document.querySelector('[data-brand]');
  const $sku   = document.querySelector('[data-sku]');
  const $img   = document.querySelector('[data-img]');
  const $specs = document.querySelector('[data-specs]');
  const $buy   = document.querySelector('[data-buy]');

  if (!$name || !$img) return;

  $name.textContent  = data.name;
  $price.textContent = `ARS ${fmtARS(data.price)}`;
  $brand.textContent = data.brand;
  $sku.textContent   = data.sku;
  $img.src = data.img;
  $img.alt = data.name;

  $specs.innerHTML = '';
  data.specs.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s;
    $specs.appendChild(li);
  });

  if ($buy) $buy.href = `comprar.html?id=${data.id}`;
}
renderProductPage();

/******************************
 * CARRITO (localStorage)
 ******************************/
const CART_KEY = 'gpu-cart';

function cartLoad() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function cartSave(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); }
function cartAdd(id, q=1) {
  const items = cartLoad();
  const i = items.findIndex(x => x.id === id);
  if (i >= 0) items[i].q += q; else items.push({ id, q });
  cartSave(items);
}
function cartSetQty(id, q) {
  q = Math.max(0, Number(q || 0));
  let items = cartLoad().map(x => x.id === id ? { ...x, q } : x).filter(x => x.q > 0);
  cartSave(items);
}
function cartRemove(id) { cartSave(cartLoad().filter(x => x.id !== id)); }
function cartClear() { cartSave([]); }

function cartDetailed() {
  const items = cartLoad();
  let total = 0;
  const rows = items.map(({ id, q }) => {
    const p = CATALOG[id];
    const price = p?.price || 0;
    const subtotal = price * q;
    total += subtotal;
    const vram = (p?.specs?.[0] || '').match(/\b\d+\s*GB\b/)?.[0] || '-';
    return { id, q, name: p?.name || id, brand: p?.brand || '-', sku: p?.sku || '-', vram, price, subtotal };
  });
  return { rows, total };
}

/*****************************************
 * RENDER DEL CARRITO (comprar.html)
 *****************************************/
function renderCartPage() {
  const table   = document.querySelector('[data-cart]');
  const body    = document.querySelector('[data-cart-body]');
  const totalEl = document.querySelector('[data-cart-total]');
  if (!table || !body || !totalEl) return;

  const fmt = (n) => new Intl.NumberFormat('es-AR').format(n);

  const draw = () => {
    const { rows, total } = cartDetailed();
    body.innerHTML = rows.length
      ? rows.map(r => `
          <tr data-id="${r.id}">
            <td>${r.name}</td>
            <td>${r.brand}</td>
            <td>${r.sku}</td>
            <td>${r.vram}</td>
            <td>ARS ${fmt(r.price)}</td>
            <td><input class="qty" type="number" min="0" value="${r.q}" inputmode="numeric"></td>
            <td class="right">ARS ${fmt(r.subtotal)}</td>
            <td class="center"><button class="icon danger" data-del aria-label="Quitar">✕</button></td>
          </tr>
        `).join('')
      : `<tr><td colspan="8" style="text-align:center;padding:1rem">Tu carrito está vacío.</td></tr>`;
    totalEl.textContent = `ARS ${fmt(total)}`;
  };

  // Cambiar cantidad
  table.addEventListener('input', (e) => {
    const inp = e.target.closest('input.qty');
    if (!inp) return;
    const id = inp.closest('tr').getAttribute('data-id');
    cartSetQty(id, inp.value);
    draw();
  });

  // Eliminar
  table.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    const id = btn.closest('tr').getAttribute('data-id');
    cartRemove(id);
    draw();
  });

  // Vaciar carrito
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-empty-cart]');
    if (!btn) return;
    cartClear();
    draw();
  });

  // Si llegan con ?id=... desde listados/ficha, agrego y limpio URL
  const pid = new URLSearchParams(location.search).get('id');
  if (pid && CATALOG[pid]) {
    cartAdd(pid, 1);
    history.replaceState({}, '', 'comprar.html');
  }

  draw();
}
renderCartPage();

/*****************************************
 * AGREGAR AL CARRITO desde listados/ficha
 *****************************************/
// Listados (tabla/box): <a data-add="id" href="comprar.html">Comprar</a>
document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (!add) return;
  e.preventDefault();
  const id = add.getAttribute('data-add');
  if (!CATALOG[id]) return;
  cartAdd(id, 1);
  // redirige a comprar siempre
  window.location.href = 'comprar.html';
});

// Ficha: botón “Comprar ahora” con data-buy
(function hookProductBuy(){
  const btnBuy = document.querySelector('[data-buy]');
  if (!btnBuy) return;
  const id = new URLSearchParams(location.search).get('id');
  if (!id || !CATALOG[id]) return;
  btnBuy.addEventListener('click', (e) => {
    e.preventDefault();
    cartAdd(id, 1);
    window.location.href = 'comprar.html';
  });
})();

/******************************
 * FOOTER: año automático
 ******************************/
const yearSpan = document.querySelector('[data-year]');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
