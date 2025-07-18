// ==UserScript==
// @name         PYS Font Awesome Ekle
// @namespace    https://fontawesome.com/icons
// @version      1.0
// @description  PYS sitesine Font Awesome ikon kütüphanesini ekle
// @author       hssndrms
// @match        https://pys.koton.com.tr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/font-awesome.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/font-awesome.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Font Awesome CDN yükle (ücretsiz sürüm)
    if (!document.querySelector('link[href*="cdnjs.cloudflare.com/ajax/libs/font-awesome"]')) {
        const link = document.createElement('link');
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

})();