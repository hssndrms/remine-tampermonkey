// ==UserScript==
// @name         PYS Overdue Kontrollü Satır Düzeltme
// @namespace    http://tampermonkey.net/
// @version      2025-09-02
// @description  Overdue olan satırları kontrol et, cf_101 tarihine göre sınıfı güncelle
// @author       hssndrms
// @match        https://pys.koton.com.tr/*issues*
// @match        https://pys.koton.com.tr/my/page
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/overdue-kontrol.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/overdue-kontrol.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Tarih kontrolü için yardımcı fonksiyon
    function parseDate(dateStr) {
        // Redmine'deki tarih formatı: "dd/MM/yyyy"
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
    }

    // Bugünün tarihi (saat sıfırlanmış)
    const today = new Date();
    today.setHours(0,0,0,0);

    // Tüm satırları kontrol et
    const rows = document.querySelectorAll('tr');

    rows.forEach(row => {
        if (row.classList.contains('overdue')) {
            const cf101 = row.querySelector('td.cf_101');
            if(cf101) {
                const dateValue = cf101.textContent.trim();
                if(dateValue) {
                    const cfDate = parseDate(dateValue);
                    // Bugünden önceyse overdue kalır, değilse sınıfı sil
                    if(cfDate >= today) {
                        row.classList.remove('overdue');
                    }
                } else {
                    // cf_101 boşsa overdue kalır
                }
            } else {
                // cf_101 yoksa overdue kalır
            }
        }
    });

})();
