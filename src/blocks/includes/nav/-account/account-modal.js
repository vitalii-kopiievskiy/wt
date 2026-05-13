import { getApiErrorMessage, ordersApi } from "../../../../js/api";
import {
  AUTH_STATE_CHANGED,
  getCurrentUser,
  getUserDisplayName,
} from "../../../../js/auth-state";

const accountModal = document.getElementById("accountModal");
const closeAccountBtn = document.getElementById("closeAccountBtn");
const accountUserName = document.getElementById("accountUserName");
const accountUserEmail = document.getElementById("accountUserEmail");
const accountOrdersList = document.getElementById("accountOrdersList");
const accountOrderDetails = document.getElementById("accountOrderDetails");
const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");

let activeOrderId = null;
let lastOrders = [];

const statusLabels = {
  pending: "Ожидает",
  paid: "Оплачен",
  processing: "В обработке",
  shipped: "Отправлен",
  completed: "Выполнен",
  cancelled: "Отменен",
};

function escapeHtml(value) {
  return String(value || "")
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

function getStatusLabel(status) {
  return statusLabels[status] || status || "Без статуса";
}

function renderMessage(container, text) {
  if (!container) return;
  container.innerHTML = `<p class="account-modal__message">${escapeHtml(text)}</p>`;
}

function renderUser() {
  const user = getCurrentUser();

  if (accountUserName) {
    accountUserName.textContent = user
      ? `Вы вошли: ${getUserDisplayName(user)}`
      : "Вы вошли";
  }

  if (accountUserEmail) {
    accountUserEmail.textContent = user && user.email ? user.email : "";
  }
}

function renderOrders(orders) {
  if (!accountOrdersList) return;

  if (!orders.length) {
    renderMessage(accountOrdersList, "Заказов пока нет.");
    return;
  }

  accountOrdersList.innerHTML = orders
    .map((order) => {
      const orderId = Number(order.id);
      const isActive = activeOrderId === orderId;

      return `
        <article class="account-modal__order${isActive ? " is-active" : ""}">
          <div class="account-modal__order-head">
            <div>
              <h4 class="account-modal__order-title">Заказ #${orderId}</h4>
              <p class="account-modal__meta">${escapeHtml(formatDate(order.created_at))}</p>
              <span class="account-modal__status">${escapeHtml(getStatusLabel(order.status))}</span>
            </div>
            <strong class="account-modal__total">${escapeHtml(formatMoney(order.total_price))}</strong>
          </div>
          <button class="account-modal__details-btn" type="button" data-order-id="${orderId}">
            Подробнее
          </button>
        </article>
      `;
    })
    .join("");
}

function renderOrderDetails(order) {
  if (!accountOrderDetails) return;

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsMarkup = items.length
    ? items
        .map((item) => {
          return `
            <div class="account-modal__item">
              <div>
                <h5 class="account-modal__item-name">${escapeHtml(item.product_name || "Товар")}</h5>
                <p class="account-modal__item-line">
                  ${Number(item.quantity || 0)} шт. x ${escapeHtml(formatMoney(item.product_price))}
                </p>
              </div>
              <strong class="account-modal__item-price">${escapeHtml(formatMoney(item.total_price))}</strong>
            </div>
          `;
        })
        .join("")
    : `<p class="account-modal__message">В заказе нет товаров.</p>`;

  accountOrderDetails.innerHTML = `
    <article class="account-modal__details-card">
      <div class="account-modal__details-head">
        <div>
          <h4 class="account-modal__details-title">Заказ #${Number(order.id)}</h4>
          <p class="account-modal__meta">Создан: ${escapeHtml(formatDate(order.created_at))}</p>
          <p class="account-modal__meta">Обновлен: ${escapeHtml(formatDate(order.updated_at))}</p>
          <span class="account-modal__status">${escapeHtml(getStatusLabel(order.status))}</span>
        </div>
        <strong class="account-modal__total">${escapeHtml(formatMoney(order.total_price))}</strong>
      </div>
      <div class="account-modal__items">
        ${itemsMarkup}
      </div>
    </article>
  `;
}

async function loadOrders() {
  renderUser();
  activeOrderId = null;
  renderMessage(accountOrderDetails, "Выберите заказ из списка.");
  renderMessage(accountOrdersList, "Загрузка заказов...");

  if (refreshOrdersBtn) refreshOrdersBtn.disabled = true;

  try {
    const orders = await ordersApi.list();
    lastOrders = Array.isArray(orders) ? orders : [];
    renderOrders(lastOrders);
  } catch (error) {
    renderMessage(accountOrdersList, getApiErrorMessage(error));
  } finally {
    if (refreshOrdersBtn) refreshOrdersBtn.disabled = false;
  }
}

async function loadOrderDetails(orderId) {
  activeOrderId = Number(orderId);
  renderOrders(lastOrders);
  renderMessage(accountOrderDetails, "Загрузка деталей заказа...");

  try {
    const order = await ordersApi.byId(orderId);
    renderOrderDetails(order);
  } catch (error) {
    renderMessage(accountOrderDetails, getApiErrorMessage(error));
  }
}

export async function openAccountModal() {
  if (!accountModal) return;

  accountModal.style.display = "block";
  accountModal.setAttribute("aria-hidden", "false");
  document.body.style.overflowY = "hidden";

  await loadOrders();
}

export function closeAccountModal() {
  if (!accountModal) return;

  accountModal.style.display = "none";
  accountModal.setAttribute("aria-hidden", "true");
  document.body.style.overflowY = "visible";
}

if (closeAccountBtn) {
  closeAccountBtn.addEventListener("click", closeAccountModal);
}

if (refreshOrdersBtn) {
  refreshOrdersBtn.addEventListener("click", loadOrders);
}

if (accountOrdersList) {
  accountOrdersList.addEventListener("click", async (event) => {
    const trigger = event.target.closest("[data-order-id]");
    if (!trigger) return;

    await loadOrderDetails(trigger.dataset.orderId);
  });
}

window.addEventListener(AUTH_STATE_CHANGED, (event) => {
  if (!event.detail || !event.detail.isAuthenticated) {
    closeAccountModal();
    return;
  }

  renderUser();
});
