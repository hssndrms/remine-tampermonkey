// ==UserScript==
// @name         PYS MyPage Toggle Boxes
// @namespace    https://pys.koton.com.tr
// @version      2025-09-02
// @description  MyPage kutularını başlığa tıklayınca aç/kapat yapar ve kapalı kutuları hatırlar
// @author       hssndrms
// @match        https://pys.koton.com.tr/my/page*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/my-page-toggle-box.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/my-page-toggle-box.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'mypage_closed_boxes';

    function getClosedBoxes() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveClosedBoxes(closedIds) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(closedIds));
    }

    function initToggles() {
        const closedBoxes = getClosedBoxes();

        document.querySelectorAll('#my-page .mypage-box').forEach(box => {
            const header = box.querySelector('h3');
            if (!header) return;

            const contents = Array.from(box.children).filter(el => {
                if (el.tagName === 'H3') return false;
                if (el.classList.contains('contextual')) return false;
                if (el.id && el.id.includes('settings')) return false;
                return true;
            });

            // Varsayılan olarak kapalı mı açık mı kontrol et
            const isClosed = closedBoxes.includes(box.id);
            contents.forEach(el => el.style.display = isClosed ? 'none' : '');

            // Başlık tıklanabilir yap
            header.style.cursor = 'pointer';
            header.onclick = () => {
                const currentlyHidden = contents[0]?.style.display === 'none';
                contents.forEach(el => el.style.display = currentlyHidden ? '' : 'none');

                // closedBoxes güncelle
                let updatedClosed = getClosedBoxes();
                if (currentlyHidden) {
                    // açıldı -> listeden çıkar
                    updatedClosed = updatedClosed.filter(id => id !== box.id);
                } else {
                    // kapandı -> listeye ekle
                    if (!updatedClosed.includes(box.id)) updatedClosed.push(box.id);
                }
                saveClosedBoxes(updatedClosed);
            };
        });
    }

    // Sayfa yüklendiğinde çalıştır
    window.addEventListener('load', initToggles);

    // Ajax ile kutular eklenirse tekrar çalışması için MutationObserver
    const observer = new MutationObserver(() => initToggles());
    observer.observe(document.body, { childList: true, subtree: true });
})();
