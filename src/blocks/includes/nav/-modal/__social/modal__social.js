let naVmodal = document.querySelector('.nav-modal');

naVmodal.onclick = function (e) {
    if (e.target.nodeName != 'A') return;
    naVmodal.style.display = 'none';
}

