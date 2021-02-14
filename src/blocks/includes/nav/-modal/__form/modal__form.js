let navForm = document.getElementById("navForm");
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
    emailError.remove();
  }

  email.classList.remove("valid");
}

function checkPasswordMatch() {
  if (!password.value) {
    let error = generateError("Пожалуйста заполните поле");
    password.after(error);
    password.classList.add("invalid");
  } else if (password.value.length < 4) {
    let error = generateError("Пожалуйста, введите минимум 4 символа");
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
    passError.remove();
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

email.oninput = function() {
  removeValidationEmail();
  checkEmailMatch();
  checkValidation();
};

email.onfocus = function() {
  removeValidationEmail();
};

password.oninput = function() {
  removeValidationPass();
  checkPasswordMatch();
  checkValidation();
};

password.onfocus = function() {
  removeValidationPass();
};

navForm.onsubmit = function() {
  removeValidationEmail();
  checkEmailMatch();
  removeValidationPass();
  checkPasswordMatch();

  if (
    email.classList.contains("invalid") ||
    password.classList.contains("invalid")
  ) {
    return false;
  } else {
    modal.style.display = "none";
    document.body.style.overflowY = "visible";
  }
};
