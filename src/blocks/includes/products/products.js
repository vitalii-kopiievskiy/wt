import { getApiErrorMessage, ordersApi, productsApi } from "../../../js/api";
import {
  addToCart,
  addToWish,
  getShopState,
  SHOP_STATE_CHANGED,
  syncHeaderCounters,
} from "../../../js/shop-state";

const productsContainer = document.getElementById("productsList");
const filterForm = document.getElementById("tabForm");
const searchForm = document.querySelector(".search-form");
const searchFormInput = document.querySelector(".search-form__input");
const clearTabButton = document.getElementById("clearTabButton");

const FALLBACK_IMAGE = "./assets/img/products/tire_1.png";
const DEFAULT_LIMIT = 20;

let currentState = null;
let currentProducts = [];
let syncingControls = false;

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

function getControlValue(name) {
  const fields = Array.from(document.querySelectorAll(`[name="${name}"]`));
  const activeField = fields.find((field) => field.value);
  return activeField ? activeField.value : "";
}

function setControlValue(name, value) {
  document.querySelectorAll(`[name="${name}"]`).forEach((field) => {
    field.value = value || "";
    field.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function syncNamedControls(name, source) {
  if (syncingControls) return;

  syncingControls = true;

  document.querySelectorAll(`[name="${name}"]`).forEach((field) => {
    if (field !== source) {
      field.value = source.value;
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });

  syncingControls = false;
}

function setUrlParams(params) {
  const url = new URL(window.location.href);

  Array.from(url.searchParams.keys()).forEach((key) => {
    if (
      [
        "category",
        "brand",
        "in_stock",
        "sort_by",
        "sort_order",
        "min_price",
        "max_price",
        "q",
      ].includes(key)
    ) {
      url.searchParams.delete(key);
    }
  });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  window.history.replaceState({}, "", url);
}

function getCatalogParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {
    limit: DEFAULT_LIMIT,
    offset: 0,
  };

  [
    "category",
    "brand",
    "in_stock",
    "sort_by",
    "sort_order",
    "min_price",
    "max_price",
  ].forEach((key) => {
    const value = params.get(key);
    if (value) result[key] = value;
  });

  const query = params.get("q");
  if (query) {
    result.q = query;
    result.limit = 100;
  }

  return result;
}

function getBackendParams(params) {
  const { q, ...backendParams } = params;
  return backendParams;
}

function productMatchesQuery(product, query) {
  if (!query) return true;

  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [
    product.name,
    product.description,
    product.brand,
    product.category,
  ].some((value) => String(value || "").toLowerCase().includes(normalized));
}

function getImageUrl(product) {
  return product.image_url || FALLBACK_IMAGE;
}

function getFeedbackText(product) {
  if (Number(product.stock_quantity) > 0) {
    return `В наличии: ${product.stock_quantity} шт`;
  }

  return "Нет в наличии";
}

function getCurrentProduct(productId) {
  return currentProducts.find((product) => String(product.id) === String(productId));
}

function getOrderedQuantity(response, productId, fallback = 1) {
  const items =
    response && response.order && Array.isArray(response.order.items)
      ? response.order.items
      : [];
  const item = items.find((orderItem) => String(orderItem.product_id) === String(productId));
  const quantity = Number(item && item.quantity);

  return Number.isFinite(quantity) && quantity > 0 ? quantity : fallback;
}

function decreaseRenderedStock(productId, quantity = 1) {
  const product = getCurrentProduct(productId);
  if (!product) return;

  const currentStock = Number(product.stock_quantity || 0);
  product.stock_quantity = Math.max(currentStock - Number(quantity || 1), 0);

  const item = Array.from(document.querySelectorAll(".products__item")).find(
    (card) => String(card.dataset.productId) === String(productId)
  );
  if (!item) return;

  const feedback = item.querySelector(".desc__feedback");
  if (feedback) {
    feedback.textContent = getFeedbackText(product);
  }

  const content = item.querySelector(".products__content");
  const existingStickers = item.querySelector(".products__stickers");
  if (existingStickers) {
    existingStickers.remove();
  }

  if (content) {
    const stickers = renderStickers(product);
    if (stickers) {
      content.insertAdjacentHTML("beforeend", stickers);
    }
  }
}

function waitForNextFrame() {
  return new Promise((resolve) => {
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(resolve);
      return;
    }

    window.setTimeout(resolve, 0);
  });
}

function makeSnapshotFromDataset(element) {
  return {
    id: Number(element.dataset.id),
    title: element.dataset.title,
    price: Number(element.dataset.price),
    qty: 1,
  };
}

function renderRating(productId) {
  let html = "";

  for (let i = 0; i < 5; i += 1) {
    html += `
      <input class="rat__input" type="radio" name="rating_${productId}" id="r${productId}_${i}">
      <label class="rat__label" for="r${productId}_${i}">
        <i class="fas fa-star"></i>
      </label>
    `;
  }

  return html;
}

function renderLabels(product) {
  const labels = [];

  if (product.category) {
    labels.push(`
      <div class="products__label">
        <img class="label__icon" src="./assets/img/products/label_icon.svg" alt="label icon">
        <span class="label__title">${escapeHtml(product.category)}</span>
      </div>
    `);
  }

  if (product.brand) {
    labels.push(`
      <div class="products__label">
        <img class="label__icon" src="./assets/img/products/car_icon.svg" alt="car icon">
        <span class="label__title">${escapeHtml(product.brand)}</span>
      </div>
    `);
  }

  if (!labels.length) {
    labels.push(`
      <div class="products__label">
        <img class="label__icon" src="./assets/img/products/label_icon.svg" alt="label icon">
        <span class="label__title">Товар</span>
      </div>
    `);
  }

  return labels.join("");
}

function renderStickers(product) {
  const stickers = [];

  if (product.old_price && Number(product.old_price) > Number(product.price)) {
    stickers.push(`
      <div class="sticker products__sticker">
        <span class="sticker__title sticker__title-disc">Скидка</span>
      </div>
    `);
  }

  if (Number(product.stock_quantity) > 0) {
    stickers.push(`
      <div class="sticker products__sticker">
        <span class="sticker__title sticker__title-hit">В наличии</span>
      </div>
    `);
  }

  if (!stickers.length) return "";

  return `<div class="products__stickers">${stickers.join("")}</div>`;
}

function renderProductCard(product, state) {
  const imageUrl = getImageUrl(product);
  const productId = String(product.id);
  const disablePrice = product.old_price
    ? `<p class="products__price products__price--disable">${formatPrice(product.old_price)} грн.</p>`
    : "";

  const cartText = state.cartIds.has(productId) ? "В корзине" : "В корзину";
  const wishText = state.wishIds.has(productId)
    ? "В избранном"
    : "В избранное";

  return `
    <div class="products__item" data-product-id="${product.id}">
      <span class="products__marker"></span>

      <div class="products__caption">
        <h2 class="products__title">
          <a href="product.html?slug=${encodeURIComponent(product.slug)}">
            ${escapeHtml(product.name)}
          </a>
        </h2>
        ${product.description ? `<p class="products__subtitle">${escapeHtml(product.description)}</p>` : ""}
      </div>

      <div class="products__description desc">
        <div class="desc__rating rat">
          ${renderRating(product.id)}
        </div>
        <a href="#" class="desc__feedback prevent-link">${escapeHtml(getFeedbackText(product))}</a>
        <span class="desc__exist">${product.brand ? escapeHtml(product.brand) : ""}</span>
      </div>

      <div class="products__content">
        <div class="products__block">
          <div class="products__labels">
            ${renderLabels(product)}
          </div>

          <div class="products__image">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}">
          </div>
        </div>

        ${renderStickers(product)}
      </div>

      <div class="products__prices">
        <p class="products__price products__price--active">
          ${formatPrice(product.price)}
          <span class="products__price--desc"> грн.</span>
        </p>
        ${disablePrice}
      </div>

      <button
        class="btn products__btn"
        data-id="${product.id}"
        data-title="${escapeHtml(product.name)}"
        data-price="${product.price}"
      >
        <img class="products__btn-img" src="./assets/img/products/basket_icon.svg" alt="basket icon">
        <span class="products__btn-txt">${cartText}</span>
      </button>

      <ul class="products-add">
        <li class="products-add__item">
          <div
            class="products-add__btn products-buy-link"
            data-id="${product.id}"
            data-title="${escapeHtml(product.name)}"
            data-price="${product.price}"
          >
            <img class="products-add__icon" src="./assets/img/products/basket_icon.svg" alt="basket icon">
            <span class="products-add__text">Купить товар</span>
          </div>
        </li>

        <li class="products-add__item">
          <div
            class="products-add__btn products-wishlist"
            data-id="${product.id}"
            data-title="${escapeHtml(product.name)}"
            data-price="${product.price}"
          >
            <img class="products-add__icon" src="./assets/img/products/wishlist_icon.svg" alt="wishlist icon">
            <span class="products-add__text">${wishText}</span>
          </div>
        </li>
      </ul>
    </div>
  `;
}

function renderProducts(products, total, state) {
  if (!products.length) {
    productsContainer.innerHTML = "<p class=\"products__message\">Товары не найдены.</p>";
    return;
  }

  const countText = `
    <p class="products__message">
      Показано ${products.length} из ${total} товаров
    </p>
  `;

  productsContainer.innerHTML =
    countText + products.map((product) => renderProductCard(product, state)).join("");
}

async function loadProducts(params = getCatalogParams()) {
  if (!productsContainer) return;

  productsContainer.innerHTML = "<p class=\"products__message\">Загрузка товаров...</p>";

  try {
    const [response, state] = await Promise.all([
      productsApi.list(getBackendParams(params)),
      getShopState(),
    ]);

    currentState = state;
    currentProducts = Array.isArray(response.items) ? response.items : [];

    const products = currentProducts.filter((product) =>
      productMatchesQuery(product, params.q)
    );

    renderProducts(products, response.total || products.length, state);
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
    productsContainer.innerHTML = `<p class="products__message">${escapeHtml(getApiErrorMessage(error))}</p>`;
  }
}

function makeOption(value, text) {
  return {
    value,
    text,
  };
}

function updateCustomSelect(select) {
  const wrapper = select.closest(".tab__selects") || select.closest(".search__selects");
  if (!wrapper) return;

  const trigger = wrapper.querySelector(".tab__trigger, .search__trigger");
  const option = select.options[select.selectedIndex];

  if (trigger && option) {
    trigger.textContent = option.textContent;
  }

  wrapper
    .querySelectorAll(".tab__option, .search__option")
    .forEach((item) => {
      item.classList.toggle("isActive", item.dataset.value === select.value);
    });
}

function fillSelect(name, options) {
  document.querySelectorAll(`[name="${name}"]`).forEach((select) => {
    const placeholder = select.dataset.placeholder || "Все";
    const currentValue = select.value || new URLSearchParams(window.location.search).get(name) || "";
    const wrapper = select.closest(".tab__selects") || select.closest(".search__selects");
    const optionContainer = wrapper
      ? wrapper.querySelector(".tab__options, .search__options")
      : null;

    select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;

    options.forEach((option) => {
      const item = document.createElement("option");
      item.value = option.value;
      item.textContent = option.text;
      select.appendChild(item);
    });

    if (optionContainer) {
      optionContainer.innerHTML = options
        .map(
          (option) =>
            `<div class="${optionContainer.classList.contains("search__options") ? "search__option" : "tab__option"}" data-value="${escapeHtml(option.value)}">${escapeHtml(option.text)}</div>`
        )
        .join("");
    }

    select.value = Array.from(select.options).some((option) => option.value === currentValue)
      ? currentValue
      : "";
    updateCustomSelect(select);
  });
}

async function loadFilters() {
  if (!filterForm && !searchForm) return;

  try {
    const filters = await productsApi.filters();
    const categories = (filters.categories || []).map((item) => makeOption(item, item));
    const brands = (filters.brands || []).map((item) => makeOption(item, item));

    fillSelect("category", categories);
    fillSelect("brand", brands);
    fillSelect("in_stock", [
      makeOption("true", "В наличии"),
      makeOption("false", "Нет в наличии"),
    ]);
    fillSelect("sort_by", [
      makeOption("newest", "Новинки"),
      makeOption("price", "Цена"),
      makeOption("name", "Название"),
    ]);
    fillSelect("sort_order", [
      makeOption("desc", "По убыванию"),
      makeOption("asc", "По возрастанию"),
    ]);

    const priceRange = filters.price_range || {};
    const startPrice = document.getElementById("startPrice");
    const endPrice = document.getElementById("endPrice");

    if (startPrice && priceRange.min_price !== null) {
      startPrice.placeholder = Math.floor(Number(priceRange.min_price));
    }

    if (endPrice && priceRange.max_price !== null) {
      endPrice.placeholder = Math.ceil(Number(priceRange.max_price));
    }

    document.dispatchEvent(new Event("catalog:selects-updated"));
  } catch (error) {
    console.error("Ошибка загрузки фильтров:", error);
  }
}

function applyUrlStateToControls() {
  const params = new URLSearchParams(window.location.search);

  [
    "category",
    "brand",
    "in_stock",
    "sort_by",
    "sort_order",
    "min_price",
    "max_price",
  ].forEach((key) => setControlValue(key, params.get(key) || ""));

  if (searchFormInput) {
    searchFormInput.value = params.get("q") || "";
  }
}

function collectFormParams() {
  const params = {};

  [
    "category",
    "brand",
    "in_stock",
    "sort_by",
    "sort_order",
    "min_price",
    "max_price",
  ].forEach((key) => {
    const value = getControlValue(key);
    if (value) params[key] = value;
  });

  const query = searchFormInput ? searchFormInput.value.trim() : "";
  if (query) params.q = query;

  return params;
}

function initCatalogForms() {
  if (filterForm) {
    filterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (filterForm.querySelector(".invalid")) return;
      const params = collectFormParams();
      setUrlParams(params);
      loadProducts(getCatalogParams());
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (searchFormInput && searchFormInput.value.trim().length === 1) {
        return;
      }

      const params = collectFormParams();
      setUrlParams(params);
      loadProducts(getCatalogParams());
    });
  }

  if (clearTabButton) {
    clearTabButton.addEventListener("click", () => {
      window.setTimeout(() => {
        setUrlParams({});
        applyUrlStateToControls();
        loadProducts(getCatalogParams());
      }, 0);
    });
  }

  document.querySelectorAll('[name="category"]').forEach((field) => {
    field.addEventListener("change", () => syncNamedControls("category", field));
  });
}

function updateRenderedButtons(state) {
  currentState = state;

  document.querySelectorAll(".products__item").forEach((item) => {
    const id = String(item.dataset.productId);
    const buyText = item.querySelector(".products__btn-txt");
    const wishText = item.querySelector(".products-wishlist .products-add__text");

    if (buyText) buyText.textContent = state.cartIds.has(id) ? "В корзине" : "В корзину";
    if (wishText) wishText.textContent = state.wishIds.has(id) ? "В избранном" : "В избранное";
  });
}

async function buyNow(product, trigger) {
  if (trigger.classList.contains("isLoading")) return;

  const textNode = trigger.querySelector(".products-add__text");
  const previousText = textNode ? textNode.textContent : "";

  trigger.classList.add("isLoading");
  if (textNode) textNode.textContent = "Оформление...";

  try {
    const response = await ordersApi.buyNow(product.id, 1);
    decreaseRenderedStock(product.id, getOrderedQuantity(response, product.id, 1));
    await waitForNextFrame();
    alert(response && response.message ? response.message : "Заказ создан");
  } finally {
    trigger.classList.remove("isLoading");
    if (textNode) textNode.textContent = previousText || "Купить товар";
  }
}

document.addEventListener("click", async function(event) {
  const buyButton = event.target.closest(".products__btn");
  const buyLinkButton = event.target.closest(".products-buy-link");
  const wishButton = event.target.closest(".products-wishlist");

  try {
    if (buyButton) {
      buyButton.disabled = true;
      const state = await addToCart(makeSnapshotFromDataset(buyButton));
      updateRenderedButtons(state);
      buyButton.disabled = false;
    }

    if (buyLinkButton) {
      await buyNow(makeSnapshotFromDataset(buyLinkButton), buyLinkButton);
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
  if (event.detail && currentProducts.length) {
    updateRenderedButtons(event.detail);
  }
});

window.addEventListener("load", async function() {
  await syncHeaderCounters();
  initCatalogForms();
  await loadFilters();
  applyUrlStateToControls();
  await loadProducts();
});
