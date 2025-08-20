// ==UserScript==
// @name         PYS Sidebar Göster/Gizle
// @namespace    https://pys.koton.com.tr
// @version      2025-07-14
// @description  Sidebar'ı Hamburger İkonu ile Gizle/Göster, durumu hatırla (Font Awesome ile)
// @author       hssndrms
// @match        https://pys.koton.com.tr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/sidebar-hamburger.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/sidebar-hamburger.user.js
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

    const sidebar = document.querySelector('#sidebar');
    if (!sidebar || sidebar.children.length === 0) return;

    // Daha önce kaydedilmiş sidebar durumu varsa al
    let sidebarVisible = localStorage.getItem('pysSidebarVisible');
    if (sidebarVisible === null) {
        sidebarVisible = true; // default görünür
    } else {
        sidebarVisible = sidebarVisible === 'true'; // string -> boolean
    }

    // Hamburger İkonunu İçeren Div Oluştur
    const toggleContainer = document.createElement('div');
    toggleContainer.style.display = 'flex';
    toggleContainer.style.alignItems = 'center';
    toggleContainer.style.justifyContent = 'center';
    toggleContainer.style.padding = '7px';
    toggleContainer.style.height = 'fit-content';

    // Hamburger İkonu Oluştur (Font Awesome)
    const hamburger = document.createElement('i');
    hamburger.className = sidebarVisible ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'; // Tek ikon olarak kullanabiliriz
    hamburger.style.cursor = 'pointer';
    hamburger.style.fontSize = '28px';
    hamburger.style.userSelect = 'none';

    toggleContainer.appendChild(hamburger);

    // Sidebar'ın hemen yanına Ekle
    sidebar.parentNode.insertBefore(toggleContainer, sidebar);

    // Sidebar'ın başlangıç görünümünü ayarla
    sidebar.style.display = sidebarVisible ? '' : 'none';

    // Tıklama İşlemi
    hamburger.addEventListener('click', () => {
        sidebarVisible = !sidebarVisible;
        sidebar.style.display = sidebarVisible ? '' : 'none';

        // İkon değişimi istersen, örneğin 'fa-bars' ve 'fa-xmark' arasında
        hamburger.className = sidebarVisible ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';

        // Durumu localStorage'da sakla
        localStorage.setItem('pysSidebarVisible', sidebarVisible.toString());
    });
})();
