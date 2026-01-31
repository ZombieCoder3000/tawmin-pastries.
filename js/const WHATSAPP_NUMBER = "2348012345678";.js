const WHATSAPP_NUMBER = "2347030224625"; // Change to Tawmin Number
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQMqa0bVRme8P4ud19VlOVD4ZCAn4_gDrd4-Hiilhk-lUVBjoIRo3VvrQ2VtkRBlLTor6Ap-Vwa3ScO/pub?output=csv";
let products = [];
let cart = JSON.parse(localStorage.getItem('tawmin_cart')) || [];
let currentProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    
    Papa.parse(GOOGLE_SHEET_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            products = results.data
                .filter(item => item.id && item.name)
                .map(item => ({
                    ...item,
                    id: parseInt(item.id),
                    price: parseInt(item.price.replace(/,/g, '').replace(/₦/g, '').trim())
                }));
            initApp();
        }
    });
});

function initApp() {
    // 1. Featured Grid (Home Page)
    const featured = document.getElementById('featured-grid');
    if (featured) featured.innerHTML = products.slice(0, 4).map(createCard).join('');

    // 2. Accordion (Shop Page)
    const accordionContainer = document.getElementById('category-accordion');
    if (accordionContainer) {
        const grouped = products.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});

        accordionContainer.innerHTML = Object.keys(grouped).map((cat, idx) => `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button onclick="toggleCategory('cat-${idx}')" class="w-full flex justify-between items-center p-6 hover:bg-red-50 transition">
                    <span class="text-xl font-black text-slate-800 uppercase tracking-tight">${cat}</span>
                    <span id="icon-cat-${idx}" class="text-red-600 text-2xl font-bold">+</span>
                </button>
                <div id="cat-${idx}" class="hidden p-6 border-t border-gray-50 bg-gray-50/30">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${grouped[cat].map(createCard).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function toggleCategory(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    const isHidden = el.classList.contains('hidden');
    
    // Auto-close others
    document.querySelectorAll('[id^="cat-"]').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('[id^="icon-cat-"]').forEach(i => i.innerText = '+');

    if (isHidden) {
        el.classList.remove('hidden');
        icon.innerText = '−';
    }
}

function createCard(p) {
    return `
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition flex flex-col h-full">
            <img src="${p.image || 'https://via.placeholder.com/400x300?text=Tawmin+Pastries'}" class="w-full h-44 object-cover rounded-xl mb-4">
            <h3 class="font-bold text-slate-900 leading-tight mb-1">${p.name}</h3>
            <p class="text-red-600 font-black text-lg mb-4">₦${p.price.toLocaleString()}</p>
            <button onclick="openQtyModal(${p.id})" class="mt-auto w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">Add to Order</button>
        </div>
    `;
}

// ... Keep existing cart logic from your previous main.js (toggleCartModal, finalizeOrder, etc.) ...
// Just update color classes from orange-600 to red-600 inside those functions.