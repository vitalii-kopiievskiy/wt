import { initCustomSelect, tabSelectors } from "../../../../../../js/custom-select";

function initTabSelects() {
  document.querySelectorAll(".tab__selects").forEach((wrapper) => {
    initCustomSelect(wrapper, tabSelectors);
  });
}

initTabSelects();
document.addEventListener("catalog:selects-updated", initTabSelects);
