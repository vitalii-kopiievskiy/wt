const productsContainer = document.querySelector(".products__items");

const cartLabel = document.getElementById("cartLabel");
const compareLabel = document.getElementById("compareLabel");
const wishLabel = document.getElementById("wishLabel");

const API_BASE_URL = "http://127.0.0.1:8000";
const PRODUCTS_URL = `${API_BASE_URL}/products/?only_active=true&limit=20`;

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

  const compareCount = Object.keys(compareData).length;
  const wishCount = Object.keys(wishData).length;

  updateBadge(cartLabel, cartCount);
  updateBadge(compareLabel, compareCount);
  updateBadge(wishLabel, wishCount);
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

  if (product.stock_quantity > 0) {
    stickers.push(`
      <div class="sticker products__sticker">
        <span class="sticker__title sticker__title-hit">В наличии</span>
      </div>
    `);
  }

  if (!stickers.length) {
    return "";
  }

  return `<div class="products__stickers">${stickers.join("")}</div>`;
}

function getImageUrl(product) {
  if (!product.image_url) {
    return FALLBACK_IMAGE;
  }

  return product.image_url;
}

function getFeedbackText(product) {
  if (product.stock_quantity > 0) {
    return `В наличии: ${product.stock_quantity} шт`;
  }

  return "Нет в наличии";
}

function renderProductCard(product) {
  const imageUrl = getImageUrl(product);
  const disablePrice = product.old_price
    ? `<p class="products__price products__price--disable">${formatPrice(product.old_price)} грн.</p>`
    : "";

  const cartText = isInStorage("cart", product.id) ? "В корзине" : "Купить товар";
  const compareText = isInStorage("compare", product.id) ? "В сравнении" : "Сравнить товар";
  const wishText = isInStorage("wish", product.id) ? "В избранном" : "В избранное";

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
            class="products-add__btn products-compare"
            data-id="${product.id}"
            data-title="${escapeHtml(product.name)}"
            data-price="${product.price}"
          >
            <img class="products-add__icon" src="./assets/img/products/compare_icon.svg" alt="compare icon">
            <span class="products-add__text">${compareText}</span>
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

async function loadProducts() {
  if (!productsContainer) return;

  productsContainer.innerHTML = "<p>Загрузка товаров...</p>";

  try {
    const response = await fetch(PRODUCTS_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const products = await response.json();

    if (!Array.isArray(products) || products.length === 0) {
      productsContainer.innerHTML = "<p>Товары пока не добавлены.</p>";
      return;
    }

    productsContainer.innerHTML = products.map(renderProductCard).join("");
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
    productsContainer.innerHTML = "<p>Не удалось загрузить товары.</p>";
  }
}

document.addEventListener("click", function(event) {
  const buyButton = event.target.closest(".products__btn");
  const compareButton = event.target.closest(".products-compare");
  const wishButton = event.target.closest(".products-wishlist");

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

    const textNode = buyButton.querySelector(".products__btn-txt");
    if (textNode) {
      textNode.textContent = "В корзине";
    }
  }

  if (compareButton) {
    addToStorage("compare", {
      id: compareButton.dataset.id,
      title: compareButton.dataset.title,
      price: Number(compareButton.dataset.price)
    });

    const textNode = compareButton.querySelector(".products-add__text");
    if (textNode) {
      textNode.textContent = "В сравнении";
    }
  }

  if (wishButton) {
    addToStorage("wish", {
      id: wishButton.dataset.id,
      title: wishButton.dataset.title,
      price: Number(wishButton.dataset.price)
    });

    const textNode = wishButton.querySelector(".products-add__text");
    if (textNode) {
      textNode.textContent = "В избранном";
    }
  }
});

window.addEventListener("load", async function() {
  syncCounters();
  await loadProducts();
});