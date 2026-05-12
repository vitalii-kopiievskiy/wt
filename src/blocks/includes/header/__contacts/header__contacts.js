let enterContactsBtn = document.querySelector("#enterContactsBtn");
let headermodal = document.querySelector(".header-modal");

if (enterContactsBtn && headermodal) {
enterContactsBtn.onclick = function() {
  headermodal.style.display = "block";
  document.body.style.overflowY = "hidden";
};
}
