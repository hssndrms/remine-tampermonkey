// ==UserScript==
// @name         PYS Kişiye Ata
// @namespace    http://tampermonkey.net/
// @version      2025-08-13
// @description  issue_assigned_to_id nesnesine hızlı atama linki ekler
// @author       hssndrms
// @match        https://pys.koton.com.tr/*issues/*
// @match        *://*/redmine/issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/kisiye-ata.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/kisiye-ata.user.js
// @connect      pys.koton.com.tr
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Burada kişi bilgilerini tanımlayın
    const PERSON_ID = '38'; // Atanacak kişinin ID'si
    const PERSON_NAME = 'Fahri Molla'; // Atanacak kişinin adı

    function addAssignLink() {
        // issue_assigned_to_id elementini bul
        const assignedToElement = document.getElementById('issue_assigned_to_id');

        if (!assignedToElement) {
            return;
        }

        // Zaten link eklenmiş mi kontrol et
        if (assignedToElement.parentElement.querySelector('.assign-to-who')) {
            return;
        }

        // Link elementi oluştur
        const assignLink = document.createElement('a');
        assignLink.href = '#';
        assignLink.className = 'assign-to-who';
        assignLink.title = PERSON_NAME;
        assignLink.style.marginLeft = '10px';
        assignLink.style.color = '#169';
        assignLink.style.textDecoration = 'none';
        assignLink.innerHTML = '<i class="fas fa-user-plus"></i>';

        // Click event handler
        assignLink.addEventListener('click', function(e) {
            e.preventDefault();

            // Dropdown'u PERSON_ID'ye set et
            assignedToElement.value = PERSON_ID;

            // Change event'ini trigger et (Redmine'ın kendi JS'i için)
            const changeEvent = new Event('change', { bubbles: true });
            assignedToElement.dispatchEvent(changeEvent);

            console.log(`Assigned to: ${PERSON_NAME} (ID: ${PERSON_ID})`);
        });

        // Link'i assigned_to elementinin parent'ına ekle (son child olarak)
        assignedToElement.parentElement.appendChild(assignLink);
    }

    // FontAwesome yüklenmiş mi kontrol et, yoksa yükle
    function loadFontAwesome() {
        if (!document.querySelector('link[href*="fontawesome"]') && !document.querySelector('script[src*="fontawesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
            document.head.appendChild(link);
        }
    }

    // Sayfa yüklendiğinde çalış
    function init() {
        loadFontAwesome();

        // DOM hazır olana kadar bekle
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addAssignLink);
        } else {
            addAssignLink();
        }

        // AJAX çağrıları sonrası da kontrol et
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    addAssignLink();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    init();
})();