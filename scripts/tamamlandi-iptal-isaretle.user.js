// ==UserScript==
// @name         PYS Tamamlandı iptal işaretle
// @namespace    https://pys.koton.com.tr
// @version      2025-07-14
// @description  Durumu "Tamamlandı" "İptal" Olarak Ayarla (Font Awesome ile)
// @author       hssndrms
// @match        https://pys.koton.com.tr/issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/tamamlandi-iptal-isaretle.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/tamamlandi-iptal-isaretle.user.js
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

    // Select elementini seçelim
    const statusSelect = document.querySelector('#issue_status_id');
    if (statusSelect) {

        // Tamamlandı ikonu (check)
        const iconDone = document.createElement('i');
        iconDone.className = 'fa-solid fa-check';
        iconDone.title = 'Tamamlandı';
        iconDone.style.color = 'var(--success)';

        const button = document.createElement('button');
        button.title = 'Tamamlandı olarak işaretle';
        button.style.marginLeft = '5px';
        button.style.cursor = 'pointer';
        button.appendChild(iconDone);

        // İptal ikonu (close)
        const iconCancel = document.createElement('i');
        iconCancel.className = 'fa-solid fa-xmark';
        iconCancel.title = 'İptal Et';
        iconCancel.style.color = 'var(--error)';

        const buttonCancel = document.createElement('button');
        buttonCancel.title = 'İptal olarak işaretle';
        buttonCancel.style.marginLeft = '1px';
        buttonCancel.style.cursor = 'pointer';
        buttonCancel.appendChild(iconCancel);

        // İptal tıklama
        buttonCancel.addEventListener('click', function(e) {
            e.preventDefault();
            statusSelect.value = '28';  // İptal Edildi'nin value'su
            statusSelect.dispatchEvent(new Event('change', { bubbles: true }));

            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.querySelector('#issue_custom_field_values_94');
            if (dateInput) {
                dateInput.value = today;
                dateInput.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                console.warn('Tamamlanma Tarihi alanı bulunamadı.');
            }
        });

        // Tamamlandı tıklama
        button.addEventListener('click', function(e) {
            e.preventDefault();
            statusSelect.value = '19';  // Tamamlandı'nın value'su
            statusSelect.dispatchEvent(new Event('change', { bubbles: true }));

            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.querySelector('#issue_custom_field_values_94');
            if (dateInput) {
                dateInput.value = today;
                dateInput.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                console.warn('Tamamlanma Tarihi alanı bulunamadı.');
            }
        });

        // İkonları select'in yanına ekle
        statusSelect.parentNode.insertBefore(buttonCancel, statusSelect.nextSibling);
        statusSelect.parentNode.insertBefore(button, statusSelect.nextSibling);
    }
})();
