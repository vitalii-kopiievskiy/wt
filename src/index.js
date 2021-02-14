// JS
import "./js/";

// SCSS
import "./assets/scss/main.scss";

// CSS (example)
// import './assets/css/main.css'

document.addEventListener("click", followPrevent);

function followPrevent(e) {
  if (!e.target.classList.contains("prevent-link")) return;
  e.preventDefault();
}
