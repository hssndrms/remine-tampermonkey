// ==UserScript==
// @name         PYS DueDate Süresi
// @namespace    https://pys.koton.com.tr
// @version      2025-06-11
// @description  startdate ile duedate arasındaki farkı gün bazında gösterir
// @author       hssndrms
// @match        https://pys.koton.com.tr/issues*
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

    window.addEventListener('load', () => {
        const startDateElement = document.querySelector('.start-date .value');
        const dueDateElement = document.querySelector('.due-date .value');

        if (startDateElement && dueDateElement) {
            const startDateText = startDateElement.innerText.trim(); // "08/04/2025"
            const dueDateRaw = dueDateElement.innerText.trim();      // "17/06/2025 (Due in 6 days)"
            const dueDateText = dueDateRaw.split(' ')[0];           // "17/06/2025"

            // "DD/MM/YYYY" formatındaki tarihleri JS Date nesnesine çevir
            const parseDate = (str) => {
                const [day, month, year] = str.split('/');
                return new Date(`${year}-${month}-${day}`);
            };

            const start = parseDate(startDateText);
            const due = parseDate(dueDateText);

            if (!isNaN(start) && !isNaN(due)) {
                const diffTime = due - start;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Gösterim elemanı
                const durationElement = document.createElement('div');
                durationElement.textContent = `Süre: ${diffDays+1} gün`;
                durationElement.style.fontWeight = 'bold';
                durationElement.style.color = getColorByDayCount(diffDays);//'var(--warning)';
                durationElement.style.marginTop = '5px';

                // Due date elementinin altına ekle
                dueDateElement.parentElement.appendChild(durationElement);
            }
        }
    });
})();
