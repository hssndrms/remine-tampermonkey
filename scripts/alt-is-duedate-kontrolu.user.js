// ==UserScript==
// @name         PYS Parent task Duedate kontrolü
// @namespace    https://pys.koton.com.tr
// @version      2025-06-27
// @description  Subtask tarihlerine göre parent duedate geri tarihli ise arka planın rengi uygular
// @author       hssndrms
// @match        https://pys.koton.com.tr/issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/alt-is-duedate-kontrolu.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/alt-is-duedate-kontrolu.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function parseDate(str) {
        const [day, month, year] = str.split('/');
        return new Date(`${year}-${month}-${day}`);
    }

    const parentDueDiv = document.querySelector('.due-date .value');
    if (!parentDueDiv) return;

    const match = parentDueDiv.textContent.trim().match(/\d{2}\/\d{2}\/\d{4}/);
    if (!match) return;

    const parentDueDate = parseDate(match[0]);

    const subtaskTable = document.querySelector('#issue_tree .list.issues');
    if (!subtaskTable) return;

    const rows = subtaskTable.querySelectorAll('tr');
    let anyLater = false;

    rows.forEach(row => {
        if (row.classList.contains('closed')) return;

        const dueCell = row.querySelector('td.due_date');
        if (!dueCell) return;

        const text = dueCell.textContent.trim();
        if (!text) return;

        const subtaskDueDate = parseDate(text);
        if (subtaskDueDate > parentDueDate) {
            anyLater = true;
        }
    });

    if (anyLater) {
        // Yeni uyarı div'i oluştur
        const warningDiv = document.createElement('div');
        warningDiv.textContent = 'İleri tarihli subtask var';
        warningDiv.style.background = 'var(--warning)';
        warningDiv.style.color = 'var(--text-primary)';
        warningDiv.style.padding = '1px 4px';
        warningDiv.style.borderRadius = '6px';
        warningDiv.style.fontWeight = 'bold';
        warningDiv.style.display = 'inline-block';
        warningDiv.style.marginLeft = '8px';

        // due-date value div'inin hemen sonrasına ekle
        //parentDueDiv.insertAdjacentElement('afterend', warningDiv);
        parentDueDiv.appendChild(warningDiv);
    }
})();
