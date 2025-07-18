// ==UserScript==
// @name         PYS Tema Seçici
// @namespace    https://pys.koton.com.tr
// @version      0.1
// @author       hssndrms
// @description  Redmine için tema seçici ekler
// @match        https://pys.koton.com.tr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/tema-secici.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/tema-secici.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Tema class'larını temizleyen fonksiyon
    function removeAllThemeClasses() {
        document.body.classList.forEach(cls => {
            if (cls.startsWith('theme-')) {
                document.body.classList.remove(cls);
            }
        });
    }

    const selector = document.createElement('select');
    selector.innerHTML = `
        <option value="">Default</option>
        <option value="theme-rose">Rose & Lavender</option>
        <option value="theme-mint">Mint</option>
        <option value="theme-leopard">Leopard</option>
        <option value="theme-blue">Sky</option>
    `;
    selector.style.marginRight = '10px';

    const currentTheme = localStorage.getItem('selectedTheme');
    if (currentTheme) {
        document.body.classList.add(currentTheme);
        selector.value = currentTheme;
    }

    selector.addEventListener('change', function() {
        removeAllThemeClasses();
        if (this.value) {
            document.body.classList.add(this.value);
            localStorage.setItem('selectedTheme', this.value);
        } else {
            localStorage.removeItem('selectedTheme');
        }
    });

    const loggedasDiv = document.querySelector('#quick-search');
    if (loggedasDiv) {
        loggedasDiv.insertBefore(selector, loggedasDiv.firstChild);
    }
})();
