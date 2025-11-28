// ================ AUTHENTICATION ================
if (localStorage.getItem("adminLoggedIn") !== "true") {
  window.location.href = "/gerbang-sundagakure";
}

const API_BASE = "/hostinger/api";
window.__DISABLE_SYNC = true;
async function fetchKV(key){
  try{
    const r = await fetch(`${API_BASE}/get.php?key=${encodeURIComponent(key)}&_=${Date.now()}`);
    const j = await r.json();
    if(j && j.ok && j.value){ return JSON.parse(j.value); }
    return null;
  }catch(e){ return null; }
}
async function saveKV(key, obj){
  try{
    await fetch(`${API_BASE}/save.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value: JSON.stringify(obj) }) });
  }catch(e){}
}

async function setAndSync(key, obj){
  localStorage.setItem(key, JSON.stringify(obj));
  await saveKV(key, obj);
}

// ================ DOM ELEMENTS ================
const packageTable = document.getElementById("packageTable");
const dishTable = document.getElementById("dishTable");
const packageForm = document.getElementById("packageForm");
const dishForm = document.getElementById("dishForm");
const ordersTable = document.getElementById("ordersTable");

// ================ DATA MANAGEMENT ================
let packages = JSON.parse(localStorage.getItem("packages")) || [];
let dishes = JSON.parse(localStorage.getItem("dishes")) || [];
let orders = [];
let discountCodes = JSON.parse(localStorage.getItem("discountCodes")) || [];
let settings = JSON.parse(localStorage.getItem("settings")) || {
  taxEnabled: true,
  taxRate: 0.1,
  shippingEnabled: true,
  shippingCost: 5000,
  discountEnabled: true,
  lowStockThreshold: 5
};
let cmsContent = JSON.parse(localStorage.getItem("cmsContent")) || {
  hero: { title: "Selamat datang di KONOHA Catering", subtitle: "Makan dulu biar tenang!", image: "assets/paket-ayam-bakar.jpg" },
  testimonials: [],
  contact: { whatsapp: "081572455714", email: "info@konohacatering.com", address: "Konoha Street No. 1" }
};
let articles = JSON.parse(localStorage.getItem("articles")) || [];
let pkgAdditionalState = [];
let dishAdditionalState = [];
let inquiries = JSON.parse(localStorage.getItem("inquiries")) || [];

// Global Variant Template System
let globalVariantTemplates = JSON.parse(localStorage.getItem("globalVariantTemplates")) || [];

// Initialize with default data if empty
if (packages.length === 0) {
  packages = [
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
  localStorage.setItem("packages", JSON.stringify(packages));
}

if (dishes.length === 0) {
  dishes = [
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
  localStorage.setItem("dishes", JSON.stringify(dishes));
}

// Initialize default discount codes - ADDED minQuantity
if (discountCodes.length === 0) {
  discountCodes = [
    { code: "KONOHA10", type: "percentage", value: 10, active: true, minPurchase: 0, minQuantity: 0, maxDiscount: 0 },
    { code: "WELCOME20", type: "percentage", value: 20, active: true, minPurchase: 50000, minQuantity: 0, maxDiscount: 20000 },
    { code: "FLAT5K", type: "fixed", value: 5000, active: true, minPurchase: 30000, minQuantity: 0, maxDiscount: 0 },
    { code: "QTY10", type: "fixed", value: 10000, active: true, minPurchase: 0, minQuantity: 10, maxDiscount: 0 } // EXAMPLE: Minimum 10 Qty, Flat Rp 10.000
  ];
  localStorage.setItem("discountCodes", JSON.stringify(discountCodes));
} else {
  // Ensure all existing discount codes have minQuantity property
  discountCodes = discountCodes.map(d => ({
    ...d,
    minQuantity: d.minQuantity || 0
  }));
  localStorage.setItem("discountCodes", JSON.stringify(discountCodes));
}

// Initialize default global variant templates
if (globalVariantTemplates.length === 0) {
  globalVariantTemplates = [
    {
      id: 'level-pedas',
      name: 'Level Pedas',
      group: 'Level Pedas',
      options: [
        { name: 'Tidak Pedas', delta: 0 },
        { name: 'Pedas Sedang', delta: 0 },
        { name: 'Pedas', delta: 1000 },
        { name: 'Extra Pedas', delta: 2000 }
      ]
    },
    {
      id: 'topping',
      name: 'Topping',
      group: 'Topping',
      options: [
        { name: 'Tidak Pakai', delta: 0 },
        { name: 'Keju', delta: 3000 },
        { name: 'Susu', delta: 2000 },
        { name: 'Coklat', delta: 2500 }
      ]
    },
    {
      id: 'level-gula',
      name: 'Level Gula',
      group: 'Level Gula',
      options: [
        { name: 'Tidak Pakai Gula', delta: 0 },
        { name: 'Gula Sedang', delta: 0 },
        { name: 'Manis', delta: 1000 }
      ]
    }
  ];
  localStorage.setItem("globalVariantTemplates", JSON.stringify(globalVariantTemplates));
}

// ================ RENDER FUNCTIONS ================
function renderTables() {
  try { renderPackageTable(); } catch (_) {}
  try { renderDishTable(); } catch (_) {}
  try { renderOrdersTable(); } catch (_) {}
  try { renderDiscountTable(); } catch (_) {}
  try { renderSettings(); } catch (_) {}
  try { renderCMSForm(); } catch (_) {}
  try { renderVariantTemplatesTable(); } catch (_) {}
  try { renderTemplateSelectors(); } catch (_) {}
  try { renderInquiriesTable(); } catch (_) {}
  try { updateStatistics(); } catch (_) {}
}

function renderVariantEditor(containerId, state, prefix) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = state.map((g, gi) => `
    <div class="p-3 bg-gray-100 dark:bg-black rounded border border-gray-600 hover:bg-gray-50 dark:hover:bg-orange-900 transition-colors">
      <div class="flex items-center gap-2 mb-2">
        <input type="text" value="${g.group || ''}" data-prefix="${prefix}" data-gi="${gi}" class="flex-1 border border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-black dark:text-gray-300 hover:bg-white dark:hover:bg-orange-900 hover:text-orange-600 dark:hover:text-orange-300 variant-group-name focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
        <button type="button" data-prefix="${prefix}" data-gi="${gi}" class="bg-red-600 text-white px-3 py-1 rounded remove-group">Hapus</button>
      </div>
      <div class="space-y-2">
        ${(g.options || []).map((o, oi) => `
          <div class="grid grid-cols-5 gap-2 items-center">
            <input type="text" value="${o.name || ''}" data-prefix="${prefix}" data-gi="${gi}" data-oi="${oi}" class="col-span-3 border border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-black dark:text-gray-300 hover:bg-white dark:hover:bg-orange-900 hover:text-orange-600 dark:hover:text-orange-300 variant-opt-name focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" placeholder="Opsi">
            <input type="number" value="${o.delta || 0}" data-prefix="${prefix}" data-gi="${gi}" data-oi="${oi}" class="col-span-1 border border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-black dark:text-gray-300 hover:bg-white dark:hover:bg-orange-900 hover:text-orange-600 dark:hover:text-orange-300 variant-opt-delta focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" placeholder="Delta Rp">
            <button type="button" data-prefix="${prefix}" data-gi="${gi}" data-oi="${oi}" class="bg-red-500 text-white px-2 py-1 rounded remove-option">✕</button>
          </div>
        `).join('')}
        <button type="button" data-prefix="${prefix}" data-gi="${gi}" class="mt-1 bg-blue-500 text-white px-3 py-1 rounded add-option">+ Tambah Opsi</button>
      </div>
    </div>
  `).join('');
}

function bindVariantEditorControls(prefix) {
  const state = prefix === 'pkg' ? pkgAdditionalState : dishAdditionalState;
  const container = document.getElementById(prefix === 'pkg' ? 'pkgVarEditor' : 'dishVarEditor');
  const addGroupBtn = document.getElementById(prefix === 'pkg' ? 'pkgAddGroupBtn' : 'dishAddGroupBtn');
  if (addGroupBtn) {
    addGroupBtn.onclick = () => {
      state.push({ group: '', options: [{ name: '', delta: 0 }] });
      renderVariantEditor(container.id, state, prefix);
      bindVariantEditorControls(prefix);
    };
  }
  if (!container) return;
  if (!container.__bound) {
    container.addEventListener('input', (e) => {
      const t = e.target;
      if (t.classList.contains('variant-group-name')) {
        const gi = parseInt(t.getAttribute('data-gi'));
        state[gi].group = t.value.trim();
      } else if (t.classList.contains('variant-opt-name')) {
        const gi = parseInt(t.getAttribute('data-gi'));
        const oi = parseInt(t.getAttribute('data-oi'));
        state[gi].options[oi].name = t.value.trim();
      } else if (t.classList.contains('variant-opt-delta')) {
        const gi = parseInt(t.getAttribute('data-gi'));
        const oi = parseInt(t.getAttribute('data-oi'));
        state[gi].options[oi].delta = parseInt(t.value) || 0;
      }
    });
    container.addEventListener('click', (e) => {
      const t = e.target;
      if (t.classList.contains('add-option')) {
        const gi = parseInt(t.getAttribute('data-gi'));
        state[gi].options.push({ name: '', delta: 0 });
        renderVariantEditor(container.id, state, prefix);
        // rebind is not necessary due to delegation
      } else if (t.classList.contains('remove-option')) {
        const gi = parseInt(t.getAttribute('data-gi'));
        const oi = parseInt(t.getAttribute('data-oi'));
        state[gi].options.splice(oi, 1);
        renderVariantEditor(container.id, state, prefix);
      } else if (t.classList.contains('remove-group')) {
        const gi = parseInt(t.getAttribute('data-gi'));
        state.splice(gi, 1);
        renderVariantEditor(container.id, state, prefix);
      }
    });
    container.__bound = true;
  }
}

function formatAdditionalVariantsText(groups) {
  if (!Array.isArray(groups) || groups.length === 0) return '';
  return groups.map(g => `${g.group}: ${g.options.map(o => `${o.name}=${o.delta || 0}`).join(', ')}`).join('\n');
}

function parseAdditionalVariants(text) {
  if (!text) return [];
  const groups = [];
  text.split(/\n|;/).forEach((line) => {
    const parts = line.split(":");
    if (parts.length < 2) return;
    const groupName = parts[0].trim();
    const optionsPart = parts.slice(1).join(":");
    const options = [];
    optionsPart.split(",").forEach((seg) => {
      const [optName, deltaStr] = seg.split("=");
      const name = (optName || "").trim();
      const delta = parseInt((deltaStr || "0").trim(), 10) || 0;
      if (name) options.push({ name, delta });
    });
    if (groupName && options.length) groups.push({ group: groupName, options });
  });
  return groups;
}

function renderPackageTable() {
  if (!packageTable) return;
  
  packageTable.innerHTML = packages.map((p, i) => `
    <tr class="hover:bg-gray-50 transition">
      <td class="border border-gray-200 p-2">
        <img src="${p.image}" alt="${p.name}" 
             class="w-20 h-20 object-cover rounded-lg shadow-sm"
             onerror="this.src='assets/placeholder.jpg'">
      </td>
      <td class="border border-gray-200 p-3">
        <div class="font-semibold text-gray-800">${p.name}</div>
      </td>
      <td class="border border-gray-200 p-3">
        <div class="font-bold text-yellow-600">Rp${(() => { const pv = p.primaryVariants?.options?.find(o=>o.name==='normal')?.price; const base = typeof pv === 'number' ? pv : (typeof p.price === 'number' ? p.price : 0); return base.toLocaleString(); })()}</div>
      </td>
      <td class="border border-gray-200 p-3">
        <div class="text-sm text-gray-600">
          ${Array.isArray(p.dishes) ? p.dishes.join(", ") : p.dishes || '-'}
        </div>
      </td>
      <td class="border border-gray-200 p-3">
        <div class="flex gap-2">
          <button onclick="editPackage(${i})" 
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm">✏️ Edit</button>
          <button onclick="deletePackage(${i})" 
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm">🗑️ Hapus</button>
        </div>
      </td>
      <td class="border border-gray-200 p-3">
        <div class="flex items-center gap-2">
          ${(() => { const st = (typeof p.stock === 'number') ? p.stock : null; const low = (st !== null) && (st <= (settings.lowStockThreshold || 5)); return `<span class=\"text-sm ${low ? 'text-red-600 font-semibold' : ''}\">${st !== null ? st : '-'}</span>`; })()}
          <button onclick="editPackageStock(${i})" class="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 text-xs">Ubah</button>
        </div>
      </td>
      <td class="border border-gray-200 p-3 text-center">
        <button onclick="togglePackageStatus(${i})" 
                class="${p.active === false ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white px-3 py-1 rounded transition text-sm">
          ${p.active === false ? '✅ Aktifkan' : '⏸️ Nonaktifkan'}
        </button>
      </td>
    </tr>
  `).join("");
}

function renderDishTable() {
  if (!dishTable) return;
  
  dishTable.innerHTML = dishes.map((d, i) => `
    <tr class="hover:bg-gray-50 transition">
      <td class="border border-gray-200 p-2">
        <img src="${d.image}" alt="${d.name}" 
             class="w-16 h-16 object-cover rounded-lg shadow-sm"
             onerror="this.src='assets/placeholder.jpg'">
      </td>
      <td class="border border-gray-200 p-3">
        <div class="font-semibold text-gray-800">${d.name}</div>
      </td>
      <td class="border border-gray-200 p-3">
        ${d.category ? `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">${d.category}</span>` : '-'}
      </td>
      <td class="border border-gray-200 p-3">
        <div class="font-bold text-yellow-600">Rp${(() => { const pv = d.primaryVariants?.options?.find(o=>o.name==='normal')?.price; const base = typeof pv === 'number' ? pv : (typeof d.price === 'number' ? d.price : 0); return base.toLocaleString(); })()}</div>
      </td>
      <td class="border border-gray-200 p-3">
        <div class="flex gap-2">
          <button onclick="editDish(${i})" 
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm">✏️ Edit</button>
          <button onclick="deleteDish(${i})" 
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm">🗑️ Hapus</button>
        </div>
      </td>
      <td class="border border-gray-200 p-3">
        <div class="flex items-center gap-2">
          ${(() => { const st = (typeof d.stock === 'number') ? d.stock : null; const low = (st !== null) && (st <= (settings.lowStockThreshold || 5)); return `<span class=\"text-sm ${low ? 'text-red-600 font-semibold' : ''}\">${st !== null ? st : '-'}</span>`; })()}
          <button onclick="editDishStock(${i})" class="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 text-xs">Ubah</button>
        </div>
      </td>
      <td class="border border-gray-200 p-3 text-center">
        <button onclick="toggleDishStatus(${i})" 
                class="${d.active === false ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white px-3 py-1 rounded transition text-sm">
          ${d.active === false ? '✅ Aktifkan' : '⏸️ Nonaktifkan'}
        </button>
      </td>
    </tr>
  `).join("");
}

function renderOrdersTable() {
  if (!ordersTable) return;
  
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const statusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      delivering: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };
  
  const statusText = {
    pending: '⏳ Pending',
    confirmed: '✅ Confirmed',
    processing: '🍳 Processing',
    delivering: '🚚 Delivering',
    completed: '✅ Completed',
    cancelled: '❌ Cancelled'
  };
  
  if (orders.length === 0) {
    ordersTable.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">Belum ada pesanan masuk</td></tr>';
    return;
  }
  
  ordersTable.innerHTML = orders.map((order, i) => `
    <tr class="hover:bg-gray-50 transition">
      <td class="border border-gray-200 p-3">
        <div class="font-mono text-sm font-bold">${order.trackCode}</div>
        <div class="text-xs text-gray-500">${new Date(order.createdAt).toLocaleString('id-ID')}</div>
      </td>
      <td class="border border-gray-200 p-3">
        <div class="font-semibold">${order.name}</div>
        <div class="text-sm text-gray-600">${order.phone}</div>
        <div class="text-xs text-gray-500">${order.email}</div>
      </td>
      <td class="border border-gray-200 p-3">
        <div class="text-sm max-w-xs">
          ${order.items.map(item => `${item.name} x${item.qty}`).join(', ')}
        </div>
      </td>
      <td class="border border-gray-200 p-3">
        <div class="font-bold text-yellow-600">Rp${order.total.toLocaleString()}</div>
      </td>
      <td class="border border-gray-200 p-3">
        <div class="text-sm">${new Date(order.delivery).toLocaleString('id-ID')}</div>
      </td>
      <td class="border border-gray-200 p-3 text-center">
        <span class="px-2 py-1 rounded text-xs font-medium ${statusBadge(order.status)}">
          ${statusText[order.status] || order.status}
        </span>
      </td>
      <td class="border border-gray-200 p-3 text-center">
        <div class="flex flex-col gap-1">
          <button onclick="viewOrderDetail(${i})" 
                  class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition text-xs">
            👁️ Detail
          </button>
          <button onclick="updateOrderStatus(${i})" 
                  class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition text-xs">
            🔄 Update
          </button>
          <button onclick="requestDeleteOrder(${i})" 
                  class="${['completed','cancelled'].includes(order.status) ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'} text-white px-2 py-1 rounded transition text-xs"
                  ${['completed','cancelled'].includes(order.status) ? '' : 'title="Hanya bisa hapus jika status Selesai/ Ditolak" disabled'}>
            🗑️ Hapus
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderDiscountTable() {
  const discountTable = document.getElementById("discountTable");
  if (!discountTable) return;
  
  discountTable.innerHTML = discountCodes.map((d, i) => `
    <tr class="hover:bg-gray-50 transition">
      <td class="border border-gray-200 p-3">
        <div class="font-mono font-bold text-yellow-600">${d.code}</div>
      </td>
      <td class="border border-gray-200 p-3">
        ${d.type === 'percentage' ? `${(typeof d.value === 'number' ? d.value : parseFloat(d.value) || 0)}%` : `Rp ${(typeof d.value === 'number' ? d.value : parseFloat(d.value) || 0).toLocaleString()}`}
      </td>
      <td class="border border-gray-200 p-3">
        <div class="text-sm text-gray-700">
          ${(typeof d.minPurchase === 'number' ? d.minPurchase : parseInt(d.minPurchase) || 0) > 0 ? `Rp ${(typeof d.minPurchase === 'number' ? d.minPurchase : parseInt(d.minPurchase) || 0).toLocaleString()}` : ''}
          ${(d.minPurchase > 0 && d.minQuantity > 0) ? ' & ' : ''}
          ${(typeof d.minQuantity === 'number' ? d.minQuantity : parseInt(d.minQuantity) || 0) > 0 ? `${(typeof d.minQuantity === 'number' ? d.minQuantity : parseInt(d.minQuantity) || 0)} Qty` : ''}
          ${d.minPurchase === 0 && d.minQuantity === 0 ? 'Tidak ada batas' : ''}
        </div>
      </td>
      <td class="border border-gray-200 p-3">
        ${(typeof d.maxDiscount === 'number' ? d.maxDiscount : parseInt(d.maxDiscount) || 0) > 0 ? `Rp ${(typeof d.maxDiscount === 'number' ? d.maxDiscount : parseInt(d.maxDiscount) || 0).toLocaleString()}` : 'Tidak ada batas'}
      </td>
      <td class="border border-gray-200 p-3 text-center">
        <button onclick="toggleDiscountStatus(${i})" 
                class="px-3 py-1 rounded text-xs font-medium ${d.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          ${d.active ? '✅ Aktif' : '❌ Nonaktif'}
        </button>
      </td>
      <td class="border border-gray-200 p-3 text-center">
        <div class="flex justify-center gap-2">
          <button onclick="editDiscount(${i})" 
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm">
            ✏️ Edit
          </button>
          <button onclick="deleteDiscount(${i})" 
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm">
            🗑️ Hapus
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderSettings() {
  const taxToggle = document.getElementById("taxToggle");
  const shippingToggle = document.getElementById("shippingToggle");
  const discountToggle = document.getElementById("discountToggle");
  const taxRate = document.getElementById("taxRate");
  const shippingCost = document.getElementById("shippingCost");
  const lowStockThreshold = document.getElementById("lowStockThreshold");
  
  if (taxToggle) taxToggle.checked = settings.taxEnabled;
  if (shippingToggle) shippingToggle.checked = settings.shippingEnabled;
  if (discountToggle) discountToggle.checked = settings.discountEnabled;
  if (taxRate) taxRate.value = (settings.taxRate * 100);
  if (shippingCost) shippingCost.value = settings.shippingCost;
  if (lowStockThreshold) lowStockThreshold.value = settings.lowStockThreshold || 5;
}

// ================ CMS MANAGEMENT ================
function renderCMSForm() {
  const heroTitleInput = document.getElementById('heroTitleInput');
  const heroSubtitleInput = document.getElementById('heroSubtitleInput');
  const heroImageInput = document.getElementById('heroImageInput');
  const contactWaInput = document.getElementById('contactWaInput');
  const contactEmailInput = document.getElementById('contactEmailInput');
  const contactAddressInput = document.getElementById('contactAddressInput');
  const testiList = document.getElementById('testimonialAdminList');
  if (heroTitleInput) heroTitleInput.value = cmsContent.hero?.title || '';
  if (heroSubtitleInput) heroSubtitleInput.value = cmsContent.hero?.subtitle || '';
  if (heroImageInput) heroImageInput.value = cmsContent.hero?.image || '';
  if (contactWaInput) contactWaInput.value = cmsContent.contact?.whatsapp || '';
  if (contactEmailInput) contactEmailInput.value = cmsContent.contact?.email || '';
  if (contactAddressInput) contactAddressInput.value = cmsContent.contact?.address || '';
  if (testiList) {
    testiList.innerHTML = (cmsContent.testimonials || []).map((t, i) => `
      <div class="flex items-center justify-between p-2 bg-white rounded border">
        <div class="text-sm"><strong>${t.name}:</strong> ${t.text}</div>
        <button onclick="deleteTestimonial(${i})" class="text-red-600 hover:text-red-800">Hapus</button>
      </div>
    `).join('');
  }
  try { setupImageUploaders(); } catch (_) {}
}

const cmsForm = document.getElementById('cmsForm');
if (cmsForm) {
  cmsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    cmsContent.hero = {
      title: document.getElementById('heroTitleInput').value.trim(),
      subtitle: document.getElementById('heroSubtitleInput').value.trim(),
      image: document.getElementById('heroImageInput').value.trim()
    };
    cmsContent.contact = {
      whatsapp: document.getElementById('contactWaInput').value.trim(),
      email: document.getElementById('contactEmailInput').value.trim(),
      address: document.getElementById('contactAddressInput').value.trim()
    };
    await setAndSync('cmsContent', cmsContent);
    showNotification('Konten halaman utama disimpan!', 'success');
  });
}

const addTestimonialBtn = document.getElementById('addTestimonialBtn');
if (addTestimonialBtn) {
  addTestimonialBtn.addEventListener('click', async () => {
    const name = document.getElementById('testiName').value.trim();
    const text = document.getElementById('testiText').value.trim();
    if (!name || !text) return showNotification('Nama dan komentar wajib diisi!', 'error');
  cmsContent.testimonials = cmsContent.testimonials || [];
  cmsContent.testimonials.push({ name, text });
  await setAndSync('cmsContent', cmsContent);
  document.getElementById('testiName').value = '';
  document.getElementById('testiText').value = '';
  renderCMSForm();
  showNotification('Testimoni ditambahkan!', 'success');
  });
}

async function deleteTestimonial(i) {
  cmsContent.testimonials.splice(i, 1);
  await setAndSync('cmsContent', cmsContent);
  renderCMSForm();
}

// ================ ARTICLE MANAGEMENT ================
let editingArticleIndex = -1;
function toggleArticleForm() {
  const container = document.getElementById('articleFormContainer');
  if (container) {
    container.classList.toggle('hidden');
    if (!container.classList.contains('hidden')) {
      document.getElementById('articleForm').reset();
      editingArticleIndex = -1;
      try { setupImageUploaders(); } catch (_) {}
    }
  }
}

// ================ INQUIRY MANAGEMENT ================
function renderInquiriesTable(){
  const t = document.getElementById('inquiriesTable');
  if(!t) return;
  if(!Array.isArray(inquiries) || inquiries.length===0){
    t.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">Belum ada inquiry masuk</td></tr>';
    return;
  }
  const rows = inquiries.map((q,i)=>`
    <tr class="hover:bg-gray-50 transition">
      <td class="border border-gray-200 p-3">
        <div class="font-semibold text-gray-800">${q.name || '-'}</div>
      </td>
      <td class="border border-gray-200 p-3 text-sm">
        <div>📞 ${q.phone || '-'}</div>
        <div>✉️ ${q.email || '-'}</div>
      </td>
      <td class="border border-gray-200 p-3 text-sm">${q.message || '-'}</td>
      <td class="border border-gray-200 p-3 text-sm">${q.createdAt ? new Date(q.createdAt).toLocaleString('id-ID') : '-'}</td>
      <td class="border border-gray-200 p-3 text-center">
        <span class="px-2 py-1 rounded text-xs font-medium ${q.status==='processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
          ${q.status==='processed' ? 'Selesai' : 'Baru'}
        </span>
      </td>
      <td class="border border-gray-200 p-3 text-center">
        <div class="flex justify-center gap-2">
          <button onclick="markInquiryProcessed(${i})" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm">Tandai Selesai</button>
          <button onclick="deleteInquiry(${i})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');
  t.innerHTML = rows;
}

async function markInquiryProcessed(i){
  if(!inquiries[i]) return;
  inquiries[i].status = 'processed';
  await setAndSync('inquiries', inquiries);
  renderInquiriesTable();
  showNotification('Inquiry ditandai selesai', 'success');
}

async function deleteInquiry(i){
  showConfirmDialog(
    `Hapus inquiry dari "${inquiries[i]?.name || 'Pelanggan'}"?`,
    async ()=>{
      inquiries.splice(i,1);
      await setAndSync('inquiries', inquiries);
      renderInquiriesTable();
      showNotification('Inquiry dihapus', 'success');
    }
  );
}

const articleForm = document.getElementById('articleForm');
if (articleForm) {
  articleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      title: document.getElementById('articleTitle').value.trim(),
      date: document.getElementById('articleDate').value,
      image: document.getElementById('articleImage').value.trim(),
      content: document.getElementById('articleContent').value.trim()
    };
    if (editingArticleIndex >= 0) {
      articles[editingArticleIndex] = data;
      editingArticleIndex = -1;
    } else {
      articles.push(data);
    }
    await setAndSync('articles', articles);
    renderArticlesTable();
    toggleArticleForm();
    showNotification('Artikel disimpan!', 'success');
  });
}

function renderArticlesTable() {
  const table = document.getElementById('articlesTable');
  if (!table) return;
  if (articles.length === 0) {
    table.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-gray-500">Belum ada artikel</td></tr>';
    return;
  }
  table.innerHTML = articles.map((a, i) => `
    <tr class="hover:bg-gray-50 transition">
      <td class="border border-blue-700 p-3">${a.title}</td>
      <td class="border border-blue-700 p-3">${a.date || '-'}</td>
      <td class="border border-blue-700 p-3">${a.image ? `<img src="${a.image}" class="w-16 h-16 object-cover rounded">` : '-'}</td>
      <td class="border border-blue-700 p-3 text-center">
        <div class="flex justify-center gap-2">
          <button onclick="editArticle(${i})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm">✏️ Edit</button>
          <button onclick="deleteArticle(${i})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm">🗑️ Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editArticle(i) {
  const a = articles[i];
  document.getElementById('articleTitle').value = a.title;
  document.getElementById('articleDate').value = a.date || '';
  document.getElementById('articleImage').value = a.image || '';
  document.getElementById('articleContent').value = a.content || '';
  editingArticleIndex = i;
  document.getElementById('articleFormContainer').classList.remove('hidden');
}

async function deleteArticle(i) {
  showConfirmDialog(`Hapus artikel "${articles[i].title}"?`, async () => {
    articles.splice(i, 1);
    await setAndSync('articles', articles);
    renderArticlesTable();
    showNotification('Artikel dihapus!', 'success');
  });
}

// ================ GLOBAL VARIANT TEMPLATE MANAGEMENT ================
let editingVariantTemplateIndex = -1;
let templateVariantState = [];

function toggleVariantTemplateForm() {
  const container = document.getElementById("variantTemplateFormContainer");
  if (container) {
    container.classList.toggle("hidden");
    if (!container.classList.contains("hidden")) {
      document.getElementById("variantTemplateForm").reset();
      editingVariantTemplateIndex = -1;
      templateVariantState = [];
      renderTemplateVariantEditor();
      initVariantTemplateBindings();
    }
  }
}

function renderTemplateVariantEditor() {
  const container = document.getElementById("templateVarEditor");
  if (!container) return;
  
  container.innerHTML = templateVariantState.map((option, index) => `
    <div class="flex gap-2 items-center">
      <input type="text" placeholder="Nama opsi" value="${option.name}" 
             onchange="updateTemplateOption(${index}, 'name', this.value)"
             class="flex-1 border border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-black dark:text-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-orange-900 hover:text-orange-600 dark:hover:text-orange-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
      <input type="number" placeholder="Delta harga" value="${option.delta}" 
             onchange="updateTemplateOption(${index}, 'delta', parseInt(this.value) || 0)"
             class="w-24 border border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-black dark:text-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-orange-900 hover:text-orange-600 dark:hover:text-orange-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
      <button type="button" onclick="removeTemplateOption(${index})" 
              class="bg-red-500 text-white px-2 py-1 rounded text-sm">✕</button>
    </div>
  `).join('');
}

function updateTemplateOption(index, field, value) {
  if (templateVariantState[index]) {
    templateVariantState[index][field] = value;
  }
}

function removeTemplateOption(index) {
  templateVariantState.splice(index, 1);
  renderTemplateVariantEditor();
}

function addTemplateOption() {
  templateVariantState.push({ name: '', delta: 0 });
  renderTemplateVariantEditor();
}

function renderVariantTemplatesTable() {
  const table = document.getElementById("variantTemplatesTable");
  if (!table) return;
  
  if (globalVariantTemplates.length === 0) {
    table.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-gray-500">Belum ada template varian</td></tr>';
    return;
  }
  
  table.innerHTML = globalVariantTemplates.map((template, i) => `
    <tr class="hover:bg-gray-50 transition">
      <td class="border border-indigo-700 p-3">
        <div class="font-semibold text-gray-800">${template.name}</div>
      </td>
      <td class="border border-indigo-700 p-3">
        <div class="font-medium">${template.group}</div>
      </td>
      <td class="border border-indigo-700 p-3">
        <div class="text-sm text-gray-600">
          ${template.options.map(opt => `${opt.name} ${opt.delta > 0 ? `(+Rp ${opt.delta.toLocaleString()})` : ''}`).join(', ')}
        </div>
      </td>
      <td class="border border-indigo-700 p-3 text-center">
        <div class="flex justify-center gap-2">
          <button onclick="editVariantTemplate(${i})" 
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm">
            ✏️ Edit
          </button>
          <button onclick="deleteVariantTemplate(${i})" 
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm">
            🗑️ Hapus
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderTemplateSelectors() {
  // Render template selectors for package form
  const pkgTemplateContainer = document.getElementById('pkgTemplateVariants');
  if (pkgTemplateContainer) {
    if (globalVariantTemplates.length === 0) {
      pkgTemplateContainer.innerHTML = '<span class="text-xs text-gray-500">Belum ada template tersedia</span>';
    } else {
      pkgTemplateContainer.innerHTML = globalVariantTemplates.map((template, i) => `
        <button type="button" onclick="applyTemplateToPackage(${i})" 
                class="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition">
          + ${template.name}
        </button>
      `).join('');
    }
  }
  
  // Render template selectors for dish form
  const dishTemplateContainer = document.getElementById('dishTemplateVariants');
  if (dishTemplateContainer) {
    if (globalVariantTemplates.length === 0) {
      dishTemplateContainer.innerHTML = '<span class="text-xs text-gray-500">Belum ada template tersedia</span>';
    } else {
      dishTemplateContainer.innerHTML = globalVariantTemplates.map((template, i) => `
        <button type="button" onclick="applyTemplateToDish(${i})" 
                class="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition">
          + ${template.name}
        </button>
      `).join('');
    }
  }
}

function applyTemplateToPackage(templateIndex) {
  const template = globalVariantTemplates[templateIndex];
  if (!template) return;
  
  // Add template variants to pkgAdditionalState
  const existingGroupIndex = pkgAdditionalState.findIndex(g => g.group === template.group);
  if (existingGroupIndex >= 0) {
    // Replace existing group
    pkgAdditionalState[existingGroupIndex] = {
      group: template.group,
      options: JSON.parse(JSON.stringify(template.options))
    };
  } else {
    // Add new group
    pkgAdditionalState.push({
      group: template.group,
      options: JSON.parse(JSON.stringify(template.options))
    });
  }
  
  renderVariantEditor('pkgVarEditor', pkgAdditionalState, 'pkg');
  bindVariantEditorControls('pkg');
  showNotification(`Template "${template.name}" berhasil diterapkan!`, 'success');
}

function applyTemplateToDish(templateIndex) {
  const template = globalVariantTemplates[templateIndex];
  if (!template) return;
  
  // Add template variants to dishAdditionalState
  const existingGroupIndex = dishAdditionalState.findIndex(g => g.group === template.group);
  if (existingGroupIndex >= 0) {
    // Replace existing group
    dishAdditionalState[existingGroupIndex] = {
      group: template.group,
      options: JSON.parse(JSON.stringify(template.options))
    };
  } else {
    // Add new group
    dishAdditionalState.push({
      group: template.group,
      options: JSON.parse(JSON.stringify(template.options))
    });
  }
  
  renderVariantEditor('dishVarEditor', dishAdditionalState, 'dish');
  bindVariantEditorControls('dish');
  showNotification(`Template "${template.name}" berhasil diterapkan!`, 'success');
}

function editVariantTemplate(index) {
  const template = globalVariantTemplates[index];
  document.getElementById("templateName").value = template.name;
  document.getElementById("templateGroup").value = template.group;
  templateVariantState = JSON.parse(JSON.stringify(template.options));
  editingVariantTemplateIndex = index;
  renderTemplateVariantEditor();
  document.getElementById("variantTemplateFormContainer").classList.remove("hidden");
}

function deleteVariantTemplate(index) {
  showConfirmDialog(
    `Apakah Anda yakin ingin menghapus template "${globalVariantTemplates[index].name}"?`,
    () => {
      globalVariantTemplates.splice(index, 1);
      setAndSync("globalVariantTemplates", globalVariantTemplates);
      renderVariantTemplatesTable();
      showNotification("Template varian berhasil dihapus!", "success");
    }
  );
}

function updateStatistics() {
  const totalPackagesEl = document.getElementById("totalPackages");
  const totalDishesEl = document.getElementById("totalDishes");
  const totalItemsEl = document.getElementById("totalItems");
  const totalOrdersEl = document.getElementById("totalOrders");
  
  if (totalPackagesEl) totalPackagesEl.textContent = packages.length;
  if (totalDishesEl) totalDishesEl.textContent = dishes.length;
  if (totalItemsEl) totalItemsEl.textContent = packages.length + dishes.length;
  if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
}

// ================ PACKAGE MANAGEMENT ================
let editingPackageIndex = -1;

function togglePackageForm() {
  const container = document.getElementById("packageFormContainer");
  if (container) {
    container.classList.toggle("hidden");
    if (!container.classList.contains("hidden")) {
      packageForm.reset();
      editingPackageIndex = -1;
      pkgAdditionalState = [];
      renderVariantEditor('pkgVarEditor', pkgAdditionalState, 'pkg');
      bindVariantEditorControls('pkg');
      try { setupImageUploaders(); } catch (_) {}
    }
  }
}

if (packageForm) {
  packageForm.addEventListener("submit", async e => {
    e.preventDefault();
    
    const basePrice = parseInt(document.getElementById("pkgPrice").value) || 0;
    document.getElementById("pkgPriceNormal").value = basePrice;
    const smallStr = (document.getElementById("pkgPriceSmall").value || '').trim();
    const jumboStr = (document.getElementById("pkgPriceJumbo").value || '').trim();
    const pSmall = smallStr === '' ? undefined : (parseInt(smallStr) || 0);
    const pNormal = basePrice;
    const pJumbo = jumboStr === '' ? undefined : (parseInt(jumboStr) || 0);
    
    const primaryOptions = [];
    if (typeof pSmall === 'number') primaryOptions.push({ name: "kecil", price: pSmall });
    if (typeof pJumbo === 'number') primaryOptions.push({ name: "jumbo", price: pJumbo });
    if (primaryOptions.length > 0) primaryOptions.splice(1, 0); // no-op to keep order
    if (primaryOptions.length > 0) primaryOptions.unshift({ name: "normal", price: pNormal });
    const pkgData = {
      name: document.getElementById("pkgName").value.trim(),
      price: basePrice,
      dishes: document.getElementById("pkgDishes").value.split(",").map(d => d.trim()).filter(d => d),
      image: document.getElementById("pkgImage").value.trim(),
      stock: (document.getElementById("pkgStock").value || '').trim() === '' ? undefined : (parseInt(document.getElementById("pkgStock").value) || 0),
      active: document.getElementById("pkgActive").checked,
      
      primaryVariants: (primaryOptions.length > 1) ? { group: "Porsi", options: primaryOptions } : undefined,
      additionalVariants: pkgAdditionalState
    };
    
    // Only validate if provided
    if (typeof pSmall === 'number' && pSmall >= basePrice) {
      return showNotification("Harga porsi kecil harus di bawah harga menu!", "error");
    }
    if (typeof pJumbo === 'number' && pJumbo <= basePrice) {
      return showNotification("Harga porsi jumbo harus di atas harga menu!", "error");
    }
    
    if (editingPackageIndex >= 0) {
      packages[editingPackageIndex] = pkgData;
      editingPackageIndex = -1;
    } else {
      packages.push(pkgData);
    }
    
    await setAndSync("packages", packages);
    renderTables();
    togglePackageForm();
    showNotification("Paket menu berhasil disimpan!", "success");
  });
}

function editPackage(i) {
  const pkg = packages[i];
  document.getElementById("pkgName").value = pkg.name;
  document.getElementById("pkgPrice").value = pkg.price;
  document.getElementById("pkgDishes").value = Array.isArray(pkg.dishes) ? pkg.dishes.join(", ") : pkg.dishes;
  document.getElementById("pkgImage").value = pkg.image || "";
  document.getElementById("pkgStock").value = (pkg.stock ?? '').toString();
  document.getElementById("pkgActive").checked = pkg.active !== false;
  
  const pv = pkg.primaryVariants && pkg.primaryVariants.options ? pkg.primaryVariants.options : [];
  const s = pv.find(o => o.name === "kecil");
  const n = pv.find(o => o.name === "normal");
  const j = pv.find(o => o.name === "jumbo");
  document.getElementById("pkgPriceSmall").value = s ? s.price : "";
  document.getElementById("pkgPriceNormal").value = pkg.price;
  document.getElementById("pkgPriceJumbo").value = j ? j.price : "";
  pkgAdditionalState = (pkg.additionalVariants || []).map(g => ({ group: g.group, options: g.options.map(o => ({ name: o.name, delta: o.delta || 0 })) }));
  renderVariantEditor('pkgVarEditor', pkgAdditionalState, 'pkg');
  bindVariantEditorControls('pkg');
  
  editingPackageIndex = i;
  document.getElementById("packageFormContainer").classList.remove("hidden");
  document.getElementById("pkgName").focus();
}

async function deletePackage(i) {
  showConfirmDialog(
    `Apakah Anda yakin ingin menghapus "${packages[i].name}"?`,
    async () => {
      packages.splice(i, 1);
  await setAndSync("packages", packages);
      renderTables();
      showNotification("Paket menu berhasil dihapus!", "success");
    }
  );
}

// ================ DISH MANAGEMENT ================
let editingDishIndex = -1;

function toggleDishForm() {
  const container = document.getElementById("dishFormContainer");
  if (container) {
    container.classList.toggle("hidden");
    if (!container.classList.contains("hidden")) {
      dishForm.reset();
      editingDishIndex = -1;
      dishAdditionalState = [];
      renderVariantEditor('dishVarEditor', dishAdditionalState, 'dish');
      bindVariantEditorControls('dish');
      try { setupImageUploaders(); } catch (_) {}
    }
  }
}

if (dishForm) {
  dishForm.addEventListener("submit", async e => {
    e.preventDefault();
    
    const basePrice = parseInt(document.getElementById("dishPrice").value) || 0;
    document.getElementById("dishPriceNormal").value = basePrice;
    const smallStr = (document.getElementById("dishPriceSmall").value || '').trim();
    const jumboStr = (document.getElementById("dishPriceJumbo").value || '').trim();
    const pSmall = smallStr === '' ? undefined : (parseInt(smallStr) || 0);
    const pNormal = basePrice;
    const pJumbo = jumboStr === '' ? undefined : (parseInt(jumboStr) || 0);
    
    const primaryOptions = [];
    if (typeof pSmall === 'number') primaryOptions.push({ name: "kecil", price: pSmall });
    if (typeof pJumbo === 'number') primaryOptions.push({ name: "jumbo", price: pJumbo });
    if (primaryOptions.length > 0) primaryOptions.unshift({ name: "normal", price: pNormal });
    const dishData = {
      name: document.getElementById("dishName").value.trim(),
      price: basePrice,
      category: document.getElementById("dishCategory").value,
      image: document.getElementById("dishImage").value.trim(),
      stock: (document.getElementById("dishStock").value || '').trim() === '' ? undefined : (parseInt(document.getElementById("dishStock").value) || 0),
      active: document.getElementById("dishActive").checked,
      
      primaryVariants: (primaryOptions.length > 1) ? { group: "Porsi", options: primaryOptions } : undefined,
      additionalVariants: dishAdditionalState
    };
    
    if (typeof pSmall === 'number' && pSmall >= basePrice) {
      return showNotification("Harga porsi kecil harus di bawah harga menu!", "error");
    }
    if (typeof pJumbo === 'number' && pJumbo <= basePrice) {
      return showNotification("Harga porsi jumbo harus di atas harga menu!", "error");
    }
    
    if (editingDishIndex >= 0) {
      dishes[editingDishIndex] = dishData;
      editingDishIndex = -1;
    } else {
      dishes.push(dishData);
    }
    
    await setAndSync("dishes", dishes);
    renderTables();
    toggleDishForm();
    showNotification("Menu berhasil disimpan!", "success");
  });
}

function editDish(i) {
  const dish = dishes[i];
  document.getElementById("dishName").value = dish.name;
  document.getElementById("dishPrice").value = dish.price;
  document.getElementById("dishCategory").value = dish.category || "";
  document.getElementById("dishImage").value = dish.image || "";
  document.getElementById("dishStock").value = (dish.stock ?? '').toString();
  document.getElementById("dishActive").checked = dish.active !== false;
  
  const pv = dish.primaryVariants && dish.primaryVariants.options ? dish.primaryVariants.options : [];
  const s = pv.find(o => o.name === "kecil");
  const n = pv.find(o => o.name === "normal");
  const j = pv.find(o => o.name === "jumbo");
  document.getElementById("dishPriceSmall").value = s ? s.price : "";
  document.getElementById("dishPriceNormal").value = dish.price;
  document.getElementById("dishPriceJumbo").value = j ? j.price : "";
  dishAdditionalState = (dish.additionalVariants || []).map(g => ({ group: g.group, options: g.options.map(o => ({ name: o.name, delta: o.delta || 0 })) }));
  renderVariantEditor('dishVarEditor', dishAdditionalState, 'dish');
  bindVariantEditorControls('dish');
  
  editingDishIndex = i;
  document.getElementById("dishFormContainer").classList.remove("hidden");
  document.getElementById("dishName").focus();
}

async function deleteDish(i) {
  showConfirmDialog(
    `Apakah Anda yakin ingin menghapus "${dishes[i].name}"?`,
    async () => {
      dishes.splice(i, 1);
  await setAndSync("dishes", dishes);
      renderTables();
      showNotification("Menu berhasil dihapus!", "success");
    }
  );
}

// ================ DISCOUNT CODE MANAGEMENT ================
let editingDiscountIndex = -1;

function toggleDiscountForm() {
  const container = document.getElementById("discountFormContainer");
  if (container) {
    container.classList.toggle("hidden");
    if (!container.classList.contains("hidden")) {
      document.getElementById("discountForm").reset();
      editingDiscountIndex = -1;
    }
  }
}

const discountForm = document.getElementById("discountForm");
if (discountForm) {
  discountForm.addEventListener("submit", async e => {
    e.preventDefault();
    
    const discountData = {
      code: document.getElementById("discountCodeInput").value.trim().toUpperCase(),
      type: document.getElementById("discountType").value,
      value: parseFloat(document.getElementById("discountValue").value),
      minPurchase: parseInt(document.getElementById("minPurchase").value) || 0,
      minQuantity: parseInt(document.getElementById("minQuantity").value) || 0, // CAPTURE MIN QUANTITY
      maxDiscount: parseInt(document.getElementById("maxDiscount").value) || 0,
      active: true
    };
    
    // Validate discount code uniqueness
    const existingIndex = discountCodes.findIndex(d => d.code === discountData.code);
    if (existingIndex >= 0 && existingIndex !== editingDiscountIndex) {
      showNotification("Kode diskon sudah ada!", "error");
      return;
    }
    
    if (editingDiscountIndex >= 0) {
      discountCodes[editingDiscountIndex] = discountData;
      editingDiscountIndex = -1;
    } else {
      discountCodes.push(discountData);
    }
    
  await setAndSync("discountCodes", discountCodes);
    renderTables();
    toggleDiscountForm();
    showNotification("Kode diskon berhasil disimpan!", "success");
  });
}

function editDiscount(i) {
  const discount = discountCodes[i];
  document.getElementById("discountCodeInput").value = discount.code;
  document.getElementById("discountType").value = discount.type;
  document.getElementById("discountValue").value = discount.value;
  document.getElementById("minPurchase").value = discount.minPurchase;
  document.getElementById("minQuantity").value = discount.minQuantity || 0; // POPULATE MIN QUANTITY
  document.getElementById("maxDiscount").value = discount.maxDiscount;
  
  editingDiscountIndex = i;
  document.getElementById("discountFormContainer").classList.remove("hidden");
  document.getElementById("discountCodeInput").focus();
}

async function deleteDiscount(i) {
  showConfirmDialog(
    `Apakah Anda yakin ingin menghapus kode diskon "${discountCodes[i].code}"?`,
    async () => {
      discountCodes.splice(i, 1);
      await setAndSync("discountCodes", discountCodes);
      renderTables();
      showNotification("Kode diskon berhasil dihapus!", "success");
    }
  );
}

async function toggleDiscountStatus(i) {
  discountCodes[i].active = !discountCodes[i].active;
  await setAndSync("discountCodes", discountCodes);
  renderTables();
  showNotification(
    `Kode diskon ${discountCodes[i].code} ${discountCodes[i].active ? 'diaktifkan' : 'dinonaktifkan'}!`,
    "success"
  );
}

// ================ SETTINGS MANAGEMENT ================
async function saveSettings() {
  settings.taxEnabled = document.getElementById("taxToggle").checked;
  settings.taxRate = parseFloat(document.getElementById("taxRate").value) / 100;
  settings.shippingEnabled = document.getElementById("shippingToggle").checked;
  settings.shippingCost = parseInt(document.getElementById("shippingCost").value);
  settings.discountEnabled = document.getElementById("discountToggle").checked;
  const lstEl = document.getElementById("lowStockThreshold");
  settings.lowStockThreshold = lstEl ? (parseInt(lstEl.value) || 5) : (settings.lowStockThreshold || 5);
  
  await setAndSync("settings", settings);
  showNotification("Pengaturan berhasil disimpan!", "success");
}

const settingsForm = document.getElementById("settingsForm");
if (settingsForm) {
  settingsForm.addEventListener("submit", async e => {
    e.preventDefault();
    await saveSettings();
  });
}

// ================ IMAGE UPLOAD HELPERS ================
function uploadImageToServer(category, file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'));
    if (file.size > 5 * 1024 * 1024) return reject(new Error('File terlalu besar (max 5MB)'));
    if (!file.type.startsWith('image/')) return reject(new Error('File harus berupa gambar'));
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', category);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/upload.php`);
    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable && typeof onProgress === 'function') {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        try {
          const j = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300 && j && j.ok && j.path) {
            resolve(j.path);
          } else {
            reject(new Error(j.error || 'Upload gagal'));
          }
        } catch (err) {
          reject(new Error('Upload gagal'));
        }
      }
    };
    xhr.onerror = function() { reject(new Error('Network error')); };
    xhr.send(fd);
  });
}

function setupImageUploaders() {
  const attach = (textId, category, fileId) => {
    const textEl = document.getElementById(textId);
    if (!textEl) return;
    let fileEl = document.getElementById(fileId);
    if (!fileEl) {
      fileEl = document.createElement('input');
      fileEl.type = 'file';
      fileEl.id = fileId;
      fileEl.accept = 'image/*';
      fileEl.className = 'hidden';
      textEl.parentElement.appendChild(fileEl);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Upload';
      btn.className = 'mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition font-semibold';
      textEl.parentElement.appendChild(btn);
      btn.addEventListener('click', () => fileEl.click());
      const progressContainer = document.createElement('div');
      progressContainer.id = fileId + '-progress';
      progressContainer.className = 'hidden mt-2';
      const barWrap = document.createElement('div');
      barWrap.className = 'w-full h-2 bg-gray-200 rounded';
      const bar = document.createElement('div');
      bar.id = fileId + '-progress-bar';
      bar.className = 'h-2 bg-yellow-600 rounded';
      bar.style.width = '0%';
      barWrap.appendChild(bar);
      const text = document.createElement('div');
      text.id = fileId + '-progress-text';
      text.className = 'text-xs text-gray-600 mt-1';
      text.textContent = 'Mengupload: 0%';
      progressContainer.appendChild(barWrap);
      progressContainer.appendChild(text);
      const status = document.createElement('div');
      status.id = fileId + '-status';
      status.className = 'hidden mt-2';
      textEl.parentElement.appendChild(progressContainer);
      textEl.parentElement.appendChild(status);
    }
    fileEl.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const progressContainer = document.getElementById(fileId + '-progress');
        const bar = document.getElementById(fileId + '-progress-bar');
        const text = document.getElementById(fileId + '-progress-text');
        const status = document.getElementById(fileId + '-status');
        if (status) status.classList.add('hidden');
        if (progressContainer) progressContainer.classList.remove('hidden');
        const path = await uploadImageToServer(category, file, (p) => {
          if (bar) bar.style.width = p + '%';
          if (text) text.textContent = 'Mengupload: ' + p + '%';
        });
        if (progressContainer) progressContainer.classList.add('hidden');
        if (status) {
          status.className = 'mt-2 p-2 rounded text-sm bg-green-100 text-green-700';
          status.innerHTML = '<div class="flex items-center gap-2"><span>✅</span><span>Gambar berhasil diupload!</span></div>';
        }
        textEl.value = path;
        showNotification('Gambar berhasil diupload', 'success');
      } catch (err) {
        const status = document.getElementById(fileId + '-status');
        const progressContainer = document.getElementById(fileId + '-progress');
        if (progressContainer) progressContainer.classList.add('hidden');
        if (status) {
          status.className = 'mt-2 p-2 rounded text-sm bg-red-100 text-red-700';
          status.innerHTML = '<div class="flex items-center gap-2"><span>❌</span><span>' + (err.message || 'Gagal upload gambar') + '</span></div>';
        }
        showNotification(err.message || 'Gagal upload gambar', 'error');
        e.target.value = '';
      }
    });
  };
  attach('heroImageInput', 'content', 'heroImageFile');
  attach('pkgImage', 'menu', 'pkgImageFile');
  attach('dishImage', 'menu', 'dishImageFile');
  attach('articleImage', 'content', 'articleImageFile');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupImageUploaders();
  });
} else {
  try { setupImageUploaders(); } catch (_) {}
}

// ================ ORDER MANAGEMENT ================
function viewOrderDetail(i) {
  const order = orders[i];
  const modal = document.getElementById("orderDetailModal");
  const content = document.getElementById("orderDetailContent");
  
  if (!modal || !content) return;
  
  content.innerHTML = `
    <div class="space-y-4">
      <div>
        <h4 class="font-bold text-gray-700 mb-2">Informasi Pesanan</h4>
        <div class="grid grid-cols-2 gap-2 text-gray-500">
          <div><strong>Kode Tracking:</strong></div>
          <div>${order.trackCode}</div>
          <div><strong>Tanggal Order:</strong></div>
          <div>${new Date(order.createdAt).toLocaleString('id-ID')}</div>
          <div><strong>Waktu Kirim:</strong></div>
          <div>${new Date(order.delivery).toLocaleString('id-ID')}</div>
          <div><strong>Status:</strong></div>
          <div><span class="font-bold text-yellow-600">${order.status}</span></div>
        </div>
      </div>
      
      <div>
        <h4 class="font-bold text-gray-500 mb-2">Data Pelanggan</h4>
        <div class="text-gray-500 space-y-1">
          <p><strong>Nama:</strong> ${order.name}</p>
          <p><strong>No. HP:</strong> ${order.phone}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <div>
            <p><strong>Alamat:</strong> ${order.address}</p>
            <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div><strong>Jalan:</strong></div><div>${(order.addressParts||{}).street || '-'}</div>
              <div><strong>No:</strong></div><div>${(order.addressParts||{}).no || '-'}</div>
              <div><strong>RT/RW:</strong></div><div>${(order.addressParts||{}).rtrw || '-'}</div>
              <div><strong>Kelurahan:</strong></div><div>${(order.addressParts||{}).kelurahan || '-'}</div>
              <div><strong>Kecamatan:</strong></div><div>${(order.addressParts||{}).kecamatan || '-'}</div>
              <div><strong>Kota/Kab:</strong></div><div>${(order.addressParts||{}).kotaKab || '-'}</div>
              <div><strong>Provinsi:</strong></div><div>${(order.addressParts||{}).provinsi || '-'}</div>
              <div><strong>Kode Pos:</strong></div><div>${(order.addressParts||{}).kodePos || '-'}</div>
            </div>
          </div>
          <p><strong>Metode Pembayaran:</strong> ${order.paymentMethod === 'qris' ? 'QRIS' : (order.paymentMethod === 'bank' ? 'Bank Transfer' : '-')}</p>
        </div>
      </div>
      
      <div>
        <h4 class="font-bold text-gray-700 mb-2">Detail Pesanan</h4>
        <div class="space-y-1 text-gray-500">
          ${order.items.map(item => {
            const unit = calcItemUnitPrice(item);
            const pv = item.primaryVariant ? ` [${item.primaryVariant}]` : '';
            const addSel = item.additionalSelections && Object.keys(item.additionalSelections).length
              ? ` {${Object.entries(item.additionalSelections).map(([g, v]) => `${g}: ${v}`).join('; ')}}`
              : '';
            return `
            <div class="p-2 bg-gray-50 rounded">
              <div class="flex justify-between">
                <span>${item.name}${pv}${addSel} x ${item.qty}</span>
                <span class="font-bold">Rp ${(item.qty * unit).toLocaleString()}</span>
              </div>
              ${item.note ? `<div class="text-xs text-gray-600 mt-1">Catatan: ${item.note}</div>` : ''}
            </div>
            `;
          }).join('')}
        </div>
        <div class="mt-3 pt-3 border-t space-y-1 text-gray-500">
          <div class="flex justify-between">
            <span>Subtotal:</span>
            <span>Rp ${order.subtotal.toLocaleString()}</span>
          </div>
          ${order.tax > 0 ? `
          <div class="flex justify-between">
            <span>Pajak (${(order.taxRate * 100).toFixed(0)}%):</span>
            <span>Rp ${order.tax.toLocaleString()}</span>
          </div>
          ` : ''}
          ${order.transport > 0 ? `
          <div class="flex justify-between">
            <span>Biaya Antar:</span>
            <span>Rp ${order.transport.toLocaleString()}</span>
          </div>
          ` : ''}
          ${order.totalDiscount > 0 ? `
            <div class="flex justify-between text-green-600">
              <span>Diskon ${order.appliedDiscounts ? `(${order.appliedDiscounts.join(', ')})` : ''}:</span>
              <span>- Rp ${order.totalDiscount.toLocaleString()}</span>
            </div>
          ` : ''}
          <div class="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total:</span>
            <span class="text-yellow-600">Rp ${order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      ${(order.paymentProofUrl || order.paymentProof) ? `
        <div>
          <h4 class="font-bold text-gray-500 mb-2">Bukti Pembayaran</h4>
          <img src="${order.paymentProofUrl || order.paymentProof}" alt="Bukti Pembayaran" 
               class="w-full max-w-md mx-auto rounded-lg shadow-lg cursor-pointer"
               onclick="openImageModal('${order.paymentProofUrl || order.paymentProof}')">
          <p class="text-xs text-center text-gray-500 mt-2">Klik gambar untuk memperbesar</p>
        </div>
      ` : '<p class="text-gray-500 text-gray-500">Belum ada bukti pembayaran</p>'}
  </div>
  `;
  
  modal.classList.remove("hidden");
}

function calcItemUnitPrice(item) {
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

function closeOrderDetail() {
  const modal = document.getElementById("orderDetailModal");
  if (modal) modal.classList.add("hidden");
}

function openImageModal(src) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[9999] p-4';
  const container = document.createElement('div');
  container.className = 'bg-white p-4 rounded-xl shadow-2xl w-full max-w-4xl';
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center mb-3';
  const title = document.createElement('h4');
  title.className = 'text-gray-500 font-bold';
  title.textContent = 'Bukti Pembayaran';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'text-2xl';
  closeBtn.textContent = '×';
  header.appendChild(title);
  header.appendChild(closeBtn);
  const toolbar = document.createElement('div');
  toolbar.className = 'flex gap-2 mb-3';
  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.className = 'px-3 py-1 bg-orange-500/90 rounded';
  zoomOutBtn.textContent = '−';
  const zoomInBtn = document.createElement('button');
  zoomInBtn.className = 'px-3 py-1 bg-blue-500/90 rounded';
  zoomInBtn.textContent = '+';
  const resetBtn = document.createElement('button');
  resetBtn.className = 'px-3 py-1 bg-gray-700 rounded';
  resetBtn.textContent = 'Reset';
  toolbar.appendChild(zoomOutBtn);
  toolbar.appendChild(zoomInBtn);
  toolbar.appendChild(resetBtn);
  const viewport = document.createElement('div');
  viewport.className = 'relative overflow-hidden rounded border';
  viewport.style.maxHeight = '70vh';
  const imgWrap = document.createElement('div');
  imgWrap.style.transformOrigin = 'center center';
  const img = document.createElement('img');
  img.src = src;
  img.alt = 'Bukti Pembayaran';
  img.style.maxWidth = '100%';
  img.style.maxHeight = '70vh';
  imgWrap.appendChild(img);
  viewport.appendChild(imgWrap);
  container.appendChild(header);
  container.appendChild(toolbar);
  container.appendChild(viewport);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  let scale = 1;
  let startX = 0;
  let startY = 0;
  let transX = 0;
  let transY = 0;
  function applyTransform() {
    imgWrap.style.transform = `translate(${transX}px, ${transY}px) scale(${scale})`;
  }
  function clampScale(s) {
    return Math.min(5, Math.max(0.5, s));
  }
  zoomInBtn.addEventListener('click', () => { scale = clampScale(scale + 0.2); applyTransform(); });
  zoomOutBtn.addEventListener('click', () => { scale = clampScale(scale - 0.2); applyTransform(); });
  resetBtn.addEventListener('click', () => { scale = 1; transX = 0; transY = 0; applyTransform(); });
  viewport.addEventListener('wheel', (e) => { e.preventDefault(); const delta = e.deltaY > 0 ? -0.1 : 0.1; scale = clampScale(scale + delta); applyTransform(); });
  viewport.addEventListener('mousedown', (e) => { startX = e.clientX - transX; startY = e.clientY - transY; document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp); });
  function onMove(e) { transX = e.clientX - startX; transY = e.clientY - startY; applyTransform(); }
  function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
  function close() { overlay.remove(); }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

function updateOrderStatus(i) {
  const order = orders[i];
  const modal = document.getElementById("statusUpdateModal");
  const content = document.getElementById("statusUpdateContent");
  
  if (!modal || !content) return;
  
  const statuses = [
    { value: 'pending', label: '⏳ Menunggu Konfirmasi' },
    { value: 'confirmed', label: '✅ Dikonfirmasi' },
    { value: 'processing', label: '🍳 Sedang Diproses' },
    { value: 'delivering', label: '🚚 Dalam Pengiriman' },
    { value: 'completed', label: '✅ Selesai' },
    { value: 'cancelled', label: '❌ Dibatalkan' }
  ];
  
  content.innerHTML = `
    <div class="space-y-3">
      <p class="text-sm text-gray-600">Pesanan: <strong>${order.trackCode}</strong></p>
      <div>
        <label class="block text-sm font-medium mb-2">Pilih Status Baru:</label>
        <div class="space-y-2">
          ${statuses.map(s => `
            <button onclick="confirmStatusUpdate(${i}, '${s.value}')" 
                    class="w-full text-left px-4 py-3 rounded-lg border-2 ${order.status === s.value ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200 hover:border-yellow-400'} transition">
              ${s.label}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  modal.classList.remove("hidden");
}

async function confirmStatusUpdate(orderIndex, newStatus) {
  orders[orderIndex].status = newStatus;
  // Close modal and update UI immediately for responsiveness
  closeStatusUpdateModal();
  renderTables();
  // Persist in background
  try {
    await Promise.all([
      saveKV('orders', orders),
      saveKV(`order_status:${orders[orderIndex].trackCode}`, newStatus)
    ]);
    showNotification("Status pesanan berhasil diupdate!", "success");
  } catch (_) {
    showNotification("Gagal menyimpan status pesanan", "error");
  }
}

function closeStatusUpdateModal() {
  const modal = document.getElementById("statusUpdateModal");
  if (modal) modal.classList.add("hidden");
}

// ================ BACKUP & RESTORE ================
function exportData() {
  const data = {
    packages: packages,
    dishes: dishes,
    orders: orders,
    discountCodes: discountCodes,
    settings: settings,
    exportDate: new Date().toISOString(),
    version: "2.0"
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `konoha-backup-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showNotification("Data berhasil di-export!", "success");
}

const importFile = document.getElementById("importFile");
if (importFile) {
  importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.packages && data.dishes) {
          showConfirmDialog(
            "Import data akan menimpa data yang ada. Lanjutkan?",
            () => {
              packages = data.packages;
              dishes = data.dishes;
              if (data.orders) orders = data.orders;
              if (data.discountCodes) discountCodes = data.discountCodes.map(d => ({
                ...d,
                minQuantity: d.minQuantity || 0 // Ensure minQuantity is present on imported data
              }));
              if (data.settings) settings = data.settings;
              
              setAndSync("packages", packages);
              setAndSync("dishes", dishes);
              setAndSync("orders", orders);
              setAndSync("discountCodes", discountCodes);
              setAndSync("settings", settings);
              
              renderTables();
              showNotification("Data berhasil di-import!", "success");
            }
          );
        } else {
          showNotification("Format file tidak valid!", "error");
        }
      } catch (error) {
        showNotification("Error membaca file: " + error.message, "error");
      }
    };
    reader.readAsText(file);
    importFile.value = "";
  });
}

// ================ LOGOUT ================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    showConfirmDialog(
      "Apakah Anda yakin ingin logout?",
      () => {
        localStorage.removeItem("adminLoggedIn");
        window.location.href = "/gerbang-sundagakure";
      }
    );
  });
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

function showConfirmDialog(message, onConfirm) {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[9999] p-4";
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
      <div class="text-center mb-6">
        <div class="text-5xl mb-3">⚠️</div>
        <p class="text-lg text-gray-800">${message}</p>
      </div>
      <div class="flex gap-3">
        <button id="confirmCancel" class="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-semibold">
          Batal
        </button>
        <button id="confirmOk" class="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold">
          Ya, Lanjutkan
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector("#confirmCancel").addEventListener("click", () => {
    modal.remove();
  });
  
  modal.querySelector("#confirmOk").addEventListener("click", () => {
    modal.remove();
    onConfirm();
  });
  
  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function showPasswordConfirmDialog(message, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[9999] p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
      <div class="text-center mb-4">
        <div class="text-5xl mb-2">⚠️</div>
        <p class="text-lg text-gray-800">${message}</p>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Masukkan Password Admin</label>
        <input type="password" id="confirmPasswordInput" class="w-full border rounded px-3 py-2" placeholder="Password" />
        <div id="confirmPasswordError" class="hidden mt-2 p-2 rounded text-sm bg-red-100 text-red-700">Password salah</div>
      </div>
      <div class="flex gap-3">
        <button id="confirmCancel" class="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-semibold">Batal</button>
        <button id="confirmOk" class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">Hapus</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const passInput = modal.querySelector('#confirmPasswordInput');
  const err = modal.querySelector('#confirmPasswordError');
  modal.querySelector('#confirmCancel').onclick = () => modal.remove();
  modal.querySelector('#confirmOk').onclick = async () => {
    const val = (passInput.value || '').trim();
    try {
      const res = await fetch('/hostinger/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'sundakage', password: val })
      });
      const j = await res.json();
      if (res.ok && j && j.ok) {
        modal.remove();
        onConfirm();
      } else {
        if (err) err.classList.remove('hidden');
      }
    } catch (_) {
      if (err) err.classList.remove('hidden');
    }
  };
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

async function requestDeleteOrder(i) {
  const ord = orders[i];
  showPasswordConfirmDialog(`Hapus pesanan "${ord.trackCode}"?`, async () => {
    orders.splice(i, 1);
    await setAndSync('orders', orders);
    renderTables();
    showNotification('Pesanan berhasil dihapus!', 'success');
  });
}

// ================ INITIALIZE ================
;(async function initAdmin(){
  const ro = await fetchKV('orders');
  if(Array.isArray(ro)) { orders = ro; }
  const pk = await fetchKV('packages');
  if(Array.isArray(pk)) { packages = pk; }
  const ds = await fetchKV('dishes');
  if(Array.isArray(ds)) { dishes = ds; }
  const dc = await fetchKV('discountCodes');
  if(Array.isArray(dc)) { discountCodes = dc.map(d => ({ ...d, minQuantity: d.minQuantity || 0 })); }
  const iq = await fetchKV('inquiries');
  if(Array.isArray(iq)) { inquiries = iq; }
  const st = await fetchKV('settings');
  if(st && typeof st==='object') { settings = st; }
  const rc = await fetchKV('cmsContent');
  if(rc && typeof rc==='object') { cmsContent = rc; }
  const ar = await fetchKV('articles');
  if(Array.isArray(ar)) { articles = ar; }
  const gt = await fetchKV('globalVariantTemplates');
  if(Array.isArray(gt)) { globalVariantTemplates = gt; }
  renderTables();
  renderCMSForm();
  window.__DISABLE_SYNC = false;
})();
if (packageForm) {
  const baseInput = document.getElementById("pkgPrice");
  const normalInput = document.getElementById("pkgPriceNormal");
  if (baseInput && normalInput) {
    normalInput.value = parseInt(baseInput.value) || 0;
    baseInput.addEventListener("input", () => {
      normalInput.value = parseInt(baseInput.value) || 0;
    });
  }
}

if (dishForm) {
  const baseInput = document.getElementById("dishPrice");
  const normalInput = document.getElementById("dishPriceNormal");
  if (baseInput && normalInput) {
    normalInput.value = parseInt(baseInput.value) || 0;
    baseInput.addEventListener("input", () => {
      normalInput.value = parseInt(baseInput.value) || 0;
    });
  }
}

function initVariantTemplateBindings() {
  const addOptionBtn = document.getElementById("templateAddOptionBtn");
  if (addOptionBtn) {
    addOptionBtn.onclick = addTemplateOption;
  }
  const templateForm = document.getElementById("variantTemplateForm");
  if (templateForm && !templateForm.__bound) {
    templateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById("templateName").value.trim();
      const group = document.getElementById("templateGroup").value.trim();
      if (!name || !group) {
        showNotification("Nama template dan grup wajib diisi!", "error");
        return;
      }
      if (templateVariantState.length === 0) {
        showNotification("Minimal harus ada 1 opsi varian!", "error");
        return;
      }
      const validOptions = templateVariantState.filter(opt => opt.name.trim() !== '');
      if (validOptions.length === 0) {
        showNotification("Minimal harus ada 1 opsi varian yang valid!", "error");
        return;
      }
      const templateData = {
        id: editingVariantTemplateIndex >= 0 ? globalVariantTemplates[editingVariantTemplateIndex].id : 'template-' + Date.now(),
        name,
        group,
        options: validOptions
      };
      if (editingVariantTemplateIndex >= 0) {
        globalVariantTemplates[editingVariantTemplateIndex] = templateData;
      } else {
        globalVariantTemplates.push(templateData);
      }
      await setAndSync("globalVariantTemplates", globalVariantTemplates);
      renderVariantTemplatesTable();
      renderTemplateSelectors();
      toggleVariantTemplateForm();
      showNotification("Template varian berhasil disimpan!", "success");
    });
    templateForm.__bound = true;
  }
}

// Bind on load
initVariantTemplateBindings();
async function togglePackageStatus(i) {
  packages[i].active = packages[i].active === false ? true : false;
  await setAndSync("packages", packages);
  renderTables();
  showNotification(
    `Paket ${packages[i].name} ${packages[i].active ? 'diaktifkan' : 'dinonaktifkan'}!`,
    "success"
  );
}

async function toggleDishStatus(i) {
  dishes[i].active = dishes[i].active === false ? true : false;
  await setAndSync("dishes", dishes);
  renderTables();
  showNotification(
    `Menu ${dishes[i].name} ${dishes[i].active ? 'diaktifkan' : 'dinonaktifkan'}!`,
    "success"
  );
}

async function editPackageStock(i) {
  const val = prompt("Masukkan stok untuk paket (kosong = tanpa batas)", (packages[i].stock ?? '').toString());
  if (val === null) return;
  const num = val.trim() === '' ? undefined : (parseInt(val) || 0);
  packages[i].stock = num;
  await setAndSync("packages", packages);
  renderTables();
  showNotification("Stok paket diperbarui", "success");
}

async function editDishStock(i) {
  const val = prompt("Masukkan stok untuk menu (kosong = tanpa batas)", (dishes[i].stock ?? '').toString());
  if (val === null) return;
  const num = val.trim() === '' ? undefined : (parseInt(val) || 0);
  dishes[i].stock = num;
  await setAndSync("dishes", dishes);
  renderTables();
  showNotification("Stok menu diperbarui", "success");
}
