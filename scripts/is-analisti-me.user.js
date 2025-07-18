// ==UserScript==
// @name         PYS İş Analisti otomatik seçilsin
// @namespace    https://pys.koton.com.tr
// @version      2025-07-02
// @description  iş analisti özel alanında kendimin otomatik seçilmesi
// @author       hssndrms
// @match        https://pys.koton.com.tr/projects/*/issues/new
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/is-analisti-me.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/is-analisti-me.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Sayfa tamamen yüklendiğinde çalışması için
    window.addEventListener('load', function() {
        const select = document.querySelector('select#issue_custom_field_values_20');
        if (select) {
            const optionToSelect = Array.from(select.options).find(opt => opt.text.includes("<< me >>"));
            if (optionToSelect) {
                select.value = optionToSelect.value;

                // Değişiklik olayını tetikle (Redmine bazen bu gerekli olabiliyor)
                const event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);
            }
        }
    });
})();
