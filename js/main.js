const WHATSAPP_NUMBER = "2347030224625"; 
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQMqa0bVRme8P4ud19VlOVD4ZCAn4_gDrd4-Hiilhk-lUVBjoIRo3VvrQ2VtkRBlLTor6Ap-Vwa3ScO/pub?output=csv";

let products = [];
let cart = JSON.parse(localStorage.getItem('tawmin_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    loadData();
});

function loadData() {
    Papa.parse(GOOGLE_SHEET_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            products = results.data.filter(row => row.name).map((row, index) => ({
                id: row.id || index,
                category: row.category || "General",
                name: row.name,
                price: parseInt(row.price.toString().replace(/[^\d]/g, '')) || 0,
                image: row.image || '',
                description: row.description || ''
            }));
            initApp();
        }
    });
}

function initApp() {
    const featured = document.getElementById('featured-grid');
    if (featured) featured.innerHTML = products.slice(0, 4).map(createCard).join('');

    const accordion = document.getElementById('category-accordion');
    if (accordion) {
        const grouped = products.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});

        accordion.innerHTML = Object.keys(grouped).map((cat, idx) => `
            <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                <button onclick="toggleCategory('cat-${idx}')" class="w-full flex justify-between items-center p-8 hover:bg-red-50 transition text-left">
                    <span class="text-2xl font-black uppercase italic tracking-tighter text-slate-800">${cat}</span>
                    <span id="icon-cat-${idx}" class="text-red-600 text-3xl font-light">+</span>
                </button>
                <div id="cat-${idx}" class="hidden p-8 border-t border-gray-50 bg-gray-50/20">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        ${grouped[cat].map(createCard).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function createCard(p) {
    const fallback = "https://images.unsplash.com/photo-1541779408-c355f91b42c9?q=80&w=400";
    return `
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition flex flex-col h-full">
            <img src="${p.image || fallback}" class="w-full h-44 object-cover rounded-xl mb-4 bg-gray-50" onerror="this.src='${fallback}'">
            <h3 class="font-bold text-slate-900 leading-tight mb-2">${p.name}</h3>
            <p class="text-red-600 font-black text-xl mb-4">₦${p.price.toLocaleString()}</p>
            <button onclick="addToCart(${p.id})" class="mt-auto w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">Add to Basket</button>
        </div>
    `;
}

function toggleCategory(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    const isHidden = el.classList.contains('hidden');
    document.querySelectorAll('[id^="cat-"]').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('[id^="icon-cat-"]').forEach(i => i.innerText = '+');
    if (isHidden) { el.classList.remove('hidden'); icon.innerText = '−'; }
}

function addToCart(id) {
    const p = products.find(x => x.id == id);
    const existing = cart.find(x => x.id == id);
    if(existing) existing.qty++;
    else cart.push({...p, qty: 1});
    saveCart();
    toggleCartModal();
}

function removeItem(id) { cart = cart.filter(x => x.id != id); saveCart(); renderCart(); }
function saveCart() { localStorage.setItem('tawmin_cart', JSON.stringify(cart)); updateCartCounter(); }
function updateCartCounter() { document.querySelectorAll('#cart-count').forEach(b => b.innerText = cart.reduce((s, i) => s + i.qty, 0)); }
function toggleCartModal() { const modal = document.getElementById('cart-modal'); if(modal) { modal.classList.toggle('hidden'); renderCart(); } }

function renderCart() {
    const container = document.getElementById('cart-items');
    let total = 0;
    if(cart.length === 0) { container.innerHTML = "<p class='text-center py-10 italic'>Basket is empty.</p>"; document.getElementById('cart-total').innerText = "₦0"; return; }
    container.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        return `<div class="flex justify-between items-center border-b pb-4">
            <div><h4 class="font-bold text-sm">${item.name}</h4><p class="text-xs text-red-600">${item.qty} x ₦${item.price.toLocaleString()}</p></div>
            <button onclick="removeItem(${item.id})" class="text-red-600 font-bold text-xl">&times;</button>
        </div>`;
    }).join('');
    document.getElementById('cart-total').innerText = "₦" + total.toLocaleString();
}

function openInquiryModal(subject) { document.getElementById('inquiry-subject').innerText = subject; document.getElementById('inquiry-modal').classList.remove('hidden'); }
function closeInquiryModal() { document.getElementById('inquiry-modal').classList.add('hidden'); }
function openCheckout() { document.getElementById('cart-modal').classList.add('hidden'); document.getElementById('checkout-modal').classList.remove('hidden'); }
function closeCheckout() { document.getElementById('checkout-modal').classList.add('hidden'); }

function finalizeOrder(e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    let text = `*🚨 NEW ORDER: TAWMIN PASTRIES*\n\n*Customer:* ${name}\n*Phone:* ${phone}\n*Address:* ${address}\n\n*Items:*\n`;
    let total = 0;
    cart.forEach(i => { text += `• ${i.qty}x ${i.name} (₦${(i.price*i.qty).toLocaleString()})\n`; total += (i.price*i.qty); });
    text += `\n*TOTAL: ₦${total.toLocaleString()}*`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    cart = []; saveCart(); closeCheckout();
}

function sendInquiry(e) {
    e.preventDefault();
    const text = `*❓ INQUIRY*\n*From:* ${document.getElementById('inq-name').value}\n*Topic:* ${document.getElementById('inquiry-subject').innerText}\n*Message:* ${document.getElementById('inq-msg').value}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    closeInquiryModal();
}