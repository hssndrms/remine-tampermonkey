// ==UserScript==
// @name         PYS Tarih alanı bugün seç
// @namespace    https://pys.koton.com.tr
// @version      1.4
// @author       IlkerDemiraslan
// @description  Tarih alanlarının yanına bugünün tarihini otomatik dolduran buton ekler (Font Awesome ikonlu).
// @match        https://pys.koton.com.tr*issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/tarih-bugun.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/tarih-bugun.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Font Awesome CDN yükle
    if (!document.querySelector('link[href*="cdnjs.cloudflare.com/ajax/libs/font-awesome"]')) {
        const link = document.createElement('link');
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    function addDateButtons() {
        document.querySelectorAll('input[type="date"]').forEach(input => {
            if (input.nextElementSibling && input.nextElementSibling.classList.contains('date-today-btn')) return;

            const button = document.createElement('button');
            button.type = 'button'; // Form submit olmasın
            button.className = 'date-today-btn';
            button.style.marginLeft = '3px';
            button.style.cursor = 'pointer';
            button.style.color = '#333';
            button.style.fontSize = '16px';
            button.title = 'Bugünün tarihi';

            // Font Awesome takvim ikonu
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-calendar-day';
            button.appendChild(icon);

            button.addEventListener('click', (e) => {
                e.preventDefault();
                input.value = today;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });

            input.insertAdjacentElement('afterend', button);
        });
    }

    // İlk yükleme
    addDateButtons();

    // DOM değişikliklerini izle
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                setTimeout(addDateButtons, 100);
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Sekme görünürlüğü değişince tekrar kontrol et
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(addDateButtons, 100);
        }
    });

})();
