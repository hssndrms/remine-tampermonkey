// ==UserScript==
// @name         PYS Start-Due Süresi Gösterimi
// @namespace    https://pys.koton.com.tr
// @version      2025-07-19
// @description  startdate ile duedate arasındaki farkı hem görüntüleme hem de düzenleme sayfalarında gün bazında gösterir (DOM dinamiğine uyumlu)
// @author       hssndrms
// @match        https://pys.koton.com.tr/*issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/start-due-gun-farki.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/start-due-gun-farki.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function getColorByDayCount(days) {
        if (days <= 7) return 'var(--success)';
        if (days <= 15) return 'var(--warning)';
        return 'var(--error)';
    }

    function showDurationOnViewPage() {
        // Zaten gösterildiyse tekrar gösterme
        if (document.getElementById('redmine-duration-view')) return;

        const startDateElement = document.querySelector('.start-date .value');
        const dueDateElement = document.querySelector('.due-date .value');

        if (startDateElement && dueDateElement) {
            const startDateText = startDateElement.innerText.trim(); // "08/04/2025"
            const dueDateRaw = dueDateElement.innerText.trim();      // "17/06/2025 (Due in 6 days)"
            const dueDateText = dueDateRaw.split(' ')[0];           // "17/06/2025"

            const parseDate = (str) => {
                const [day, month, year] = str.split('/');
                return new Date(`${year}-${month}-${day}`);
            };

            const start = parseDate(startDateText);
            const due = parseDate(dueDateText);

            if (!isNaN(start) && !isNaN(due)) {
                const diffTime = due - start;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const durationElement = document.createElement('div');
                durationElement.id = 'redmine-duration-view';
                durationElement.textContent = `Süre: ${diffDays + 1} gün`;
                durationElement.style.fontWeight = 'bold';
                durationElement.style.color = getColorByDayCount(diffDays);
                durationElement.style.marginTop = '5px';

                dueDateElement.parentElement.appendChild(durationElement);
            }
        }
    }

    function showDurationOnEditPage() {
        if (document.getElementById('redmine-duration-label')) return;

        const startInput = document.getElementById('issue_start_date');
        const dueInput = document.getElementById('issue_due_date');

        if (startInput && dueInput) {
            const label = document.createElement('span');
            label.id = 'redmine-duration-label';
            label.style.marginLeft = '10px';
            label.style.fontWeight = 'bold';

            dueInput.parentElement.appendChild(label);

            const updateDurationDisplay = () => {
                const startDate = new Date(startInput.value);
                const dueDate = new Date(dueInput.value);

                if (!isNaN(startDate) && !isNaN(dueDate)) {
                    const diffTime = dueDate - startDate;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    label.textContent = `Süre: ${diffDays + 1} gün`;
                    label.style.color = getColorByDayCount(diffDays);
                } else {
                    label.textContent = '';
                }
            };

            startInput.addEventListener('input', updateDurationDisplay);
            dueInput.addEventListener('input', updateDurationDisplay);

            updateDurationDisplay();
        }
    }

    function handlePageChanges() {
        showDurationOnViewPage();
        showDurationOnEditPage();
    }

    const observer = new MutationObserver(() => {
        handlePageChanges();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    // İlk yükleme için de çalıştır
    handlePageChanges();
})();
