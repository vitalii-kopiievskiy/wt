const selectState = new WeakMap();

function getParts(wrapper, selectors) {
  return {
    nativeSelect: wrapper.querySelector(selectors.native),
    customSelect: wrapper.querySelector(selectors.custom),
    trigger: wrapper.querySelector(selectors.trigger),
    options: wrapper.querySelector(selectors.options),
  };
}

function getOptionList(parts, selectors) {
  return Array.from(parts.options.querySelectorAll(selectors.option));
}

function closeSelect(wrapper, selectors) {
  const parts = getParts(wrapper, selectors);
  if (!parts.customSelect) return;

  parts.customSelect.classList.remove("isActive");
  parts.customSelect.setAttribute("aria-hidden", "true");

  const state = selectState.get(wrapper);
  if (state) {
    state.hoveredIndex = -1;
  }

  getOptionList(parts, selectors).forEach((option) => {
    option.classList.remove("isHover");
  });
}

function closeOtherSelects(currentWrapper) {
  document.querySelectorAll(".tab__selects, .search__selects").forEach((wrapper) => {
    if (wrapper !== currentWrapper) {
      const selectors = wrapper.classList.contains("search__selects")
        ? searchSelectors
        : tabSelectors;
      closeSelect(wrapper, selectors);
    }
  });
}

function syncSelectedOption(wrapper, selectors) {
  const parts = getParts(wrapper, selectors);
  if (!parts.nativeSelect || !parts.trigger || !parts.options) return;

  const selectedOption = parts.nativeSelect.options[parts.nativeSelect.selectedIndex];
  parts.trigger.textContent = selectedOption ? selectedOption.textContent : "";

  getOptionList(parts, selectors).forEach((option) => {
    option.classList.toggle("isActive", option.dataset.value === parts.nativeSelect.value);
  });
}

function updateHovered(wrapper, selectors, nextIndex) {
  const parts = getParts(wrapper, selectors);
  const options = getOptionList(parts, selectors);
  const state = selectState.get(wrapper);
  if (!state) return;

  options.forEach((option) => option.classList.remove("isHover"));

  if (options[nextIndex]) {
    options[nextIndex].classList.add("isHover");
    state.hoveredIndex = nextIndex;
  } else {
    state.hoveredIndex = -1;
  }
}

function selectOption(wrapper, selectors, option) {
  const parts = getParts(wrapper, selectors);
  if (!parts.nativeSelect || !option) return;

  parts.nativeSelect.value = option.dataset.value || "";
  parts.nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
  syncSelectedOption(wrapper, selectors);
  closeSelect(wrapper, selectors);
}

function openSelect(wrapper, selectors) {
  const parts = getParts(wrapper, selectors);
  if (!parts.customSelect) return;

  closeOtherSelects(wrapper);
  parts.customSelect.classList.add("isActive");
  parts.customSelect.setAttribute("aria-hidden", "false");

  const options = getOptionList(parts, selectors);
  const selectedIndex = options.findIndex(
    (option) => option.dataset.value === parts.nativeSelect.value
  );
  updateHovered(wrapper, selectors, selectedIndex);
}

function handleKeyboard(event, wrapper, selectors) {
  const parts = getParts(wrapper, selectors);
  const options = getOptionList(parts, selectors);
  const state = selectState.get(wrapper);

  if (!state || !parts.customSelect.classList.contains("isActive")) return;

  if (event.key === "Escape") {
    closeSelect(wrapper, selectors);
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    updateHovered(wrapper, selectors, Math.min(state.hoveredIndex + 1, options.length - 1));
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    updateHovered(wrapper, selectors, Math.max(state.hoveredIndex - 1, 0));
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectOption(wrapper, selectors, options[state.hoveredIndex]);
  }
}

export function initCustomSelect(wrapper, selectors) {
  const parts = getParts(wrapper, selectors);
  if (!parts.nativeSelect || !parts.customSelect || !parts.trigger || !parts.options) {
    return;
  }

  syncSelectedOption(wrapper, selectors);

  if (selectState.has(wrapper)) {
    return;
  }

  selectState.set(wrapper, {
    hoveredIndex: -1,
  });

  parts.trigger.addEventListener("click", (event) => {
    event.stopPropagation();

    if (parts.customSelect.classList.contains("isActive")) {
      closeSelect(wrapper, selectors);
    } else {
      openSelect(wrapper, selectors);
    }
  });

  parts.nativeSelect.addEventListener("change", () => {
    syncSelectedOption(wrapper, selectors);
  });

  parts.options.addEventListener("click", (event) => {
    const option = event.target.closest(selectors.option);
    if (!option) return;
    selectOption(wrapper, selectors, option);
  });

  parts.options.addEventListener("mouseover", (event) => {
    const option = event.target.closest(selectors.option);
    if (!option) return;

    const options = getOptionList(parts, selectors);
    updateHovered(wrapper, selectors, options.indexOf(option));
  });

  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) {
      closeSelect(wrapper, selectors);
    }
  });

  document.addEventListener("keydown", (event) => {
    handleKeyboard(event, wrapper, selectors);
  });
}

export const tabSelectors = {
  native: ".tab__select-native",
  custom: ".tab__select-custom",
  trigger: ".tab__trigger",
  options: ".tab__options",
  option: ".tab__option",
};

export const searchSelectors = {
  native: ".js-selectNative",
  custom: ".js-selectCustom",
  trigger: ".search__trigger",
  options: ".search__options",
  option: ".search__option",
};
