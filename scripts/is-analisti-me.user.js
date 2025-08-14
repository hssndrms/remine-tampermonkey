// ==UserScript==
// @name         PYS İş Analisti otomatik seçilsin
// @namespace    https://pys.koton.com.tr
// @version      2025-08-14
// @description  iş analisti özel alanında kendimin otomatik seçilmesi
// @author       hssndrms
// @match        https://pys.koton.com.tr/projects/*/issues/new
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/is-analisti-me.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/is-analisti-me.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // İş analisti seçimini yapan fonksiyon
    function selectAnalyst() {
        const select = document.querySelector('select#issue_custom_field_values_20');
        if (select) {
            const optionToSelect = Array.from(select.options).find(opt => opt.text.includes("<< me >>"));
            if (optionToSelect && select.value !== optionToSelect.value) {
                select.value = optionToSelect.value;
                // Değişiklik olayını tetikle
                const changeEvent = new Event('change', { bubbles: true });
                select.dispatchEvent(changeEvent);
                console.log('İş Analisti otomatik seçildi: ' + optionToSelect.text);
                return true;
            }
        }
        return false;
    }
    
    // Sayfa yüklendiğinde ilk kontrolü yap
    function initialCheck() {
        // Biraz bekleyip dene
        setTimeout(() => {
            if (!selectAnalyst()) {
                console.log('İş Analisti select elementi henüz bulunamadı, DOM observer başlatılıyor...');
            }
        }, 1000);
    }
    
    // MutationObserver ile DOM değişikliklerini izle
    function startDOMObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Yeni eklenen node'ları kontrol et
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Eklenen element select elementi mi veya içinde select var mı kontrol et
                            if (node.matches && node.matches('select#issue_custom_field_values_20')) {
                                selectAnalyst();
                            } else if (node.querySelector) {
                                const selectElement = node.querySelector('select#issue_custom_field_values_20');
                                if (selectElement) {
                                    // Biraz bekleyip seç (select'in option'ları yüklenene kadar)
                                    setTimeout(selectAnalyst, 100);
                                }
                            }
                        }
                    });
                }
                
                // Attribute değişikliklerini de izle (AJAX yükleme durumları için)
                if (mutation.type === 'attributes') {
                    const target = mutation.target;
                    if (target.id === 'issue_custom_field_values_20' || 
                        target.querySelector && target.querySelector('select#issue_custom_field_values_20')) {
                        setTimeout(selectAnalyst, 100);
                    }
                }
            });
        });
        
        // Observer'ı başlat - tüm body'yi izle
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'disabled']
        });
        
        console.log('DOM Observer başlatıldı - İş Analisti seçimi izleniyor...');
    }
    
    // Sayfa durumuna göre başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initialCheck();
            startDOMObserver();
        });
    } else {
        initialCheck();
        startDOMObserver();
    }
    
    // Sayfa tamamen yüklendiğinde de bir kez daha kontrol et
    window.addEventListener('load', function() {
        setTimeout(selectAnalyst, 500);
    });
    
})();