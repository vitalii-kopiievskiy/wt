import {
  getApiErrorMessage,
  getAuthToken,
  ordersApi,
  productsApi,
  usersApi,
} from "../../../js/api";
import {
  AUTH_STATE_CHANGED,
  getCurrentUser,
  getUserDisplayName,
  syncAuthState,
} from "../../../js/auth-state";

const panel = document.getElementById("adminPanel");
const notice = document.getElementById("adminNotice");
const workspace = document.getElementById("adminWorkspace");
const productForm = document.getElementById("adminProductForm");
const productsTable = document.getElementById("adminProductsTable");
const ordersTable = document.getElementById("adminOrdersTable");
const usersTable = document.getElementById("adminUsersTable");
const orderDetails = document.getElementById("adminOrderDetails");

const orderStatuses = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

let products = [];
let orders = [];
let users = [];

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("ru-RU")} грн.`;
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function setNotice(message, isError = false) {
  if (!notice) return;

  notice.textContent = message;
  notice.classList.toggle("is-error", isError);
}

function showWorkspace() {
  if (!workspace || !notice) return;

  workspace.hidden = false;
  notice.hidden = true;
}

function hideWorkspace(message, isError = false) {
  if (!workspace || !notice) return;

  workspace.hidden = true;
  notice.hidden = false;
  setNotice(message, isError);
}

function requireAdmin() {
  const user = getCurrentUser();

  if (!getAuthToken()) {
    hideWorkspace("Войдите под администратором, чтобы открыть админку.", true);
    return false;
  }

  if (!user) {
    hideWorkspace("Проверяем пользователя...");
    return false;
  }

  if (user.role !== "admin") {
    hideWorkspace(`Доступ закрыт для ${getUserDisplayName(user)}. Нужна роль admin.`, true);
    return false;
  }

  showWorkspace();
  return true;
}

function productPayloadFromForm() {
  const formData = new FormData(productForm);
  const payload = {};
  const optionalTextFields = ["description", "old_price", "image_url", "brand", "category"];

  ["name", "slug", "description", "image_url", "brand", "category"].forEach((field) => {
    const value = String(formData.get(field) || "").trim();
    if (value || !optionalTextFields.includes(field)) {
      payload[field] = value || null;
    }
  });

  payload.price = Number(formData.get("price"));
  payload.stock_quantity = Number(formData.get("stock_quantity") || 0);
  payload.is_active = formData.get("is_active") === "on";

  const oldPrice = String(formData.get("old_price") || "").trim();
  payload.old_price = oldPrice ? Number(oldPrice) : null;

  return payload;
}

function resetProductForm() {
  if (!productForm) return;

  productForm.reset();
  productForm.elements.id.value = "";
  productForm.elements.stock_quantity.value = "0";
  productForm.elements.is_active.checked = true;
}

function fillProductForm(product) {
  if (!productForm) return;

  productForm.elements.id.value = product.id;
  productForm.elements.name.value = product.name || "";
  productForm.elements.slug.value = product.slug || "";
  productForm.elements.description.value = product.description || "";
  productForm.elements.price.value = product.price || "";
  productForm.elements.old_price.value = product.old_price || "";
  productForm.elements.image_url.value = product.image_url || "";
  productForm.elements.brand.value = product.brand || "";
  productForm.elements.category.value = product.category || "";
  productForm.elements.stock_quantity.value = product.stock_quantity || 0;
  productForm.elements.is_active.checked = Boolean(product.is_active);
}

function renderProducts() {
  if (!productsTable) return;

  if (!products.length) {
    productsTable.innerHTML = `
      <tr>
        <td colspan="6">Товары не найдены.</td>
      </tr>
    `;
    return;
  }

  productsTable.innerHTML = products
    .map((product) => {
      return `
        <tr>
          <td>${Number(product.id)}</td>
          <td>
            <strong>${escapeHtml(product.name)}</strong><br>
            <span>${escapeHtml(product.slug)}</span><br>
            <span>${escapeHtml([product.category, product.brand].filter(Boolean).join(" / "))}</span>
          </td>
          <td>${escapeHtml(formatMoney(product.price))}</td>
          <td>${Number(product.stock_quantity || 0)}</td>
          <td>${product.is_active ? "Активен" : "Скрыт"}</td>
          <td>
            <div class="admin-table__actions">
              <button class="admin-panel__secondary-btn" type="button" data-product-edit="${product.id}">Править</button>
              <button class="admin-panel__danger-btn" type="button" data-product-delete="${product.id}">Удалить</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadProducts() {
  if (!productsTable) return;

  productsTable.innerHTML = `
    <tr>
      <td colspan="6">Загрузка товаров...</td>
    </tr>
  `;

  const response = await productsApi.list({
    only_active: false,
    limit: 100,
    offset: 0,
  });

  products = Array.isArray(response.items) ? response.items : [];
  renderProducts();
}

function renderUsers() {
  if (!usersTable) return;

  if (!users.length) {
    usersTable.innerHTML = `
      <tr>
        <td colspan="6">Пользователи не найдены.</td>
      </tr>
    `;
    return;
  }

  usersTable.innerHTML = users
    .map((user) => {
      const name = [user.first_name, user.last_name].filter(Boolean).join(" ");

      return `
        <tr>
          <td>${Number(user.id)}</td>
          <td>${escapeHtml(user.email)}</td>
          <td>${escapeHtml(name || "-")}</td>
          <td>${escapeHtml(user.role)}</td>
          <td>${user.is_active ? "Да" : "Нет"}</td>
          <td>${escapeHtml(formatDate(user.created_at))}</td>
        </tr>
      `;
    })
    .join("");
}

async function loadUsers() {
  if (!usersTable) return;

  usersTable.innerHTML = `
    <tr>
      <td colspan="6">Загрузка пользователей...</td>
    </tr>
  `;

  users = await usersApi.adminList();
  renderUsers();
}

function statusOptions(currentStatus) {
  return orderStatuses
    .map((status) => {
      const selected = status === currentStatus ? " selected" : "";
      return `<option value="${status}"${selected}>${status}</option>`;
    })
    .join("");
}

function renderOrders() {
  if (!ordersTable) return;

  if (!orders.length) {
    ordersTable.innerHTML = `
      <tr>
        <td colspan="6">Заказы не найдены.</td>
      </tr>
    `;
    return;
  }

  ordersTable.innerHTML = orders
    .map((order) => {
      return `
        <tr>
          <td>${Number(order.id)}</td>
          <td>${Number(order.user_id)}</td>
          <td>
            <select data-order-status="${order.id}">
              ${statusOptions(order.status)}
            </select>
          </td>
          <td>${escapeHtml(formatMoney(order.total_price))}</td>
          <td>${escapeHtml(formatDate(order.created_at))}</td>
          <td>
            <div class="admin-table__actions">
              <button class="admin-panel__secondary-btn" type="button" data-order-view="${order.id}">Детали</button>
              <button class="admin-panel__primary-btn" type="button" data-order-save="${order.id}">Сохранить</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadOrders() {
  if (!ordersTable) return;

  ordersTable.innerHTML = `
    <tr>
      <td colspan="6">Загрузка заказов...</td>
    </tr>
  `;

  orders = await ordersApi.adminList();
  renderOrders();
}

function renderOrderDetails(order) {
  if (!orderDetails) return;

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsMarkup = items.length
    ? items
        .map((item) => {
          return `
            <div>
              <strong>${escapeHtml(item.product_name)}</strong>
              <p>${Number(item.quantity)} шт. x ${escapeHtml(formatMoney(item.product_price))} = ${escapeHtml(formatMoney(item.total_price))}</p>
            </div>
          `;
        })
        .join("")
    : "<p>В заказе нет товаров.</p>";

  orderDetails.innerHTML = `
    <h3>Заказ #${Number(order.id)}</h3>
    <p>Пользователь: ${Number(order.user_id)}</p>
    <p>Статус: ${escapeHtml(order.status)}</p>
    <p>Сумма: ${escapeHtml(formatMoney(order.total_price))}</p>
    <p>Создан: ${escapeHtml(formatDate(order.created_at))}</p>
    <hr>
    ${itemsMarkup}
  `;
}

async function loadOrderDetails(orderId) {
  if (!orderDetails) return;

  orderDetails.innerHTML = "<p>Загрузка деталей заказа...</p>";
  renderOrderDetails(await ordersApi.adminById(orderId));
}

async function loadAllAdminData() {
  if (!requireAdmin()) return;

  try {
    await Promise.all([
      loadProducts(),
      loadOrders(),
      loadUsers(),
    ]);
    setNotice("");
  } catch (error) {
    hideWorkspace(getApiErrorMessage(error), true);
  }
}

function initTabs() {
  document.querySelectorAll("[data-admin-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const name = tab.dataset.adminTab;

      document.querySelectorAll("[data-admin-tab]").forEach((item) => {
        item.classList.toggle("is-active", item === tab);
      });
      document.querySelectorAll("[data-admin-panel]").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.adminPanel === name);
      });
    });
  });
}

function initProducts() {
  const resetButton = document.getElementById("resetProductFormBtn");
  const refreshButton = document.getElementById("refreshProductsBtn");

  if (resetButton) {
    resetButton.addEventListener("click", resetProductForm);
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      await loadProducts();
    });
  }

  if (productForm) {
    productForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const productId = productForm.elements.id.value;
      const payload = productPayloadFromForm();

      try {
        if (productId) {
          await productsApi.update(productId, payload);
        } else {
          await productsApi.create(payload);
        }

        resetProductForm();
        await loadProducts();
      } catch (error) {
        alert(getApiErrorMessage(error));
      }
    });
  }

  if (productsTable) {
    productsTable.addEventListener("click", async (event) => {
      const editButton = event.target.closest("[data-product-edit]");
      const deleteButton = event.target.closest("[data-product-delete]");

      if (editButton) {
        const product = products.find((item) => String(item.id) === String(editButton.dataset.productEdit));
        if (product) fillProductForm(product);
      }

      if (deleteButton) {
        const productId = deleteButton.dataset.productDelete;
        const product = products.find((item) => String(item.id) === String(productId));
        const productName = product ? product.name : `#${productId}`;

        if (!confirm(`Удалить товар ${productName}?`)) return;

        try {
          await productsApi.remove(productId);
          await loadProducts();
        } catch (error) {
          alert(getApiErrorMessage(error));
        }
      }
    });
  }
}

function initOrders() {
  const refreshButton = document.getElementById("refreshOrdersAdminBtn");

  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      await loadOrders();
    });
  }

  if (ordersTable) {
    ordersTable.addEventListener("click", async (event) => {
      const viewButton = event.target.closest("[data-order-view]");
      const saveButton = event.target.closest("[data-order-save]");

      try {
        if (viewButton) {
          await loadOrderDetails(viewButton.dataset.orderView);
        }

        if (saveButton) {
          const orderId = saveButton.dataset.orderSave;
          const statusSelect = ordersTable.querySelector(`[data-order-status="${orderId}"]`);
          await ordersApi.adminUpdateStatus(orderId, statusSelect.value);
          await loadOrders();
          await loadOrderDetails(orderId);
        }
      } catch (error) {
        alert(getApiErrorMessage(error));
      }
    });
  }
}

function initUsers() {
  const refreshButton = document.getElementById("refreshUsersBtn");

  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      await loadUsers();
    });
  }
}

if (panel) {
  initTabs();
  initProducts();
  initOrders();
  initUsers();

  window.addEventListener("load", async () => {
    await syncAuthState();
    await loadAllAdminData();
  });

  window.addEventListener(AUTH_STATE_CHANGED, () => {
    loadAllAdminData();
  });
}
