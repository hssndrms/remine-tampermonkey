// ==UserScript==
// @name         PYS özelleştirilmiş Zorunlu Alanlar - ID Kontrollü
// @namespace    https://pys.koton.com.tr
// @version      2025-10-07
// @author       hssndrms
// @description  Redmine'daki bazı zorunlu olmayan alanları ID'den kontrol ederek zorunluymuş gibi kontrol eder, eksikse hata divi ekler
// @match        https://pys.koton.com.tr/projects/*/issues/new
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
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
        requiredFields.forEach(([fieldId]) => {
            const label = document.querySelector(`label[for="${fieldId}"]`);
            if (!label) return;

            // Eğer zaten bir * varsa tekrar ekleme
            if (label.querySelector('.required')) return;

            const star = document.createElement('span');
            star.className = 'required';
            star.textContent = ' *';

            label.appendChild(star);
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

<<<<<<< HEAD
        const icon = document.createElement("i");
=======
         const icon = document.createElement("i");
>>>>>>> 3aa49fe497d3c062898619721fefafbf17215a8a
        icon.className = "fa-solid fa-circle-exclamation pys-error-icon";

        errorDiv.prepend(icon);

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
        form.querySelectorAll('.cls_important').forEach(el => {
            el.classList.remove('cls_important');
            el.style.border = '';
        });

        let isValid = true;
        let messages = [];


        const requiredLabels = document.querySelectorAll('label');
        requiredLabels.forEach(label => {
            // label içinde .required span var mı?
            const hasRequiredSpan = label.querySelector('span.required');
            if (!hasRequiredSpan) return;

            const fieldId = label.getAttribute('for');
            if (!fieldId) return;
            const field = document.getElementById(fieldId);
            if (!field) return;

            const labelText = label.textContent.replace('*', '').trim();
            const isInput = ['INPUT', 'TEXTAREA'].includes(field.tagName);
            const isSelect = field.tagName === 'SELECT';

            if (isInput && field.value.trim() === '') {
                field.style.border = '2px solid red';
                field.classList.add('cls_important');
                messages.push(`${labelText} boş bırakılamaz`);
                isValid = false;
            } else if (isSelect && (field.selectedIndex === -1 || field.value === '')) {
                field.style.border = '2px solid red';
                field.classList.add('cls_important');
                messages.push(`${labelText} seçilmelidir`);
                isValid = false;
            }
        });

        requiredFields.forEach(([fieldId, labelText]) => {
            const el = document.getElementById(fieldId);
            if (!el) return; // Alan yoksa geç

            const label = document.querySelector(`label[for="${fieldId}"]`);
            const isInput = ['INPUT', 'TEXTAREA'].includes(el.tagName);
            const isSelect = el.tagName === 'SELECT';

            const isEmpty =
                  (isInput && el.value.trim() === '') ||
                  (isSelect && (el.selectedIndex === -1 || el.value === ''));

            // 🔹 Label yoksa VE alan boşsa/seçim yapılmadıysa uyarı ver
            if (!label && isEmpty) {
                messages.push(`${labelText} seçilmelidir`);
                el.style.border = '2px solid red';
                el.classList.add('cls_important');
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

    function observeFormChanges() {
        const target = document.querySelector('#issue-form') || document.body;
        if (!target) return;

        const observer = new MutationObserver(() => {
            addRequiredStars(); // yeni alanlar geldiğinde tekrar yıldız ekle
        });

        observer.observe(target, {
            childList: true,
            subtree: true
        });
    }

    window.addEventListener('load', function () {
        const form = document.querySelector('form#issue-form');
        if (!form) return;

        addRequiredStars();
        observeFormChanges();

        form.addEventListener('submit', function(e) {
            const valid = validateForm(form);
            if (!valid) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }, true); // capture=true sayesinde diğer submit'lerden önce çalışır
    });
})();