let enterContactsBtn = document.querySelector("#enterContactsBtn");
let headermodal = document.querySelector(".header-modal");

enterContactsBtn.onclick = function() {
  headermodal.style.display = "block";
  document.body.style.overflowY = "hidden";
};
