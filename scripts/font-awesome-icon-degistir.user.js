// ==UserScript==
// @name         PYS 😎 Iconları Font Awesome ile Değiştir
// @namespace    https://fontawesome.com/icons
// @version      2025-07-14
// @description  Redmine'deki icon-* sınıflarını Font Awesome ikonlarla değiştirir. Dinamik içerik desteği (MutationObserver) ile tam uyum sağlar.
// @author       hssndrms
// @match        https://pys.koton.com.tr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/font-awesome-icon-degistir.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/font-awesome-icon-degistir.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Font Awesome CDN yükle (ücretsiz sürüm)
    if (!document.querySelector('link[href*="cdnjs.cloudflare.com/ajax/libs/font-awesome"]')) {
        const link = document.createElement('link');
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    // icon-* sınıfı => Font Awesome sınıf(ları)
    const iconMap = {
        'icon-edit': 'fa-solid fa-pen-to-square',
        'icon-del': 'fa-solid fa-trash',
        'icon-copy': 'fa-solid fa-copy',
        'icon-add': 'fa-solid fa-plus',
        'icon-checked': 'fa-solid fa-check',
        'icon-attachment': 'fa-solid fa-paperclip',
        'icon-email': 'fa-solid fa-envelope',
        'icon-folder': 'fa-solid fa-folder',
        'icon-reload': 'fa-solid fa-rotate-right',
        'icon-time-add': 'fa-solid fa-clock',
        'icon-fav-off': 'far fa-eye',
        'icon-fav': 'fas fa-eye',
        'icon-actions': 'fa-solid fa-ellipsis-h',
        'icon-link-break': 'fa-solid fa-link-slash',
        'icon-comment': 'fa-solid fa-comment',
        'icon-copy-link': 'fa-solid fa-link',
        'icon-email-add': 'fa-solid fa-envelope-circle-check',
        'icon-help': 'fa-solid fa-circle-question',
        'icon-import': 'fa-solid fa-file-import',
        'icon-clear-query': 'fa-solid fa-xmark',
        'icon-zoom-in': 'fa-solid fa-magnifying-glass-plus',
        'icon-zoom-out': 'fa-solid fa-magnifying-glass-minus',
        'icon-save': 'fa-solid fa-floppy-disk',
        'icon-fullscreen': 'fa-solid fa-expand',
        'icon-stats': 'fa-solid fa-chart-column',
        'icon-settings': 'fa-solid fa-gear',
        'icon-groupnonmember': 'fa-solid fa-users',
        'icon-group': 'fa-solid fa-users',
        'icon-shared': 'fa-solid fa-share-nodes',
        'icon-locked': 'fa-solid fa-lock',
        'icon-sort-handle': 'fa-solid fa-up-down',
        'icon-close': 'fa-solid fa-xmark',
        'icon-user': 'fa-solid fa-user',
        'icon-bookmarked-project': 'fa-solid fa-bookmark',
        'icon-bookmark': 'fa-regular fa-bookmark',
        'icon-lock': 'fa-solid fa-lock',
        'icon-add-bullet': 'fa-solid fa-star'
    };

    function processIcons(root = document) {
        Object.entries(iconMap).forEach(([oldClass, faClasses]) => {
            root.querySelectorAll(`.${oldClass}`).forEach(el => {
                if (el.dataset.iconified) return;
                el.dataset.iconified = 'true';

                if (el.classList.contains('project') && el.classList.contains('leaf')) return;

                el.classList.remove(oldClass);

                const icon = document.createElement('i');
                faClasses.split(' ').forEach(cls => icon.classList.add(cls));
                icon.style.marginRight = '4px';
                icon.title = el.title || '';

                if (el.classList.contains('icon-only')) {
                    el.innerHTML = '';
                    el.appendChild(icon);
                    el.classList.remove('icon-only');
                } else {
                    el.insertBefore(icon, el.firstChild);
                }
            });
        });
    }

    // Sayfa yüklendiğinde ikonları işle
    processIcons();

    // Dinamik içerik için gözlemci
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) processIcons(node);
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
