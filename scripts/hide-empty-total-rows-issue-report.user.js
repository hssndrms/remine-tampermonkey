// ==UserScript==
// @name         PYS Issue Report - Boş Satırları Gizle
// @namespace    https://pys.koton.com.tr
// @version      2025-10-07
// @description  Tüm issue-report tablolarında değer içermeyen satırları gizler; splitcontent üstüne checkbox ekler ve seçim hatırlanır
// @author       hssndrms
// @match        https://pys.koton.com.tr/projects/*/issues/report*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=redmine.org
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/hide-empty-total-rows-issue-report.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/hide-empty-total-rows-issue-report.user.js
// @grant        none
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const STORAGE_KEY = "pysHideEmptyRows";

    // Checkbox oluştur
    function createGlobalCheckbox() {
        if (document.querySelector("#pys-hide-empty-checkbox")) return;

        const splitDiv = document.querySelector("h2");
        if (!splitDiv) return;

        const label = document.createElement("label");
        label.id = "pys-hide-empty-checkbox";
        label.innerHTML = `
      <input type="checkbox" style="cursor:pointer;">
      <span>Boş satırları gizle</span>
    `;

      // Splitcontent divinin üstüne ekle
      //splitDiv.parentElement.prepend(label, splitDiv);
      splitDiv.insertAdjacentElement("afterend", label);

      const checkbox = label.querySelector("input");
      const savedState = localStorage.getItem(STORAGE_KEY) === "true";
      checkbox.checked = savedState;

      // Checkbox değiştiğinde tüm tabloları güncelle
      checkbox.addEventListener("change", () => {
          localStorage.setItem(STORAGE_KEY, checkbox.checked);
          toggleAllTables(checkbox.checked);
      });

      // İlk yükleme durumu
      toggleAllTables(savedState);
  }

    // Tablolardaki boş satırları gizle/göster
    function toggleAllTables(hide = true) {
        const tables = document.querySelectorAll("table.list.issue-report,table.list.issue-report-detailed");
        tables.forEach((table) => {
            const rows = table.querySelectorAll("tbody tr");
            rows.forEach((row) => {
                const totalCell = row.querySelector("td:last-child");
                if (!totalCell) return;
                const text = (totalCell.textContent || "").trim();
                const isEmpty = text === "" || text === "-" || text === "0";
                row.style.display = isEmpty && hide ? "none" : "";

                document.querySelectorAll("table td").forEach(td => {
                    if (td.textContent.trim() === "-") {
                        td.classList.add("hide-dash");
                    }
                });
            });
        });
    }

    // Ana fonksiyon
    function init() {
        createGlobalCheckbox();
        const savedState = localStorage.getItem(STORAGE_KEY) === "true";
        toggleAllTables(savedState);
    }

    // İlk yükleme
    init();

    // AJAX ile gelen içerikleri izleme
    const observer = new MutationObserver(() => init());
    observer.observe(document.body, { childList: true, subtree: true });
})();
