// ==UserScript==
// @name         PYS Otomatik Alan Doldurma
// @namespace    https://pys.koton.com.tr
// @version      2025-10-06
// @author       hssndrms
// @description  Redmine issue oluşturma sayfasında belirtilen alanları otomatik doldurur
// @match        https://pys.koton.com.tr/projects/*/issues/new
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/otomatik-alan-doldurma.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/otomatik-alan-doldurma.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Otomatik doldurulacak alanlar
    // [fieldId, fieldType, defaultValue]
    const fieldsConfig = [
        ['issue_custom_field_values_18', 'select', 'Marka'],        // İş Birimi
        ['issue_custom_field_values_45', 'input', 'Hasan Durmuş'],  // Talep Eden
        ['issue_custom_field_values_47', 'date', getTodayDate()],   // Talep Tarihi
        ['issue_custom_field_values_22', 'select', 'PLM'],          // Platform
        // ['issue_subject', 'input', 'Varsayılan Konu Başlığı'],
        // ['issue_description', 'textarea', 'Varsayılan açıklama metni'],
    ];

    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function setFieldValue(fieldId, fieldType, value) {
        const el = document.getElementById(fieldId);
        if (!el) {
            return false;
        }

        // Eğer alan zaten doluysa, üzerine yazma
        if (el.value && el.value.trim() !== '') {
            console.log(`${fieldId} alanı zaten dolu, atlanıyor`);
            return false;
        }

        try {
            switch(fieldType.toLowerCase()) {
                case 'select':
                    const option = Array.from(el.options).find(opt => opt.text === value || opt.value === value);
                    if (option) {
                        el.value = option.value;
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log(`✓ ${fieldId} değeri ayarlandı: ${value}`);
                        return true;
                    } else {
                        console.warn(`${fieldId} için '${value}' değeri seçenekler arasında bulunamadı`);
                        return false;
                    }

                case 'input':
                case 'textarea':
                    el.value = value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log(`✓ ${fieldId} değeri ayarlandı: ${value}`);
                    return true;

                case 'date':
                    el.value = value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log(`✓ ${fieldId} tarih değeri ayarlandı: ${value}`);
                    return true;

                default:
                    console.warn(`Bilinmeyen alan tipi: ${fieldType} (${fieldId})`);
                    return false;
            }
        } catch (error) {
            console.error(`${fieldId} alanı ayarlanırken hata:`, error);
            return false;
        }
    }

    function fillFields() {
        console.log('Otomatik alan doldurma başlatıldı...');
        let successCount = 0;

        fieldsConfig.forEach(([fieldId, fieldType, value]) => {
            if (setFieldValue(fieldId, fieldType, value)) {
                successCount++;
            }
        });

        if (successCount > 0) {
            console.log(`Otomatik alan doldurma tamamlandı. ${successCount}/${fieldsConfig.length} alan dolduruldu.`);
        }
    }

    function setupTrackerListener() {
        const trackerSelect = document.getElementById('issue_tracker_id');
        if (!trackerSelect) {
            console.warn('Tracker dropdown bulunamadı');
            return;
        }

        console.log('Tracker değişikliği dinleyicisi eklendi');

        trackerSelect.addEventListener('change', function() {
            console.log('Tracker değişti, alanlar kontrol ediliyor...');

            setTimeout(() => {
                fillFields();
            }, 500);
        });
    }

    function setupMutationObserver() {
        const formContainer = document.querySelector('#content') || document.querySelector('form#issue-form');
        if (!formContainer) return;

        const observer = new MutationObserver((mutations) => {
            const hasNewFields = mutations.some(mutation => {
                return Array.from(mutation.addedNodes).some(node => {
                    return node.nodeType === 1 && (
                        node.querySelector && (
                            node.querySelector('[id^="issue_custom_field_values"]') ||
                            node.id && node.id.startsWith('issue_custom_field_values')
                        )
                    );
                });
            });

            if (hasNewFields) {
                console.log('Form yapısı değişti, alanlar kontrol ediliyor...');
                setTimeout(() => {
                    fillFields();
                }, 300);
            }
        });

        observer.observe(formContainer, {
            childList: true,
            subtree: true
        });

        console.log('Form değişiklik gözlemcisi aktif');
    }

    window.addEventListener('load', function() {
        setTimeout(() => {
            const form = document.querySelector('form#issue-form');
            if (form) {
                setupTrackerListener();
                setupMutationObserver();
                fillFields();
            } else {
                console.warn('Issue formu bulunamadı');
            }
        }, 500);
    });

})();