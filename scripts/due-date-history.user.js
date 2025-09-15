// ==UserScript==
// @name         PYS Due Date History
// @namespace    https://pys.koton.com.tr
// @version      2025-09-15
// @description  Issue duedate değişikliklerini göster
// @author       hssndrms
// @match        https://pys.koton.com.tr/*issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/due-date-history.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/due-date-history.user.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // ===============================
    // KONFIGÜRASYON ALANI - Yeni alanlar buraya eklenir
    // ===============================
    const FIELD_CONFIGS = [
        {
            selector: ".due-date",           // HTML selector
            fieldName: "due_date",           // API'deki field name
            title: "Termin Tarihi Değişiklikleri",
            tooltip: "Termin tarihi değişiklikleri"
        },
        {
            selector: ".cf_101",             
            fieldName: "101",                 
            title: "Revize Termin Tarihi Değişiklikleri",
            tooltip: "Revize termin tarihi değişiklikleri"
        },
        {
            selector:".start-date",
            fieldName: "start_date",
            title: "Başlangıç Tarihi Değişiklikleri",
            tooltip: "Başlangıç tarihi değişiklikleri."
        }
        // Yeni alanlar için örnek:
        // {
        //     selector: ".cf_102",
        //     fieldName: "102",
        //     title: "Başka Alan Değişiklikleri",
        //     tooltip: "Başka alan değişiklikleri"
        // }
    ];

    // API bilgileri
    const API_KEY = localStorage.getItem("pysRedmineApiKey");
    const BASE_URL = "https://pys.koton.com.tr";
    const issueId = window.location.pathname.match(/issues\/(\d+)/)[1];

    // Stil ekle (modern modal görünümü)
    GM_addStyle(`
        .duedate-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-primary);
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            padding: 20px;
            z-index: 9999;
            max-width: 600px;
            width: 90%;
            max-height: 80%;
            overflow-y: auto;
        }
        .duedate-modal h2 {
            margin-top: 0;
        }
        .duedate-overlay {
            position: fixed;
            top:0;
            left:0;
            width:100%;
            height:100%;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
        }
        .duedate-close {
            float: right;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
        }
        .duedate-entry {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        .duedate-entry:last-child {
            border-bottom: none;
        }
    `);

    // ===============================
    // TEMEL FONKSİYONLAR
    // ===============================

    // API çağrısı ile field değişikliklerini çek (generic)
    async function fetchFieldChanges(issueId, fieldName) {
        try {
            const res = await fetch(`${BASE_URL}/issues/${issueId}.json?include=journals`, {
                headers: {
                    "X-Redmine-API-Key": API_KEY
                }
            });
            const data = await res.json();
            const journals = data.issue.journals || [];

            // Sadece belirtilen field değişikliklerini filtrele
            return journals.filter(j => j.details && j.details.some(d => d.name === fieldName))
                .map(j => ({
                    user: j.user.name,
                    created_on: j.created_on,
                    changes: j.details.filter(d => d.name === fieldName)
                }));
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    // İkon ekleme fonksiyonu (generic)
    function addIconToField(fieldDiv, config) {
        const icon = document.createElement("i");
        icon.className = "fa-solid fa-clock-rotate-left";
        icon.style.cursor = "pointer";
        icon.title = config.tooltip;

        fieldDiv.appendChild(icon);
        fieldDiv.style.display = "flex";
        fieldDiv.style.alignItems = "center";
        fieldDiv.style.gap = "5px";

        icon.addEventListener("click", async () => {
            const changes = await fetchFieldChanges(issueId, config.fieldName);
            showModal(changes, config.title);
        });
    }

    // Modal göster fonksiyonu
    function showModal(changes, title) {
        // Overlay
        const overlay = document.createElement("div");
        overlay.className = "duedate-overlay";

        // Modal container
        const modal = document.createElement("div");
        modal.className = "duedate-modal";

        // Kapatma butonu
        const closeBtn = document.createElement("span");
        closeBtn.className = "duedate-close";
        closeBtn.innerHTML = "&times;";
        closeBtn.onclick = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        };

        modal.appendChild(closeBtn);
        const titleElement = document.createElement("h2");
        titleElement.textContent = title;
        modal.appendChild(titleElement);

        if (changes.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "Herhangi bir değişiklik bulunamadı.";
            empty.style.color = "var(--warning)";
            modal.appendChild(empty);
        } else {
            // Tablo oluştur
            const table = document.createElement("table");
            table.style.width = "100%";
            table.style.borderCollapse = "collapse";
            table.innerHTML = `
                <thead>
                    <tr>
                        <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Değişikliği Yapan</th>
                        <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Değişiklik Tarihi</th>
                        <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Önce</th>
                        <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Sonra</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector("tbody");

            changes.forEach(c => {
                c.changes.forEach(change => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td style="padding:8px; border-bottom:1px solid #eee;">${c.user}</td>
                        <td style="padding:8px; border-bottom:1px solid #eee;">${new Date(c.created_on).toLocaleString()}</td>
                        <td style="padding:8px; border-bottom:1px solid #eee;">${change.old_value || "-"}</td>
                        <td style="padding:8px; border-bottom:1px solid #eee;">${change.new_value || "-"}</td>
                    `;
                    tbody.appendChild(row);
                });
            });

            modal.appendChild(table);
        }

        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    }

    // ===============================
    // MAIN EXECUTION - Konfigürasyona göre çalışır
    // ===============================
    FIELD_CONFIGS.forEach(config => {
        const fieldDiv = document.querySelector(config.selector);
        if (fieldDiv) {
            addIconToField(fieldDiv, config);
        }
    });

})();