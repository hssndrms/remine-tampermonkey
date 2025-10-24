// ==UserScript==
// @name         PYS Commit Buton Klonu
// @namespace    https://pys.koton.com.tr/
// @version      2025-10-24.1
// @description  Redmine'daki orijinal commit (Create/Save) butonunu birebir klonlayarak #issue-form içindeki #all_attributes bölümünün üst sağına ekler. DOM ve AJAX yüklemelerinde otomatik yenilenir. İşlevi tamamen aynıdır.
// @author       hssndrms
// @match        https://pys.koton.com.tr/*issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/clone-commit-button.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/clone-commit-button.user.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function cloneCommitButton() {
    const issueForm = document.querySelector('#issue-form');
    if (!issueForm) return;

    const allAttributes = issueForm.querySelector('#all_attributes');
    if (!allAttributes) return;

    // Zaten eklendiyse tekrar ekleme
    if (allAttributes.querySelector('.commit-button-wrapper')) return;

    // Orijinal commit butonlarını bul
    const originalBtn = issueForm.querySelector('input[name="commit"]');
    if (!originalBtn) return;

    const originalContinueBtn = issueForm.querySelector('input[name="continue"]');

    // Wrapper oluştur
    const wrapper = document.createElement('div');
    wrapper.className = 'commit-button-wrapper';

    // Commit butonunu klonla
    const clonedBtn = originalBtn.cloneNode(true);
    clonedBtn.classList.add('commit-clone-button');
    clonedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      originalBtn.click(); // orijinal commit tetikle
    });
    wrapper.appendChild(clonedBtn);

    // Continue varsa onu da klonla
    if (originalContinueBtn) {
      const clonedContinueBtn = originalContinueBtn.cloneNode(true);
      clonedContinueBtn.classList.add('commit-clone-button', 'commit-continue-button');
      clonedContinueBtn.addEventListener('click', (e) => {
        e.preventDefault();
        originalContinueBtn.click(); // orijinal continue tetikle
      });
      wrapper.appendChild(clonedContinueBtn);
    }

    // #all_attributes içine ilk eleman olarak ekle
    allAttributes.prepend(wrapper);
  }

  function safeClone() {
    requestAnimationFrame(() => cloneCommitButton());
  }

  // İlk yüklemede
  document.addEventListener('DOMContentLoaded', safeClone);
  window.addEventListener('load', safeClone);

  // AJAX işlemleri tamamlandığında
  if (window.jQuery) {
    $(document).ajaxComplete(() => safeClone());
  }

  // DOM değişimlerini gözlemle
  const observer = new MutationObserver(() => safeClone());
  observer.observe(document.body, { childList: true, subtree: true });
})();
