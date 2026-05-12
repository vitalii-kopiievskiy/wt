let headerForm = document.getElementById("headerForm");
let closeHeaderBtn = document.querySelector("#closeHeaderBtn");
let headerModal = document.querySelector(".header-modal");
let submitHeaderBtn = document.getElementById("submitHeaderBtn");
let phoneField = document.getElementById("phoneField");

if (headerForm && closeHeaderBtn && headerModal && submitHeaderBtn && phoneField) {
closeHeaderBtn.onclick = function() {
  headerModal.style.display = "none";
  document.body.style.overflowY = "visible";
};

let phoneMask = window.IMask
  ? new IMask(phoneField, {
      mask: "+{38}(000)000-00-00",
      lazy: false,
    })
  : null;

phoneField.oninput = function() {
  checkPhoneMatch();
};
let error = document.createElement("div");
error.className = "error";
error.innerHTML = "Пожалуйста заполните поле до конца";

function checkPhoneMatch() {
  const valueLength = phoneMask
    ? phoneMask.unmaskedValue.length
    : phoneField.value.replace(/\D/g, "").length;

  if (valueLength == 12) {
    submitHeaderBtn.classList.add("active");
    error.remove();
  } else {
    submitHeaderBtn.classList.remove("active");
    phoneField.after(error);
  }
}

headerForm.onsubmit = function() {
  const valueLength = phoneMask
    ? phoneMask.unmaskedValue.length
    : phoneField.value.replace(/\D/g, "").length;

  if (valueLength != 12) {
    phoneField.after(error);
    return false;
  } else {
    headerModal.style.display = "none";
    document.body.style.overflowY = "visible";
  }
};
}
