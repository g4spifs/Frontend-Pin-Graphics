console.log('✅ app.js cargado correctamente');

/* NAV: menú móvil (hamburger)*/
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav]');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
  });
}

/* TEMA: modo oscuro persistente*/
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

/* BUSCADOR en vivo (tabla/box)*/
function liveFilter() {
  const q = document.querySelector('#q');
  if (!q) return;

  const cards = [...document.querySelectorAll('.card[data-name]')];
  const rows  = [...document.querySelectorAll('tbody tr[data-name]')];
  const grid = document.querySelector('[data-product-grid]');
  const table = document.querySelector('[data-product-table]');
  const featuredGrid = document.querySelector('[data-featured-products]');

  const run = () => {
    const needle = q.value.trim().toLowerCase();
    
    // Si está vacío, mostrar todo
    if (needle === '') {
      cards.forEach(c => c.style.display = '');
      rows.forEach(r => r.style.display = '');
      return;
    }
    
    // Función mejorada que busca en múltiples campos
    const match = (element) => {
      const name = element.dataset.name || '';
      const text = element.textContent.toLowerCase();
      return name.includes(needle) || text.includes(needle);
    };
    
    // Filtrar tarjetas (grid)
    let visibleCards = 0;
    cards.forEach(c => {
      const isVisible = match(c);
      c.style.display = isVisible ? '' : 'none';
      if (isVisible) visibleCards++;
    });
    
    // Mostrar mensaje si no hay resultados en grid
    if (cards.length > 0 && visibleCards === 0 && (grid || featuredGrid)) {
      const container = grid || featuredGrid;
      const noResults = container.querySelector('.no-results');
      if (!noResults) {
        const msg = document.createElement('p');
        msg.className = 'no-results';
        msg.style.cssText = 'text-align:center; padding:2rem; color:var(--muted); grid-column: 1/-1;';
        msg.textContent = `No se encontraron productos para "${q.value}"`;
        container.appendChild(msg);
      }
    } else {
      // Eliminar mensaje de "no hay resultados" si hay productos visibles
      document.querySelectorAll('.no-results').forEach(el => el.remove());
    }
    
    // Filtrar filas (tabla)
    let visibleRows = 0;
    rows.forEach(r => {
      const isVisible = match(r);
      r.style.display = isVisible ? '' : 'none';
      if (isVisible) visibleRows++;
    });
    
    // Mostrar mensaje si no hay resultados en tabla
    if (rows.length > 0 && visibleRows === 0 && table) {
      const tbody = table.querySelector('tbody');
      const noResults = tbody.querySelector('.no-results-row');
      if (!noResults) {
        const tr = document.createElement('tr');
        tr.className = 'no-results-row';
        tr.innerHTML = `<td colspan="7" style="text-align:center; padding:2rem; color:var(--muted);">No se encontraron productos para "${q.value}"</td>`;
        tbody.appendChild(tr);
      }
    } else {
      // Eliminar mensaje de "no hay resultados" si hay filas visibles
      document.querySelectorAll('.no-results-row').forEach(el => el.remove());
    }
  };
  
  q.addEventListener('input', run);
  
  // Limpiar búsqueda con botón ESC
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      q.value = '';
      run();
      q.blur();
    }
  });
  
  run();
}
liveFilter();

/* === GESTIÓN DE SESIÓN === */
async function updateSessionUI() {
  console.log('🔍 Iniciando verificación de sesión...');
  
  try {
    const response = await fetch('session_status.php');
    console.log('📡 Respuesta del servidor:', response.status);
    
    const data = await response.json();
    console.log('📦 Datos de sesión:', data);
    
    const loggedOutLinks = document.querySelectorAll('[data-logged-out]');
    const loggedInLinks = document.querySelectorAll('[data-logged-in]');
    const notAdminLinks = document.querySelectorAll('[data-not-admin]');
    const userName = document.querySelector('[data-user-name]');
    
    console.log(`👥 Encontrados ${loggedOutLinks.length} enlaces [data-logged-out]`);
    console.log(`👤 Encontrados ${loggedInLinks.length} enlaces [data-logged-in]`);
    
    if (data.loggedIn) {
      console.log('✅ Usuario logueado:', data.nombre);
      console.log('🔐 Es admin:', data.isAdmin);
      
      // Usuario logueado: ocultar crear cuenta/ingresar
      loggedOutLinks.forEach(el => {
        el.style.display = 'none';
      });
      loggedInLinks.forEach(el => {
        el.style.display = 'block';
      });
      
      if (userName) {
        console.log('📝 Elemento [data-user-name] encontrado');
        // Si es admin, mostrar badge especial
        if (data.isAdmin === true) {
          console.log('🎨 Aplicando badge de ADMIN');
          userName.innerHTML = `Hola, <span class="badge" style="background:#dc2626; color:#fff; padding:.2rem .5rem; border-radius:.4rem; font-size:.75rem; margin-left:.3rem;">ADMIN</span>`;
          console.log('✅ Badge aplicado. HTML:', userName.innerHTML);
        } else {
          console.log('👤 Usuario normal, sin badge');
          userName.textContent = `Hola, ${data.nombre}`;
        }
      } else {
        console.log('⚠️ No se encontró elemento [data-user-name]');
      }
      
      // Mostrar/ocultar opciones según tipo de usuario
      const adminOnlyItems = document.querySelectorAll('[data-admin-only]');
      const clientOnlyItems = document.querySelectorAll('[data-client-only]');
      
      if (data.isAdmin === true) {
        console.log('⚙️ Usuario ADMIN - Ocultando enlaces normales, mostrando menú completo');
        // Si es admin, ocultar los enlaces normales de Inicio/Productos
        notAdminLinks.forEach(el => el.style.display = 'none');
        // Mostrar todas las opciones de admin en el dropdown
        adminOnlyItems.forEach(el => el.style.display = 'block');
        // IMPORTANTE: Ocultar opciones de cliente
        clientOnlyItems.forEach(el => el.style.display = 'none');
      } else {
        console.log('👤 Usuario CLIENTE - Mostrando enlaces normales');
        // Si es cliente, mostrar los enlaces normales
        notAdminLinks.forEach(el => el.style.display = 'block');
        // Ocultar opciones de admin
        adminOnlyItems.forEach(el => el.style.display = 'none');
        // IMPORTANTE: Mostrar opciones de cliente
        clientOnlyItems.forEach(el => el.style.display = 'block');
      }
    } else {
      console.log('❌ Usuario NO logueado');
      // No logueado: mostrar crear cuenta/ingresar y enlaces normales
      loggedOutLinks.forEach(el => {
        el.style.display = 'block';
      });
      loggedInLinks.forEach(el => {
        el.style.display = 'none';
      });
      notAdminLinks.forEach(el => {
        el.style.display = 'block';
      });
    }
  } catch (error) {
    console.error('❌ Error al verificar sesión:', error);
    // En caso de error, mostrar opciones de login
    document.querySelectorAll('[data-logged-out]').forEach(el => el.style.display = 'block');
    document.querySelectorAll('[data-logged-in]').forEach(el => el.style.display = 'none');
    document.querySelectorAll('[data-not-admin]').forEach(el => el.style.display = 'block');
  }
}

/* === FUNCIONALIDAD DEL MENÚ DESPLEGABLE === */
function initDropdownMenu() {
  const dropdown = document.querySelector('.dropdown');
  const toggle = document.querySelector('[data-user-menu]');
  
  if (!dropdown || !toggle) return;
  
  // Alternar menú al hacer clic
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    dropdown.classList.toggle('open');
  });
  
  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
  
  // Cerrar al presionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
    }
  });
}

// Inicializar dropdown después de que se cargue el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDropdownMenu);
} else {
  initDropdownMenu();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateSessionUI);
} else {
  updateSessionUI();
}

/* === CATÁLOGO DINÁMICO (ASYNC) === */

let catalogPromise = null;
const API_URL = 'api.php';

async function getCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP! status: ${response.status}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error("Error al cargar el catálogo:", error);
        catalogPromise = null; 
        return {};
      });
  }
  return catalogPromise;
}

const fmtARS  = (n) => new Intl.NumberFormat('es-AR').format(n);
const getParam = (k) => new URLSearchParams(location.search).get(k);

/* FICHA DINÁMICA (modificada a async) */
async function renderProductPage() {
  if (!document.body.classList.contains('page-producto')) return;

  const CATALOG = await getCatalog();
  if (!CATALOG) return;

  const id = getParam('id');
  const data = (id && CATALOG[id]) ? CATALOG[id] : Object.values(CATALOG)[0];
  
  if (!data) return; 

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

/* CARRITO (localStorage) */
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

async function cartDetailed() {
  const items = cartLoad();
  const CATALOG = await getCatalog();
  if (!CATALOG) return { rows: [], total: 0 };

  let total = 0;
  const rows = items.map(({ id, q }) => {
    const p = CATALOG[id];
    const price = p?.price || 0;
    const subtotal = price * q;
    total += subtotal;
    const vram = p?.vram || '-'; 
    
    return { id, q, name: p?.name || id, brand: p?.brand || '-', sku: p?.sku || '-', vram, price, subtotal };
  });
  return { rows, total };
}

/* RENDER DEL CARRITO (comprar.html) */
async function renderCartPage() {
  const table   = document.querySelector('[data-cart]');
  const body    = document.querySelector('[data-cart-body]');
  const totalEl = document.querySelector('[data-cart-total]');
  if (!table || !body || !totalEl) return;

  const fmt = (n) => new Intl.NumberFormat('es-AR').format(n);

  const draw = async () => {
    const { rows, total } = await cartDetailed();
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

  table.addEventListener('input', (e) => {
    const inp = e.target.closest('input.qty');
    if (!inp) return;
    const id = inp.closest('tr').getAttribute('data-id');
    cartSetQty(id, inp.value);
    draw();
  });

  table.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    const id = btn.closest('tr').getAttribute('data-id');
    cartRemove(id);
    draw();
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-empty-cart]');
    if (!btn) return;
    cartClear();
    draw();
  });

  const pid = new URLSearchParams(location.search).get('id');
  if (pid) {
    const CATALOG = await getCatalog();
    if (CATALOG[pid]) {
      cartAdd(pid, 1);
      history.replaceState({}, '', 'comprar.html');
    }
  }

  draw();
}
renderCartPage();

/* AGREGAR AL CARRITO desde listados/ficha*/
document.addEventListener('click', async (e) => {
  const add = e.target.closest('[data-add]');
  if (!add) return;
  e.preventDefault();
  
  const id = add.getAttribute('data-add');
  const CATALOG = await getCatalog();
  if (!CATALOG[id]) return;
  
  cartAdd(id, 1);
  showToast("✅ Producto agregado al carrito");
});

(async function hookProductBuy(){
  const btnBuy = document.querySelector('[data-buy]');
  if (!btnBuy) return;
  
  const id = new URLSearchParams(location.search).get('id');
  const CATALOG = await getCatalog();
  if (!id || !CATALOG[id]) return;
  
  btnBuy.addEventListener('click', (e) => {
    e.preventDefault();
    cartAdd(id, 1);
    window.location.href = 'comprar.html';
  });
})();

/* FOOTER: año automático*/
const yearSpan = document.querySelector('[data-year]');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* NOTIFICACIÓN TOAST */
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.background = 'var(--nav-bg, #0b1220)';
  toast.style.color = 'var(--nav-ink, #e2e8f0)';
  toast.style.padding = '1rem 1.25rem';
  toast.style.borderRadius = '.75rem';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  toast.style.zIndex = '10000';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(10px)';
  toast.style.transition = 'opacity .3s ease, transform .3s ease';
  
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* RENDERIZAR PRODUCTOS ALEATORIOS EN INDEX (DESTACADOS) */
async function renderFeaturedProducts() {
  const container = document.querySelector('[data-featured-products]');
  if (!container) return; // Si no estamos en index.html, salir
  
  console.log('⭐ Cargando productos destacados...');
  
  try {
    const CATALOG = await getCatalog();
    const products = Object.values(CATALOG);
    
    if (products.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--muted);">No hay productos disponibles.</p>';
      return;
    }
    
    // Seleccionar 3 productos aleatorios
    const shuffled = products.sort(() => 0.5 - Math.random());
    const featured = shuffled.slice(0, 3);
    
    const fmt = (n) => new Intl.NumberFormat('es-AR').format(n);
    
    container.innerHTML = featured.map(p => `
      <article class="card" data-name="${p.name.toLowerCase()}">
        <picture>
          <img src="${p.img}" alt="${p.name}" width="300" height="180" />
        </picture>
        <div class="body">
          <h3>${p.name}</h3>
          <p class="meta">${p.specs[0] || 'Sin especificaciones'}</p>
          <p class="price">ARS ${fmt(p.price)}</p>
          <div class="actions">
            <a class="btn" href="producto.html?id=${p.id}">Ver ficha</a>
          </div>
        </div>
      </article>
    `).join('');
    
    console.log(`✅ ${featured.length} productos destacados renderizados`);
    
  } catch (error) {
    console.error('❌ Error al cargar productos destacados:', error);
    container.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--muted);">Error al cargar productos.</p>';
  }
}

/* RENDERIZAR PRODUCTOS EN TABLA */
async function renderProductTable() {
  const tbody = document.querySelector('[data-product-table]');
  if (!tbody) return; // Si no estamos en listado_tabla.html, salir
  
  console.log('📊 Cargando productos para la tabla...');
  
  try {
    const CATALOG = await getCatalog();
    const products = Object.values(CATALOG);
    
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--muted);">No hay productos disponibles.</td></tr>';
      return;
    }
    
    const fmt = (n) => new Intl.NumberFormat('es-AR').format(n);
    
    tbody.innerHTML = products.map(p => `
      <tr data-name="${p.name.toLowerCase()}">
        <td><img src="${p.img}" alt="${p.name}" width="120" height="70"></td>
        <td><a href="producto.html?id=${p.id}">${p.name}</a></td>
        <td>${p.brand}</td>
        <td>${p.sku}</td>
        <td>ARS ${fmt(p.price)}</td>
        <td><span class="pill">En stock</span></td>
        <td class="center">
          <a class="btn" href="producto.html?id=${p.id}">Ver ficha</a>
          <a class="btn primary" href="comprar.html?id=${p.id}">Comprar</a>
        </td>
      </tr>
    `).join('');
    
    console.log(`✅ ${products.length} productos en tabla renderizados`);
    
  } catch (error) {
    console.error('❌ Error al cargar tabla de productos:', error);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--muted);">Error al cargar productos.</td></tr>';
  }
}

/* RENDERIZAR PRODUCTOS DINÁMICAMENTE EN LISTADO_BOX */
async function renderProductGrid() {
  const grid = document.querySelector('[data-product-grid]');
  if (!grid) return; // Si no estamos en listado_box.html, salir
  
  console.log('📦 Cargando productos para el grid...');
  
  try {
    const CATALOG = await getCatalog();
    const products = Object.values(CATALOG);
    
    if (products.length === 0) {
      grid.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--muted);">No hay productos disponibles.</p>';
      return;
    }
    
    const fmt = (n) => new Intl.NumberFormat('es-AR').format(n);
    
    grid.innerHTML = products.map(p => `
      <article class="card" data-name="${p.name.toLowerCase()}">
        <a href="producto.html?id=${p.id}">
          <picture>
            <img src="${p.img}" alt="${p.name}">
          </picture>
        </a>
        <div class="body">
          <h3><a href="producto.html?id=${p.id}">${p.name}</a></h3>
          <p class="meta">${p.specs[0] || 'Sin especificaciones'}</p>
          <p class="price">ARS ${fmt(p.price)}</p>
          <div class="actions">
            <a class="btn" href="producto.html?id=${p.id}">Ver ficha</a>
            <a class="btn primary" href="comprar.html?id=${p.id}">Comprar</a>
          </div>
        </div>
      </article>
    `).join('');
    
    console.log(`✅ ${products.length} productos renderizados`);
    
  } catch (error) {
    console.error('❌ Error al cargar productos:', error);
    grid.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--muted);">Error al cargar productos.</p>';
  }
}

/* GENERAR FACTURA EN PDF */
async function generateInvoicePDF(formData, cartItems, total) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Configuración
  const pageWidth = doc.internal.pageSize.getWidth();
  const currentDate = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const invoiceNumber = 'F-' + Date.now().toString().slice(-8);
  
  // --- ENCABEZADO ---
  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA DE COMPRA', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PIN Graphics', pageWidth / 2, 27, { align: 'center' });
  doc.text('Venta de tarjetas gráficas', pageWidth / 2, 32, { align: 'center' });
  
  // Línea separadora
  doc.setLineWidth(0.5);
  doc.line(15, 37, pageWidth - 15, 37);
  
  // --- INFORMACIÓN DE LA FACTURA ---
  let yPos = 45;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Factura N°: ${invoiceNumber}`, 15, yPos);
  doc.text(`Fecha: ${currentDate}`, pageWidth - 15, yPos, { align: 'right' });
  
  yPos += 10;
  
  // --- DATOS DEL CLIENTE ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE', 15, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${formData.nombre}`, 15, yPos);
  yPos += 5;
  doc.text(`Email: ${formData.email}`, 15, yPos);
  yPos += 5;
  doc.text(`Teléfono: ${formData.telefono}`, 15, yPos);
  yPos += 5;
  doc.text(`Dirección: ${formData.direccion}`, 15, yPos);
  yPos += 5;
  doc.text(`Método de pago: ${formData.pago}`, 15, yPos);
  
  yPos += 10;
  
  // --- TABLA DE PRODUCTOS ---
  const tableData = cartItems.map(item => [
    item.name,
    item.brand,
    item.sku,
    item.q.toString(),
    `ARS ${new Intl.NumberFormat('es-AR').format(item.price)}`,
    `ARS ${new Intl.NumberFormat('es-AR').format(item.subtotal)}`
  ]);
  
  doc.autoTable({
    startY: yPos,
    head: [['Producto', 'Marca', 'SKU', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [14, 165, 233],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  });
  
  // --- TOTAL ---
  yPos = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const totalText = `TOTAL: ARS ${new Intl.NumberFormat('es-AR').format(total)}`;
  doc.text(totalText, pageWidth - 15, yPos, { align: 'right' });
  
  // --- PIE DE PÁGINA ---
  yPos = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Gracias por tu compra en PIN Graphics', pageWidth / 2, yPos, { align: 'center' });
  doc.text('Esta factura es un comprobante de compra', pageWidth / 2, yPos + 4, { align: 'center' });
  
  // --- GUARDAR PDF ---
  doc.save(`Factura_${invoiceNumber}_${formData.nombre.replace(/\s+/g, '_')}.pdf`);
  
  return invoiceNumber;
}

/* MANEJAR ENVÍO DEL FORMULARIO DE COMPRA */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('📝 Procesando compra...');
    
    // Obtener datos del formulario
    const formData = {
      nombre: document.getElementById('nombre').value,
      telefono: document.getElementById('telefono').value,
      email: document.getElementById('email').value,
      direccion: document.getElementById('direccion').value,
      pago: document.querySelector('input[name="pago"]:checked')?.value || 'No especificado'
    };
    
    // Obtener productos del carrito
    const { rows, total } = await cartDetailed();
    
    if (rows.length === 0) {
      alert('Tu carrito está vacío. Agrega productos antes de confirmar la compra.');
      return;
    }
    
    try {
      console.log('📄 Generando PDF...');
      
      // Generar PDF
      const invoiceNumber = await generateInvoicePDF(formData, rows, total);
      
      console.log('💾 Guardando pedido en la base de datos...');
      
      // Guardar pedido en la base de datos
      const response = await fetch('guardar_pedido.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numero_factura: invoiceNumber,
          total: total,
          medio_pago: formData.pago,
          productos: rows
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Pedido guardado:', data);
        
        // Mostrar mensaje de éxito
        showToast(`✅ ¡Factura generada! N° ${invoiceNumber}`);
        
        // Vaciar carrito después de la compra
        setTimeout(() => {
          cartClear();
          alert('¡Compra realizada con éxito! Tu pedido ha sido registrado.\n\nPuedes ver tu historial en "Mi Perfil".');
          window.location.href = 'perfil.html';
        }, 1000);
        
      } else {
        throw new Error('Error al guardar el pedido');
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Ocurrió un error al procesar la compra. Por favor, intenta nuevamente.');
    }
  });
});

/* RENDERIZAR PÁGINA DE PERFIL */
async function renderProfilePage() {
  const container = document.querySelector('[data-profile-container]');
  if (!container) return; // No estamos en perfil.html
  
  console.log('👤 Cargando perfil del usuario...');
  
  try {
    const response = await fetch('perfil_api.php');
    
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = 'login.html';
        return;
      }
      throw new Error('Error al cargar perfil');
    }
    
    const data = await response.json();
    const { cliente, pedidos, stats } = data;
    
    const fmt = (n) => new Intl.NumberFormat('es-AR').format(n);
    const fotoUrl = cliente.foto_perfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(cliente.nombre) + '&size=150&background=0ea5e9&color=fff';
    
    container.innerHTML = `
      <!-- Sidebar -->
      <aside class="profile-sidebar">
        <div class="profile-photo-container">
          <img src="${fotoUrl}" alt="Foto de perfil" class="profile-photo" id="profile-photo">
          <label for="photo-upload" class="photo-upload-btn" title="Cambiar foto">
            📷
          </label>
          <input type="file" id="photo-upload" accept="image/*" style="display:none;">
        </div>
        
        <h2 class="profile-name">${cliente.nombre}</h2>
        <p class="profile-email">${cliente.email}</p>
        
        <div class="profile-stats">
          <div class="stat-box">
            <div class="stat-number">${stats.total_pedidos || 0}</div>
            <div class="stat-label">Pedidos</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">ARS ${fmt(stats.total_gastado || 0)}</div>
            <div class="stat-label">Gastado</div>
          </div>
        </div>
      </aside>
      
      <!-- Contenido principal -->
      <div class="profile-main">
        <!-- Información personal -->
        <section class="profile-section">
          <div class="section-header">
            <h3 class="section-title">Información Personal</h3>
            <button class="btn" onclick="alert('Función de edición en desarrollo')">✏️ Editar</button>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre completo</span>
              <span class="info-value">${cliente.nombre}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">${cliente.email}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Miembro desde</span>
              <span class="info-value">${new Date(cliente.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ID de Cliente</span>
              <span class="info-value">#${String(cliente.id).padStart(6, '0')}</span>
            </div>
          </div>
        </section>
        
        <!-- Historial de compras -->
        <section class="profile-section">
          <div class="section-header">
            <h3 class="section-title">Historial de Compras</h3>
          </div>
          
          ${pedidos.length > 0 ? pedidos.map(pedido => `
            <div class="order-card">
              <div class="order-header">
                <span class="order-number">Factura ${pedido.numero_factura}</span>
                <span class="order-status ${pedido.estado === 'Completado' ? 'status-completed' : 'status-pending'}">
                  ${pedido.estado}
                </span>
              </div>
              <div class="order-details">
                <span>📅 ${new Date(pedido.fecha).toLocaleDateString('es-AR')}</span>
                <span class="order-total">ARS ${fmt(pedido.total)}</span>
                <span>💳 ${pedido.medio_pago || 'No especificado'}</span>
                <span></span>
              </div>
            </div>
          `).join('') : `
            <div class="empty-state">
              <p>📦 No hay compras registradas</p>
              <p style="margin-top:.5rem;"><a href="listado_box.html" class="btn primary">Explorar productos</a></p>
            </div>
          `}
        </section>
      </div>
    `;
    
    // Manejar cambio de foto de perfil
    const photoInput = document.getElementById('photo-upload');
    const photoImg = document.getElementById('profile-photo');
    
    if (photoInput && photoImg) {
      photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validar tamaño (máx 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('La imagen es muy grande. Máximo 2MB.');
          return;
        }
        
        // Validar tipo
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecciona una imagen válida.');
          return;
        }
        
        // Previsualizar
        const reader = new FileReader();
        reader.onload = (e) => {
          photoImg.src = e.target.result;
          showToast('📸 Foto actualizada');
        };
        reader.readAsDataURL(file);
      });
    }
    
    console.log('✅ Perfil cargado correctamente');
    
  } catch (error) {
    console.error('❌ Error al cargar perfil:', error);
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; color:var(--muted); grid-column: 1/-1;">
        <p>❌ Error al cargar el perfil</p>
        <p style="margin-top:1rem;">${error.message}</p>
        <p style="margin-top:1rem;"><a href="index.html" class="btn">Volver al inicio</a></p>
      </div>
    `;
  }
}

// Ejecutar las funciones al cargar la página
renderFeaturedProducts();
renderProductGrid();
renderProductTable();
renderProfilePage();

console.log('✅ app.js ejecutado completamente');

/* ============================================
   SLICK CAROUSEL - PRODUCTOS DESTACADOS
   ============================================ */

// Función para cargar productos destacados con carrusel
async function cargarProductosDestacados() {
  const featuredCarousel = document.querySelector('[data-featured-carousel]');
  
  if (!featuredCarousel) return;

  try {
    const CATALOG = await getCatalog();
    if (!CATALOG || Object.keys(CATALOG).length === 0) {
      featuredCarousel.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--muted);">No hay productos disponibles</p>';
      return;
    }

    const productos = Object.values(CATALOG);
    
    // Seleccionar 6 productos aleatorios
    const destacados = productos.sort(() => 0.5 - Math.random()).slice(0, 6);
    
    // Limpiar contenedor
    featuredCarousel.innerHTML = '';
    
    // Agregar productos al carrusel
    destacados.forEach(producto => {
      const div = document.createElement('div');
      div.innerHTML = `
        <article class="card" data-name="${producto.name.toLowerCase()}">
          <img src="${producto.img}" alt="${producto.name}" loading="lazy">
          <h3>${producto.name}</h3>
          <p class="brand">${producto.brand}</p>
          <p class="price">ARS ${fmtARS(producto.price)}</p>
          <a href="producto.html?id=${producto.id}" class="btn primary">Ver detalles</a>
        </article>
      `;
      featuredCarousel.appendChild(div);
    });
    
    // Inicializar Slick después de cargar los productos
    // Usamos setTimeout para asegurar que el DOM se haya actualizado
    setTimeout(() => {
      $(featuredCarousel).slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        arrows: true,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1,
              dots: true
            }
          },
          {
            breakpoint: 640,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              dots: true
            }
          }
        ]
      });
      
      console.log('✅ Slick Carousel inicializado correctamente');
    }, 100);
    
  } catch (error) {
    console.error('❌ Error al cargar productos destacados:', error);
    featuredCarousel.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--muted);">Error al cargar productos</p>';
  }
}

// Ejecutar solo si estamos en la página de inicio
if (document.body.classList.contains('home')) {
  // Esperar a que jQuery esté disponible
  if (typeof jQuery !== 'undefined') {
    cargarProductosDestacados();
  } else {
    console.error('❌ jQuery no está cargado');
  }
}

/* ============================================
   MAGNIFIC POPUP - ZOOM DE IMÁGENES
   ============================================ */

// Función para inicializar Magnific Popup en la página de producto
function initMagnificPopup() {
  // Solo ejecutar si estamos en la página de producto
  if (!document.body.classList.contains('page-producto')) return;
  
  // Esperar a que jQuery y Magnific Popup estén disponibles
  if (typeof jQuery === 'undefined' || typeof jQuery.fn.magnificPopup === 'undefined') {
    console.error('❌ jQuery o Magnific Popup no están cargados');
    return;
  }
  
  // Inicializar Magnific Popup cuando la imagen esté lista
  const checkImage = setInterval(() => {
    const imgLink = document.querySelector('.image-popup');
    const img = document.querySelector('[data-img]');
    
    if (imgLink && img && img.src && img.src !== '' && !img.src.includes('placeholder.png')) {
      clearInterval(checkImage);
      
      // Actualizar el href del enlace con la imagen actual
      imgLink.href = img.src;
      
      // Inicializar Magnific Popup
      $('.image-popup').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        closeBtnInside: false,
        mainClass: 'mfp-zoom-in',
        image: {
          verticalFit: true,
          titleSrc: function(item) {
            const productName = document.querySelector('[data-name]')?.textContent || 'Producto';
            return productName + ' - Click para cerrar';
          }
        },
        zoom: {
          enabled: true,
          duration: 300,
          easing: 'ease-in-out'
        },
        callbacks: {
          open: function() {
            console.log('🔍 Zoom abierto');
          },
          close: function() {
            console.log('✅ Zoom cerrado');
          }
        }
      });
      
      console.log('✅ Magnific Popup inicializado correctamente');
    }
  }, 100);
  
  // Timeout de seguridad (10 segundos)
  setTimeout(() => {
    clearInterval(checkImage);
  }, 10000);
}

// Ejecutar cuando el documento esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMagnificPopup);
} else {
  initMagnificPopup();
}