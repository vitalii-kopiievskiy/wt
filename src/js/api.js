const TOKEN_KEY = "autoShopAccessToken";

export const API_BASE_URL =
  window.AUTO_SHOP_API_URL || "http://127.0.0.1:8000";

function buildUrl(path, params = {}) {
  const url = new URL(path, `${API_BASE_URL}/`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, value);
  });

  return url.toString();
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export function getApiErrorMessage(error) {
  if (!error) return "Неизвестная ошибка";
  if (error.detail) return error.detail;
  if (error.message) return error.message;
  return "Не удалось выполнить запрос";
}

async function request(path, options = {}) {
  const {
    method = "GET",
    params,
    body,
    auth = false,
    headers = {},
  } = options;

  const token = getAuthToken();
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof data === "object" && data && data.detail
        ? data.detail
        : `HTTP ${response.status}`
    );
    error.status = response.status;
    error.detail = data && data.detail;
    error.response = data;
    throw error;
  }

  return data;
}

export const productsApi = {
  list(params = {}) {
    return request("/products/", {
      params: {
        only_active: true,
        limit: 20,
        offset: 0,
        ...params,
      },
    });
  },

  filters() {
    return request("/products/filters", {
      params: {
        only_active: true,
      },
    });
  },

  bySlug(slug) {
    return request(`/products/slug/${encodeURIComponent(slug)}`);
  },

  byId(productId) {
    return request(`/products/${Number(productId)}`);
  },
};

export const authApi = {
  async login(credentials) {
    const response = await request("/auth/login", {
      method: "POST",
      body: credentials,
    });

    setAuthToken(response.access_token);
    return response;
  },

  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: payload,
    });
  },
};

export const usersApi = {
  me() {
    return request("/users/me", {
      auth: true,
    });
  },
};

export const cartApi = {
  get() {
    return request("/cart/", {
      auth: true,
    });
  },

  add(productId, quantity = 1) {
    return request("/cart/items", {
      method: "POST",
      auth: true,
      body: {
        product_id: Number(productId),
        quantity,
      },
    });
  },

  update(productId, quantity) {
    return request(`/cart/items/${productId}`, {
      method: "PATCH",
      auth: true,
      body: {
        quantity,
      },
    });
  },

  remove(productId) {
    return request(`/cart/items/${productId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  clear() {
    return request("/cart/", {
      method: "DELETE",
      auth: true,
    });
  },
};

export const favoritesApi = {
  get() {
    return request("/favorites/", {
      auth: true,
    });
  },

  add(productId) {
    return request("/favorites/", {
      method: "POST",
      auth: true,
      body: {
        product_id: Number(productId),
      },
    });
  },

  remove(productId) {
    return request(`/favorites/${productId}`, {
      method: "DELETE",
      auth: true,
    });
  },
};

export const ordersApi = {
  createFromCart() {
    return request("/orders/", {
      method: "POST",
      auth: true,
    });
  },

  buyNow(productId, quantity = 1) {
    return request("/orders/buy-now", {
      method: "POST",
      auth: true,
      body: {
        product_id: Number(productId),
        quantity,
      },
    });
  },
};
