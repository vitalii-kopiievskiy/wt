let tabLinks = document.querySelectorAll(".tab__link");
let selectedLink = document.querySelector(".tab__link--active");

tabLinks.forEach(function(link) {
  link.onclick = function() {
    activateLink(this);
  };
});

function activateLink(link) {
  if (selectedLink) {
    selectedLink.classList.remove("tab__link--active");
  }

  selectedLink = link;
  selectedLink.classList.add("tab__link--active");
}
