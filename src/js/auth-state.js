import { getAuthToken, setAuthToken, usersApi } from "./api";
import { syncHeaderCounters } from "./shop-state";

const USER_KEY = "autoShopCurrentUser";
export const AUTH_STATE_CHANGED = "auth-state-changed";

let currentUser = getStoredUser();
let syncRequestId = 0;

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch (error) {
    console.error("Не удалось прочитать пользователя из localStorage", error);
    return null;
  }
}

function setStoredUser(user) {
  currentUser = user || null;

  if (currentUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getUserDisplayName(user = currentUser) {
  if (!user) return "";

  const firstName = user.first_name || user.firstname || user.firstName || "";
  const lastName = user.last_name || user.lastname || user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user.name || user.email || "Пользователь";
}

function emitAuthStateChanged() {
  window.dispatchEvent(
    new CustomEvent(AUTH_STATE_CHANGED, {
      detail: {
        user: currentUser,
        isAuthenticated: Boolean(getAuthToken()),
      },
    })
  );
}

function renderAuthState() {
  const account = document.getElementById("navAccount");
  const enterButton = document.getElementById("enterNavBtn");
  const logoutButton = document.getElementById("logoutNavBtn");
  const userName = document.getElementById("currentUserName");
  const enterText = enterButton && enterButton.querySelector(".btn__text");
  const isLoggedIn = Boolean(getAuthToken());

  if (account) {
    account.classList.toggle("is-authenticated", isLoggedIn);
  }

  if (enterText) {
    enterText.textContent = isLoggedIn ? "Кабинет" : "Вход";
  }

  if (enterButton) {
    enterButton.setAttribute(
      "aria-label",
      isLoggedIn ? "Личный кабинет" : "Вход в личный кабинет"
    );
  }

  if (logoutButton) {
    logoutButton.hidden = !isLoggedIn;
  }

  if (userName) {
    userName.textContent = isLoggedIn && currentUser
      ? `Вы вошли: ${getUserDisplayName()}`
      : "";
  }
}

function clearAuthSession() {
  setAuthToken(null);
  setStoredUser(null);
  renderAuthState();
  emitAuthStateChanged();
}

export function getCurrentUser() {
  return currentUser;
}

export async function syncAuthState() {
  const token = getAuthToken();
  const requestId = ++syncRequestId;

  if (!token) {
    setStoredUser(null);
    renderAuthState();
    emitAuthStateChanged();
    return null;
  }

  if (currentUser) {
    renderAuthState();
  }

  try {
    const user = await usersApi.me();

    if (requestId !== syncRequestId) return currentUser;

    setStoredUser(user);
    renderAuthState();
    emitAuthStateChanged();
    return currentUser;
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      clearAuthSession();
      await syncHeaderCounters();
      return null;
    }

    console.error("Не удалось загрузить пользователя", error);
    renderAuthState();
    emitAuthStateChanged();
    return currentUser;
  }
}

export async function logout() {
  syncRequestId += 1;
  clearAuthSession();
  await syncHeaderCounters();
}

const logoutButton = document.getElementById("logoutNavBtn");

if (logoutButton) {
  logoutButton.addEventListener("click", async (event) => {
    event.preventDefault();
    await logout();
  });
}

renderAuthState();
syncAuthState();
