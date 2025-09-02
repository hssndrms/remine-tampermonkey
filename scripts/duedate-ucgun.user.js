// ==UserScript==
// @name         PYS Due Date veya startdate 3 gün içindeyse Renklendir
// @namespace    https://pys.koton.com.tr
// @version      2025-07-20
// @description  Duedati bugün olan kayıtlara ait tablodaki satıra dueToday ekler.
// @author       hssndrms
// @match        https://pys.koton.com.tr/*issues*
// @match        https://pys.koton.com.tr/my/page
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/duedate-ucgun.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/duedate-ucgun.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Yardımcı: Tarihleri karşılaştırmak için Date nesnesine çevir
    function parseDate(dateStr) {
        // Redmine'deki tarih formatı: "dd/MM/yyyy"
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    document.querySelectorAll('tr').forEach(tr => {
        if (tr.classList.contains('closed')) return;

        // Öncelikle cf_101 kontrol et
        let dateSource = null;
        const cf101 = tr.querySelector('td.cf_101');
        if (cf101 && cf101.textContent.trim()) {
            dateSource = parseDate(cf101.textContent.trim());
        } else {
            // cf_101 yok veya boşsa due_date kullan
            const dueTd = tr.querySelector('td.due_date');
            if (dueTd && dueTd.textContent.trim()) {
                dateSource = parseDate(dueTd.textContent.trim());
            }
        }

        if (dateSource && dateSource >= today && dateSource <= threeDaysLater) {
            tr.classList.add('dueToday');
        }

        // start_date kısmı olduğu gibi kalacak
        const startTd = tr.querySelector('td.start_date');
        if (startTd) {
            const startText = startTd.textContent.trim();
            if (startText) {
                const startDate = parseDate(startText);
                if (startDate >= today && startDate <= threeDaysLater) {
                    tr.classList.add('dueToday');
                }
            }
        }
    });

})();
