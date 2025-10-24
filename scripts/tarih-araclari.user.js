// ==UserScript==
// @name         PYS Tarih Araçları - Hepsi Bir Arada
// @namespace    https://pys.koton.com.tr
// @version      2.1
// @author       IlkerDemiraslan
// @description  Tarih butonları: Bugün seç, +14 gün ekle, Tarih kopyala
// @match        https://pys.koton.com.tr*issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/tarih-araclari.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/tarih-araclari.user.js
// @grant        none
// ==/UserScript==
(function() {
    'use strict';

    // ==================== AYARLAR YÖNETİMİ ====================
    const STORAGE_KEY = 'pysDateToolsSettings';

    // Varsayılan ayarlar (ilk kurulumda kullanılır)
    const DEFAULT_SETTINGS = {
        todayButton: 1,        // Bugünün tarihini ekle butonu
        plus14Days: 1,         // Başlangıç tarihine +14 gün ekle butonu
        copyDueDate: 1         // Bitiş tarihini kopyala butonu
    };

    // LocalStorage'dan ayarları oku, yoksa varsayılanı kullan
    function loadSettings() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Ayarlar yüklenemedi:', e);
        }
        // İlk kullanım veya hata durumunda varsayılan ayarları kaydet
        saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    }

    // Ayarları localStorage'a kaydet
    function saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Ayarlar kaydedilemedi:', e);
        }
    }

    // Ayarları yükle
    const SETTINGS = loadSettings();

    // ==================== AYARLAR MENÜSÜ (Opsiyonel) ====================
    // Console'dan ayarları değiştirmek için:
    // window.updatePYSDateSettings({todayButton: 0, plus14Days: 1, copyDueDate: 1})
    window.updatePYSDateSettings = function(newSettings) {
        Object.assign(SETTINGS, newSettings);
        saveSettings(SETTINGS);
        console.log('PYS Tarih Araçları ayarları güncellendi:', SETTINGS);
        console.log('Değişikliklerin aktif olması için sayfayı yenileyin.');
    };

    // Mevcut ayarları göster
    window.showPYSDateSettings = function() {
        console.log('Mevcut PYS Tarih Araçları Ayarları:', SETTINGS);
        console.log('Ayarları değiştirmek için: window.updatePYSDateSettings({todayButton: 0, plus14Days: 1, copyDueDate: 1})');
    };

    // =================================================

    // Font Awesome CDN yükle (eğer yoksa)
    if (!document.querySelector('link[href*="cdnjs.cloudflare.com/ajax/libs/font-awesome"]')) {
        const link = document.createElement('link');
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    // ==================== 1. BUGÜN BUTONU ====================
    function addTodayButtons() {
        if (!SETTINGS.todayButton) return;

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        document.querySelectorAll('input[type="date"]').forEach(input => {
            // Buton zaten varsa ekleme
            const existingButton = input.parentNode.querySelector('.date-today-btn');
            if (existingButton) return;

            if (input.nextElementSibling && input.nextElementSibling.classList.contains('date-today-btn')) return;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'date-today-btn';
            button.style.marginLeft = '3px';
            button.style.cursor = 'pointer';
            button.style.color = '#333';
            button.style.fontSize = '16px';
            button.title = 'Bugünün tarihi';

            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-calendar-day';
            button.appendChild(icon);

            button.addEventListener('click', (e) => {
                e.preventDefault();
                input.value = today;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });

            input.insertAdjacentElement('afterend', button);
        });
    }

    // ==================== 2. +14 GÜN BUTONU ====================
    function addPlusFourteenButton() {
        if (!SETTINGS.plus14Days) return;

        const targetInput = document.getElementById('issue_due_date');
        const sourceInput = document.getElementById('issue_start_date');

        if (targetInput && sourceInput) {
            // Buton zaten varsa ekleme
            const existingButton = targetInput.parentNode.querySelector('.date-plus14-btn');
            if (existingButton) return;

            const addDaysButton = document.createElement('button');
            addDaysButton.type = 'button';
            addDaysButton.className = 'date-plus14-btn';
            addDaysButton.title = 'Başlangıç tarihine +14 gün ekle';
            addDaysButton.style.marginLeft = '3px';
            addDaysButton.style.cursor = 'pointer';
            addDaysButton.style.color = '#333333';
            addDaysButton.style.fontSize = '16px';
            addDaysButton.innerHTML = '<i class="fa-solid fa-plus"></i>14';

            addDaysButton.addEventListener('click', function(e) {
                e.preventDefault();
                const startDateValue = sourceInput.value;
                if (startDateValue) {
                    const startDate = new Date(startDateValue);
                    startDate.setDate(startDate.getDate() + 14);

                    const year = startDate.getFullYear();
                    const month = String(startDate.getMonth() + 1).padStart(2, '0');
                    const day = String(startDate.getDate()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}`;

                    targetInput.value = formattedDate;

                    if (typeof $ !== 'undefined' && $(targetInput).datepicker) {
                        $(targetInput).datepicker('setDate', formattedDate);
                    }

                    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                    targetInput.dispatchEvent(new Event('change', { bubbles: true }));

                    if (typeof $ !== 'undefined') {
                        $(targetInput).trigger('input');
                        $(targetInput).trigger('change');
                        $(targetInput).change();
                    }

                    addDaysButton.style.color = '#28a745';
                    setTimeout(() => {
                        addDaysButton.style.color = '#333333';
                    }, 500);
                } else {
                    alert('Başlangıç tarihi boş!');
                }
            });

            targetInput.insertAdjacentElement('afterend', addDaysButton);
        }
    }

    // ==================== 3. TARİH KOPYALA BUTONU ====================
    function addCopyButton() {
        if (!SETTINGS.copyDueDate) return;

        const targetInput = document.getElementById('issue_custom_field_values_94');
        const sourceInput = document.getElementById('issue_due_date');

        if (targetInput && sourceInput) {
            // Buton zaten varsa ekleme
            const existingButton = targetInput.parentNode.querySelector('.date-copy-btn');
            if (existingButton) return;

            const copyButton = document.createElement('button');
            copyButton.type = 'button';
            copyButton.className = 'date-copy-btn';
            copyButton.title = 'Bitiş tarihini kopyala';
            copyButton.style.marginLeft = '3px';
            copyButton.style.cursor = 'pointer';
            copyButton.style.color = '#333333';
            copyButton.style.fontSize = '16px';

            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-clone';
            copyButton.appendChild(icon);

            copyButton.addEventListener('click', function(e) {
                e.preventDefault();
                const dueDateValue = sourceInput.value;
                if (dueDateValue) {
                    targetInput.value = dueDateValue;

                    if (typeof $ !== 'undefined' && $(targetInput).datepicker) {
                        $(targetInput).datepicker('setDate', dueDateValue);
                    }

                    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                    targetInput.dispatchEvent(new Event('change', { bubbles: true }));

                    if (typeof $ !== 'undefined') {
                        $(targetInput).trigger('input');
                        $(targetInput).trigger('change');
                    }

                    copyButton.style.color = '#28a745';
                    setTimeout(() => {
                        copyButton.style.color = '#333333';
                    }, 500);
                } else {
                    alert('Bitiş tarihi boş!');
                }
            });

            targetInput.insertAdjacentElement('afterend', copyButton);
        }
    }

    // ==================== TÜM BUTONLARI EKLE ====================
    function addAllButtons() {
        addPlusFourteenButton();
        addCopyButton();
        addTodayButtons();
    }

    // İlk yükleme
    addAllButtons();

    // DOM değişikliklerini izle
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Eklenen node'ların bizim butonlarımız olmadığını kontrol et
                let shouldAdd = false;
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 &&
                        !node.classList.contains('date-today-btn') &&
                        !node.classList.contains('date-plus14-btn') &&
                        !node.classList.contains('date-copy-btn')) {
                        shouldAdd = true;
                    }
                });
                if (shouldAdd) {
                    setTimeout(addAllButtons, 100);
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Sekme görünürlüğü değişince tekrar kontrol et
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(addAllButtons, 100);
        }
    });

    // Başlangıçta ayarları console'a yazdır
    console.log('PYS Tarih Araçları yüklendi. Ayarları görmek için: window.showPYSDateSettings()');
})();