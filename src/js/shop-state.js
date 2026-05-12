import {
  cartApi,
  favoritesApi,
  getAuthToken,
  setAuthToken,
} from "./api";

const CART_KEY = "cart";
const COMPARE_KEY = "compare";
const WISH_KEY = "wish";

export const SHOP_STATE_CHANGED = "shop-state-changed";

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

function makeLocalProduct(product) {
  return {
    id: Number(product.id),
    title: product.title || product.name,
    price: Number(product.price || 0),
    qty: Number(product.qty || 1),
  };
}

function addLocalItem(key, product, increaseQty = false) {
  const data = safeParse(key);
  const item = makeLocalProduct(product);
  const id = String(item.id);

  if (data[id]) {
    if (increaseQty) {
      data[id].qty = Number(data[id].qty || 0) + item.qty;
    }
  } else {
    data[id] = item;
  }

  saveStorage(key, data);
  return data;
}

function getLocalCartCount() {
  return Object.values(safeParse(CART_KEY)).reduce((sum, item) => {
    return sum + Number(item.qty || 0);
  }, 0);
}

function getLocalIds(key) {
  return Object.keys(safeParse(key));
}

function createState({
  cartCount = getLocalCartCount(),
  cartIds = getLocalIds(CART_KEY),
  compareIds = getLocalIds(COMPARE_KEY),
  wishIds = getLocalIds(WISH_KEY),
} = {}) {
  return {
    cartCount,
    compareCount: compareIds.length,
    wishCount: wishIds.length,
    cartIds: new Set(cartIds.map(String)),
    compareIds: new Set(compareIds.map(String)),
    wishIds: new Set(wishIds.map(String)),
  };
}

function stateFromServer(cart, favorites) {
  const cartItems = Array.isArray(cart && cart.items) ? cart.items : [];
  const favoriteItems = Array.isArray(favorites) ? favorites : [];

  return createState({
    cartCount:
      cart && Number.isFinite(Number(cart.total_items))
        ? Number(cart.total_items)
        : cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    cartIds: cartItems
      .map((item) => item.product && item.product.id)
      .filter(Boolean),
    compareIds: getLocalIds(COMPARE_KEY),
    wishIds: favoriteItems
      .map((item) => item.product && item.product.id)
      .filter(Boolean),
  });
}

export function updateBadge(labelElement, count) {
  if (!labelElement) return;

  const textNode = labelElement.children[1];
  if (!textNode) return;

  textNode.textContent = count;
  labelElement.style.display = count > 0 ? "block" : "none";
}

export function updateHeaderCounters(state) {
  updateBadge(document.getElementById("cartLabel"), state.cartCount);
  updateBadge(document.getElementById("compareLabel"), state.compareCount);
  updateBadge(document.getElementById("wishLabel"), state.wishCount);
}

export function emitShopStateChanged(state) {
  window.dispatchEvent(
    new CustomEvent(SHOP_STATE_CHANGED, {
      detail: state,
    })
  );
}

async function fetchServerState() {
  const [cart, favorites] = await Promise.all([
    cartApi.get(),
    favoritesApi.get(),
  ]);

  return stateFromServer(cart, favorites);
}

export async function getShopState() {
  if (!getAuthToken()) {
    return createState();
  }

  try {
    return await fetchServerState();
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      setAuthToken(null);
    } else {
      console.error("Ошибка синхронизации состояния магазина", error);
    }

    return createState();
  }
}

export async function syncHeaderCounters() {
  const state = await getShopState();
  updateHeaderCounters(state);
  emitShopStateChanged(state);
  return state;
}

export async function addToCart(product) {
  if (!getAuthToken()) {
    addLocalItem(CART_KEY, product, true);
    return syncHeaderCounters();
  }

  try {
    const cart = await cartApi.add(product.id, Number(product.qty || 1));
    const favorites = await favoritesApi.get();
    const state = stateFromServer(cart, favorites);
    updateHeaderCounters(state);
    emitShopStateChanged(state);
    return state;
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      setAuthToken(null);
      addLocalItem(CART_KEY, product, true);
      return syncHeaderCounters();
    }

    throw error;
  }
}

export async function addToCompare(product) {
  addLocalItem(COMPARE_KEY, product, false);
  return syncHeaderCounters();
}

export async function addToWish(product) {
  if (!getAuthToken()) {
    addLocalItem(WISH_KEY, product, false);
    return syncHeaderCounters();
  }

  try {
    await favoritesApi.add(product.id);
    return syncHeaderCounters();
  } catch (error) {
    if (error.status === 400 && error.detail === "Product already in favorites") {
      return syncHeaderCounters();
    }

    if (error.status === 401 || error.status === 403) {
      setAuthToken(null);
      addLocalItem(WISH_KEY, product, false);
      return syncHeaderCounters();
    }

    throw error;
  }
}

export async function syncGuestStateToAccount() {
  if (!getAuthToken()) return createState();

  const cart = safeParse(CART_KEY);
  const wish = safeParse(WISH_KEY);

  for (const item of Object.values(cart)) {
    try {
      await cartApi.add(item.id, Number(item.qty || 1));
    } catch (error) {
      console.error("Не удалось перенести товар в корзину аккаунта", error);
    }
  }

  for (const item of Object.values(wish)) {
    try {
      await favoritesApi.add(item.id);
    } catch (error) {
      if (error.status !== 400) {
        console.error("Не удалось перенести товар в избранное аккаунта", error);
      }
    }
  }

  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(WISH_KEY);
  return syncHeaderCounters();
}
