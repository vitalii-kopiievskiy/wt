const searchForm = document.querySelector(".search-form");
const searchFormInput = document.querySelector(".search-form__input");

let elSelectNative = document.getElementsByClassName("js-selectNative")[0];
let elSelectCustom = document.getElementsByClassName("js-selectCustom")[0];

let elSelectCustomBox = elSelectCustom.children[0];
let elSelectCustomOpts = elSelectCustom.children[1];

let customOptsList = Array.from(elSelectCustomOpts.children);
let optionsCount = customOptsList.length;
let defaultLabel = elSelectCustomBox.getAttribute("data-value");

let optionChecked = "";
let optionHoveredIndex = -1;

elSelectCustomBox.addEventListener("click", (e) => {
  const isClosed = !elSelectCustom.classList.contains("isActive");

  if (isClosed) {
    openSelectCustom();
  } else {
    closeSelectCustom();
  }
});

function openSelectCustom() {
  elSelectCustom.classList.add("isActive");
  elSelectCustom.setAttribute("aria-hidden", false);

  if (optionChecked) {
    const optionCheckedIndex = customOptsList.findIndex(
      (el) => el.getAttribute("data-value") === optionChecked
    );
    updateCustomSelectHovered(optionCheckedIndex);
  }

  document.addEventListener("click", watchClickOutside);
  document.addEventListener("keydown", supportKeyboardNavigation);
}

function closeSelectCustom() {
  elSelectCustom.classList.remove("isActive");

  elSelectCustom.setAttribute("aria-hidden", true);

  updateCustomSelectHovered(-1);

  document.removeEventListener("click", watchClickOutside);
  document.removeEventListener("keydown", supportKeyboardNavigation);
}

function updateCustomSelectHovered(newIndex) {
  const prevOption = elSelectCustomOpts.children[optionHoveredIndex];
  const option = elSelectCustomOpts.children[newIndex];

  if (prevOption) {
    prevOption.classList.remove("isHover");
  }
  if (option) {
    option.classList.add("isHover");
  }

  optionHoveredIndex = newIndex;
}

function updateCustomSelectChecked(value, text) {
  const prevValue = optionChecked;

  const elPrevOption = elSelectCustomOpts.querySelector(
    `[data-value="${prevValue}"`
  );
  const elOption = elSelectCustomOpts.querySelector(`[data-value="${value}"`);

  if (elPrevOption) {
    elPrevOption.classList.remove("isActive");
  }

  if (elOption) {
    elOption.classList.add("isActive");
  }

  elSelectCustomBox.textContent = text;
  optionChecked = value;
}

function watchClickOutside(e) {
  const didClickedOutside = !elSelectCustom.contains(e.target);
  if (didClickedOutside) {
    closeSelectCustom();
  }
}

function supportKeyboardNavigation(e) {
  if (e.keyCode === 34) {
    e.preventDefault();
    updateCustomSelectHovered(optionsCount - 1);
  }

  if (e.keyCode === 33) {
    e.preventDefault();
    updateCustomSelectHovered(0);
  }

  if (e.keyCode === 40 && optionHoveredIndex < optionsCount - 1) {
    e.preventDefault();
    updateCustomSelectHovered(optionHoveredIndex + 1);
  }

  if (e.keyCode === 38 && optionHoveredIndex > 0) {
    e.preventDefault();
    updateCustomSelectHovered(optionHoveredIndex - 1);
  }

  if (e.keyCode === 13 || e.keyCode === 32) {
    e.preventDefault();

    const option = elSelectCustomOpts.children[optionHoveredIndex];
    const value = option && option.getAttribute("data-value");

    if (value) {
      elSelectNative.value = value;
      updateCustomSelectChecked(value, option.textContent);
    }
    closeSelectCustom();
  }

  if (e.keyCode === 27) {
    closeSelectCustom();
  }
}

elSelectNative.addEventListener("change", (e) => {
  const value = e.target.value;
  const elRespectiveCustomOption = elSelectCustomOpts.querySelectorAll(
    `[data-value="${value}"]`
  )[0];

  updateCustomSelectChecked(value, elRespectiveCustomOption.textContent);
});

customOptsList.forEach(function(elOption, index) {
  elOption.addEventListener("click", (e) => {
    const value = e.target.getAttribute("data-value");

    elSelectNative.value = value;
    updateCustomSelectChecked(value, e.target.textContent);
    closeSelectCustom();
  });

  elOption.addEventListener("mouseenter", (e) => {
    updateCustomSelectHovered(index);
  });
});

searchForm.onsubmit = function() {
  if (searchFormInput.value.length < 2) return false;
};
