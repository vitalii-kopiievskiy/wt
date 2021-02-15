let nativeSelect_1 = document.getElementsByClassName("tab__select-native1")[0];
let customSelect_1 = document.getElementsByClassName("tab__select-custom1")[0];

let tabTrigger_1 = customSelect_1.children[0];
let customSelectOpts_1 = customSelect_1.children[1];
let customOptsList_1 = Array.from(customSelectOpts_1.children);

let optionsCount_1 = customOptsList_1.length;
let optionChecked_1 = "";
let optionHoveredIndex_1 = -1;

tabTrigger_1.addEventListener("click", (e) => {
  const isClosed = !customSelect_1.classList.contains("isActive");

  if (isClosed) {
    openSelectCustom_1();
  } else {
    closeSelectCustom_1();
  }
});

function openSelectCustom_1() {
  customSelect_1.classList.add("isActive");
  customSelect_1.setAttribute("aria-hidden", false);
  if (optionChecked_1) {
    const optionChecked_1Index = customOptsList_1.findIndex(
      (el) => el.getAttribute("data-value") === optionChecked_1
    );
    updateCustomSelectHovered_1(optionChecked_1Index);
  }
  document.addEventListener("click", watchClickOutside_1);
  document.addEventListener("keydown", supportKeyboardNavigation_1);
}

function closeSelectCustom_1() {
  customSelect_1.classList.remove("isActive");

  customSelect_1.setAttribute("aria-hidden", true);

  updateCustomSelectHovered_1(-1);

  document.removeEventListener("click", watchClickOutside_1);
  document.removeEventListener("keydown", supportKeyboardNavigation_1);
}

function watchClickOutside_1(e) {
  const didClickedOutside = !customSelect_1.contains(e.target);

  if (didClickedOutside) {
    closeSelectCustom_1();
  }
}

function supportKeyboardNavigation_1(e) {
  if (e.keyCode === 34) {
    e.preventDefault();
    updateCustomSelectHovered_1(optionsCount_1 - 1);
  }

  if (e.keyCode === 33) {
    e.preventDefault();
    updateCustomSelectHovered_1(0);
  }

  if (e.keyCode === 40 && optionHoveredIndex_1 < optionsCount_1 - 1) {
    e.preventDefault();
    updateCustomSelectHovered_1(optionHoveredIndex_1 + 1);
  }

  if (e.keyCode === 38 && optionHoveredIndex_1 > 0) {
    e.preventDefault();
    updateCustomSelectHovered_1(optionHoveredIndex_1 - 1);
  }

  if (e.keyCode === 13 || e.keyCode === 32) {
    e.preventDefault();

    const option = customSelectOpts_1.children[optionHoveredIndex_1];
    const value = option && option.getAttribute("data-value");

    if (value) {
      nativeSelect_1.value = value;
      updateCustomSelectChecked_1(value, option.textContent);
    }
    closeSelectCustom_1();
  }

  if (e.keyCode === 27) {
    closeSelectCustom_1();
  }
}

function updateCustomSelectHovered_1(newIndex) {
  const prevOption = customSelectOpts_1.children[optionHoveredIndex_1];
  const option = customSelectOpts_1.children[newIndex];

  if (prevOption) {
    prevOption.classList.remove("isHover");
  }

  if (option) {
    option.classList.add("isHover");
  }

  optionHoveredIndex_1 = newIndex;
}

function updateCustomSelectChecked_1(value, text) {
  const prevValue = optionChecked_1;
  const elPrevOption = customSelectOpts_1.querySelector(
    `[data-value="${prevValue}"`
  );
  const elOption = customSelectOpts_1.querySelector(`[data-value="${value}"`);

  if (elPrevOption) {
    elPrevOption.classList.remove("isActive");
  }

  if (elOption) {
    elOption.classList.add("isActive");
  }

  tabTrigger_1.textContent = text;
  optionChecked_1 = value;
}

nativeSelect_1.addEventListener("change", (e) => {
  const value = e.target.value;
  console.log(value);
  const elRespectiveCustomOption = customSelectOpts_1.querySelectorAll(
    `[data-value="${value}"]`
  )[0];

  updateCustomSelectChecked_1(value, elRespectiveCustomOption.textContent);
});

customOptsList_1.forEach(function(elOption, index) {
  elOption.addEventListener("click", (e) => {
    const value = e.target.getAttribute("data-value");

    nativeSelect_1.value = value;
    updateCustomSelectChecked_1(value, e.target.textContent);
    closeSelectCustom_1();
  });

  elOption.addEventListener("mouseenter", (e) => {
    updateCustomSelectHovered_1(index);
  });
});

// -----------------------------------------------------------------

let nativeSelect_2 = document.getElementsByClassName("tab__select-native2")[0];
let customSelect_2 = document.getElementsByClassName("tab__select-custom2")[0];

let tabTrigger_2 = customSelect_2.children[0];
let customSelectOpts_2 = customSelect_2.children[1];
let customOptsList_2 = Array.from(customSelectOpts_2.children);

let optionsCount_2 = customOptsList_2.length;
let optionChecked_2 = "";
let optionHoveredIndex_2 = -1;

tabTrigger_2.addEventListener("click", (e) => {
  const isClosed = !customSelect_2.classList.contains("isActive");

  if (isClosed) {
    openSelectCustom_2();
  } else {
    closeSelectCustom_2();
  }
});

function openSelectCustom_2() {
  customSelect_2.classList.add("isActive");
  customSelect_2.setAttribute("aria-hidden", false);
  if (optionChecked_2) {
    const optionChecked_2Index = customOptsList_2.findIndex(
      (el) => el.getAttribute("data-value") === optionChecked_2
    );
    updateCustomSelectHovered_2(optionChecked_2Index);
  }
  document.addEventListener("click", watchClickOutside_2);
  document.addEventListener("keydown", supportKeyboardNavigation_2);
}

function closeSelectCustom_2() {
  customSelect_2.classList.remove("isActive");

  customSelect_2.setAttribute("aria-hidden", true);

  updateCustomSelectHovered_2(-1);

  document.removeEventListener("click", watchClickOutside_2);
  document.removeEventListener("keydown", supportKeyboardNavigation_2);
}

function watchClickOutside_2(e) {
  const didClickedOutside = !customSelect_2.contains(e.target);

  if (didClickedOutside) {
    closeSelectCustom_2();
  }
}

function supportKeyboardNavigation_2(e) {
  if (e.keyCode === 34) {
    e.preventDefault();
    updateCustomSelectHovered_2(optionsCount_2 - 1);
  }

  if (e.keyCode === 33) {
    e.preventDefault();
    updateCustomSelectHovered_2(0);
  }

  if (e.keyCode === 40 && optionHoveredIndex_2 < optionsCount_2 - 1) {
    e.preventDefault();
    updateCustomSelectHovered_2(optionHoveredIndex_2 + 1);
  }

  if (e.keyCode === 38 && optionHoveredIndex_2 > 0) {
    e.preventDefault();
    updateCustomSelectHovered_2(optionHoveredIndex_2 - 1);
  }

  if (e.keyCode === 13 || e.keyCode === 32) {
    e.preventDefault();

    const option = customSelectOpts_2.children[optionHoveredIndex_2];
    const value = option && option.getAttribute("data-value");

    if (value) {
      nativeSelect_2.value = value;
      updateCustomSelectChecked_2(value, option.textContent);
    }
    closeSelectCustom_2();
  }

  if (e.keyCode === 27) {
    closeSelectCustom_2();
  }
}

function updateCustomSelectHovered_2(newIndex) {
  const prevOption = customSelectOpts_2.children[optionHoveredIndex_2];
  const option = customSelectOpts_2.children[newIndex];

  if (prevOption) {
    prevOption.classList.remove("isHover");
  }

  if (option) {
    option.classList.add("isHover");
  }

  optionHoveredIndex_2 = newIndex;
}

function updateCustomSelectChecked_2(value, text) {
  const prevValue = optionChecked_2;
  const elPrevOption = customSelectOpts_2.querySelector(
    `[data-value="${prevValue}"`
  );
  const elOption = customSelectOpts_2.querySelector(`[data-value="${value}"`);

  if (elPrevOption) {
    elPrevOption.classList.remove("isActive");
  }

  if (elOption) {
    elOption.classList.add("isActive");
  }

  tabTrigger_2.textContent = text;
  optionChecked_2 = value;
}

nativeSelect_2.addEventListener("change", (e) => {
  const value = e.target.value;
  console.log(value);
  const elRespectiveCustomOption = customSelectOpts_2.querySelectorAll(
    `[data-value="${value}"]`
  )[0];

  updateCustomSelectChecked_2(value, elRespectiveCustomOption.textContent);
});

customOptsList_2.forEach(function(elOption, index) {
  elOption.addEventListener("click", (e) => {
    const value = e.target.getAttribute("data-value");

    nativeSelect_2.value = value;
    updateCustomSelectChecked_2(value, e.target.textContent);
    closeSelectCustom_2();
  });

  elOption.addEventListener("mouseenter", (e) => {
    updateCustomSelectHovered_2(index);
  });
});

// ---------------------------------------------------

let nativeSelect_3 = document.getElementsByClassName("tab__select-native3")[0];
let customSelect_3 = document.getElementsByClassName("tab__select-custom3")[0];

let tabTrigger_3 = customSelect_3.children[0];
let customSelectOpts_3 = customSelect_3.children[1];
let customOptsList_3 = Array.from(customSelectOpts_3.children);

let optionsCount_3 = customOptsList_3.length;
let optionChecked_3 = "";
let optionHoveredIndex_3 = -1;

tabTrigger_3.addEventListener("click", (e) => {
  const isClosed = !customSelect_3.classList.contains("isActive");

  if (isClosed) {
    openSelectCustom_3();
  } else {
    closeSelectCustom_3();
  }
});

function openSelectCustom_3() {
  customSelect_3.classList.add("isActive");
  customSelect_3.setAttribute("aria-hidden", false);
  if (optionChecked_3) {
    const optionChecked_3Index = customOptsList_3.findIndex(
      (el) => el.getAttribute("data-value") === optionChecked_3
    );
    updateCustomSelectHovered_3(optionChecked_3Index);
  }
  document.addEventListener("click", watchClickOutside_3);
  document.addEventListener("keydown", supportKeyboardNavigation_3);
}

function closeSelectCustom_3() {
  customSelect_3.classList.remove("isActive");

  customSelect_3.setAttribute("aria-hidden", true);

  updateCustomSelectHovered_3(-1);

  document.removeEventListener("click", watchClickOutside_3);
  document.removeEventListener("keydown", supportKeyboardNavigation_3);
}

function watchClickOutside_3(e) {
  const didClickedOutside = !customSelect_3.contains(e.target);

  if (didClickedOutside) {
    closeSelectCustom_3();
  }
}

function supportKeyboardNavigation_3(e) {
  if (e.keyCode === 34) {
    e.preventDefault();
    updateCustomSelectHovered_3(optionsCount_3 - 1);
  }

  if (e.keyCode === 33) {
    e.preventDefault();
    updateCustomSelectHovered_3(0);
  }

  if (e.keyCode === 40 && optionHoveredIndex_3 < optionsCount_3 - 1) {
    e.preventDefault();
    updateCustomSelectHovered_3(optionHoveredIndex_3 + 1);
  }

  if (e.keyCode === 38 && optionHoveredIndex_3 > 0) {
    e.preventDefault();
    updateCustomSelectHovered_3(optionHoveredIndex_3 - 1);
  }

  if (e.keyCode === 13 || e.keyCode === 32) {
    e.preventDefault();

    const option = customSelectOpts_3.children[optionHoveredIndex_3];
    const value = option && option.getAttribute("data-value");

    if (value) {
      nativeSelect_3.value = value;
      updateCustomSelectChecked_3(value, option.textContent);
    }
    closeSelectCustom_3();
  }

  if (e.keyCode === 27) {
    closeSelectCustom_3();
  }
}

function updateCustomSelectHovered_3(newIndex) {
  const prevOption = customSelectOpts_3.children[optionHoveredIndex_3];
  const option = customSelectOpts_3.children[newIndex];

  if (prevOption) {
    prevOption.classList.remove("isHover");
  }

  if (option) {
    option.classList.add("isHover");
  }

  optionHoveredIndex_3 = newIndex;
}

function updateCustomSelectChecked_3(value, text) {
  const prevValue = optionChecked_3;
  const elPrevOption = customSelectOpts_3.querySelector(
    `[data-value="${prevValue}"`
  );
  const elOption = customSelectOpts_3.querySelector(`[data-value="${value}"`);

  if (elPrevOption) {
    elPrevOption.classList.remove("isActive");
  }

  if (elOption) {
    elOption.classList.add("isActive");
  }

  tabTrigger_3.textContent = text;
  optionChecked_3 = value;
}

nativeSelect_3.addEventListener("change", (e) => {
  const value = e.target.value;
  console.log(value);
  const elRespectiveCustomOption = customSelectOpts_3.querySelectorAll(
    `[data-value="${value}"]`
  )[0];

  updateCustomSelectChecked_3(value, elRespectiveCustomOption.textContent);
});

customOptsList_3.forEach(function(elOption, index) {
  elOption.addEventListener("click", (e) => {
    const value = e.target.getAttribute("data-value");

    nativeSelect_3.value = value;
    updateCustomSelectChecked_3(value, e.target.textContent);
    closeSelectCustom_3();
  });

  elOption.addEventListener("mouseenter", (e) => {
    updateCustomSelectHovered_3(index);
  });
});

// ------------------------------------------------

let nativeSelect_4 = document.getElementsByClassName("tab__select-native4")[0];
let customSelect_4 = document.getElementsByClassName("tab__select-custom4")[0];

let tabTrigger_4 = customSelect_4.children[0];
let customSelectOpts_4 = customSelect_4.children[1];
let customOptsList_4 = Array.from(customSelectOpts_4.children);

let optionsCount_4 = customOptsList_4.length;
let optionChecked_4 = "";
let optionHoveredIndex_4 = -1;

tabTrigger_4.addEventListener("click", (e) => {
  const isClosed = !customSelect_4.classList.contains("isActive");

  if (isClosed) {
    openSelectCustom_4();
  } else {
    closeSelectCustom_4();
  }
});

function openSelectCustom_4() {
  customSelect_4.classList.add("isActive");
  customSelect_4.setAttribute("aria-hidden", false);
  if (optionChecked_4) {
    const optionChecked_4Index = customOptsList_4.findIndex(
      (el) => el.getAttribute("data-value") === optionChecked_4
    );
    updateCustomSelectHovered_4(optionChecked_4Index);
  }
  document.addEventListener("click", watchClickOutside_4);
  document.addEventListener("keydown", supportKeyboardNavigation_4);
}

function closeSelectCustom_4() {
  customSelect_4.classList.remove("isActive");

  customSelect_4.setAttribute("aria-hidden", true);

  updateCustomSelectHovered_4(-1);

  document.removeEventListener("click", watchClickOutside_4);
  document.removeEventListener("keydown", supportKeyboardNavigation_4);
}

function watchClickOutside_4(e) {
  const didClickedOutside = !customSelect_4.contains(e.target);

  if (didClickedOutside) {
    closeSelectCustom_4();
  }
}

function supportKeyboardNavigation_4(e) {
  if (e.keyCode === 34) {
    e.preventDefault();
    updateCustomSelectHovered_4(optionsCount_4 - 1);
  }

  if (e.keyCode === 33) {
    e.preventDefault();
    updateCustomSelectHovered_4(0);
  }

  if (e.keyCode === 40 && optionHoveredIndex_4 < optionsCount_4 - 1) {
    e.preventDefault();
    updateCustomSelectHovered_4(optionHoveredIndex_4 + 1);
  }

  if (e.keyCode === 38 && optionHoveredIndex_4 > 0) {
    e.preventDefault();
    updateCustomSelectHovered_4(optionHoveredIndex_4 - 1);
  }

  if (e.keyCode === 13 || e.keyCode === 32) {
    e.preventDefault();

    const option = customSelectOpts_4.children[optionHoveredIndex_4];
    const value = option && option.getAttribute("data-value");

    if (value) {
      nativeSelect_4.value = value;
      updateCustomSelectChecked_4(value, option.textContent);
    }
    closeSelectCustom_4();
  }

  if (e.keyCode === 27) {
    closeSelectCustom_4();
  }
}

function updateCustomSelectHovered_4(newIndex) {
  const prevOption = customSelectOpts_4.children[optionHoveredIndex_4];
  const option = customSelectOpts_4.children[newIndex];

  if (prevOption) {
    prevOption.classList.remove("isHover");
  }

  if (option) {
    option.classList.add("isHover");
  }

  optionHoveredIndex_4 = newIndex;
}

function updateCustomSelectChecked_4(value, text) {
  const prevValue = optionChecked_4;
  const elPrevOption = customSelectOpts_4.querySelector(
    `[data-value="${prevValue}"`
  );
  const elOption = customSelectOpts_4.querySelector(`[data-value="${value}"`);

  if (elPrevOption) {
    elPrevOption.classList.remove("isActive");
  }

  if (elOption) {
    elOption.classList.add("isActive");
  }

  tabTrigger_4.textContent = text;
  optionChecked_4 = value;
}

nativeSelect_4.addEventListener("change", (e) => {
  const value = e.target.value;
  console.log(value);
  const elRespectiveCustomOption = customSelectOpts_4.querySelectorAll(
    `[data-value="${value}"]`
  )[0];

  updateCustomSelectChecked_4(value, elRespectiveCustomOption.textContent);
});

customOptsList_4.forEach(function(elOption, index) {
  elOption.addEventListener("click", (e) => {
    const value = e.target.getAttribute("data-value");

    nativeSelect_4.value = value;
    updateCustomSelectChecked_4(value, e.target.textContent);
    closeSelectCustom_4();
  });

  elOption.addEventListener("mouseenter", (e) => {
    updateCustomSelectHovered_4(index);
  });
});

// ------------------------------------------

let nativeSelect_6 = document.getElementsByClassName("tab__select-native6")[0];
let customSelect_6 = document.getElementsByClassName("tab__select-custom6")[0];

let tabTrigger_6 = customSelect_6.children[0];
let customSelectOpts_6 = customSelect_6.children[1];
let customOptsList_6 = Array.from(customSelectOpts_6.children);

let optionsCount_6 = customOptsList_6.length;
let optionChecked_6 = "";
let optionHoveredIndex_6 = -1;

tabTrigger_6.addEventListener("click", (e) => {
  const isClosed = !customSelect_6.classList.contains("isActive");

  if (isClosed) {
    openSelectCustom_6();
  } else {
    closeSelectCustom_6();
  }
});

function openSelectCustom_6() {
  customSelect_6.classList.add("isActive");
  customSelect_6.setAttribute("aria-hidden", false);
  if (optionChecked_6) {
    const optionChecked_6Index = customOptsList_6.findIndex(
      (el) => el.getAttribute("data-value") === optionChecked_6
    );
    updateCustomSelectHovered_6(optionChecked_6Index);
  }
  document.addEventListener("click", watchClickOutside_6);
  document.addEventListener("keydown", supportKeyboardNavigation_6);
}

function closeSelectCustom_6() {
  customSelect_6.classList.remove("isActive");

  customSelect_6.setAttribute("aria-hidden", true);

  updateCustomSelectHovered_6(-1);

  document.removeEventListener("click", watchClickOutside_6);
  document.removeEventListener("keydown", supportKeyboardNavigation_6);
}

function watchClickOutside_6(e) {
  const didClickedOutside = !customSelect_6.contains(e.target);

  if (didClickedOutside) {
    closeSelectCustom_6();
  }
}

function supportKeyboardNavigation_6(e) {
  if (e.keyCode === 34) {
    e.preventDefault();
    updateCustomSelectHovered_6(optionsCount_6 - 1);
  }

  if (e.keyCode === 33) {
    e.preventDefault();
    updateCustomSelectHovered_6(0);
  }

  if (e.keyCode === 40 && optionHoveredIndex_6 < optionsCount_6 - 1) {
    e.preventDefault();
    updateCustomSelectHovered_6(optionHoveredIndex_6 + 1);
  }

  if (e.keyCode === 38 && optionHoveredIndex_6 > 0) {
    e.preventDefault();
    updateCustomSelectHovered_6(optionHoveredIndex_6 - 1);
  }

  if (e.keyCode === 13 || e.keyCode === 32) {
    e.preventDefault();

    const option = customSelectOpts_6.children[optionHoveredIndex_6];
    const value = option && option.getAttribute("data-value");

    if (value) {
      nativeSelect_6.value = value;
      updateCustomSelectChecked_6(value, option.textContent);
    }
    closeSelectCustom_6();
  }

  if (e.keyCode === 27) {
    closeSelectCustom_6();
  }
}

function updateCustomSelectHovered_6(newIndex) {
  const prevOption = customSelectOpts_6.children[optionHoveredIndex_6];
  const option = customSelectOpts_6.children[newIndex];

  if (prevOption) {
    prevOption.classList.remove("isHover");
  }

  if (option) {
    option.classList.add("isHover");
  }

  optionHoveredIndex_6 = newIndex;
}

function updateCustomSelectChecked_6(value, text) {
  const prevValue = optionChecked_6;
  const elPrevOption = customSelectOpts_6.querySelector(
    `[data-value="${prevValue}"`
  );
  const elOption = customSelectOpts_6.querySelector(`[data-value="${value}"`);

  if (elPrevOption) {
    elPrevOption.classList.remove("isActive");
  }

  if (elOption) {
    elOption.classList.add("isActive");
  }

  tabTrigger_6.textContent = text;
  optionChecked_6 = value;
}

nativeSelect_6.addEventListener("change", (e) => {
  const value = e.target.value;
  console.log(value);
  const elRespectiveCustomOption = customSelectOpts_6.querySelectorAll(
    `[data-value="${value}"]`
  )[0];

  updateCustomSelectChecked_6(value, elRespectiveCustomOption.textContent);
});

customOptsList_6.forEach(function(elOption, index) {
  elOption.addEventListener("click", (e) => {
    const value = e.target.getAttribute("data-value");

    nativeSelect_6.value = value;
    updateCustomSelectChecked_6(value, e.target.textContent);
    closeSelectCustom_6();
  });

  elOption.addEventListener("mouseenter", (e) => {
    updateCustomSelectHovered_6(index);
  });
});
