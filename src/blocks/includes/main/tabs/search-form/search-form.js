import { initCustomSelect, searchSelectors } from "../../../../../js/custom-select";

const searchForm = document.querySelector(".search-form");
const searchFormInput = document.querySelector(".search-form__input");

function initSearchSelect() {
  document.querySelectorAll(".search__selects").forEach((wrapper) => {
    initCustomSelect(wrapper, searchSelectors);
  });
}

if (searchForm && searchFormInput) {
  initSearchSelect();
  document.addEventListener("catalog:selects-updated", initSearchSelect);

  searchFormInput.addEventListener("input", () => {
    searchFormInput.classList.toggle(
      "invalid",
      searchFormInput.value.trim().length === 1
    );
  });
}
