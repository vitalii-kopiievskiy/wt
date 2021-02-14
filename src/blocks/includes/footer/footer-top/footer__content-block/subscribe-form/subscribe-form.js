let subscribeForm = document.getElementById("subscribeForm");
let subscribeEmail = document.getElementById("subscribeEmail");
let confirmSubscribeBtn = document.getElementById("confirmSubscribeBtn");
let subscribeModal = document.getElementById("subscribeModal");
let closeSubscribeModalBtn = document.getElementById("closeSubscribeModalBtn");

let emailRegExp = /.+@.+\..+/i;

function checkSubEmailMatch() {
  if (!subscribeEmail.value) {
    subscribeEmail.classList.add("invalid");
  } else if (!emailRegExp.test(subscribeEmail.value)) {
    subscribeEmail.classList.add("invalid");
  } else {
    subscribeEmail.classList.add("valid");
  }
}

function removeSubValidationEmail() {
  if (subscribeEmail.classList.contains("invalid")) {
    subscribeEmail.classList.remove("invalid");
  }

  subscribeEmail.classList.remove("valid");
}

subscribeEmail.oninput = function() {
  removeSubValidationEmail();
  checkSubEmailMatch();
};
subscribeEmail.onfocus = function() {
  removeSubValidationEmail();
};

confirmSubscribeBtn.onclick = function() {
  removeSubValidationEmail();
  checkSubEmailMatch();

  if (subscribeEmail.classList.contains("invalid")) {
    return false;
  } else {
    subscribeModal.style.display = "block";
    document.body.style.overflowY = "hidden";
  }
  return false;
};

closeSubscribeModalBtn.onclick = function() {
  subscribeModal.style.display = "none";
  document.body.style.overflowY = "visible";
  subscribeForm.submit();
};
