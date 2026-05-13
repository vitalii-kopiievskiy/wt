import { authApi, getApiErrorMessage } from "../../../../../js/api";
import { syncAuthState } from "../../../../../js/auth-state";
import { syncGuestStateToAccount } from "../../../../../js/shop-state";

const FORM_MODE_LOGIN = "login";
const FORM_MODE_REGISTER = "register";

let navForm = document.getElementById("navForm");
let navModal = document.querySelector(".nav-modal");
let navTitle = navForm && navForm.querySelector(".nav-modal__title");
let closeNavBtn = document.getElementById("closeNavBtn");
let email = document.getElementById("emailField");
let password = document.getElementById("passField");
let firstName = document.getElementById("firstNameField");
let lastName = document.getElementById("lastNameField");
let submitNavBtn = document.getElementById("submitNavBtn");
let registerModeBtn = document.getElementById("registerModeBtn");
let loginModeBtn = document.getElementById("loginModeBtn");
let forgotPasswordLink = document.getElementById("forgotPasswordLink");
let restoreBlock = navForm && navForm.querySelector(".form__restore");
let registerItems = navForm
  ? navForm.querySelectorAll(".form__item--register")
  : [];
let formMode = FORM_MODE_LOGIN;

let emailRegExp = /.+@.+\..+/i;

function generateError(text) {
  let error = document.createElement("div");
  error.className = "error";
  error.textContent = text;
  return error;
}

function removeSubmitError() {
  const error = navForm && navForm.querySelector(".form__submit-error");
  if (error) error.remove();
}

function showSubmitError(text) {
  removeSubmitError();

  let error = generateError(text);
  error.classList.add("form__submit-error");
  submitNavBtn.before(error);
}

function getFieldError(input) {
  const nextElement = input && input.nextElementSibling;
  return nextElement && nextElement.classList.contains("error")
    ? nextElement
    : null;
}

function removeValidation(input) {
  if (!input) return;

  const error = getFieldError(input);
  if (error) error.remove();

  input.classList.remove("invalid");
  input.classList.remove("valid");
}

function markInvalid(input, text) {
  removeValidation(input);
  let error = generateError(text);
  input.after(error);
  input.classList.add("invalid");
}

function checkEmailMatch() {
  if (!email.value.trim()) {
    markInvalid(email, "Пожалуйста заполните поле");
  } else if (!emailRegExp.test(email.value)) {
    markInvalid(email, "Введите email в формате mail@gmail.com");
  } else {
    email.classList.add("valid");
  }
}

function removeValidationEmail() {
  removeValidation(email);
}

function checkPasswordMatch() {
  if (!password.value) {
    markInvalid(password, "Пожалуйста заполните поле");
  } else if (password.value.length < 6) {
    markInvalid(password, "Пожалуйста, введите минимум 6 символов");
  } else {
    password.classList.add("valid");
  }
}

function removeValidationPass() {
  removeValidation(password);
}

function checkFirstNameMatch() {
  if (formMode !== FORM_MODE_REGISTER || !firstName) return;

  if (!firstName.value.trim()) {
    markInvalid(firstName, "Пожалуйста заполните имя");
  } else {
    firstName.classList.add("valid");
  }
}

function checkLastNameMatch() {
  if (formMode !== FORM_MODE_REGISTER || !lastName) return;

  if (lastName.value.trim()) {
    lastName.classList.add("valid");
  }
}

function checkValidation() {
  const isLoginValid =
    email.classList.contains("valid") &&
    password.classList.contains("valid");
  const isRegisterValid =
    formMode !== FORM_MODE_REGISTER ||
    (firstName && firstName.classList.contains("valid"));

  if (isLoginValid && isRegisterValid) {
    submitNavBtn.classList.add("active");
  } else {
    submitNavBtn.classList.remove("active");
  }
}

function setFormMode(mode) {
  formMode = mode;
  const isRegisterMode = formMode === FORM_MODE_REGISTER;

  registerItems.forEach((item) => {
    item.hidden = !isRegisterMode;
  });

  if (restoreBlock) restoreBlock.hidden = isRegisterMode;
  if (forgotPasswordLink) forgotPasswordLink.hidden = isRegisterMode;
  if (registerModeBtn) registerModeBtn.hidden = isRegisterMode;
  if (loginModeBtn) loginModeBtn.hidden = !isRegisterMode;
  if (navTitle) {
    navTitle.textContent = isRegisterMode
      ? "Регистрация"
      : "Вход в личный кабинет";
  }
  if (submitNavBtn) {
    submitNavBtn.textContent = isRegisterMode
      ? "Зарегистрироваться"
      : "Войти в личный кабинет";
  }
  if (password) {
    password.setAttribute(
      "autocomplete",
      isRegisterMode ? "new-password" : "current-password"
    );
  }

  [firstName, lastName, email, password].forEach(removeValidation);
  removeSubmitError();
  checkValidation();
}

function closeNavModal() {
  if (navModal) {
    navModal.style.display = "none";
    document.body.style.overflowY = "visible";
  }
}

function resetNavForm() {
  if (navForm) navForm.reset();
  setFormMode(FORM_MODE_LOGIN);
}

if (navForm && email && password && submitNavBtn) {
  if (registerModeBtn) {
    registerModeBtn.onclick = function() {
      setFormMode(FORM_MODE_REGISTER);
    };
  }

  if (loginModeBtn) {
    loginModeBtn.onclick = function() {
      setFormMode(FORM_MODE_LOGIN);
    };
  }

  email.oninput = function() {
    removeSubmitError();
    removeValidationEmail();
    checkEmailMatch();
    checkValidation();
  };

  email.onfocus = function() {
    removeSubmitError();
    removeValidationEmail();
    checkValidation();
  };

  password.oninput = function() {
    removeSubmitError();
    removeValidationPass();
    checkPasswordMatch();
    checkValidation();
  };

  password.onfocus = function() {
    removeSubmitError();
    removeValidationPass();
    checkValidation();
  };

  if (firstName) {
    firstName.oninput = function() {
      removeSubmitError();
      removeValidation(firstName);
      checkFirstNameMatch();
      checkValidation();
    };

    firstName.onfocus = function() {
      removeSubmitError();
      removeValidation(firstName);
      checkValidation();
    };
  }

  if (lastName) {
    lastName.oninput = function() {
      removeSubmitError();
      removeValidation(lastName);
      checkLastNameMatch();
    };

    lastName.onfocus = function() {
      removeSubmitError();
      removeValidation(lastName);
    };
  }

  navForm.onsubmit = async function(event) {
    event.preventDefault();
    removeSubmitError();
    removeValidation(firstName);
    checkFirstNameMatch();
    removeValidation(lastName);
    checkLastNameMatch();
    removeValidationEmail();
    checkEmailMatch();
    removeValidationPass();
    checkPasswordMatch();

    if (
      (firstName && firstName.classList.contains("invalid")) ||
      email.classList.contains("invalid") ||
      password.classList.contains("invalid")
    ) {
      return false;
    }

    submitNavBtn.disabled = true;

    try {
      const credentials = {
        email: email.value.trim(),
        password: password.value,
      };

      if (formMode === FORM_MODE_REGISTER) {
        await authApi.register({
          ...credentials,
          first_name: firstName.value.trim(),
          last_name: lastName && lastName.value.trim()
            ? lastName.value.trim()
            : null,
        });
      }

      await authApi.login({
        ...credentials,
      });

      await syncGuestStateToAccount();
      await syncAuthState();
      closeNavModal();
      resetNavForm();
    } catch (error) {
      showSubmitError(getApiErrorMessage(error));
    } finally {
      submitNavBtn.disabled = false;
    }

    return false;
  };

  if (closeNavBtn) {
    closeNavBtn.addEventListener("click", resetNavForm);
  }
}
