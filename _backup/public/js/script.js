// script.js
// Lógica de carrito de compras usando localStorage y API

const CART_KEY = "bodyforge_cart_v2";
const API_URL = "http://localhost:3000/api";

// --- UTILIDADES ---

function getCart() {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (e) {
    console.error("Error leyendo carrito:", e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  } catch (e) {
    console.error("Error guardando carrito:", e);
    alert("No se pudo guardar el carrito. Revisa tu almacenamiento local.");
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
}

// --- FUNCIONES DEL CARRITO ---

function addToCart(product) {
  console.log("Intentando agregar:", product);
  const cart = getCart();
  const existingItem = cart.find(item => item.id == product.id);

  if (existingItem) {
    existingItem.quantity += 1;
    showToast(`Cantidad actualizada: ${existingItem.name}`);
  } else {
    cart.push({ ...product, quantity: 1 });
    showToast(`Agregado al carrito: ${product.name}`);
  }

  saveCart(cart);
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id != id);
  saveCart(cart);
  renderCartPage();
}

function updateQuantity(id, newQuantity) {
  const cart = getCart();
  const item = cart.find(item => item.id == id);
  if (item) {
    item.quantity = parseInt(newQuantity);
    if (item.quantity < 1) item.quantity = 1;
    saveCart(cart);
    renderCartPage();
  }
}

function clearCart() {
  saveCart([]);
  renderCartPage();
  showToast("Carrito vaciado");
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// --- UI UPDATES ---

function updateCartCount() {
  const count = getCartCount();
  const links = document.querySelectorAll(".cart-link");
  links.forEach(link => {
    link.textContent = `Carrito (${count})`;
  });
}

function showToast(message) {
  console.log("Toast:", message);
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  // Force reflow
  void toast.offsetWidth;

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// --- API FETCHING & RENDERING ---

async function fetchAndRenderProducts() {
  const productGrid = document.querySelector(".product-grid");
  if (!productGrid) return;

  productGrid.innerHTML = '<p style="text-align:center; width:100%;">Cargando productos...</p>';

  try {
    const response = await fetch(`${API_URL}/products`);
    console.log("Respuesta API:", response.status);

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const products = await response.json();
    console.log("Productos recibidos:", products);

    productGrid.innerHTML = "";

    if (products.length === 0) {
      productGrid.innerHTML = '<p style="text-align:center; width:100%;">No hay productos disponibles.</p>';
      return;
    }

    products.forEach(product => {
      const article = document.createElement("article");
      article.className = "product-card";
      article.dataset.id = product.id;
      article.dataset.name = product.name;
      article.dataset.price = product.price;
      article.dataset.image = product.image;

      article.innerHTML = `
        <div class="product-img-container">
          <img src="${product.image}" alt="${product.name}" class="product-img-real">
        </div>
        <h3>${product.name}</h3>
        <p class="price">${formatPrice(product.price)}</p>
        <button class="btn-secondary btn-add-cart">Agregar al carrito</button>
        <p class="tag-ml">${product.description || ''}</p>
      `;

      productGrid.appendChild(article);
    });

    // Configurar botones DESPUÉS de renderizar
    setupProductButtons();

  } catch (error) {
    console.error("Error fetch:", error);
    productGrid.innerHTML = `<p style="text-align:center; width:100%; color:red;">
      Error al cargar productos: ${error.message}.<br>
      Asegúrate de que el servidor (node server.js) esté corriendo.
    </p>`;
  }
}

function setupProductButtons() {
  console.log("Configurando botones de compra...");
  const buttons = document.querySelectorAll(".btn-add-cart");
  console.log(`Encontrados ${buttons.length} botones.`);

  buttons.forEach(btn => {
    // Usamos un atributo para evitar doble binding en lugar de clonar
    if (btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";

    btn.addEventListener("click", (e) => {
      e.preventDefault(); // Prevenir comportamientos default
      const card = e.target.closest(".product-card");

      if (!card) {
        console.error("No se encontró la tarjeta del producto");
        return;
      }

      console.log("Click en producto:", card.dataset.name);

      if (!card.dataset.id) {
        console.error("Producto sin ID");
        alert("Error: Este producto no tiene ID válido.");
        return;
      }

      const product = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseInt(card.dataset.price) || 0,
        image: card.dataset.image || 'images/protein.svg'
      };

      addToCart(product);
    });
  });
}

// --- PÁGINA DEL CARRITO ---

function renderCartPage() {
  const cartTableBody = document.querySelector(".cart-table tbody");
  const cartSummary = document.querySelector(".cart-summary");

  if (!cartTableBody) return;

  const cart = getCart();
  cartTableBody.innerHTML = "";

  if (cart.length === 0) {
    cartTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">Tu carrito está vacío. <a href="productos.html">Ir a comprar</a></td></tr>`;
    if (cartSummary) cartSummary.style.display = "none";
    return;
  }

  if (cartSummary) cartSummary.style.display = "block";

  cart.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; object-fit:contain; border-radius:4px;">
          <span>${item.name}</span>
        </div>
      </td>
      <td>
        <input type="number" min="1" value="${item.quantity}" class="qty-input" data-id="${item.id}">
      </td>
      <td>${formatPrice(item.price)}</td>
      <td>${formatPrice(item.price * item.quantity)}</td>
      <td><button class="btn-remove" data-id="${item.id}">X</button></td>
    `;
    cartTableBody.appendChild(row);
  });

  document.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("change", (e) => {
      updateQuantity(e.target.dataset.id, e.target.value);
    });
  });

  document.querySelectorAll(".btn-remove").forEach(btn => {
    btn.addEventListener("click", (e) => {
      removeFromCart(e.target.dataset.id);
    });
  });

  const subtotal = getCartTotal();
  const shipping = 4000;
  const total = subtotal + shipping;

  const summarySubtotal = document.querySelector(".summary-subtotal");
  const summaryTotal = document.querySelector(".summary-total");
  const checkoutTotalDisplay = document.querySelector(".checkout-total-display");

  if (summarySubtotal) summarySubtotal.textContent = formatPrice(subtotal);
  if (summaryTotal) summaryTotal.textContent = formatPrice(total);
  if (checkoutTotalDisplay) checkoutTotalDisplay.textContent = formatPrice(total);
}

function setupCartPage() {
  const clearBtn = document.querySelector(".btn-vaciar-carrito");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearCart);
  }
  renderCartPage();
}

// --- PÁGINA DE CHECKOUT ---

function setupCheckoutPage() {
  const checkoutForm = document.querySelector(".checkout-form form");
  if (!checkoutForm) return;

  const cartTotal = getCartTotal();
  const totalWithShipping = cartTotal + 4000;

  const totalDisplay = document.querySelector(".checkout-total-display");
  if (totalDisplay) {
    totalDisplay.textContent = formatPrice(totalWithShipping);
  }

  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = checkoutForm.querySelector("button[type='submit']");
    const originalText = btn.textContent;
    btn.textContent = "Procesando...";
    btn.disabled = true;

    const formData = new FormData(checkoutForm);
    const customerData = {};
    formData.forEach((value, key) => customerData[key] = value);

    const order = {
      customer: customerData,
      items: getCart(),
      total: totalWithShipping
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) throw new Error("Error al procesar la orden");

      const result = await response.json();

      alert(`¡Compra realizada con éxito! ID de orden: ${result.orderId}`);
      saveCart([]);
      window.location.href = "index.html";

    } catch (error) {
      console.error(error);
      alert("Hubo un error al procesar tu compra. Inténtalo nuevamente.");
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// --- INICIALIZACIÓN ---

document.addEventListener("DOMContentLoaded", () => {
  console.log("BodyForge: Inicializando...");
  updateCartText();

  const productGrid = document.querySelector(".product-grid");

  if (productGrid) {
    // Lógica simplificada: Si tiene el atributo dynamic O si está vacío (solo loading), cargamos.
    // Si tiene contenido (como en ofertas.html), solo configuramos botones.

    const isDynamic = productGrid.dataset.dynamic === "true";
    const isEmpty = productGrid.children.length <= 1; // Asumiendo que puede tener un <p> de loading

    if (isDynamic || isEmpty) {
      console.log("Cargando productos dinámicamente...");
      fetchAndRenderProducts();
    } else {
      console.log("Grid estático detectado. Configurando botones...");
      setupProductButtons();
    }
  } else {
    console.log("No se encontró grid de productos.");
  }

  setupCartPage();
  setupCheckoutPage();
});
