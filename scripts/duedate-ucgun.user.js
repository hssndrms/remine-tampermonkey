// ==UserScript==
// @name         PYS Due Date veya startdate 3 gün içindeyse Renklendir
// @namespace    https://pys.koton.com.tr
// @version      2025-07-20
// @description  Duedati bugün olan kayıtlara ait tablodaki satıra dueToday ekler.
// @author       hssndrms
// @match        https://pys.koton.com.tr/*issues*
// @match        https://pys.koton.com.tr/my/page
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
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

    // Bugünün tarihi (saatleri sıfırla)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3 gün sonrası
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    // Tablodaki tüm <tr> satırlarını kontrol et
    document.querySelectorAll('tr').forEach(tr => {
        // Eğer satır 'closed' ise (tamamlanmış görev), atla
        if (tr.classList.contains('closed')) return;
        const dueTd = tr.querySelector('td.due_date');
        if (dueTd) {
            const dueText = dueTd.textContent.trim();
            if (dueText) {
                const dueDate = parseDate(dueText);
                if (dueDate >= today && dueDate <= threeDaysLater) {
                    tr.classList.add('dueToday');
                }
            }
        }

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

