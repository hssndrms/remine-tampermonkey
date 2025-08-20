// ==UserScript==
// @name         PYS Issue Üzerine Gelince Son Notu Göster
// @namespace    https://pys.koton.com.tr
// @version      1.0
// @description  Issue satırına gelince son notu tooltip olarak gösterir
// @author       hssndrms
// @match        https://pys.koton.com.tr/issues*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @grant        GM_xmlhttpRequest
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/son-not-goster.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/son-not-goster.user.js
// @connect      pys.koton.com.tr
// ==/UserScript==

(function () {
    'use strict';

    const baseUrl = 'https://pys.koton.com.tr';

    // Her issue satırını bul
    document.querySelectorAll('table.issues tr.issue').forEach(row => {
        const link = row.querySelector('a.issue');

        if (!link) return;

        row.addEventListener('mouseenter', () => {
            // Daha önce tooltip varsa tekrar yükleme
            if (row.dataset.tooltipLoaded) return;

            row.dataset.tooltipLoaded = 'true';
            const issueUrl = link.href;

            GM_xmlhttpRequest({
                method: "GET",
                url: issueUrl,
                onload: function (response) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, "text/html");

                    const journals = doc.querySelectorAll('#history .journal .wiki');

                    if (journals.length > 0) {
                        const lastNote = journals[journals.length - 1].innerText.trim();
                        row.title = lastNote || "Son not bulunamadı";
                    } else {
                        row.title = "Hiç not yok";
                    }
                }
            });
        });
    });
})();
