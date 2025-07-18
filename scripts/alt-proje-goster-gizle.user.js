// ==UserScript==
// @name         PYS Alt Projeleri Göster/Gizle
// @namespace    https://pys.koton.com.tr
// @version      2025-07-14
// @description  PYS projeler sayfasındaki alt projeleri gösterip gizlemek için togglebutton ve checkbox ekler (Font Awesome ile)
// @author       hssndrms
// @match        https://pys.koton.com.tr/projects*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/alt-proje-goster-gizle.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/alt-proje-goster-gizle.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'altProjeleriGizle';

    if (!document.querySelector('link[href*="cdnjs.cloudflare.com/ajax/libs/font-awesome"]')) {
        const link = document.createElement('link');
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    
    const buttonsContainer = document.querySelector('p.buttons');
    if (buttonsContainer) {
        const checkboxLabel = document.createElement('label');
        checkboxLabel.style.marginLeft = '16px';
        checkboxLabel.style.cursor = 'pointer';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = localStorage.getItem(STORAGE_KEY) === 'true';
        checkbox.style.marginRight = '4px';

        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode('Alt Projeleri Gizle'));

        buttonsContainer.appendChild(checkboxLabel);

        checkbox.addEventListener('change', () => {
            localStorage.setItem(STORAGE_KEY, checkbox.checked);
            applyProjectVisibility();
        });
    }

    // İkonlu toggle butonu ekleme fonksiyonu
    function addToggleButton(liElement) {
        const div = liElement.querySelector('div');
        const subProjects = liElement.querySelector(':scope > ul.projects');

        if (subProjects) {
            const toggleIcon = document.createElement('i');
            toggleIcon.className = 'fa-solid fa-chevron-down';
            toggleIcon.style.cursor = 'pointer';
            toggleIcon.style.marginRight = '8px';
            toggleIcon.style.verticalAlign = 'middle';
            toggleIcon.title = 'Alt Projeleri Göster/Gizle';

            toggleIcon.addEventListener('click', () => {
                if (subProjects.style.display === 'none') {
                    subProjects.style.display = '';
                    toggleIcon.className = 'fa-solid fa-chevron-down';
                } else {
                    subProjects.style.display = 'none';
                    toggleIcon.className = 'fa-solid fa-chevron-right';
                }
            });

            div.prepend(toggleIcon);

            // Başlangıç durumu checkbox'a göre ayarlanacak
            return { icon: toggleIcon, subProjects: subProjects };
        }
        return null;
    }

    // Proje elemanlarını işle
    const projectItems = [];
    document.querySelectorAll('li.root, li.child').forEach(li => {
        const item = addToggleButton(li);
        if (item) projectItems.push(item);
    });

    // Checkbox'a göre görünürlüğü uygula
    function applyProjectVisibility() {
        const hide = localStorage.getItem(STORAGE_KEY) === 'true';
        projectItems.forEach(({ icon, subProjects }) => {
            if (hide) {
                subProjects.style.display = 'none';
                icon.className = 'fa-solid fa-chevron-right';
            } else {
                subProjects.style.display = '';
                icon.className = 'fa-solid fa-chevron-down';
            }
        });
    }

    // İlk yükleme
    applyProjectVisibility();

})();
