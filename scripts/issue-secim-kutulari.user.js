// ==UserScript==
// @name         PYS Issue Seçim Kutuları
// @namespace    https://pys.koton.com.tr
// @version      2025-07-21
// @description  Seçim kutularını görünür yapar ve tümünü seç kutuları ekler
// @author       hssndrms
// @match        https://pys.koton.com.tr/issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/issue-secim-kutulari.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/issue-secim-kutulari.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const STYLE_ID = 'show-checkbox-tds';
    const TOGGLE_ID = 'checkbox-toggle';
    const TABLE_SELECTOR = '.list.issues.odd-even';

    function injectStyle(id, css) {
        if (!document.getElementById(id)) {
            const style = document.createElement('style');
            style.id = id;
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    function removeStyle(id) {
        const style = document.getElementById(id);
        if (style) style.remove();
    }

    function addToggleControl(containerDiv, labelText, checkboxId, onChangeCallback) {
        if (!containerDiv || document.getElementById(checkboxId)) return;

        const label = document.createElement('label');
        label.style.marginLeft = '10px';
        label.style.cursor = 'pointer';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.style.marginRight = '5px';

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(labelText));
        containerDiv.insertBefore(label, containerDiv.firstChild);

        checkbox.addEventListener('change', onChangeCallback);
        return checkbox;
    }

    function addSelectAllControl(wrapperDiv, table, sectionId) {
        const existing = wrapperDiv.querySelector('.select-all-wrapper');
        if (existing) return;

        const div = document.createElement('div');
        div.className = 'select-all-wrapper';
        div.style.marginBottom = '5px';

        const label = document.createElement('label');
        label.style.cursor = 'pointer';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '5px';

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode('Tümünü Seç'));
        div.appendChild(label);

        table.parentElement.insertBefore(div, table);

      checkbox.addEventListener('change', () => {
    const rows = table.querySelectorAll('tbody tr');

    // Toggle'ların durumunu al
    const isIssueTreeHideClosed = document.getElementById('toggle-closed-tasks-hide_closed_issue_tree')?.checked;
    const isRelationsHideClosed = document.getElementById('toggle-closed-tasks-hide_closed_relations')?.checked;

    let hideClosedActive = false;
    if (sectionId === 'issue_tree') {
        hideClosedActive = isIssueTreeHideClosed;
    } else if (sectionId === 'relations') {
        hideClosedActive = isRelationsHideClosed;
    }

    rows.forEach(row => {
        const cb = row.querySelector('td.checkbox input[type=checkbox]');
        if (!cb) return; // Checkbox yoksa geç

        if (checkbox.checked) {
            // Sadece closed olmayanları seç, eğer toggle aktifse
            if (!hideClosedActive || !row.classList.contains('closed')) {
                cb.checked = true;
                row.classList.add('context-menu-selection');
            } else {
                cb.checked = false;
                row.classList.remove('context-menu-selection');
            }
        } else {
            // Seçim kaldırılıyor
            cb.checked = false;
            row.classList.remove('context-menu-selection');
        }
    });
});



        // Başta gizli, toggle ile gösterilecek
        div.style.display = 'none';
        div.dataset.section = sectionId;
        return div;
    }


    window.addEventListener('load', () => {
        const issueTree = document.getElementById('issue_tree');
        const relations = document.getElementById('relations');

        const issueTreeContextual = issueTree?.querySelector('.contextual');
        const relationsContextual = relations?.querySelector('.contextual');

        const issueTable = issueTree?.querySelector(TABLE_SELECTOR);
        const relationsTable = relations?.querySelector(TABLE_SELECTOR);

        const toggleCheckbox = addToggleControl(issueTreeContextual, 'Seçim kutuları aktif', TOGGLE_ID, () => {
            const checked = toggleCheckbox.checked;
            if (checked) {
                injectStyle(STYLE_ID, `
                    #issue_tree td.checkbox,
                    #relations td.checkbox {
                        display: table-cell !important;
                    }
                `);
            } else {
                removeStyle(STYLE_ID);
            }

            // Toggle "Tümünü Seç" kontrollerinin görünürlüğü
             document.querySelectorAll('.select-all-wrapper').forEach(div => {
                div.style.display = checked ? 'block' : 'none';

                // Toggle kapandıysa, sadece "Tümünü Seç" kutusunu pasifleştir
                if (!checked) {
                    const selectAllCheckbox = div.querySelector('input[type=checkbox]');
                    if (selectAllCheckbox) {
                        selectAllCheckbox.checked = false;
                    }
                }
            });
        });

        // Her tabloya "Tümünü Seç" kontrolü ekle (başta gizli)
        if (issueTree && issueTable) {
            addSelectAllControl(issueTree, issueTable, 'issue_tree');
        }
        if (relations && relationsTable) {
            addSelectAllControl(relations, relationsTable, 'relations');
        }
    });
})();
