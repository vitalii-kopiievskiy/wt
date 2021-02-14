let burgerIcon = document.querySelector(".burger__icon");
let navList = document.getElementById("navList");

burgerIcon.onclick = function() {
  this.classList.toggle("open");
  navList.classList.toggle("open");
};
