import { authApi, getApiErrorMessage } from "../../../../../js/api";
import { syncGuestStateToAccount } from "../../../../../js/shop-state";

let navForm = document.getElementById("navForm");
let navModal = document.querySelector(".nav-modal");
let email = document.getElementById("emailField");
let password = document.getElementById("passField");
let submitNavBtn = document.getElementById("submitNavBtn");

let emailRegExp = /.+@.+\..+/i;

function generateError(text) {
  let error = document.createElement("div");
  error.className = "error";
  error.innerHTML = text;
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

function checkEmailMatch() {
  if (!email.value) {
    let error = generateError("Пожалуйста заполните поле");
    email.after(error);
    email.classList.add("invalid");
  } else if (!emailRegExp.test(email.value)) {
    let error = generateError("Введите email в формате mail@gmail.com");
    email.after(error);
    email.classList.add("invalid");
  } else {
    email.classList.add("valid");
  }
}

function removeValidationEmail() {
  if (email.classList.contains("invalid")) {
    email.classList.remove("invalid");
    let emailError = email.nextSibling;
    if (emailError) emailError.remove();
  }

  email.classList.remove("valid");
}

function checkPasswordMatch() {
  if (!password.value) {
    let error = generateError("Пожалуйста заполните поле");
    password.after(error);
    password.classList.add("invalid");
  } else if (password.value.length < 6) {
    let error = generateError("Пожалуйста, введите минимум 6 символов");
    password.after(error);
    password.classList.add("invalid");
  } else {
    password.classList.add("valid");
  }
}

function removeValidationPass() {
  if (password.classList.contains("invalid")) {
    password.classList.remove("invalid");
    let passError = password.nextSibling;
    if (passError) passError.remove();
  }

  password.classList.remove("valid");
}

function checkValidation() {
  if (
    email.classList.contains("valid") &&
    password.classList.contains("valid")
  ) {
    submitNavBtn.classList.add("active");
  } else {
    submitNavBtn.classList.remove("active");
  }
}

if (navForm && email && password && submitNavBtn) {
  email.oninput = function() {
    removeSubmitError();
    removeValidationEmail();
    checkEmailMatch();
    checkValidation();
  };

  email.onfocus = function() {
    removeSubmitError();
    removeValidationEmail();
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
  };

  navForm.onsubmit = async function(event) {
    event.preventDefault();
    removeSubmitError();
    removeValidationEmail();
    checkEmailMatch();
    removeValidationPass();
    checkPasswordMatch();

    if (
      email.classList.contains("invalid") ||
      password.classList.contains("invalid")
    ) {
      return false;
    }

    submitNavBtn.disabled = true;

    try {
      await authApi.login({
        email: email.value.trim(),
        password: password.value,
      });

      await syncGuestStateToAccount();

      if (navModal) {
        navModal.style.display = "none";
        document.body.style.overflowY = "visible";
      }
    } catch (error) {
      showSubmitError(getApiErrorMessage(error));
    } finally {
      submitNavBtn.disabled = false;
    }

    return false;
  };
}
