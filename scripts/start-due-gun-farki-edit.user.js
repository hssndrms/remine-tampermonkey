// ==UserScript==
// @name         PYS Duedate Süresi Edit Sırasında
// @namespace    https://pys.koton.com.tr
// @version      2025-06-11
// @description  startdate ile duedate arasındaki farkı edit sayfasında hesaplar gösterir
// @author       hssndrms
// @match        https://pys.koton.com.tr*issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/start-due-gun-farki-edit.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/start-due-gun-farki-edit.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    function getColorByDayCount(days) {
        if (days <= 7) return 'var(--success)';
        if (days <= 15) return 'var(--warning)';
        return 'var(--error)';
    }
    // Tarihleri al, farkı hesapla ve göster
    function updateDurationDisplay() {
        const startInput = document.getElementById('issue_start_date');
        const dueInput = document.getElementById('issue_due_date');
        const label = document.getElementById('redmine-duration-label');

        if (!startInput || !dueInput) return;

        const startDate = new Date(startInput.value);
        const dueDate = new Date(dueInput.value);

        if (!isNaN(startDate) && !isNaN(dueDate)) {
            const diffTime = dueDate - startDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            label.textContent = `Süre: ${diffDays+1} gün`;
            label.style.color = getColorByDayCount(diffDays);
        } else {
            label.textContent = '';
        }
    }

    window.addEventListener('load', () => {
        const dueInput = document.getElementById('issue_due_date');
        const startInput = document.getElementById('issue_start_date');

        if (dueInput && startInput) {
            // Yeni gösterim elemanını oluştur
            const label = document.createElement('span');
            label.id = 'redmine-duration-label';
            label.style.marginLeft = '10px';
            label.style.fontWeight = 'bold';
            //label.style.color = 'var(--warning)';

            // Due date input'un hemen sağına ekle
            dueInput.parentElement.appendChild(label);

            // Değişiklik olduğunda güncelle
            dueInput.addEventListener('input', updateDurationDisplay);
            startInput.addEventListener('input', updateDurationDisplay);

            // Sayfa yüklenince göster
            updateDurationDisplay();
        }
    });
})();
