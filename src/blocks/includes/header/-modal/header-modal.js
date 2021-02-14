let headerForm = document.getElementById("headerForm");
let closeHeaderBtn = document.querySelector("#closeHeaderBtn");
let headerModal = document.querySelector(".header-modal");
let submitHeaderBtn = document.getElementById("submitHeaderBtn");
let phoneField = document.getElementById("phoneField");

closeHeaderBtn.onclick = function() {
  headerModal.style.display = "none";
  document.body.style.overflowY = "visible";
};

let phoneMask = new IMask(phoneField, {
  mask: "+{38}(000)000-00-00",
  lazy: false,
});

phoneField.oninput = function() {
  checkPhoneMatch();
};
let error = document.createElement("div");
error.className = "error";
error.innerHTML = "Пожалуйста заполните поле до конца";

function checkPhoneMatch() {
  if (phoneMask.unmaskedValue.length == 12) {
    submitHeaderBtn.classList.add("active");
    error.remove();
  } else {
    submitHeaderBtn.classList.remove("active");
    phoneField.after(error);
  }
}

headerForm.onsubmit = function() {
  if (phoneMask.unmaskedValue.length != 12) {
    phoneField.after(error);
    return false;
  } else {
    headerModal.style.display = "none";
    document.body.style.overflowY = "visible";
  }
};
