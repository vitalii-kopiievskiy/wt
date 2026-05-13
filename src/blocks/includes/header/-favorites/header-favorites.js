import { getApiErrorMessage } from "../../../../js/api";
import {
  getWishProducts,
  removeFromWish,
} from "../../../../js/shop-state";

const openButton = document.getElementById("openFavoritesBtn");
const modal = document.getElementById("favoritesModal");
const closeButton = document.getElementById("closeFavoritesBtn");
const list = document.getElementById("favoritesList");

const FALLBACK_IMAGE = "./assets/img/products/tire_1.png";

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

function renderFavoriteItem(product) {
  const name = getProductName(product);
  const image = product.image_url || FALLBACK_IMAGE;
  const description = product.description || "Описание пока не добавлено.";
  const meta = getMetaText(product);

  return `
    <article class="header-favorites__item" data-product-id="${product.id}">
      <div class="header-favorites__image">
        ${renderProductLink(
          product,
          `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}">`
        )}
      </div>

      <div class="header-favorites__info">
        <h3 class="header-favorites__name">
          ${renderProductLink(product, escapeHtml(name))}
        </h3>
        ${meta ? `<p class="header-favorites__meta">${escapeHtml(meta)}</p>` : ""}
        <p class="header-favorites__description">${escapeHtml(description)}</p>
        <p class="header-favorites__price">${formatPrice(product.price)} грн.</p>
        <button
          class="header-favorites__remove"
          type="button"
          data-id="${product.id}"
        >
          Удалить
        </button>
      </div>
    </article>
  `;
}

function renderFavorites(products) {
  if (!list) return;

  if (!products.length) {
    list.innerHTML = '<p class="header-favorites__message">В избранном пока нет товаров.</p>';
    return;
  }

  list.innerHTML = products.map(renderFavoriteItem).join("");
}

async function loadFavorites() {
  if (!list) return;

  list.innerHTML = '<p class="header-favorites__message">Загрузка избранного...</p>';

  try {
    renderFavorites(await getWishProducts());
  } catch (error) {
    console.error("Ошибка загрузки избранного:", error);
    list.innerHTML = `<p class="header-favorites__message">${escapeHtml(getApiErrorMessage(error))}</p>`;
  }
}

function openModal() {
  if (!modal) return;

  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflowY = "hidden";
  loadFavorites();
}

function closeModal() {
  if (!modal) return;

  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflowY = "visible";
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
    const removeButton = event.target.closest(".header-favorites__remove");
    if (!removeButton) return;

    removeButton.disabled = true;

    try {
      await removeFromWish(removeButton.dataset.id);
      await loadFavorites();
    } catch (error) {
      console.error("Ошибка удаления из избранного:", error);
      removeButton.disabled = false;
      alert(getApiErrorMessage(error));
    }
  });
}
