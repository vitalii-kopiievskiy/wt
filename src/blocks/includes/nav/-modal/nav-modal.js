let closeNavBtn = document.querySelector("#closeNavBtn");
let naVmodal = document.querySelector(".nav-modal");

closeNavBtn.onclick = function() {
  naVmodal.style.display = "none";
  document.body.style.overflowY = "visible";
};
