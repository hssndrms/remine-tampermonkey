// ==UserScript==
// @name         PYS mypage Time Entries Satır Gruplama
// @namespace    https://pys.koton.com.tr
// @version      2025-07-24
// @description  Time entries tbody içindeki 'odd' tr'lere group class ve expand ikon ekleme, diğerlerini gizle
// @author       hssndrms
// @match        https://pys.koton.com.tr/my/page
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/mypage-time-entry-collapsed.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/mypage-time-entry-collapsed.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('load', () => {
        const table = document.querySelector('table.list.time-entries.odd-even');
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');

        rows.forEach(tr => {
            if (tr.classList.contains('odd')) {
                // 'odd' olanlara 'group' class ekle
                tr.classList.add('group');

                // ilk <td> içine expander span ekle
                const firstTd = tr.querySelector('td:first-child');
                if (firstTd && !firstTd.querySelector('.expander')) {
                    const expander = document.createElement('span');
                    expander.className = 'expander icon icon-collapsed';
                    expander.setAttribute('onclick', 'toggleRowGroup(this);');
                    expander.innerHTML = '&nbsp;';
                    firstTd.insertBefore(expander, firstTd.firstChild);
                }
            } else {
                // diğer tr'leri gizle
                tr.style.display = 'none';
            }
        });
    });
})();
