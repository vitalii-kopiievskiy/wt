let closeNavBtn = document.querySelector("#closeNavBtn");
let naVmodal = document.querySelector(".nav-modal");

if (closeNavBtn && naVmodal) {
closeNavBtn.onclick = function() {
  naVmodal.style.display = "none";
  document.body.style.overflowY = "visible";
};
}
