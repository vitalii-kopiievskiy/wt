let tabTriggers = document.querySelectorAll('.js-tab-trigger');
let tabContents = document.querySelectorAll('.js-tab-content');

tabTriggers.forEach(function(trigger) {
    trigger.addEventListener('click', function() {

        let id = this.getAttribute('data-tab');
        let content = document.querySelector('.js-tab-content[data-tab="'+id+'"]');
        let activeTrigger = document.querySelector('.js-tab-trigger.active');
        let activeContent = document.querySelector('.js-tab-content.active');

        activeTrigger.classList.remove('active');
        trigger.classList.add('active');

        activeContent.classList.remove('active');
        content.classList.add('active');
    });
 });