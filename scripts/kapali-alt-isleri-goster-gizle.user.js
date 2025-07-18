// ==UserScript==
// @name         PYS Kapalı alt işleri veya İlşkili işleri göster gizle
// @namespace    https://pys.koton.com.tr
// @version      2025-07-10
// @description  PYS kapalı subtaskları veya ilişkili işleri gizler gösterir
// @author       You
// @match        https://pys.koton.com.tr/issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/kapali-alt-isleri-goster-gizle.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/kapali-alt-isleri-goster-gizle.user.js
// @grant        none
// ==/UserScript==
(function() {
    'use strict';

    function addToggleCheckbox(containerSelector, tableSelector, storageKey, labelText) {
        const contextual = document.querySelector(containerSelector + ' .contextual');
        if (!contextual) return;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `toggle-closed-tasks-${storageKey}`;
        checkbox.style.marginRight = '5px';

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = labelText;
        label.style.cursor = 'pointer';

        const container = document.createElement('div');
        container.style.display = 'inline-block';
        container.appendChild(checkbox);
        container.appendChild(label);

        contextual.insertBefore(container, contextual.firstChild);

        // Hafızadan oku
        const storedValue = localStorage.getItem(storageKey);
        const hideClosed = storedValue === 'true';
        checkbox.checked = hideClosed;
        toggleClosedTasks(hideClosed, tableSelector);

        // Değişiklikte kaydet
        checkbox.addEventListener('change', () => {
            const hide = checkbox.checked;
            localStorage.setItem(storageKey, hide);
            toggleClosedTasks(hide, tableSelector);
        });
    }

    function toggleClosedTasks(hide, tableSelector) {
        const rows = document.querySelectorAll(`${tableSelector} tr.issue.closed`);
        rows.forEach(row => {
            row.style.display = hide ? 'none' : '';
        });
    }

    // İki bölgeye ayrı ayrı ekle
    window.addEventListener('load', () => {
        addToggleCheckbox('#issue_tree', '#issue_tree table.list.issues', 'hide_closed_issue_tree', 'Kapalı Taskları Gizle (SubTask)');
        addToggleCheckbox('#relations', '#relations table.list.issues', 'hide_closed_relations', 'Kapalı Taskları Gizle (Relations)');
    });

})();