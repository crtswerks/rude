// ================ CONFIGURATION ================
const ADMIN_WHATSAPP = "6281572455714";
const ADMIN_EMAIL = "info@konohacatering.com";
const WHATSAPP_API_URL = "https://api.whatsapp.com/send";
const API_BASE = "/hostinger/api";

async function fetchKV(key) {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 3000);
    const r = await fetch(`${API_BASE}/get.php?key=${encodeURIComponent(key)}&_=${Date.now()}` , { signal: controller.signal });
    clearTimeout(tid);
    const j = await r.json();
    if (j && j.ok && j.value) return JSON.parse(j.value);
    return null;
  } catch (e) { return null; }
}

async function saveKV(key, obj) {
  try {
    await fetch(`${API_BASE}/save.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value: JSON.stringify(obj) }) });
  } catch (e) {}
}

async function loadRemoteData() {
  const keys = ["packages","dishes","discountCodes","settings","cmsContent","articles","globalVariantTemplates","cart","appliedDiscounts"];
  const fetches = keys.map(k => fetchKV(k).then(v => ({ k, v })).catch(() => ({ k, v: null })));
  const results = await Promise.all(fetches);
  results.forEach(({ k, v }) => {
    if (v === null) {
      // Skip if remote unavailable; keep existing local data for fast load
      return;
    }
    if (k === 'cmsContent' && typeof v === 'object') {
      try {
        const current = JSON.parse(localStorage.getItem('cmsContent')) || {};
        const merged = {
          hero: { title: (v.hero?.title ?? current.hero?.title ?? ''), subtitle: (v.hero?.subtitle ?? current.hero?.subtitle ?? ''), image: (v.hero?.image || current.hero?.image || 'assets/paket-ayam-bakar.jpg') },
          testimonials: Array.isArray(v.testimonials) ? v.testimonials : (current.testimonials || []),
          contact: {
            whatsapp: (v.contact?.whatsapp ?? current.contact?.whatsapp ?? ''),
            email: (v.contact?.email ?? current.contact?.email ?? ''),
            address: (v.contact?.address ?? current.contact?.address ?? '')
          }
        };
        localStorage.setItem('cmsContent', JSON.stringify(merged));
        return;
      } catch (_) {}
    }
    localStorage.setItem(k, JSON.stringify(v));
  });
}

// ================ MENU DATA ================
function initializeDefaultData() {
  if (!localStorage.getItem("packages")) {
    const defaultPackages = [
      { 
        name: "Paket Ayam Serundeng", 
        price: 25000,
        image: "assets/paket-ayam-serundeng.jpg",
        dishes: ["Nasi", "Ayam Serundeng", "Sayur", "Sambal", "Lalapan"]
      },
      { 
        name: "Paket Ayam Bakar", 
        price: 25000,
        image: "assets/paket-ayam-bakar.jpg",
        dishes: ["Nasi", "Ayam Bakar", "Sayur", "Sambal", "Lalapan"]
      },
      { 
        name: "Paket Iga Bakar", 
        price: 35000,
        image: "assets/paket-iga-bakar.jpg",
        dishes: ["Nasi", "Iga Bakar", "Sayur", "Sambal", "Lalapan"]
      },
      { 
        name: "Paket Nasi Cikur", 
        price: 20000,
        image: "assets/paket-nasi-cikur.jpg",
        dishes: ["Nasi Cikur", "Lauk Pilihan", "Sambal", "Lalapan"]
      },
      { 
        name: "Paket Nasi Putih", 
        price: 18000,
        image: "assets/paket-nasi-putih.jpg",
        dishes: ["Nasi Putih", "Lauk Pilihan", "Sambal"]
      },
    ];
    localStorage.setItem("packages", JSON.stringify(defaultPackages));
  }

  if (!localStorage.getItem("dishes")) {
    const defaultDishes = [
      { name: "Ayam Serundeng", price: 12000, image: "assets/ayam-serundeng.jpg", category: "Ayam" },
      { name: "Ayam Goreng", price: 12000, image: "assets/ayam-goreng.jpg", category: "Ayam" },
      { name: "Ayam Geprek", price: 12000, image: "assets/ayam-geprek.jpg", category: "Ayam" },
      { name: "Ayam Bakar", price: 12000, image: "assets/ayam-bakar.jpg", category: "Ayam" },
	  { name: "Suwir Ayam", price: 5000, image: "assets/suwir-ayam.jpg", category: "Ayam" },
	  { name: "Ati Ayam", price: 5000, image: "assets/ati-ayam.jpg", category: "Ayam" },
	  { name: "Usus Ayam", price: 2000, image: "assets/usus-ayam.jpg", category: "Ayam" },
      { name: "Nila Goreng", price: 15000, image: "assets/nila-goreng.jpg", category: "Ikan" },
      { name: "Nila Bakar", price: 15000, image: "assets/nila-bakar.jpg", category: "Ikan" },
      { name: "Lele Goreng", price: 13000, image: "assets/lele-goreng.jpg", category: "Ikan" },
      { name: "Cumi", price: 12000, image: "assets/cumi.jpg", category: "Seafood" },
	  { name: "Oseng Cumi", price: 5000, image: "assets/oseng-cumi.jpg", category: "Seafood" },
      { name: "Udang", price: 12000, image: "assets/udang.jpg", category: "Seafood" },
	  { name: "Asin Tulang Jambal", price: 10000, image: "assets/asin-tulang-jambal.jpg", category: "Seafood" },
	  { name: "Suwir Tongkol", price: 5000, image: "assets/suwir-tongkol.jpg", category: "Ikan" },
      { name: "Sop Iga", price: 20000, image: "assets/sop-iga.jpg", category: "Daging" },
      { name: "Iga Bakar", price: 20000, image: "assets/iga-bakar.jpg", category: "Daging" },
	  { name: "Iga Mercon", price: 20000, image: "assets/iga-mercon.jpg", category: "Daging" },
	  { name: "Sop Buntut", price: 25000, image: "assets/sop-buntut.jpg", category: "Daging" },
	  { name: "Buntut Bakar", price: 25000, image: "assets/buntut-bakar.jpg", category: "Daging" },
	  { name: "Kikil", price: 15000, image: "assets/kikil.jpg", category: "Daging" },
	  { name: "Kikil Mercon", price: 15000, image: "assets/kikil-mercon.jpg", category: "Daging" },
	  { name: "Oseng Kangkung", price: 5000, image: "assets/oseng-kangkung.jpg", category: "Sayur" },
	  { name: "Oseng Genjer", price: 5000, image: "assets/oseng-genjer.jpg", category: "Sayur" },
	  { name: "Oseng terong", price: 5000, image: "assets/oseng-terong.jpg", category: "Sayur" },
	  { name: "Oseng jengkol", price: 10000, image: "assets/oseng-jengkol.jpg", category: "Sayur" },
	  { name: "Selada Goreng", price: 5000, image: "assets/selada-goreng.jpg", category: "Sayur" },
	  { name: "Kol Goreng", price: 5000, image: "assets/kol-goreng.jpg", category: "Sayur" },
      { name: "Nasi Cikur", price: 7000, image: "assets/nasi-cikur.jpg", category: "Nasi" },
      { name: "Nasi Putih", price: 7000, image: "assets/nasi-putih.jpg", category: "Nasi" },
    ];
    localStorage.setItem("dishes", JSON.stringify(defaultDishes));
  }
}

let menuPackages = [];
let aLaCarte = [];
let settings = {};
let cmsContent = {};
let discountCodes = [];

function loadMenuData() {
  initializeDefaultData();
  menuPackages = JSON.parse(localStorage.getItem("packages")) || [];
  aLaCarte = JSON.parse(localStorage.getItem("dishes")) || [];
  settings = JSON.parse(localStorage.getItem("settings")) || {
    taxEnabled: true,
    taxRate: 0.1,
    shippingEnabled: true,
    shippingCost: 5000,
    discountEnabled: true,
    lowStockThreshold: 5
  };
  discountCodes = JSON.parse(localStorage.getItem("discountCodes")) || [];

  // Normalize menu items: default active=true, stock undefined
  const normalizeAdditional = (groups) => {
    if (!Array.isArray(groups)) return [];
    return groups
      .map(g => ({
        group: (g && g.group ? String(g.group).trim() : ''),
        options: Array.isArray(g?.options)
          ? g.options.map(o => ({
              name: (o && o.name ? String(o.name).trim() : ''),
              delta: typeof o?.delta === 'number' ? o.delta : (parseInt(o?.delta) || 0)
            }))
          : []
      }))
      .filter(g => g.group && g.options.length);
  };
  menuPackages = menuPackages.map(p => ({
    ...p,
    active: p.active === false ? false : true,
    stock: typeof p.stock === 'number' ? p.stock : undefined,
    additionalVariants: normalizeAdditional(p.additionalVariants)
  }));
  aLaCarte = aLaCarte.map(d => ({
    ...d,
    active: d.active === false ? false : true,
    stock: typeof d.stock === 'number' ? d.stock : undefined,
    additionalVariants: normalizeAdditional(d.additionalVariants)
  }));
  
  // Ensure discount codes have minQuantity for consistency (IMPORTANT FOR ADMIN.JS)
  discountCodes = discountCodes.map(d => ({
    ...d,
    minQuantity: d.minQuantity || 0
  }));

  // Load CMS content defaults
  cmsContent = JSON.parse(localStorage.getItem("cmsContent")) || {
    hero: {
      title: "Selamat datang di KONOHA Catering",
      subtitle: "Makan dulu biar tenang! Pesan paket dan menu a la carte favoritmu.",
      image: "assets/paket-ayam-bakar.jpg"
    },
    testimonials: [
      { name: "Naruto", text: "Enak banget, porsinya pas!" },
      { name: "Sasuke", text: "Rasanya premium, harga terjangkau." },
      { name: "Sakura", text: "Delivery cepat dan kemasannya pi." }
    ],
    contact: {
      whatsapp: "081572455714",
      email: "info@konohacatering.com",
      address: "Konoha Street No. 1, Bandung"
    }
  };
  localStorage.setItem("cmsContent", JSON.stringify(cmsContent));
}

// ================ CART SYSTEM ================
let cart = {};
let appliedDiscounts = [];

function renderMenu() {
  const packageList = document.getElementById("packageList");
  const aLaCarteList = document.getElementById("aLaCarteList");
  
  if (!packageList || !aLaCarteList) {
    console.error("Menu containers not found");
    return;
  }
  
  packageList.innerHTML = "";
  aLaCarteList.innerHTML = "";

  const activePackages = menuPackages.filter(item => item.active !== false);
  if (activePackages.length === 0) {
    packageList.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">Belum ada paket menu tersedia</p>';
  } else {
    activePackages.forEach((item) => {
      const div = document.createElement("div");
      div.className = "bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1 menu-item";
      div.innerHTML = `
        <div class="relative h-48 bg-gray-200">
          <img src="${item.image}" 
               alt="${item.name}" 
               class="w-full h-full object-cover"
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🍱%3C/text%3E%3C/svg%3E'">
          <div class="absolute top-2 right-2 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            Paket
          </div>
          ${typeof item.stock === 'number' && item.stock <= 0 ? '<div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">Stok Habis</div>' : ''}
        </div>
        <div class="p-4">
          <h3 class="font-bold text-lg mb-2">${item.name}</h3>
          <p class="text-sm text-gray-600 mb-2">
            ${Array.isArray(item.dishes) ? item.dishes.join(", ") : "Menu lengkap"}
          </p>
                  <p class="text-xl font-bold text-yellow-600 mb-3">
                    Rp ${(item.primaryVariants?.options?.find(o=>o.name==='normal')?.price || item.price).toLocaleString()}
                  </p>
          ${(() => {
            const opts = (item.primaryVariants && item.primaryVariants.options) ? item.primaryVariants.options : [];
            const hasSmall = opts.some(o => o.name === 'kecil');
            const hasJumbo = opts.some(o => o.name === 'jumbo');
            if (!(hasSmall || hasJumbo)) return '';
            return `
            <div class="mb-2">
              <label class="text-xs">Porsi</label>
              <select id="pv-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}" class="w-full border border-yellow-400 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" onchange="updateQtyDisplay('${item.name.replace(/[^a-zA-Z0-9]/g, '_')}', '${item.name.replace(/'/g, "\\'")}')">
                ${opts.map(o => `<option value="${o.name}">${o.name} — Rp ${o.price.toLocaleString()}</option>`).join('')}
              </select>
            </div>`;
          })()}
          ${(item.additionalVariants || []).map(g => `
            <div class="mb-2">
              <label class="text-xs">${g.group}</label>
              <select id="add-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}-${g.group.replace(/[^a-zA-Z0-9]/g,'_')}" class="w-full border border-yellow-400 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" onchange="updateQtyDisplay('${item.name.replace(/[^a-zA-Z0-9]/g, '_')}', '${item.name.replace(/'/g, "\\'")}')">
                ${g.options.map(o => `<option value="${o.name}">${o.name}${o.delta>0?` (+Rp ${o.delta.toLocaleString()})`:''}</option>`).join('')}
              </select>
            </div>
          `).join('')}
          <div class="flex items-center justify-between mt-2">
            <button class="bg-gray-300 px-3 py-2 rounded-lg hover:bg-gray-400 transition" 
                    onclick="changeQtyForCard('${item.name.replace(/[^a-zA-Z0-9]/g, '_')}', '${item.name.replace(/'/g, "\\'")}', -1)">−</button>
            <span id="qty-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}" class="text-xl font-bold w-12 text-center">0</span>
            <button class="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition" 
                    ${typeof item.stock === 'number' && item.stock <= 0 ? 'disabled' : ''}
                    onclick="changeQtyForCard('${item.name.replace(/[^a-zA-Z0-9]/g, '_')}', '${item.name.replace(/'/g, "\\'")}', 1)">+</button>
          </div>
        </div>
      `;
      packageList.appendChild(div);
    });
  }

  const activeDishes = aLaCarte.filter(item => item.active !== false);
  if (activeDishes.length === 0) {
    aLaCarteList.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">Belum ada menu a la carte tersedia</p>';
  } else {
    activeDishes.forEach((item) => {
      const div = document.createElement("div");
      div.className = "bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1 menu-item";
      div.innerHTML = `
        <div class="relative h-40 bg-gray-200">
          <img src="${item.image}" 
               alt="${item.name}" 
               class="w-full h-full object-cover"
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🍽️%3C/text%3E%3C/svg%3E'">
          ${item.category ? `
            <div class="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
              ${item.category}
            </div>
          ` : ''}
          ${typeof item.stock === 'number' && item.stock <= 0 ? '<div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">Stok Habis</div>' : ''}
        </div>
        <div class="p-3">
          <h3 class="font-semibold text-base mb-2">${item.name}</h3>
                  <p class="text-lg font-bold text-yellow-600 mb-2">
                    Rp ${(item.primaryVariants?.options?.find(o=>o.name==='normal')?.price || item.price).toLocaleString()}
                  </p>
          ${(() => {
            const opts = (item.primaryVariants && item.primaryVariants.options) ? item.primaryVariants.options : [];
            const hasSmall = opts.some(o => o.name === 'kecil');
            const hasJumbo = opts.some(o => o.name === 'jumbo');
            if (!(hasSmall || hasJumbo)) return '';
            return `
            <div class="mb-2">
              <label class="text-xs">Porsi</label>
              <select id="pv-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}" class="w-full border border-yellow-400 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" onchange="updateQtyDisplay('${item.name.replace(/[^a-zA-Z0-9]/g, '_')}', '${item.name.replace(/'/g, "\\'")}')">
                ${opts.map(o => `<option value="${o.name}">${o.name} — Rp ${o.price.toLocaleString()}</option>`).join('')}
              </select>
            </div>`;
          })()}
          ${(item.additionalVariants || []).map(g => `
            <div class="mb-2">
              <label class="text-xs">${g.group}</label>
              <select id="add-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}-${g.group.replace(/[^a-zA-Z0-9]/g,'_')}" class="w-full border border-yellow-400 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" onchange="updateQtyDisplay('${item.name.replace(/[^a-zA-Z0-9]/g, '_')}', '${item.name.replace(/'/g, "\\'")}')">
                ${g.options.map(o => `<option value="${o.name}">${o.name}${o.delta>0?` (+Rp ${o.delta.toLocaleString()})`:''}</option>`).join('')}
              </select>
            </div>
          `).join('')}
          <div class="flex items-center justify-between mt-2">
            <button class="bg-gray-300 px-3 py-2 rounded-lg hover:bg-gray-400 transition" 
                    onclick="changeQtyForCard('${item.name.replace(/[^a-zA-Z0-9]/g, '_')}', '${item.name.replace(/'/g, "\\'")}', -1)">−</button>
            <span id="qty-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}" class="text-lg font-bold w-10 text-center">0</span>
            <button class="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition" 
                    ${typeof item.stock === 'number' && item.stock <= 0 ? 'disabled' : ''}
                    onclick="changeQtyForCard('${item.name.replace(/[^a-zA-Z0-9]/g, '_')}', '${item.name.replace(/'/g, "\\'")}', 1)">+</button>
          </div>
        </div>
      `;
      aLaCarteList.appendChild(div);
    });
  }
}

function changeQty(name, delta) {
  const item = [...menuPackages, ...aLaCarte].find((m) => m.name === name);
  if (!item) return;
  if (delta > 0 && typeof item.stock === 'number') {
    const currentQty = getTotalQtyInCart(name);
    const remaining = item.stock - currentQty;
    if (remaining <= 0) {
      showNotification('Stok habis untuk item ini', 'error');
      return;
    }
    if (delta > remaining) {
      showNotification(`Hanya ${remaining} lagi yang bisa dipesan`, 'error');
      return;
    }
  }
  if (!cart[name]) {
    const defaultPv = (item.primaryVariants?.options?.find(o=>o.name==='normal')?.name) || '';
    cart[name] = { ...item, qty: 0, primaryVariant: defaultPv, additionalSelections: {} };
  }
  cart[name].qty += delta;
  if (cart[name].qty <= 0) delete cart[name];
  
  const safeId = name.replace(/[^a-zA-Z0-9]/g, '_');
  const qtyElement = document.getElementById(`qty-${safeId}`);
  if (qtyElement) {
    qtyElement.textContent = cart[name]?.qty || 0;
  }
  
  renderCart();
  saveKV("cart", Object.values(cart));
}

function normalizeId(s) { return (s || '').replace(/[^a-zA-Z0-9]/g, '_'); }

function getCartKey(name, pv, addSel) {
  const addPart = Object.entries(addSel || {}).map(([g, v]) => `${normalizeId(g)}=${normalizeId(v)}`).join('|');
  return `${name}|pv=${normalizeId(pv || '')}|${addPart}`;
}

function getCardSelections(item, safeId) {
  const pvSel = document.getElementById(`pv-${safeId}`);
  const pv = pvSel ? pvSel.value : (item.primaryVariants?.options?.find(o => o.name === 'normal')?.name || '');
  const addSel = {};
  (item.additionalVariants || []).forEach(g => {
    const id = `add-${safeId}-${normalizeId(g.group)}`;
    const el = document.getElementById(id);
    if (el) addSel[g.group] = el.value;
  });
  return { pv, addSel };
}

function findCartEntryBySelection(name, pv, addSel) {
  const key = getCartKey(name, pv, addSel);
  return cart[key];
}

function updateQtyDisplay(safeId, name) {
  const item = [...menuPackages, ...aLaCarte].find(m => m.name === name);
  if (!item) return;
  const { pv, addSel } = getCardSelections(item, safeId);
  const entry = findCartEntryBySelection(name, pv, addSel);
  const span = document.getElementById(`qty-${safeId}`);
  if (span) span.textContent = entry?.qty || 0;
}

function changeQtyForCard(safeId, name, delta) {
  const item = [...menuPackages, ...aLaCarte].find(m => m.name === name);
  if (!item) return;
  if (delta > 0) {
    const stock = item.stock;
    if (typeof stock === 'number') {
      const currentQty = getTotalQtyInCart(name);
      const remaining = stock - currentQty;
      if (remaining <= 0) {
        showNotification('Stok habis untuk item ini', 'error');
        return;
      }
      if (delta > remaining) {
        showNotification(`Hanya ${remaining} lagi yang bisa dipesan`, 'error');
        return;
      }
    }
  }
  const { pv, addSel } = getCardSelections(item, safeId);
  const key = getCartKey(name, pv, addSel);
  if (!cart[key]) {
    cart[key] = { ...item, name, qty: 0, primaryVariant: pv, additionalSelections: addSel };
  }
  cart[key].qty += delta;
  if (cart[key].qty <= 0) delete cart[key];
  const span = document.getElementById(`qty-${safeId}`);
  if (span) span.textContent = cart[key]?.qty || 0;
  renderCart();
  saveKV("cart", Object.values(cart));
}

function renderCart() {
  const summary = document.getElementById("cartSummary");
  const totalAmount = document.getElementById("totalAmount");
  const mobileSummary = document.getElementById("cartSummaryMobile");
  const totalAmountMobile = document.getElementById("totalAmountMobile");
  const cartCountBadge = document.getElementById("cartCountBadge");
  if (!summary || !totalAmount) return;
  let total = 0;
  summary.innerHTML = "";
  if (mobileSummary) mobileSummary.innerHTML = "";
  const cartItems = Object.values(cart);
  if (cartItems.length === 0) {
    summary.innerHTML = '<p class="text-gray-500 text-center">Keranjang masih kosong</p>';
    if (mobileSummary) mobileSummary.innerHTML = '<p class="text-gray-500 text-center">Keranjang masih kosong</p>';
  } else {
    cartItems.forEach((item) => {
      const line = document.createElement("div");
      line.className = "flex justify-between items-center text-gray-700 dark:text-gray-300 mb-2";
      const pvText = item.primaryVariant ? ` [${item.primaryVariant}]` : '';
      const addText = item.additionalSelections && Object.keys(item.additionalSelections).length
        ? ` {${Object.entries(item.additionalSelections).map(([g, v]) => `${g}: ${v}`).join('; ')}}`
        : '';
      const noteText = item.note ? ` — ${item.note}` : '';
      const unit = getItemUnitPrice(item);
      const itemInfo = document.createElement("div");
      itemInfo.className = "flex-1";
      itemInfo.innerHTML = `
        <div>${item.name}${pvText}${addText} x ${item.qty}</div>
        <div class="text-sm text-yellow-600 font-bold">Rp ${(item.qty * unit).toLocaleString()}${noteText}</div>
      `;
      const editButton = document.createElement("button");
      editButton.className = "text-blue-500 hover:text-blue-700 text-sm ml-2";
      editButton.innerHTML = '✏️';
      editButton.onclick = () => openItemEdit(item.name);
      editButton.title = "Edit item";
      line.appendChild(itemInfo);
      line.appendChild(editButton);
      summary.appendChild(line);
      if (mobileSummary) {
        const mline = document.createElement("div");
        mline.className = "flex justify-between items-center text-gray-700 mb-2";
        mline.innerHTML = `
          <div class="flex-1">
            <div>${item.name}${pvText}${addText} x ${item.qty}</div>
            <div class="text-sm text-yellow-600 font-bold">Rp ${(item.qty * unit).toLocaleString()}${noteText}</div>
          </div>
          <button class="text-blue-500 text-sm ml-2">✏️</button>
        `;
        const btn = mline.querySelector('button');
        if (btn) btn.addEventListener('click', () => openItemEdit(item.name));
        mobileSummary.appendChild(mline);
      }
      total += item.qty * unit;
    });
  }
  totalAmount.textContent = `Rp ${total.toLocaleString()}`;
  if (totalAmountMobile) totalAmountMobile.textContent = `Rp ${total.toLocaleString()}`;
  if (cartCountBadge) {
    const count = cartItems.reduce((n, it) => n + (it.qty || 0), 0);
    cartCountBadge.textContent = String(count);
  }
}

// ================ DISCOUNT MANAGEMENT ================
function addDiscountCode() {
  const input = document.getElementById("discountCodeInput");
  if (!input) return;
  
  const code = input.value.trim().toUpperCase();
  if (!code) {
    showNotification("Masukkan kode diskon terlebih dahulu!", "error");
    return;
  }
  
  if (!settings.discountEnabled) {
    showNotification("Fitur diskon sedang tidak aktif!", "error");
    return;
  }
  
  if (appliedDiscounts.includes(code)) {
    showNotification("Kode diskon sudah digunakan!", "error");
    return;
  }
  
  const discount = discountCodes.find(d => d.code === code && d.active);
  if (!discount) {
    showNotification("Kode diskon tidak valid atau tidak aktif!", "error");
    return;
  }
  
  let subtotal = 0;
  let totalQty = 0; // START: ADDED TOTAL QUANTITY CALCULATION
  Object.values(cart).forEach((item) => {
    subtotal += item.qty * item.price;
    totalQty += item.qty;
  }); // END: ADDED TOTAL QUANTITY CALCULATION
  
  if (subtotal < discount.minPurchase) {
    showNotification(`Minimum pembelian Rp ${discount.minPurchase.toLocaleString()} untuk kode ini!`, "error");
    return;
  }
  
  // START: ADDED MIN QUANTITY CHECK
  if (discount.minQuantity && totalQty < discount.minQuantity) {
    showNotification(`Minimum kuantitas ${discount.minQuantity} item untuk kode ini!`, "error");
    return;
  }
  // END: ADDED MIN QUANTITY CHECK
  
  appliedDiscounts.push(code);
  input.value = "";
  renderCheckoutSummary();
  showNotification(`Kode diskon ${code} berhasil diterapkan!`, "success");
  saveKV("appliedDiscounts", appliedDiscounts);
}

function removeDiscountCode(code) {
  appliedDiscounts = appliedDiscounts.filter(c => c !== code);
  renderCheckoutSummary();
  showNotification(`Kode diskon ${code} dihapus!`, "success");
  saveKV("appliedDiscounts", appliedDiscounts);
}

function calculateDiscounts(subtotal) {
  let totalDiscount = 0;
  const discountDetails = [];
  
  // Note: Validation for minPurchase/minQuantity is only done in addDiscountCode()
  // to ensure discounts are applied only if all criteria are met at the time of entry.
  appliedDiscounts.forEach(code => {
    const discount = discountCodes.find(d => d.code === code);
    if (!discount) return;
    
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = subtotal * (discount.value / 100);
      if (discount.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
    } else {
      discountAmount = discount.value;
    }
    
    totalDiscount += discountAmount;
    discountDetails.push({
      code: code,
      amount: discountAmount
    });
  });
  
  return { totalDiscount, discountDetails };
}

// ================ CHECKOUT FLOW ================
const processOrderBtn = document.getElementById("processOrderBtn");
const orderSummaryContainer = document.getElementById("orderSummaryContainer");
const orderSummaryDetails = document.getElementById("orderSummaryDetails");
const checkoutContainer = document.getElementById("checkoutContainer");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutSummary = document.getElementById("checkoutSummary");
const finalConfirmBtn = document.getElementById("finalConfirmBtn");
const trackingModalEl = document.getElementById("trackingModal");
const paymentProofInput = document.getElementById("paymentProof");
let paymentProofReady = false;
let paymentProofDataCache = null;

function updateConfirmButtonState() {
  const allFilled = checkoutForm ? [...checkoutForm.querySelectorAll("[required]:not(#paymentProof)")].every((el) => {
    if (el.type === 'radio') {
      return checkoutForm.querySelector(`input[name="${el.name}"]:checked`);
    }
    return el.value.trim() !== '';
  }) : false;
  
  console.log('Update button state - allFilled:', allFilled, 'paymentProofReady:', paymentProofReady);
  
  if (allFilled && paymentProofReady && finalConfirmBtn) {
    finalConfirmBtn.disabled = false;
    finalConfirmBtn.classList.remove("opacity-50", "cursor-not-allowed");
    finalConfirmBtn.classList.add("hover:bg-yellow-700");
    console.log('Button ENABLED');
  } else if (finalConfirmBtn) {
    finalConfirmBtn.disabled = true;
    finalConfirmBtn.classList.add("opacity-50", "cursor-not-allowed");
    finalConfirmBtn.classList.remove("hover:bg-yellow-700");
    console.log('Button DISABLED');
  }
}

function showUploadProgress(percent) {
  const container = document.getElementById("uploadProgressContainer");
  const bar = document.getElementById("uploadProgressBar");
  const text = document.getElementById("uploadProgressText");
  
  console.log('Show progress:', percent + '%');
  
  if (container && bar && text) {
    container.classList.remove("hidden");
    bar.style.width = percent + "%";
    text.textContent = `Mengupload: ${Math.round(percent)}%`;
  }
}

function hideUploadProgress() {
  const container = document.getElementById("uploadProgressContainer");
  if (container) {
    container.classList.add("hidden");
  }
}

function showUploadStatus(message, type = "success") {
  const status = document.getElementById("uploadStatus");
  if (status) {
    status.classList.remove("hidden");
    status.className = `mt-2 p-2 rounded text-sm ${
      type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`;
    status.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${type === "success" ? "✅" : "❌"}</span>
        <span>${message}</span>
      </div>
    `;
  }
}

// Compress image to reduce storage size
function compressImage(base64Image, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Resize if too large
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG with quality setting
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64Image;
  });
}

if (paymentProofInput) {
  paymentProofInput.addEventListener("change", function() {
    const file = this.files[0];
    
    console.log('File selected:', file?.name, file?.size);
    
    // Reset state immediately
    paymentProofReady = false;
    paymentProofDataCache = null;
    updateConfirmButtonState(); // Disable button immediately
    
    // Clear previous status
    hideUploadProgress();
    const statusEl = document.getElementById("uploadStatus");
    if (statusEl) statusEl.classList.add("hidden");
    
    if (!file) {
      updateConfirmButtonState();
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showUploadStatus("File terlalu besar! Maksimal 5MB", "error");
      paymentProofInput.value = "";
      updateConfirmButtonState();
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      showUploadStatus("File harus berupa gambar (JPG, PNG, dll)", "error");
      paymentProofInput.value = "";
      updateConfirmButtonState();
      return;
    }
    
    // Show initial progress
    console.log('Starting upload simulation...');
    showUploadProgress(0);
    
    // Simulate smooth progress bar
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        showUploadProgress(progress);
      }
    }, 100); // Faster animation
    
    // Read file
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      console.log('File loaded successfully');
      
      // Complete progress
      clearInterval(progressInterval);
      showUploadProgress(90);
      
      // Compress image
      try {
        console.log('Compressing image...');
        const compressedImage = await compressImage(e.target.result);
        const originalSize = (e.target.result.length / 1024).toFixed(2);
        const compressedSize = (compressedImage.length / 1024).toFixed(2);
        console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB`);
        
        paymentProofDataCache = compressedImage;
        showUploadProgress(100);
        
        // Wait a moment to show 100%, then show success
        setTimeout(() => {
          paymentProofReady = true;
          hideUploadProgress();
          showUploadStatus("Bukti pembayaran berhasil diupload!", "success");
          updateConfirmButtonState();
          console.log('Upload complete, button state updated');
        }, 500);
      } catch (error) {
        console.error('Compression error:', error);
        clearInterval(progressInterval);
        paymentProofReady = false;
        paymentProofDataCache = null;
        hideUploadProgress();
        showUploadStatus("Gagal memproses gambar. Silakan coba lagi.", "error");
        paymentProofInput.value = "";
        updateConfirmButtonState();
      }
    };
    
    reader.onerror = () => {
      console.log('File load error');
      clearInterval(progressInterval);
      paymentProofReady = false;
      paymentProofDataCache = null;
      hideUploadProgress();
      showUploadStatus("Gagal mengupload file. Silakan coba lagi.", "error");
      paymentProofInput.value = "";
      updateConfirmButtonState();
    };
    
    reader.readAsDataURL(file);
  });
}

if (processOrderBtn) {
  processOrderBtn.addEventListener("click", () => {
    if (Object.keys(cart).length === 0) {
      showNotification("Keranjang kosong. Tambahkan menu terlebih dahulu!", "error");
      return;
    }
    
    let html = '<div class="space-y-2">';
    let total = 0;
    
    Object.values(cart).forEach((item) => {
      const unit = getItemUnitPrice(item);
      const pvText = item.primaryVariant ? ` [${item.primaryVariant}]` : '';
      const addText = item.additionalSelections && Object.keys(item.additionalSelections).length
        ? ` {${Object.entries(item.additionalSelections).map(([g, v]) => `${g}: ${v}`).join('; ')}}`
        : '';
      html += `
        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
          <div class="flex-1">
            <div>${item.name}${pvText}${addText} x ${item.qty}</div>
            <div class="text-sm text-yellow-600 font-bold">Rp ${(item.qty * unit).toLocaleString()}</div>
          </div>
          <button onclick="openItemEdit('${item.name.replace(/'/g, "\\'")}')" 
                  class="text-blue-500 hover:text-blue-700 text-sm ml-2" title="Edit item">
            ✏️
          </button>
        </div>
      `;
      total += item.qty * unit;
    });
    
    html += `
      </div>
      <div class="mt-4 pt-4 border-t-2 border-yellow-600">
        <div class="flex justify-between text-lg">
          <strong>Total:</strong>
          <strong class="text-yellow-600">Rp ${total.toLocaleString()}</strong>
        </div>
      </div>
    `;
    
    orderSummaryDetails.innerHTML = html;
    orderSummaryContainer.classList.remove("hidden");
  });
}

function closeSummary() {
  if (orderSummaryContainer) {
    orderSummaryContainer.classList.add("hidden");
  }
}

if (orderSummaryContainer) {
  orderSummaryContainer.addEventListener('click', (e) => {
    if (e.target === orderSummaryContainer) closeSummary();
  });
}
if (checkoutContainer) {
  checkoutContainer.addEventListener('click', (e) => {
    if (e.target === checkoutContainer) closeCheckout();
  });
}
if (trackingModalEl) {
  trackingModalEl.addEventListener('click', (e) => {
    if (e.target === trackingModalEl) closeTrackingModal();
  });
}

// Add click-outside-to-close functionality for order summary modal
if (orderSummaryContainer) {
  orderSummaryContainer.addEventListener("click", (e) => {
    if (e.target === orderSummaryContainer) {
      closeSummary();
    }
  });
}

if (document.getElementById("confirmSummaryBtn")) {
  document.getElementById("confirmSummaryBtn").addEventListener("click", () => {
    orderSummaryContainer.classList.add("hidden");
    checkoutContainer.classList.remove("hidden");
    appliedDiscounts = [];
    renderCheckoutSummary();
    
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const minTime = now.toISOString().slice(0, 16);
  document.getElementById("deliveryTime").setAttribute("min", minTime);
    setupPaymentMethodUI();
    paymentProofReady = false;
    paymentProofDataCache = null;
    if (finalConfirmBtn) {
      finalConfirmBtn.disabled = true;
      finalConfirmBtn.classList.add("opacity-50", "cursor-not-allowed");
      finalConfirmBtn.classList.remove("hover:bg-yellow-700");
    }
  });
}

function renderCheckoutSummary() {
  let subtotal = 0;
  Object.values(cart).forEach((item) => (subtotal += item.qty * getItemUnitPrice(item)));
  
  const tax = settings.taxEnabled ? subtotal * settings.taxRate : 0;
  const transport = settings.shippingEnabled ? settings.shippingCost : 0;
  
  const { totalDiscount, discountDetails } = calculateDiscounts(subtotal);
  const grandTotal = subtotal + tax + transport - totalDiscount;

  let html = `
    <div class="space-y-2">
      <div class="flex justify-between items-center bg-white rounded p-2">
        <span>Subtotal:</span>
        <span>Rp ${subtotal.toLocaleString()}</span>
      </div>
  `;
  
  if (settings.taxEnabled) {
    html += `
      <div class="flex justify-between items-center bg-white rounded p-2">
        <span>Pajak (${(settings.taxRate * 100).toFixed(0)}%):</span>
        <span>Rp ${tax.toLocaleString()}</span>
      </div>
    `;
  }
  
  if (settings.shippingEnabled) {
    html += `
      <div class="flex justify-between items-center bg-white rounded p-2">
        <span>Biaya Antar:</span>
        <span>Rp ${transport.toLocaleString()}</span>
      </div>
    `;
  }
  
  if (settings.discountEnabled && discountDetails.length > 0) {
    html += '<div class="pt-2 border-t">';
    discountDetails.forEach(d => {
      html += `
        <div class="flex justify-between items-center bg-white rounded p-2">
          <span class="text-green-600">Diskon ${d.code}:</span>
          <div class="flex items-center gap-2">
            <span class="text-green-600">- Rp ${d.amount.toLocaleString()}</span>
            <button onclick="removeDiscountCode('${d.code}')" class="text-red-500 hover:text-red-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    });
    html += '</div>';
  }
  
  if (settings.discountEnabled) {
    html += `
      <div class="pt-2 border-t">
        <label class="block text-sm font-medium mb-1">Tambah Kode Diskon:</label>
        <div class="flex gap-2">
          <input type="text" id="discountCodeInput" placeholder="Masukkan kode" 
                 class="flex-1 p-2 border rounded-lg bg-white text-sm" />
          <button type="button" onclick="addDiscountCode()" 
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold">
            Terapkan
          </button>
        </div>
      </div>
    `;
  }
  
  html += `
      <div class="border-t-2 border-yellow-600 pt-2 mt-2">
        <div class="flex justify-between items-center bg-white rounded p-2 text-lg font-bold">
          <span>Total Bayar:</span>
          <span class="text-yellow-600">Rp ${grandTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;

  checkoutSummary.innerHTML = html;
}

function closeCheckout() {
  if (checkoutContainer) {
    checkoutContainer.classList.add("hidden");
  }
  paymentProofReady = false;
  paymentProofDataCache = null;
  if (finalConfirmBtn) {
    finalConfirmBtn.disabled = true;
    finalConfirmBtn.classList.add("opacity-50", "cursor-not-allowed");
    finalConfirmBtn.classList.remove("hover:bg-yellow-700");
  }
}

if (checkoutForm) {
  checkoutForm.addEventListener("input", () => {
    updateConfirmButtonState();
  });
}

// ================ ORDER SUBMISSION ================
if (checkoutForm) {
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("custName").value;
    const phone = document.getElementById("custPhone").value;
    const email = document.getElementById("custEmail").value;
    const addressParts = {
      street: (document.getElementById("addrStreet").value || '').trim(),
      no: (document.getElementById("addrNo").value || '').trim(),
      rtrw: (document.getElementById("addrRTRW").value || '').trim(),
      kelurahan: (document.getElementById("addrKelurahan").value || '').trim(),
      kecamatan: (document.getElementById("addrKecamatan").value || '').trim(),
      kotaKab: (document.getElementById("addrKotaKab").value || '').trim(),
    };
    const address = formatAddress(addressParts);
    const deliveryInput = document.getElementById("deliveryTime").value;
    const delivery = new Date(deliveryInput);
  const now = new Date();
  
  if (delivery - now < 60 * 60 * 1000) {
    showNotification("Waktu pengiriman minimal 1 jam dari sekarang!", "error");
    return;
  }

    const paymentMethod = (checkoutForm.querySelector('input[name="paymentMethod"]:checked') || {}).value;
    if (!paymentMethod) {
      showNotification("Pilih metode pembayaran terlebih dahulu!", "error");
      return;
    }

    let paymentProofData = paymentProofDataCache;
    if (!paymentProofData) {
      const paymentProofFile = document.getElementById("paymentProof").files[0];
      if (paymentProofFile) {
        paymentProofData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(paymentProofFile);
        });
      }
    }
    if (!paymentProofData) {
      showNotification("Upload bukti pembayaran belum selesai!", "error");
      return;
    }

    // Validate stock & active status before proceeding
    const itemsArray = Object.values(cart);
    for (const ci of itemsArray) {
      // If item has been set inactive after added to cart, block
      const currentItem = [...menuPackages, ...aLaCarte].find(m => m.name === ci.name);
      if (currentItem && currentItem.active === false) {
        showNotification(`Item ${ci.name} saat ini tidak aktif`, "error");
        return;
      }
      if (typeof (currentItem?.stock) === 'number') {
        const stock = currentItem.stock;
        const totalDesired = itemsArray.filter(it => it.name === ci.name).reduce((n, it) => n + (it.qty || 0), 0);
        const remaining = stock - totalDesired;
        if (remaining < 0) {
          showNotification(`Hanya ${stock} ${ci.name} yang tersedia. Kurangi jumlah.`, "error");
          return;
        }
        if (stock <= 0) {
          showNotification(`${ci.name} sudah habis stok`, "error");
          return;
        }
      }
    }

    let subtotal = 0;
    itemsArray.forEach((item) => (subtotal += item.qty * getItemUnitPrice(item)));
    
    const tax = settings.taxEnabled ? subtotal * settings.taxRate : 0;
    const transport = settings.shippingEnabled ? settings.shippingCost : 0;
    const { totalDiscount } = calculateDiscounts(subtotal);
    const grandTotal = subtotal + tax + transport - totalDiscount;

    const trackCode = "KN" + Date.now().toString().slice(-8);

    const order = {
      trackCode,
      name,
      phone,
      email,
      address,
      addressParts,
      delivery: delivery.toISOString(),
      items: itemsArray,
      subtotal,
      tax,
      taxRate: settings.taxRate,
      transport,
      totalDiscount,
      appliedDiscounts: appliedDiscounts,
      total: grandTotal,
      paymentProof: paymentProofData,
      paymentMethod,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    const remoteOrders = await fetchKV("orders");
    const orders = Array.isArray(remoteOrders) ? remoteOrders : [];
    orders.push(order);
    await saveKV("orders", orders);
    await saveKV(`order_status:${trackCode}`, order.status);

    finalConfirmBtn.disabled = true;
    finalConfirmBtn.textContent = "Memproses...";

  try {
    await sendWhatsAppOrder(trackCode, name, phone, email, address, delivery, grandTotal);
    generatePDF(trackCode, name, phone, email, address, delivery, grandTotal, order);
    showSuccessModal(trackCode);
    
    // Decrement stock per ordered item
    Object.values(cart).forEach(ci => {
      const pkgIdx = menuPackages.findIndex(m => m.name === ci.name);
      if (pkgIdx >= 0 && typeof menuPackages[pkgIdx].stock === 'number') {
        menuPackages[pkgIdx].stock = Math.max(0, menuPackages[pkgIdx].stock - ci.qty);
      }
      const dishIdx = aLaCarte.findIndex(m => m.name === ci.name);
      if (dishIdx >= 0 && typeof aLaCarte[dishIdx].stock === 'number') {
        aLaCarte[dishIdx].stock = Math.max(0, aLaCarte[dishIdx].stock - ci.qty);
      }
    });
    await saveKV('packages', menuPackages);
    await saveKV('dishes', aLaCarte);

    checkoutContainer.classList.add("hidden");
    cart = {};
    appliedDiscounts = [];
    renderMenu();
    renderCart();
    checkoutForm.reset();
    paymentProofReady = false;
    paymentProofDataCache = null;
    if (finalConfirmBtn) {
      finalConfirmBtn.disabled = true;
      finalConfirmBtn.textContent = "Konfirmasi & Bayar";
      finalConfirmBtn.classList.add("opacity-50", "cursor-not-allowed");
      finalConfirmBtn.classList.remove("hover:bg-yellow-700");
    }
    await saveKV("cart", []);
    await saveKV("appliedDiscounts", []);
  } catch (error) {
    console.error("Error processing order:", error);
    showNotification("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.", "error");
    finalConfirmBtn.disabled = false;
    finalConfirmBtn.textContent = "Konfirmasi & Bayar";
  }
  });
}

// ================ WHATSAPP INTEGRATION ================
function sendWhatsAppOrder(trackCode, name, phone, email, address, delivery, total) {
  let message = `*PESANAN BARU KONOHA CATERING*\n\n`;
  message += `📋 *Kode Pesanan:* ${trackCode}\n\n`;
  message += `👤 *Data Pelanggan:*\n`;
  message += `Nama: ${name}\n`;
  message += `No. HP: ${phone}\n`;
  message += `Email: ${email}\n`;
  message += `Alamat: ${address}\n\n`;
  message += `📅 *Waktu Pengiriman:*\n${delivery.toLocaleString('id-ID')}\n\n`;
  message += `🍽️ *Detail Pesanan:*\n`;
  
  Object.values(cart).forEach((item) => {
    const unit = getItemUnitPrice(item);
    const pv = item.primaryVariant ? ` [${item.primaryVariant}]` : '';
    const addSel = item.additionalSelections && Object.keys(item.additionalSelections).length
      ? ` {${Object.entries(item.additionalSelections).map(([g, v]) => `${g}: ${v}`).join('; ')}}`
      : '';
    message += `• ${item.name}${pv}${addSel} x ${item.qty} = Rp ${(item.qty * unit).toLocaleString()}\n`;
  });
  
  message += `\n💰 *Total Pembayaran:* Rp ${total.toLocaleString()}\n\n`;
  message += `Mohon segera diproses. Terima kasih! 🙏`;

  const whatsappURL = `${WHATSAPP_API_URL}?phone=${ADMIN_WHATSAPP}&text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
  
  return Promise.resolve();
}

// ================ PDF GENERATION ================
function generatePDF(trackCode, name, phone, email, address, delivery, total, order) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFillColor(234, 179, 8);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("KONOHA Catering", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text("Invoice Pemesanan", 105, 30, { align: "center" });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  let y = 50;
  doc.text(`Kode Pesanan: ${trackCode}`, 20, y);
  doc.text(`Tanggal: ${new Date().toLocaleString('id-ID')}`, 20, y + 6);
  
  y += 20;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("Data Pelanggan:", 20, y);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  y += 8;
  doc.text(`Nama: ${name}`, 20, y);
  y += 6;
  doc.text(`Telepon: ${phone}`, 20, y);
  y += 6;
  doc.text(`Email: ${email}`, 20, y);
  y += 6;
  const addrLines = doc.splitTextToSize(`Alamat: ${address}`, 170);
  doc.text(addrLines, 20, y);
  y += (addrLines.length * 6);
  doc.text(`Waktu Pengiriman: ${delivery.toLocaleString('id-ID')}`, 20, y);
  
  y += 15;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("Detail Pesanan:", 20, y);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  y += 8;
  
  Object.values(cart).forEach((item) => {
    const itemTotal = item.qty * item.price;
    doc.text(`${item.name} x ${item.qty}`, 20, y);
    doc.text(`Rp ${itemTotal.toLocaleString()}`, 170, y, { align: "right" });
    y += 6;
  });
  
  y += 5;
  doc.line(20, y, 190, y);
  y += 8;
  
  doc.text("Subtotal:", 20, y);
  doc.text(`Rp ${order.subtotal.toLocaleString()}`, 170, y, { align: "right" });
  y += 6;
  
  if (order.tax > 0) {
    doc.text(`Pajak (${(order.taxRate * 100).toFixed(0)}%):`, 20, y);
    doc.text(`Rp ${order.tax.toLocaleString()}`, 170, y, { align: "right" });
    y += 6;
  }
  
  if (order.transport > 0) {
    doc.text("Biaya Antar:", 20, y);
    doc.text(`Rp ${order.transport.toLocaleString()}`, 170, y, { align: "right" });
    y += 6;
  }
  
  if (order.totalDiscount > 0) {
    doc.setTextColor(0, 150, 0);
    doc.text(`Diskon (${order.appliedDiscounts.join(', ')}):`, 20, y);
    doc.text(`- Rp ${order.totalDiscount.toLocaleString()}`, 170, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 6;
  }
  
  y += 2;
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 8;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("TOTAL PEMBAYARAN:", 20, y);
  doc.text(`Rp ${total.toLocaleString()}`, 170, y, { align: "right" });
  
  y += 20;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text("Terima kasih telah memesan di KONOHA Catering!", 105, y, { align: "center" });
  doc.text("WhatsApp: 081572455714 | Email: info@konohacatering.com", 105, y + 5, { align: "center" });
  
  doc.save(`KONOHA_Invoice_${trackCode}.pdf`);
}

// ================ SUCCESS MODAL ================
function showSuccessModal(trackCode) {
  const modal = document.getElementById("successModal");
  const trackingCodeEl = document.getElementById("trackingCode");
  
  if (modal && trackingCodeEl) {
    trackingCodeEl.textContent = trackCode;
    modal.classList.remove("hidden");
  }
}

function closeSuccessModal() {
  const modal = document.getElementById("successModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// ================ ORDER TRACKING ================
function openTrackingModal() {
  const modal = document.getElementById("trackingModal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeTrackingModal() {
  const modal = document.getElementById("trackingModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

async function trackOrder() {
  const trackCode = document.getElementById("trackingInput").value.trim();
  const resultDiv = document.getElementById("trackingResult");
  
  if (!trackCode) {
    showNotification("Masukkan kode pelacakan!", "error");
    return;
  }
  
  const remoteOrders = await fetchKV("orders");
  const orders = Array.isArray(remoteOrders) ? remoteOrders : [];
  let order = orders.find(o => o.trackCode === trackCode);
  const statusOverride = await fetchKV(`order_status:${trackCode}`);
  if (order && typeof statusOverride === 'string' && statusOverride) {
    order = { ...order, status: statusOverride };
  }
  
  if (!order) {
    resultDiv.innerHTML = '<div class="text-center text-red-600 py-4">❌ Pesanan tidak ditemukan</div>';
    return;
  }
  
  const statusText = {
    pending: "⏳ Menunggu Konfirmasi",
    confirmed: "✅ Dikonfirmasi",
    processing: "🍳 Sedang Diproses",
    delivering: "🚚 Dalam Pengiriman",
    completed: "✅ Selesai",
    cancelled: "❌ Dibatalkan"
  };
  
  resultDiv.innerHTML = `
    <div class="bg-green-50 p-4 rounded-lg">
      <h4 class="font-bold text-lg mb-3">Pesanan Ditemukan!</h4>
      <div class="space-y-2 text-sm">
        <p><strong>Kode:</strong> ${order.trackCode}</p>
        <p><strong>Nama:</strong> ${order.name}</p>
        <p><strong>Status:</strong> <span class="font-bold">${statusText[order.status] || order.status}</span></p>
        <p><strong>Total:</strong> Rp ${order.total.toLocaleString()}</p>
        <p><strong>Tanggal Order:</strong> ${new Date(order.createdAt).toLocaleString('id-ID')}</p>
        <p><strong>Waktu Kirim:</strong> ${new Date(order.delivery).toLocaleString('id-ID')}</p>
      </div>
    </div>
  `;
}

// ================ NOTIFICATION SYSTEM ================
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-[9999] transition transform animate-slideInRight ${
    type === "success" ? "bg-green-500" : "bg-red-500"
  }`;
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <span>${type === "success" ? "✅" : "❌"}</span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(400px)";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ================ INITIALIZE ================
document.addEventListener('DOMContentLoaded', () => {
  // Render immediately with local data for fast first paint
  loadMenuData();
  renderMenu();
  renderCart();
  renderCMSContent();
  bindInquiryForm();
  window.formatAddress = formatAddress;
  // Fetch remote in background, then refresh UI with latest
  loadRemoteData()
    .then(() => {
      loadMenuData();
      renderMenu();
      renderCMSContent();
      bindInquiryForm();
    })
    .catch(() => {});
});

// ================ CMS RENDERING ================
function renderCMSContent() {
  const heroImage = document.getElementById('heroImage');
  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const testimonialCarousel = document.getElementById('testimonialCarousel');
  const testiPrev = document.getElementById('testiPrev');
  const testiNext = document.getElementById('testiNext');
  const contactWa = document.getElementById('contactWa');
  const contactEmail = document.getElementById('contactEmail');
  const contactAddress = document.getElementById('contactAddress');
  const contactWaBtn = document.getElementById('contactWaBtn');
  const contactEmailBtn = document.getElementById('contactEmailBtn');
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const contactMap = document.getElementById('contactMap');
  if (heroImage) {
    const imgSrc = (cmsContent.hero && typeof cmsContent.hero.image === 'string' && cmsContent.hero.image.trim()) ? cmsContent.hero.image : 'assets/paket-ayam-bakar.jpg';
    heroImage.onerror = function(){ this.src = 'assets/paket-ayam-bakar.jpg'; };
    heroImage.src = imgSrc;
  }
  if (heroTitle && cmsContent.hero?.title) heroTitle.textContent = cmsContent.hero.title;
  if (heroSubtitle && cmsContent.hero?.subtitle) heroSubtitle.textContent = cmsContent.hero.subtitle;
  if (testimonialCarousel) {
    let page = 0;
    let perPage = window.innerWidth < 768 ? 2 : 3;
    function renderPage(){
      const items = (cmsContent.testimonials || []);
      const start = page * perPage;
      const slice = items.slice(start, start + perPage);
      testimonialCarousel.innerHTML = slice.map(t => `
        <div class="p-4 bg-white rounded-xl shadow">
          <div class="text-yellow-600 text-xl">“</div>
          <p class="text-sm">${t.text}</p>
          <p class="mt-2 text-xs text-gray-500">— ${t.name}</p>
        </div>
      `).join('');
    }
    function next(){
      const total = (cmsContent.testimonials || []).length;
      const maxPage = Math.max(0, Math.ceil(total / perPage) - 1);
      page = Math.min(maxPage, page + 1);
      renderPage();
    }
    function prev(){
      page = Math.max(0, page - 1);
      renderPage();
    }
    renderPage();
    if (testiPrev) testiPrev.onclick = prev;
    if (testiNext) testiNext.onclick = next;
    window.addEventListener('resize', () => { perPage = window.innerWidth < 768 ? 2 : 3; page = 0; renderPage(); });
  }
  if (contactWa) contactWa.textContent = cmsContent.contact?.whatsapp || '-';
  if (contactEmail) contactEmail.textContent = cmsContent.contact?.email || '-';
  if (contactAddress) contactAddress.textContent = cmsContent.contact?.address || '-';
  if (contactWaBtn && cmsContent.contact?.whatsapp) {
    const waLink = `${WHATSAPP_API_URL}?phone=${cmsContent.contact.whatsapp}&text=${encodeURIComponent('Halo KONOHA Catering!')}`;
    contactWaBtn.href = waLink;
  }
  if (contactEmailBtn && cmsContent.contact?.email) {
    contactEmailBtn.href = `mailto:${cmsContent.contact.email}`;
  }
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      const text = cmsContent.contact?.address || '';
      if (!text) return;
      navigator.clipboard && navigator.clipboard.writeText(text).then(() => {
        showNotification('Alamat disalin!', 'success');
      }).catch(() => {
        showNotification('Gagal menyalin alamat', 'error');
      });
    });
  }
  if (contactMap && cmsContent.contact?.address) {
    contactMap.src = `https://www.google.com/maps?q=${encodeURIComponent(cmsContent.contact.address)}&output=embed`;
  }
}

function bindInquiryForm(){
  const form = document.getElementById('inquiryForm');
  const status = document.getElementById('inquiryStatus');
  const waBtn = document.getElementById('contactWaBtn');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = document.getElementById('inqName').value.trim();
    const phone = document.getElementById('inqPhone').value.trim();
    const email = document.getElementById('inqEmail').value.trim();
    const message = document.getElementById('inqMessage').value.trim();
    if(!name || !phone || !message){ if(status){ status.textContent='Nama, WhatsApp, dan pesan wajib.'; } return; }
    let inquiries = await fetchKV('inquiries');
    if(!Array.isArray(inquiries)) inquiries = [];
    const q = { id: 'inq-'+Date.now(), name, phone, email, message, status:'new', createdAt: Date.now() };
    inquiries.push(q);
    await saveKV('inquiries', inquiries);
    if(status){ status.textContent = 'Inquiry terkirim. Kami akan menghubungi Anda.'; }
    form.reset();
  });
  if(waBtn){ waBtn.addEventListener('click', ()=>{
    const phone = document.getElementById('inqPhone')?.value.trim() || (cmsContent.contact?.whatsapp || '');
    const text = encodeURIComponent('Halo KONOHA Catering, saya ingin bertanya.');
    waBtn.href = `${WHATSAPP_API_URL}?phone=${encodeURIComponent(phone)}&text=${text}`;
  }); }
}

// ================ PAYMENT METHOD UI ================
function setupPaymentMethodUI() {
  const qrisRadio = checkoutForm.querySelector('input[name="paymentMethod"][value="qris"]');
  const bankRadio = checkoutForm.querySelector('input[name="paymentMethod"][value="bank"]');
  const qrisInfo = document.getElementById('qrisInfo');
  const bankInfo = document.getElementById('bankInfo');
  function updateInfo() {
    const val = (checkoutForm.querySelector('input[name="paymentMethod"]:checked') || {}).value;
    if (val === 'qris') {
      if (qrisInfo) qrisInfo.classList.remove('hidden');
      if (bankInfo) bankInfo.classList.add('hidden');
    } else if (val === 'bank') {
      if (bankInfo) bankInfo.classList.remove('hidden');
      if (qrisInfo) qrisInfo.classList.add('hidden');
    }
  }
  [qrisRadio, bankRadio].forEach(r => r && r.addEventListener('change', updateInfo));
  updateInfo();
}

// ================ ITEM EDIT MODAL ================
function openItemEdit(name) {
  const item = [...menuPackages, ...aLaCarte].find(m => m.name === name);
  if (!item) return;
  if (!cart[name]) {
    const defaultPv = (item.primaryVariants?.options?.find(o=>o.name==='normal')?.name) || '';
    cart[name] = { ...item, qty: 1, primaryVariant: defaultPv, additionalSelections: {} };
  }
  const current = cart[name];
  const pvOptions = item.primaryVariants?.options || [];
  const addGroups = item.additionalVariants || [];
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[9999] p-4';
  modal.innerHTML = `
    <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
      <div class="flex justify-between items-center mb-3">
        <h4 class="text-lg font-bold">Edit Item</h4>
        <button class="text-2xl" id="itemEditClose">×</button>
      </div>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between items-center">
          <span class="font-semibold">${item.name}</span>
          <div class="flex items-center gap-2">
            <button class="bg-gray-300 px-3 py-1 rounded" id="decQty">−</button>
            <span id="editQty" class="font-bold">${current.qty || 1}</span>
            <button class="bg-yellow-600 text-white px-3 py-1 rounded" id="incQty">+</button>
          </div>
        </div>
        ${(pvOptions.length || 0) > 1 ? `
        <div>
          <label class="block mb-1">Porsi</label>
          <select id="editPrimary" class="w-full border rounded px-2 py-2">
            ${pvOptions.map(o => `<option value="${o.name}">${o.name} — Rp ${o.price.toLocaleString()}</option>`).join('')}
          </select>
        </div>
        ` : ''}
        ${addGroups.map(g => `
        <div>
          <label class="block mb-1">${g.group}</label>
          <select data-group="${g.group}" class="editAdditional w-full border rounded px-2 py-2">
            ${g.options.map(o => `<option value="${o.name}">${o.name}${o.delta>0?` (+Rp ${o.delta.toLocaleString()})`:''}</option>`).join('')}
          </select>
        </div>
        `).join('')}
        <div>
          <label class="block mb-1">Catatan (opsional)</label>
          <textarea id="editNote" rows="2" class="w-full border rounded px-2 py-2" placeholder="Contoh: pedas, sambal terpisah">${current.note || ''}</textarea>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button id="itemEditSave" class="flex-1 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Simpan</button>
        <button id="itemEditCancel" class="flex-1 bg-gray-400 text-white px-4 py-2 rounded">Batal</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const qtyEl = modal.querySelector('#editQty');
  const pvSel = modal.querySelector('#editPrimary');
  if (pvSel && current.primaryVariant) {
    pvSel.value = current.primaryVariant;
  }
  modal.querySelectorAll('.editAdditional').forEach(sel => {
    const g = sel.getAttribute('data-group');
    const cur = (current.additionalSelections || {})[g];
    if (cur) sel.value = cur;
  });
  modal.querySelector('#decQty').addEventListener('click', () => {
    const newQty = Math.max(0, (parseInt(qtyEl.textContent) || 0) - 1);
    qtyEl.textContent = newQty;
  });
  modal.querySelector('#incQty').addEventListener('click', () => {
    const newQty = (parseInt(qtyEl.textContent) || 0) + 1;
    qtyEl.textContent = newQty;
  });
  function close() { modal.remove(); }
  modal.querySelector('#itemEditClose').addEventListener('click', close);
  modal.querySelector('#itemEditCancel').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.querySelector('#itemEditSave').addEventListener('click', () => {
    const newQty = parseInt(qtyEl.textContent) || 0;
    const primaryVariant = (modal.querySelector('#editPrimary') || {}).value || current.primaryVariant || '';
    const additionalSelections = {};
    modal.querySelectorAll('.editAdditional').forEach(sel => {
      const g = sel.getAttribute('data-group');
      additionalSelections[g] = sel.value;
    });
    const note = (modal.querySelector('#editNote') || {}).value || '';
    const stock = item.stock;
    if (typeof stock === 'number') {
      const totalOther = getTotalQtyInCart(name) - (current.qty || 0);
      const allowed = Math.max(0, stock - totalOther);
      if (newQty > allowed) {
        showNotification(`Maksimal bisa dipesan: ${allowed}`, 'error');
        // clamp to allowed
        if (allowed <= 0) {
          close();
          return;
        }
      }
    }
    if (newQty <= 0) {
      delete cart[name];
    } else {
      const finalQty = (() => {
        if (typeof stock === 'number') {
          const totalOther = getTotalQtyInCart(name) - (current.qty || 0);
          const allowed = Math.max(0, stock - totalOther);
          return Math.min(newQty, allowed);
        }
        return newQty;
      })();
      cart[name] = { ...item, qty: finalQty, primaryVariant, additionalSelections, note };
    }
    renderMenu();
    renderCart();
    close();
  });
}

function getItemUnitPrice(item) {
  let base = item.price || 0;
  const pvOpts = item.primaryVariants && item.primaryVariants.options ? item.primaryVariants.options : [];
  const pvName = item.primaryVariant || '';
  if (pvName) {
    const opt = pvOpts.find(o => o.name === pvName);
    if (opt) base = opt.price;
  } else if (pvOpts.length) {
    const n = pvOpts.find(o => o.name === 'normal');
    base = (n ? n.price : base);
  }
  const addGroups = item.additionalVariants || [];
  const selections = item.additionalSelections || {};
  addGroups.forEach(g => {
    const sel = selections[g.group];
    if (!sel) return;
    const opt = g.options.find(o => o.name === sel);
    if (opt && opt.delta) base += opt.delta;
  });
  return base;
}
function getTotalQtyInCart(name) {
  return Object.values(cart).filter(it => it.name === name).reduce((n, it) => n + (it.qty || 0), 0);
}
  // Address detail block
  y += 5;
  doc.setFont(undefined, 'bold');
  doc.text('Detail Alamat:', 20, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  const ap = order.addressParts || {};
  const kv = [
    ['Jalan', ap.street || '-'],
    ['No', ap.no || '-'],
    ['RT/RW', ap.rtrw || '-'],
    ['Kelurahan', ap.kelurahan || '-'],
    ['Kecamatan', ap.kecamatan || '-'],
    ['Kota/Kab', ap.kotaKab || '-'],
    ['Provinsi', ap.provinsi || '-'],
    ['Kode Pos', ap.kodePos || '-']
  ];
  kv.forEach(([k, v]) => {
    const splitV = doc.splitTextToSize(v, 110);
    doc.text(`${k}:`, 20, y);
    doc.text(splitV, 50, y);
    y += Math.max(6, splitV.length * 6);
  });
function formatAddress(parts) {
  const segments = [];
  const street = parts.street || '';
  const no = parts.no ? `No. ${parts.no}` : '';
  const streetLine = [street, no].filter(Boolean).join(' ');
  if (streetLine) segments.push(streetLine);
  if (parts.rtrw) segments.push(`RT/RW ${parts.rtrw}`);
  const adminLine = [
    parts.kelurahan ? `Kel. ${parts.kelurahan}` : '',
    parts.kecamatan ? `Kec. ${parts.kecamatan}` : ''
  ].filter(Boolean).join(', ');
  if (adminLine) segments.push(adminLine);
  const regionLine = [parts.kotaKab, parts.provinsi].filter(Boolean).join(', ');
  if (regionLine) segments.push(regionLine);
  if (parts.kodePos) segments.push(parts.kodePos);
  return segments.join(', ');
}
