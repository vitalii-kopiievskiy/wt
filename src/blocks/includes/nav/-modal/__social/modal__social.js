let naVmodal = document.querySelector(".nav-modal");

if (naVmodal) {
naVmodal.onclick = function(e) {
  if (e.target.nodeName != "A") return;
  naVmodal.style.display = "none";
  document.body.style.overflowY = "visible";
};
}
