const priceLines = document.querySelectorAll(".price__line");
const priceInputs = document.querySelectorAll(".price__input");
let pricelRegExp = /^[1-9]\d*$/;

priceInputs.forEach(function(priceInput, i) {
  priceInput.addEventListener("focus", function() {
    priceLines[i].classList.add("isActive");
    priceInput.addEventListener("input", function() {
      if (pricelRegExp.test(priceInput.value) || priceInput.value == "") {
        priceLines[i].classList.remove("invalid");
      } else {
        priceLines[i].classList.add("invalid");
      }
    });
    priceInput.addEventListener("blur", function() {
      priceLines[i].classList.remove("isActive");
    });
  });
});
