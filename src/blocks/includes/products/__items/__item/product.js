const productContainer = document.getElementById("productDetail");

const cartLabel = document.getElementById("cartLabel");
const compareLabel = document.getElementById("compareLabel");
const wishLabel = document.getElementById("wishLabel");

const API_BASE_URL = "http://127.0.0.1:8000";
const FALLBACK_IMAGE = "./assets/img/products/tire_1.png";

function safeParse(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch (error) {
    console.error(`Ошибка чтения ${key} из localStorage`, error);
    return {};
  }
}

function saveStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

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

function updateBadge(labelElement, count) {
  if (!labelElement) return;

  const textNode = labelElement.children[1];
  if (!textNode) return;

  textNode.textContent = count;
  labelElement.style.display = count > 0 ? "block" : "none";
}

function syncCounters() {
  const cartData = safeParse("cart");
  const compareData = safeParse("compare");
  const wishData = safeParse("wish");

  const cartCount = Object.values(cartData).reduce((sum, item) => {
    return sum + (item.qty || 0);
  }, 0);

  updateBadge(cartLabel, cartCount);
  updateBadge(compareLabel, Object.keys(compareData).length);
  updateBadge(wishLabel, Object.keys(wishData).length);
}

function isInStorage(key, productId) {
  const data = safeParse(key);
  return Object.prototype.hasOwnProperty.call(data, String(productId));
}

function addToStorage(key, product, increaseQty = false) {
  const data = safeParse(key);
  const id = String(product.id);

  if (data[id]) {
    if (increaseQty) {
      data[id].qty += 1;
    }
  } else {
    data[id] = {
      id: product.id,
      title: product.title,
      price: product.price,
      qty: 1
    };
  }

  saveStorage(key, data);
  syncCounters();
}

function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

function getImageUrl(product) {
  return product.image_url || FALLBACK_IMAGE;
}

function getStockText(product) {
  if (product.stock_quantity > 0) {
    return `В наличии: ${product.stock_quantity} шт`;
  }

  return "Нет в наличии";
}

function renderProductPage(product) {
  const imageUrl = getImageUrl(product);
  const oldPrice = product.old_price
    ? `
      <p class="product-detail__old-price">
        ${formatPrice(product.old_price)} грн.
      </p>
    `
    : "";

  const cartText = isInStorage("cart", product.id) ? "В корзине" : "Купить товар";
  const compareText = isInStorage("compare", product.id) ? "В сравнении" : "Сравнить";
  const wishText = isInStorage("wish", product.id) ? "В избранном" : "В избранное";

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
              class="btn product-detail__compare"
              data-id="${product.id}"
              data-title="${escapeHtml(product.name)}"
              data-price="${product.price}"
            >
              ${compareText}
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
    </div>
  `;
}

async function loadProduct() {
  if (!productContainer) return;

  const slug = getSlugFromUrl();

  if (!slug) {
    productContainer.innerHTML = "<p>Slug товара не найден в URL.</p>";
    return;
  }

  productContainer.innerHTML = "<p>Загрузка товара...</p>";

  try {
    const response = await fetch(
      `${API_BASE_URL}/products/slug/${encodeURIComponent(slug)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        productContainer.innerHTML = "<p>Товар не найден.</p>";
        return;
      }

      throw new Error(`HTTP ${response.status}`);
    }

    const product = await response.json();
    productContainer.innerHTML = renderProductPage(product);
  } catch (error) {
    console.error("Ошибка загрузки товара:", error);
    productContainer.innerHTML = "<p>Не удалось загрузить товар.</p>";
  }
}

document.addEventListener("click", function(event) {
  const buyButton = event.target.closest(".product-detail__buy");
  const compareButton = event.target.closest(".product-detail__compare");
  const wishButton = event.target.closest(".product-detail__wish");

  if (buyButton) {
    addToStorage(
      "cart",
      {
        id: buyButton.dataset.id,
        title: buyButton.dataset.title,
        price: Number(buyButton.dataset.price)
      },
      true
    );

    buyButton.textContent = "В корзине";
  }

  if (compareButton) {
    addToStorage("compare", {
      id: compareButton.dataset.id,
      title: compareButton.dataset.title,
      price: Number(compareButton.dataset.price)
    });

    compareButton.textContent = "В сравнении";
  }

  if (wishButton) {
    addToStorage("wish", {
      id: wishButton.dataset.id,
      title: wishButton.dataset.title,
      price: Number(wishButton.dataset.price)
    });

    wishButton.textContent = "В избранном";
  }
});

window.addEventListener("load", async function() {
  syncCounters();
  await loadProduct();
});