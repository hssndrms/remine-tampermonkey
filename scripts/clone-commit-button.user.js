// ==UserScript==
// @name         PYS Commit Buton Klonu
// @namespace    https://pys.koton.com.tr/
// @version      2025-10-24
// @description  Redmine'daki orijinal commit (Create/Save) butonunu birebir klonlayarak #issue-form içindeki #all_attributes bölümünün üst sağına ekler (issue oluşturma/düzenleme ekranları için). İşlevi tamamen aynıdır.
// @author       hssndrms
// @match        https://pys.koton.com.tr*issue/*
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

    // Orijinal commit butonunu bul
    const originalBtn = issueForm.querySelector('input[name="commit"]');
    if (!originalBtn) return;

    // Klon oluştur
    const clonedBtn = originalBtn.cloneNode(true);
    clonedBtn.classList.add('commit-clone-button');
    clonedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      originalBtn.click(); // orijinal butonu tetikle
    });

    // Wrapper div oluştur
    const wrapper = document.createElement('div');
    wrapper.className = 'commit-button-wrapper';
    wrapper.appendChild(clonedBtn);

    // #all_attributes içine ilk eleman olarak ekle
    allAttributes.prepend(wrapper);
  }

  // Sayfa yüklendiğinde ekle
  cloneCommitButton();

  // Ajax yüklü içerik değişimlerini izle
  const observer = new MutationObserver(() => cloneCommitButton());
  observer.observe(document.body, { childList: true, subtree: true });
})();
