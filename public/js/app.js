// app.js - Single Source of Truth

const API_URL = 'http://localhost:3000/api';
const CART_KEY = 'bodyforge_cart_v3';

// State
let state = {
    products: [],
    cart: JSON.parse(localStorage.getItem(CART_KEY)) || [],
    currentPage: 'home'
};

// DOM Elements
let mainContent, cartCount, cartModal, cartItemsContainer, cartTotal, toast;

// --- CORE FUNCTIONS ---

async function init() {
    console.log('App Initializing...');

    // Initialize DOM Elements
    mainContent = document.getElementById('main-content');
    cartCount = document.getElementById('cart-count');
    cartModal = document.getElementById('cart-modal');
    cartItemsContainer = document.getElementById('cart-items');
    cartTotal = document.getElementById('cart-total');
    toast = document.getElementById('toast');

    if (!cartCount) {
        console.warn('Cart elements not found. Are you on the correct page?');
        return;
    }

    updateCartUI();

    // Render structure first to show skeletons
    renderHome();
    renderSkeletons('product-grid');

    try {
        // Simulate a small delay to see the skeleton (optional, remove in prod if super fast)
        await new Promise(r => setTimeout(r, 800));
        await loadProducts();
        renderProductGrid(state.products);
    } catch (error) {
        showError('Error fatal al iniciar la aplicación.');
    }

    setupEventListeners();
}

async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/products?t=${Date.now()}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        state.products = await res.json();
        console.log('Products loaded:', state.products.length);
    } catch (error) {
        console.error(error);
        showError('No se pudieron cargar los productos. Asegúrate de que el servidor esté corriendo.');
    }
}

// --- RENDERING ---

function renderSkeletons(containerId, count = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        container.innerHTML += `
            <div class="skeleton-card">
                <div class="skeleton skeleton-img"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text short"></div>
            </div>
        `;
    }
}

function renderHome() {
    mainContent.innerHTML = `
        <section class="hero-banner">
            <div class="hero-content">
                <h1>ALCANZA TU <br><span class="highlight">MÁXIMO POTENCIAL</span></h1>
                <p>Suplementación deportiva de élite para resultados reales.</p>
                <button class="btn-primary btn-hero" onclick="document.querySelector('[data-page=products]').click()">VER CATÁLOGO</button>
            </div>
        </section>
        
        <div class="container" style="margin-top: -3rem; position: relative; z-index: 10;">
            <div class="filters" id="category-filters">
                <button class="filter-btn active" data-category="all">Todos</button>
                <button class="filter-btn" data-category="Proteínas">Proteínas</button>
                <button class="filter-btn" data-category="Pre-entrenos">Pre-entrenos</button>
                <button class="filter-btn" data-category="Accesorios">Accesorios</button>
            </div>
        </div>

        <div class="container">
            <h2 class="section-title">Productos Destacados</h2>
            <div class="product-grid" id="product-grid"></div>
        </div>
    `;

    setupFilterListeners();
    // Don't render products immediately here, wait for fetch
}
// ... (rest of renderProductGrid) ...

// ... (rest of code) ...

function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.className = `toast visible ${type}`;
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

function renderProductGrid(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1;">No se encontraron productos.</p>';
        return;
    }

    const template = document.getElementById('product-card-template');

    products.forEach(product => {
        const clone = template.content.cloneNode(true);

        clone.querySelector('.product-name').textContent = product.name;
        clone.querySelector('.product-price').textContent = formatPrice(product.price);
        clone.querySelector('.product-category').textContent = product.category;

        const img = clone.querySelector('.product-img');
        img.src = product.image;
        img.onerror = () => { img.src = 'https://via.placeholder.com/150?text=No+Image'; };

        // Click on image to open details
        img.style.cursor = 'pointer';
        img.onclick = () => openProductDetails(product);

        const btn = clone.querySelector('.btn-add');
        btn.onclick = (e) => {
            e.stopPropagation();
            addToCart(product);
        };

        grid.appendChild(clone);
    });
}

// --- DISCOVERY LOGIC ---

function setupFilterListeners() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter
            const category = btn.dataset.category;
            const searchTerm = document.getElementById('search-input').value;
            filterProducts(category, searchTerm);
        });
    });
}

function filterProducts(category, searchTerm) {
    let filtered = state.products;

    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term)
        );
    }

    renderProductGrid(filtered);
}

// --- PRODUCTS PAGE LOGIC ---

let currentCategory = 'all';
let currentSort = 'default';

function renderProductsPage() {
    // Initial Render
    filterAndSortProducts();

    // Event Listeners for Products Page
    // Categories
    document.querySelectorAll('#products-categories li').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('#products-categories li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            currentCategory = li.dataset.category;
            filterAndSortProducts();
        });
    });

    // Search
    document.getElementById('products-search').addEventListener('input', () => filterAndSortProducts());

    // Price
    document.getElementById('apply-price-btn').addEventListener('click', () => filterAndSortProducts());

    // Sort
    document.getElementById('sort-select').addEventListener('change', (e) => {
        currentSort = e.target.value;
        filterAndSortProducts();
    });
}

function filterAndSortProducts() {
    let filtered = [...state.products];

    // 1. Category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    // 2. Search
    const searchTerm = document.getElementById('products-search').value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }

    // 3. Price
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // 4. Sort
    if (currentSort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Render
    const grid = document.getElementById('products-page-grid');
    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }

    const template = document.getElementById('product-card-template');
    filtered.forEach(product => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.product-name').textContent = product.name;
        clone.querySelector('.product-price').textContent = formatPrice(product.price);
        clone.querySelector('.product-category').textContent = product.category;

        const img = clone.querySelector('.product-img');
        img.src = product.image;
        img.onerror = () => { img.src = 'https://via.placeholder.com/150?text=No+Image'; };
        img.style.cursor = 'pointer';
        img.onclick = () => openProductDetails(product);

        clone.querySelector('.btn-add').onclick = (e) => {
            e.stopPropagation();
            addToCart(product);
        };

        grid.appendChild(clone);
    });

    // Update Title
    document.getElementById('products-title').textContent =
        currentCategory === 'all' ? 'Todos los Productos' : currentCategory;
}

// --- PRODUCT DETAILS ---

function openProductDetails(product) {
    const modal = document.getElementById('product-modal');

    document.getElementById('detail-img').src = product.image;
    document.getElementById('detail-name').textContent = product.name;
    document.getElementById('detail-category').textContent = product.category;
    document.getElementById('detail-description').textContent = product.description;
    document.getElementById('detail-price').textContent = formatPrice(product.price);

    const btn = document.getElementById('detail-add-btn');
    btn.onclick = () => {
        addToCart(product);
        modal.classList.add('hidden');
    };

    modal.classList.remove('hidden');
}

// --- CART LOGIC ---

function addToCart(product) {
    const existing = state.cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity++;
        showToast(`Cantidad actualizada: ${product.name}`, 'info');
    } else {
        state.cart.push({ ...product, quantity: 1 });
        showToast(`Agregado al carrito: ${product.name}`, 'success');
    }

    saveCart();
}

function removeFromCart(id) {
    state.cart = state.cart.filter(item => item.id !== id);
    saveCart();
    renderCartModal();
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    updateCartUI();
}

function updateCartUI() {
    if (!cartCount) return;
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
}

function renderCartModal() {
    cartItemsContainer.innerHTML = '';

    if (state.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        cartTotal.textContent = formatPrice(0);
        return;
    }

    let total = 0;

    state.cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <small>${formatPrice(item.price)} x ${item.quantity}</small>
            </div>
            <div>
                <span>${formatPrice(itemTotal)}</span>
                <button onclick="removeFromCart(${item.id})" style="color:red; border:none; background:none; cursor:pointer; margin-left:10px;">X</button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = formatPrice(total);
}



// --- UTILS ---

function formatPrice(price) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

function showError(msg) {
    mainContent.innerHTML = `<div style="color: red; text-align: center; padding: 2rem;"><h3>Error</h3><p>${msg}</p></div>`;
}

// --- EVENT LISTENERS ---

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            if (page === 'home') {
                const checkoutView = document.getElementById('checkout-view');
                const productsView = document.getElementById('products-view');
                if (checkoutView) checkoutView.classList.add('hidden');
                if (productsView) productsView.classList.add('hidden');

                document.getElementById('main-content').classList.remove('hidden');
                renderHome();
            } else if (page === 'products') {
                const checkoutView = document.getElementById('checkout-view');
                if (checkoutView) checkoutView.classList.add('hidden');

                document.getElementById('main-content').classList.add('hidden');

                const productsView = document.getElementById('products-view');
                if (productsView) {
                    productsView.classList.remove('hidden');
                    renderProductsPage();
                }
            }
        });
    });

    // Cart Modal
    document.getElementById('cart-btn').addEventListener('click', () => {
        renderCartModal();
        cartModal.classList.remove('hidden');
    });

    document.querySelector('.close-modal').addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) closeModal();
    });

    // Search Input
    document.getElementById('search-input').addEventListener('input', (e) => {
        const term = e.target.value;
        const activeCategory = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
        filterProducts(activeCategory, term);
    });

    // Product Modal
    document.getElementById('close-product-modal').addEventListener('click', () => {
        document.getElementById('product-modal').classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('product-modal')) {
            document.getElementById('product-modal').classList.add('hidden');
        }
    });

    // Cart Actions
    document.getElementById('clear-cart-btn').addEventListener('click', () => {
        state.cart = [];
        saveCart();
        renderCartModal();
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        closeModal();
        showCheckout();
    });

    document.getElementById('cancel-checkout-btn').addEventListener('click', () => {
        document.getElementById('checkout-view').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
    });

    document.getElementById('checkout-form').addEventListener('submit', processOrder);

    // Back to Home from Confirmation
    document.getElementById('back-to-home-btn').addEventListener('click', () => {
        document.getElementById('confirmation-view').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');

        // Reset URL hash or state if needed
        renderHome();
        window.scrollTo(0, 0);
    });
}

function showCheckout() {
    if (state.cart.length === 0) {
        showToast('El carrito está vacío');
        return;
    }

    document.getElementById('main-content').classList.add('hidden');
    const productsView = document.getElementById('products-view');
    if (productsView) productsView.classList.add('hidden');

    document.getElementById('checkout-view').classList.remove('hidden');

    // Render summary
    const container = document.getElementById('checkout-items');
    container.innerHTML = '';
    let total = 0;

    state.cart.forEach(item => {
        total += item.price * item.quantity;
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                <span>${item.name} x ${item.quantity}</span>
                <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
        `;
    });

    document.getElementById('checkout-total-display').textContent = formatPrice(total);
}

async function processOrder(e) {
    e.preventDefault();

    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Procesando...';
    btn.disabled = true;

    try {
        const formData = new FormData(form);
        const customer = Object.fromEntries(formData.entries());

        const order = {
            customer,
            items: state.cart,
            total: state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });

        if (!res.ok) throw new Error('Order failed');

        const result = await res.json();

        // Show Confirmation View
        document.getElementById('conf-order-id').textContent = result.orderId;
        document.getElementById('conf-customer-name').textContent = customer.name;
        document.getElementById('conf-total').textContent = formatPrice(order.total);

        state.cart = [];
        saveCart();
        form.reset();

        document.getElementById('checkout-view').classList.add('hidden');
        document.getElementById('confirmation-view').classList.remove('hidden');

        // Scroll to top
        window.scrollTo(0, 0);

    } catch (error) {
        console.error(error);
        alert('Error al procesar la compra. Inténtalo nuevamente.');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}



function closeModal() {
    cartModal.classList.add('hidden');
}

// Start App
document.addEventListener('DOMContentLoaded', init);
