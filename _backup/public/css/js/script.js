// script.js
// Carrito muy simple usando localStorage para contar productos.

const CART_KEY = "bodyforge_cart_count";

// Obtener cantidad actual
function getCartCount() {
  const value = localStorage.getItem(CART_KEY);
  return value ? parseInt(value, 10) : 0;
}

// Guardar cantidad
function setCartCount(count) {
  localStorage.setItem(CART_KEY, String(count));
}

// Actualizar texto "Carrito (N)" en todos los menús
function updateCartText() {
  const count = getCartCount();
  const links = document.querySelectorAll(".cart-link");
  links.forEach((link) => {
    link.textContent = `Carrito (${count})`;
  });
}

// Configurar botones "Agregar al carrito"
function setupAddToCartButtons() {
  const buttons = document.querySelectorAll(".btn-add-cart");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      let count = getCartCount();
      count += 1;
      setCartCount(count);
      updateCartText();

      // Feedback visual
      const originalText = btn.textContent;
      btn.textContent = "Añadido ✔";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 1000);
    });
  });
}

// Configurar botón "Vaciar carrito" en carrito.html
function setupClearCartButton() {
  const clearBtn = document.querySelector(".btn-vaciar-carrito");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", () => {
    setCartCount(0);
    updateCartText();
    alert("Carrito vaciado (simulado).");

    // Opcional: limpiar filas de la tabla visualmente
    const tbody = document.querySelector(".cart-table tbody");
    if (tbody) {
      tbody.innerHTML = "";
    }
  });
}

// Configurar botones "X" para eliminar (simulado: vacía el carrito completo)
function setupRemoveButtons() {
  const removeButtons = document.querySelectorAll(".btn-remove");
  if (!removeButtons.length) return;

  removeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // En un sistema real se eliminaría solo ese ítem.
      // Para el mockup, simplificamos: dejamos el carrito en 0.
      setCartCount(0);
      updateCartText();

      // Eliminar visualmente la fila
      const row = btn.closest("tr");
      if (row) row.remove();
    });
  });
}

// Inicializar cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
  updateCartText();
  setupAddToCartButtons();
  setupClearCartButton();
  setupRemoveButtons();
});
