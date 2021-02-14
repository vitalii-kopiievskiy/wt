const clearTabButton = document.getElementById("clearTabButton");
const tabForm = document.getElementById("tabForm");
const tabTriggers = document.querySelectorAll(".tab__trigger");

clearTabButton.addEventListener("click", function() {
  let priceLines = document.querySelectorAll(".price__line");

  priceLines.forEach(function(priceLine, i) {
    if (priceLine.classList.contains("invalid"))
      priceLine.classList.remove("invalid");
  });

  tabTriggers.forEach(function(trigger, i) {
    trigger.textContent = `Select ${i + 1}`;

    if (i == tabTriggers.length - 1) {
      trigger.textContent = `Select ${i + 2}`;
    }
  });
});

tabForm.onsubmit = function() {
  let priceLines = document.querySelectorAll(".price__line");
  if (
    priceLines[0].classList.contains("invalid") ||
    priceLines[1].classList.contains("invalid")
  )
    return false;
};
