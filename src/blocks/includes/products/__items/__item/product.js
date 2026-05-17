import { getApiErrorMessage, productsApi } from "../../../../../js/api";
import {
  addToCart,
  addToWish,
  getShopState,
  SHOP_STATE_CHANGED,
  syncHeaderCounters,
} from "../../../../../js/shop-state";

const productContainer = document.getElementById("productDetail");
const FALLBACK_IMAGE = "./assets/img/products/tire_1.png";

let currentProduct = null;
let currentState = null;

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

function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

function getImageUrl(product) {
  return product.image_url || FALLBACK_IMAGE;
}

function getStockText(product) {
  if (Number(product.stock_quantity) > 0) {
    return `В наличии: ${product.stock_quantity} шт`;
  }

  return "Нет в наличии";
}

function makeSnapshotFromDataset(element) {
  return {
    id: Number(element.dataset.id),
    title: element.dataset.title,
    price: Number(element.dataset.price),
    qty: 1,
  };
}

function renderProductPage(product, state) {
  const imageUrl = getImageUrl(product);
  const productId = String(product.id);
  const oldPrice = product.old_price
    ? `
      <p class="product-detail__old-price">
        ${formatPrice(product.old_price)} грн.
      </p>
    `
    : "";

  const cartText = state.cartIds.has(productId) ? "В корзине" : "В корзину";
  const wishText = state.wishIds.has(productId) ? "В избранном" : "В избранное";

  document.title = product.name;

  return `
    <div class="product-detail" data-product-id="${product.id}">
      <div class="product-detail__top">
        <div class="product-detail__image">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}">
        </div>

        <div class="product-detail__info">
          <p class="product-detail__category">${escapeHtml(product.category || "Товар")}</p>
          <h1 class="product-detail__title">${escapeHtml(product.name)}</h1>

          ${
            product.brand
              ? `<p class="product-detail__brand">Бренд: ${escapeHtml(product.brand)}</p>`
              : ""
          }

          <p class="product-detail__stock">${escapeHtml(getStockText(product))}</p>

          <div class="product-detail__prices">
            <p class="product-detail__price">${formatPrice(product.price)} грн.</p>
            ${oldPrice}
          </div>

          <div class="product-detail__actions">
            <button
              class="btn product-detail__buy"
              data-id="${product.id}"
              data-title="${escapeHtml(product.name)}"
              data-price="${product.price}"
            >
              ${cartText}
            </button>

            <button
              class="btn product-detail__wish"
              data-id="${product.id}"
              data-title="${escapeHtml(product.name)}"
              data-price="${product.price}"
            >
              ${wishText}
            </button>
          </div>
        </div>
      </div>

      <div class="product-detail__content">
        <h2 class="product-detail__subtitle">Описание</h2>
        <p class="product-detail__description">
          ${escapeHtml(product.description || "Описание пока не добавлено.")}
        </p>
      </div>

      <a class="product-detail__back" href="index.html">Вернуться в каталог</a>
    </div>
  `;
}

function updateRenderedButtons(state) {
  currentState = state;
  const detail = document.querySelector(".product-detail");
  if (!detail) return;

  const id = String(detail.dataset.productId);
  const buyButton = detail.querySelector(".product-detail__buy");
  const wishButton = detail.querySelector(".product-detail__wish");

  if (buyButton) {
    buyButton.textContent = state.cartIds.has(id) ? "В корзине" : "В корзину";
  }

  if (wishButton) {
    wishButton.textContent = state.wishIds.has(id) ? "В избранном" : "В избранное";
  }
}

async function loadProduct() {
  if (!productContainer) return;

  const slug = getSlugFromUrl();

  if (!slug) {
    productContainer.innerHTML = "<p class=\"product-detail__message\">Slug товара не найден в URL.</p>";
    return;
  }

  productContainer.innerHTML = "<p class=\"product-detail__message\">Загрузка товара...</p>";

  try {
    const [product, state] = await Promise.all([
      productsApi.bySlug(slug),
      getShopState(),
    ]);

    currentProduct = product;
    currentState = state;
    productContainer.innerHTML = renderProductPage(product, state);
  } catch (error) {
    console.error("Ошибка загрузки товара:", error);
    productContainer.innerHTML = `<p class="product-detail__message">${escapeHtml(getApiErrorMessage(error))}</p>`;
  }
}

document.addEventListener("click", async function(event) {
  const buyButton = event.target.closest(".product-detail__buy");
  const wishButton = event.target.closest(".product-detail__wish");

  try {
    if (buyButton) {
      buyButton.disabled = true;
      const state = await addToCart(makeSnapshotFromDataset(buyButton));
      updateRenderedButtons(state);
      buyButton.disabled = false;
    }

    if (wishButton) {
      const state = await addToWish(makeSnapshotFromDataset(wishButton));
      updateRenderedButtons(state);
    }
  } catch (error) {
    console.error("Ошибка действия с товаром:", error);
    if (buyButton) buyButton.disabled = false;
    alert(getApiErrorMessage(error));
  }
});

window.addEventListener(SHOP_STATE_CHANGED, (event) => {
  if (event.detail && currentProduct) {
    updateRenderedButtons(event.detail);
  }
});

window.addEventListener("load", async function() {
  if (!productContainer) return;

  await syncHeaderCounters();
  await loadProduct();
});
