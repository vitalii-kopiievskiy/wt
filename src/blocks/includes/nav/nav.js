let enterNavButton = document.querySelector("#enterNavBtn");
let naVmodal = document.querySelector(".nav-modal");
let navList = document.querySelector(".nav__list");
let selectedNavLink = document.querySelector(".nav__link.isActive");

enterNavButton.onclick = function() {
  naVmodal.style.display = "block";
  document.body.style.overflowY = "hidden";
};

navList.onclick = function(e) {
  if (e.target.tagName != "A") return;
  activateNavLink(e.target);
};

function activateNavLink(link) {
  if (selectedNavLink) {
    selectedNavLink.classList.remove("isActive");
  }

  selectedNavLink = link;
  selectedNavLink.classList.add("isActive");
}
