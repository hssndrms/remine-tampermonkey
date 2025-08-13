// ==UserScript==
// @name         PYS özelleştirilmiş Zorunlu Alanlar - ID Kontrollü
// @namespace    https://pys.koton.com.tr
// @version      2025-08-13
// @author       hssndrms
// @description  Redmine'daki bazı zorunlu olmayan alanları ID'den kontrol ederek zorunluymuş gibi kontrol eder, eksikse hata divi ekler
// @match        https://pys.koton.com.tr/projects/*/issues/new
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/zorunlu-ozel-alanlar.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/zorunlu-ozel-alanlar.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const requiredFields = [
        ['issue_custom_field_values_18', 'İş Birimi'],
        ['issue_custom_field_values_45', 'Talep Eden'],
        ['issue_custom_field_values_47', 'Talep Tarihi'],
        ['issue_custom_field_values_22', 'Platform'],
        ['issue_agile_data_attributes_agile_sprint_id', 'Sprint']
    ];

    function addRequiredStars() {
        requiredFields.forEach(([fieldId, labelText]) => {
            const el = document.getElementById(fieldId);
            if (!el) return;

            const label = document.querySelector(`label[for="${fieldId}"]`);
            if (label && !label.innerHTML.includes('*')) {
                label.innerHTML += ' <span style="color:var(--warning)">*</span>';
            }
        });
    }

    function removeOldErrorBox() {
        const oldBox = document.getElementById('errorExplanation');
        if (oldBox) oldBox.remove();
    }

    function showErrorBox(errorMessages) {
        removeOldErrorBox();

        const errorDiv = document.createElement('div');
        errorDiv.id = 'errorExplanation';
       
        const ul = document.createElement('ul');
        errorMessages.forEach(msg => {
            const li = document.createElement('li');
            li.innerText = msg;
            ul.appendChild(li);
        });

        errorDiv.appendChild(ul);

        const container = document.querySelector('#content') || document.body;
        container.insertBefore(errorDiv, container.firstChild);

        setTimeout(() => {
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }

    function validateForm(form) {
        let isValid = true;
        let messages = [];

        requiredFields.forEach(([fieldId, labelText]) => {
            const el = document.getElementById(fieldId);
            
            if (!el) return;

            const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
            const isSelect = el.tagName === 'SELECT';

            el.style.border = ''; // sıfırla

            if (isInput && el.value.trim() === '') {
                el.style.border = '2px solid red';
                messages.push(`${labelText} boş bırakılamaz`);
                isValid = false;
            } else if (isSelect && (el.selectedIndex === -1 || el.value === '')) {
                el.style.border = '2px solid red';
                messages.push(`${labelText} seçilmelidir`);
                isValid = false;
            }
        });

        if (!isValid) {
            showErrorBox(messages);
        } else {
            removeOldErrorBox();
        }

        return isValid;
    }

    window.addEventListener('load', function () {
        const form = document.querySelector('form#issue-form');
        if (!form) return;

        addRequiredStars();

        form.addEventListener('submit', function(e) {
            const valid = validateForm(form);
            if (!valid) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }, true); // capture=true sayesinde diğer submit'lerden önce çalışır
    });
})();