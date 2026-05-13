import { getApiErrorMessage } from "../../../../js/api";
import {
  clearCartData,
  createOrderFromCart,
  getCartData,
  removeFromCart,
  SHOP_STATE_CHANGED,
  updateCartQuantity,
} from "../../../../js/shop-state";

const openButton = document.getElementById("openCartBtn");
const modal = document.getElementById("cartModal");
const closeButton = document.getElementById("closeCartBtn");
const list = document.getElementById("cartList");
const footer = document.getElementById("cartFooter");

const FALLBACK_IMAGE = "./assets/img/products/tire_1.png";

let currentCart = null;
let orderMessage = "";

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(Number(value || 0));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getProductName(product) {
  return product.name || product.title || "Товар";
}

function getStockText(product) {
  if (Number(product.stock_quantity) > 0) {
    return `В наличии: ${product.stock_quantity} шт`;
  }

  if (product.stock_quantity === undefined || product.stock_quantity === null) {
    return "";
  }

  return "Нет в наличии";
}

function getMetaText(product) {
  return [product.category, product.brand, getStockText(product)]
    .filter(Boolean)
    .join(" · ");
}

function renderProductLink(product, content) {
  if (!product.slug) return content;

  return `<a href="product.html?slug=${encodeURIComponent(product.slug)}">${content}</a>`;
}

function getCartItems(cart) {
  return Array.isArray(cart && cart.items) ? cart.items : [];
}

function getCartTotal(cart) {
  if (cart && cart.total_price !== undefined && cart.total_price !== null) {
    return Number(cart.total_price);
  }

  return getCartItems(cart).reduce((sum, item) => {
    return sum + Number(item.product && item.product.price || 0) * Number(item.quantity || 0);
  }, 0);
}

function renderCartItem(item) {
  const product = item.product || {};
  const name = getProductName(product);
  const image = product.image_url || FALLBACK_IMAGE;
  const quantity = Number(item.quantity || 1);
  const itemTotal = Number(product.price || 0) * quantity;
  const meta = getMetaText(product);
  const description = product.description || "Описание пока не добавлено.";

  return `
    <article class="header-cart__item" data-product-id="${product.id}">
      <div class="header-cart__image">
        ${renderProductLink(
          product,
          `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}">`
        )}
      </div>

      <div class="header-cart__info">
        <h3 class="header-cart__name">
          ${renderProductLink(product, escapeHtml(name))}
        </h3>
        ${meta ? `<p class="header-cart__meta">${escapeHtml(meta)}</p>` : ""}
        <p class="header-cart__description">${escapeHtml(description)}</p>
      </div>

      <div class="header-cart__side">
        <p class="header-cart__price">${formatPrice(itemTotal)} грн.</p>
        <div class="header-cart__quantity">
          <button class="header-cart__qty-btn" type="button" data-action="decrease">-</button>
          <input
            class="header-cart__qty-input"
            type="number"
            min="1"
            value="${quantity}"
            data-id="${product.id}"
          >
          <button class="header-cart__qty-btn" type="button" data-action="increase">+</button>
        </div>
        <button class="header-cart__remove" type="button" data-id="${product.id}">
          Удалить
        </button>
      </div>
    </article>
  `;
}

function renderFooter(cart) {
  if (!footer) return;

  const items = getCartItems(cart);

  if (!items.length) {
    footer.classList.remove("isVisible");
    footer.innerHTML = "";
    return;
  }

  footer.classList.add("isVisible");
  footer.innerHTML = `
    <div>
      <p class="header-cart__total">Итого: ${formatPrice(getCartTotal(cart))} грн.</p>
      ${orderMessage ? `<p class="header-cart__order-message">${escapeHtml(orderMessage)}</p>` : ""}
    </div>
    <div class="header-cart__actions">
      <button class="header-cart__clear" type="button" id="clearCartBtn">Очистить</button>
      <button class="header-cart__checkout" type="button" id="checkoutCartBtn">Оформить заказ</button>
    </div>
  `;
}

function renderCart(cart) {
  if (!list) return;

  const items = getCartItems(cart);

  if (!items.length) {
    list.innerHTML = `
      ${orderMessage ? `<p class="header-cart__order-message">${escapeHtml(orderMessage)}</p>` : ""}
      <p class="header-cart__message">Корзина пока пустая.</p>
    `;
    renderFooter(cart);
    return;
  }

  list.innerHTML = items.map(renderCartItem).join("");
  renderFooter(cart);
}

async function loadCart() {
  if (!list) return;

  list.innerHTML = '<p class="header-cart__message">Загрузка корзины...</p>';
  if (footer) {
    footer.classList.remove("isVisible");
    footer.innerHTML = "";
  }

  try {
    currentCart = await getCartData();
    renderCart(currentCart);
  } catch (error) {
    console.error("Ошибка загрузки корзины:", error);
    list.innerHTML = `<p class="header-cart__message">${escapeHtml(getApiErrorMessage(error))}</p>`;
  }
}

function openLoginModal() {
  const navModal = document.querySelector(".nav-modal");
  if (!navModal) return;

  navModal.style.display = "block";
  document.body.style.overflowY = "hidden";
}

function openModal() {
  if (!modal) return;

  orderMessage = "";
  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflowY = "hidden";
  loadCart();
}

function closeModal() {
  if (!modal) return;

  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflowY = "visible";
}

function getItemQuantity(productId) {
  const item = getCartItems(currentCart).find((cartItem) => {
    return String(cartItem.product && cartItem.product.id) === String(productId);
  });

  return Number(item && item.quantity || 1);
}

async function setQuantity(productId, quantity, trigger) {
  if (trigger) trigger.disabled = true;

  try {
    orderMessage = "";
    await updateCartQuantity(productId, quantity);
    await loadCart();
  } finally {
    if (trigger) trigger.disabled = false;
  }
}

if (openButton && modal) {
  openButton.addEventListener("click", openModal);
}

if (closeButton) {
  closeButton.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && modal.style.display === "block") {
    closeModal();
  }
});

if (list) {
  list.addEventListener("click", async (event) => {
    const quantityButton = event.target.closest(".header-cart__qty-btn");
    const removeButton = event.target.closest(".header-cart__remove");

    try {
      if (quantityButton) {
        const item = quantityButton.closest(".header-cart__item");
        const productId = item && item.dataset.productId;
        const direction = quantityButton.dataset.action === "increase" ? 1 : -1;
        const quantity = Math.max(getItemQuantity(productId) + direction, 1);
        await setQuantity(productId, quantity, quantityButton);
      }

      if (removeButton) {
        removeButton.disabled = true;
        orderMessage = "";
        await removeFromCart(removeButton.dataset.id);
        await loadCart();
      }
    } catch (error) {
      console.error("Ошибка изменения корзины:", error);
      if (quantityButton) quantityButton.disabled = false;
      if (removeButton) removeButton.disabled = false;
      alert(getApiErrorMessage(error));
    }
  });

  list.addEventListener("change", async (event) => {
    const input = event.target.closest(".header-cart__qty-input");
    if (!input) return;

    const quantity = Math.max(Number(input.value || 1), 1);
    input.value = quantity;

    try {
      await setQuantity(input.dataset.id, quantity, input);
    } catch (error) {
      console.error("Ошибка изменения количества:", error);
      input.disabled = false;
      alert(getApiErrorMessage(error));
      await loadCart();
    }
  });
}

if (footer) {
  footer.addEventListener("click", async (event) => {
    const clearButton = event.target.closest("#clearCartBtn");
    const checkoutButton = event.target.closest("#checkoutCartBtn");

    try {
      if (clearButton) {
        clearButton.disabled = true;
        orderMessage = "";
        await clearCartData();
        await loadCart();
      }

      if (checkoutButton) {
        checkoutButton.disabled = true;
        const response = await createOrderFromCart();
        const orderId = response && response.order && response.order.id;
        orderMessage = orderId
          ? `Заказ №${orderId} создан.`
          : response && response.message
            ? response.message
            : "Заказ создан.";
        await loadCart();
      }
    } catch (error) {
      console.error("Ошибка оформления корзины:", error);
      if (clearButton) clearButton.disabled = false;
      if (checkoutButton) checkoutButton.disabled = false;
      alert(getApiErrorMessage(error));

      if (error.status === 401 || error.status === 403) {
        closeModal();
        openLoginModal();
      }
    }
  });
}

window.addEventListener(SHOP_STATE_CHANGED, () => {
  if (modal && modal.style.display === "block") {
    loadCart();
  }
});
