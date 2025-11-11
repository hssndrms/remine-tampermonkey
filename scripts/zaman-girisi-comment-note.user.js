// ==UserScript==
// @name         PYS Zaman Kaydı - Comment'tan Notlara Kopyalama
// @namespace    https://pys.koton.com.tr/
// @version      2025-11-11
// @description  Comment alanına girilen metni giriş sırasında Notlar alanına Notlar alanı başlangıçta boşsa otomatik kopyalar
// @author       hssndrms
// @match        https://pys.koton.com.tr/issues/*/time_entries*
// @match        https://pys.koton.com.tr*issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=redmine.org
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/zaman-girisi-comment-note.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/zaman-girisi-comment-note.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const initOnceForPair = (commentInput, noteTextarea) => {
        // Başlangıçtaki boşluk-dışı içerik kontrolü (sayfa/element DOM'a ilk geldiğinde)
        const initialWasEmpty = !/\S/.test(noteTextarea.value); // true = başlangıçta boş (sadece boşluk/boş)

        // İşaretle, tekrar hesaplama/aynı listener'ı eklemeyi engellemek için
        noteTextarea.dataset.initialWasEmpty = initialWasEmpty ? 'true' : 'false';

        // Eğer başlangıçta boşsa kopyalama yap; değilse hiçbir şey yapma
        if (initialWasEmpty) {
            // Tekrar eklemeyi engellemek için dataset flag
            if (commentInput.dataset.copyListenerAdded) return;
            commentInput.dataset.copyListenerAdded = 'true';

            // input event: comment alanı değiştikçe note alanını comment ile eşitle
            commentInput.addEventListener('input', () => {
                // Burada artık başlangıçta boş olduğu garantisiyle direkt kopyalıyoruz.
                // Eğer istersen buraya debounce ekleyebilirsin (ör. 200-300ms).
                noteTextarea.value = commentInput.value;
            });
        }
    };

    const observer = new MutationObserver((mutations, obs) => {
        const commentInput = document.querySelector('#time_entry_comments');
        const noteTextarea = document.querySelector('#time_entry_custom_field_values_4');

        if (commentInput && noteTextarea) {
            initOnceForPair(commentInput, noteTextarea);
            // Eğer ikisi bulunduysa daha fazla gözlem gerekmez ama Redmine dinamikse bırakabilirsin.
            // obs.disconnect(); // istersen açabilirsin; fakat Redmine AJAX ile tekrar yüklüyorsa kapatmak doğru olmayabilir.
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Ayrıca sayfa ilk yüklendiğinde de bir kez kontrol et (MutationObserver bazen gecikebilir)
    window.addEventListener('load', () => {
        const commentInput = document.querySelector('#time_entry_comments');
        const noteTextarea = document.querySelector('#time_entry_custom_field_values_4');
        if (commentInput && noteTextarea) {
            initOnceForPair(commentInput, noteTextarea);
        }
    });
})();
