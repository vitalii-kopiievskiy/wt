let productItems = document.querySelectorAll(".products__item");

let buyButtons = document.querySelectorAll(".products__btn");
let cartLabel = document.getElementById("cartLabel");
let cartLabelTxt = cartLabel.children[1];

let compareButtons = document.querySelectorAll(".products-compare");
let compareLabel = document.getElementById("compareLabel");
let compareLabelTxt = compareLabel.children[1];

let wishButtons = document.querySelectorAll(".products-wishlist");
let wishLabel = document.getElementById("wishLabel");
let wishLabelTxt = wishLabel.children[1];

function getCartData() {
  return JSON.parse(localStorage.getItem("cart"));
}

function setCartData(item) {
  localStorage.setItem("cart", JSON.stringify(item));
  return false;
}

function addToCart() {
  let cartData = getCartData() || {};
  let parentBox = this.parentElement;
  let itemId = this.getAttribute("data-id");
  let itemTitle = parentBox.querySelector(".products__caption .products__title")
    .innerHTML;

  let itemPrice = parseInt(
    parentBox
      .querySelector(".products__prices .products__price--active")
      .textContent.split(" ")
      .join("")
  );

  if (cartData.hasOwnProperty(itemId)) {
    cartData[itemId][2] += 1;
  } else {
    cartData[itemId] = [itemTitle, itemPrice, 1];
  }

  this.lastChild.textContent = "В корзине";

  setCartData(cartData);
  showCart(cartData);
}

function showCart(data) {
  let sum = Object.values(data).reduce((sum, current) => sum + current[2], 0);
  cartLabelTxt.textContent = sum;
  cartLabel.style.display = "block";
}

buyButtons.forEach(function(buyButton) {
  buyButton.addEventListener("click", addToCart);
});

function getCompareData() {
  return JSON.parse(localStorage.getItem("compare"));
}

function setCompareData(item) {
  localStorage.setItem("compare", JSON.stringify(item));
  return false;
}

function addToCompare() {
  let compareData = getCompareData() || {};
  let parentBox = this.parentElement.parentElement.parentElement;
  let itemId = this.getAttribute("data-id");
  let itemTitle = parentBox.querySelector(".products__caption .products__title")
    .innerHTML;

  let itemPrice = parseInt(
    parentBox
      .querySelector(".products__prices .products__price--active")
      .textContent.split(" ")
      .join("")
  );

  if (compareData.hasOwnProperty(itemId)) {
    compareData[itemId][2] += 1;
  } else {
    compareData[itemId] = [itemTitle, itemPrice, 1];
  }

  this.lastChild.textContent = "В сравнении";

  setCompareData(compareData);
  showCompare(compareData);
}

function showCompare(data) {
  compareLabelTxt.textContent = Object.entries(data).length;
  compareLabel.style.display = "block";
}

compareButtons.forEach(function(compareButton) {
  compareButton.addEventListener("click", addToCompare);
});

function getWishData() {
  return JSON.parse(localStorage.getItem("wish"));
}

function setWishData(item) {
  localStorage.setItem("wish", JSON.stringify(item));
  return false;
}

function addToWish() {
  let wishData = getWishData() || {};
  let parentBox = this.parentElement.parentElement.parentElement;
  let itemId = this.getAttribute("data-id");
  let itemTitle = parentBox.querySelector(".products__caption .products__title")
    .innerHTML;

  let itemPrice = parseInt(
    parentBox
      .querySelector(".products__prices .products__price--active")
      .textContent.split(" ")
      .join("")
  );

  if (wishData.hasOwnProperty(itemId)) {
    wishData[itemId][2] += 1;
  } else {
    wishData[itemId] = [itemTitle, itemPrice, 1];
  }

  this.lastChild.textContent = "В избранном";

  setWishData(wishData);
  showWish(wishData);
}

function showWish(data) {
  wishLabelTxt.textContent = Object.entries(data).length;
  wishLabel.style.display = "block";
}

wishButtons.forEach(function(wishButton) {
  wishButton.addEventListener("click", addToWish);
});

window.addEventListener("load", function() {
  if (getCartData()) {
    showCart(getCartData());
    buyButtons.forEach(function(buyButton) {
      for (let key of Object.keys(getCartData())) {
        if (buyButton.getAttribute("data-id") == key) {
          buyButton.lastChild.textContent = "В корзине";
        }
      }
    });
  }
  if (getCompareData()) {
    showCompare(getCompareData());
    compareButtons.forEach(function(compareButton) {
      for (let key of Object.keys(getCompareData())) {
        if (compareButton.getAttribute("data-id") == key) {
          compareButton.lastChild.textContent = "В сравнении";
        }
      }
    });
  }
  if (getWishData()) {
    showWish(getWishData());
    wishButtons.forEach(function(wishButton) {
      for (let key of Object.keys(getWishData())) {
        if (wishButton.getAttribute("data-id") == key) {
          wishButton.lastChild.textContent = "В избранном";
        }
      }
    });
  }
});
