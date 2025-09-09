// ==UserScript==
// @name         PYS Dashboard 📊 Gösterge Paneli + Zaman Özeti (Modern)
// @namespace    https://pys.koton.com.tr
// @version      2025-09-09
// @description  Modern görünümlü Redmine dashboard - İş sayıları ve zaman özeti
// @author       hssndrms
// @match        https://pys.koton.com.tr/my/page
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @grant        GM_xmlhttpRequest
// @connect      pys.koton.com.tr
// @require      https://cdn.jsdelivr.net/npm/chart.js
// @require      https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/dashboard.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/dashboard.user.js
// ==/UserScript==

(function () {
  "use strict";
  /* global Chart, ChartDataLabels */

  let API_KEY = localStorage.getItem("pysRedmineApiKey"); // Redmine API anahtarı
  const BASE_URL = "https://pys.koton.com.tr";
  const TODAY = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const YESTERDAY = yesterday.toISOString().split("T")[0];

  // Font Awesome yükle
  if (
    !document.querySelector(
      'link[href*="cdnjs.cloudflare.com/ajax/libs/font-awesome"]'
    )
  ) {
    const link = document.createElement("link");
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  function ensureApiKey() {
    API_KEY = localStorage.getItem("pysRedmineApiKey");
    while (!API_KEY) {
      const input = prompt("Redmine API Key'inizi girin:");
      if (input) {
        localStorage.setItem("pysRedmineApiKey", input);
        API_KEY = input;
      } else {
        alert("API Key gerekli, lütfen girin.");
      }
    }
  }

  // Modern Dashboard HTML
  const dashboardHTML = `
<div class="pys-dashboard-wrapper">
    <div class="pys-dashboard-header">
        <h2><i class="fas fa-tachometer-alt"></i> PYS Dashboard</h2>
        <div class="pys-header-controls">
            <select id="pys-user-select" class="pys-select">
                <option value="me"><<me>></option>
            </select>
            <button id="pys-add-user-option" class="pys-btn pys-btn-sm" title="Yeni Kullanıcı Ekle">
                <i class="fas fa-plus"></i>
            </button>
            <button id="pys-load-user-data" class="pys-btn pys-btn-sm" title="Seçilen Kullanıcıya Göre Verileri Yükle">
                <i class="fas fa-user-check"></i>
            </button>
            <div class="pys-refresh-btn" id="pys-refresh" title="Verileri Yenile">
                <i class="fas fa-sync-alt"></i>
            </div>
        </div>
    </div>

    <div class="pys-dashboard-grid">
        <div class="pys-card pys-card-primary">
            <div class="pys-card-header">
                <h3><i class="fas fa-tasks"></i> İş Durumu</h3>
                <div class="pys-new-btn" title="Yeni İş Ekle">
                    <a href="https://pys.koton.com.tr/projects/finans-isler/issues/new" target="_blank" style="display: flex; align-items: center; gap: 5px;" title="Yeni İş Ekle">
                        <i class="fas fa-plus"></i>
                    </a>
                </div>
            </div>
            <div class="pys-card-body">
              <div class="pys-stat-row">
                <div class="pys-stat-item">
                    <div class="pys-stat-icon pys-stat-open">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="pys-stat-content">
                        <div class="pys-stat-label">
                            <a href="${BASE_URL}/issues?utf8=✓&set_filter=1&f[]=assigned_to_id&op[assigned_to_id]==&v[assigned_to_id][]=me&f[]=status_id&op[status_id]=o" target="_blank">Açık İşler</a>
                        </div>
                        <div class="pys-stat-value" id="open-issues">
                            <div class="pys-loading-spinner"></div>
                        </div>
                    </div>
                </div>

                <div class="pys-stat-item">
                    <div class="pys-stat-icon pys-stat-open">
                        <i class="far fa-star"></i>
                    </div>
                    <div class="pys-stat-content">
                        <div class="pys-stat-label">
                            <a href="${BASE_URL}/issues?utf8=✓&set_filter=1&f[]=assigned_to_id&op[assigned_to_id]==&v[assigned_to_id][]=me&f[]=status_id&op[status_id]==&v[status_id][]=17" target="_blank">Yeni İşler</a>
                        </div>
                        <div class="pys-stat-value" id="new-issues">
                            <div class="pys-loading-spinner"></div>
                        </div>
                    </div>
                </div>

              </div>

                <div class="pys-stat-row">
                    <div class="pys-stat-item">
                        <div class="pys-stat-icon pys-stat-overdue">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="pys-stat-content">
                            <div class="pys-stat-label">
                                <a href="${BASE_URL}/issues?utf8=✓&set_filter=1&f[]=assigned_to_id&op[assigned_to_id]==&v[assigned_to_id][]=me&f[]=status_id&op[status_id]=o&f[]=due_date&op[due_date]=<%3D&v[due_date][]=${YESTERDAY}" target="_blank">Gecikmiş İşler</a>
                            </div>
                            <div class="pys-stat-value" id="overdue-issues">
                                <div class="pys-loading-spinner"></div>
                            </div>
                        </div>
                    </div>

                    <div class="pys-stat-item">
                        <div class="pys-stat-icon pys-stat-completed">
                            <i class="fas fa-calendar-day"></i>
                        </div>
                        <div class="pys-stat-content">
                            <div class="pys-stat-label">
                                <a href="${BASE_URL}/issues?utf8=✓&set_filter=1&f[]=assigned_to_id&op[assigned_to_id]==&v[assigned_to_id][]=me&f[]=status_id&op[status_id]=o&f[]=due_date&op[due_date]=t" target="_blank">Bugün Terminli İşler</a>
                            </div>
                            <div class="pys-stat-value" id="due-today-issues">
                                <div class="pys-loading-spinner"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pys-stat-row">
                    <div class="pys-stat-item">
                        <div class="pys-stat-icon pys-stat-week">
                            <i class="fas fa-calendar-week"></i>
                        </div>
                        <div class="pys-stat-content">
                            <div class="pys-stat-label">
                                <a href="${BASE_URL}/issues?utf8=✓&set_filter=1&f[]=assigned_to_id&op[assigned_to_id]==&v[assigned_to_id][]=me&f[]=status_id&op[status_id]=o&f[]=due_date&op[due_date]=w" target="_blank">Bu Hafta Terminli</a>
                            </div>
                            <div class="pys-stat-value" id="due-this-week-issues">
                                <div class="pys-loading-spinner"></div>
                            </div>
                        </div>
                    </div>

                    <div class="pys-stat-item">
                        <div class="pys-stat-icon pys-stat-month">
                            <i class="fas fa-calendar-days"></i>
                        </div>
                        <div class="pys-stat-content">
                            <div class="pys-stat-label">
                                <a href="${BASE_URL}/issues?utf8=✓&set_filter=1&f[]=assigned_to_id&op[assigned_to_id]==&v[assigned_to_id][]=me&f[]=status_id&op[status_id]=o&f[]=due_date&op[due_date]=m" target="_blank">Bu Ay Terminli</a>
                            </div>
                            <div class="pys-stat-value" id="due-this-month-issues">
                                <div class="pys-loading-spinner"></div>
                            </div>
                        </div>
                    </div>
                </div>
            <div class="pys-stat-row">
                <div class="pys-stat-item">
                    <div class="pys-stat-icon pys-stat-completed">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="pys-stat-content">
                        <div class="pys-stat-label">
                            <a href="${BASE_URL}/issues?utf8=✓&set_filter=1&sort=closed_on:desc&f[]=status_id&op[status_id]=c&f[]=assigned_to_id&op[assigned_to_id]==&v[assigned_to_id][]=me&f[]=closed_on&op[closed_on]=m" target="_blank">Bu Ay Tamamlanan</a>
                        </div>
                        <div class="pys-stat-value" id="completed-this-month">
                            <div class="pys-loading-spinner"></div>
                        </div>
                    </div>
                </div>

                <div class="pys-stat-item">
                    <div class="pys-stat-icon pys-stat-completed">
                        <i class="far fa-star"></i>
                    </div>
                    <div class="pys-stat-content">
                        <div class="pys-stat-label">
                            <a href="${BASE_URL}/issues?utf8=✓&set_filter=1&sort=subject&f[]=status_id&op[status_id]=o&f[]=cf_20&op[cf_20]==&v[cf_20][]=me&f[]=start_date&op[start_date]=w" target="_blank">Bu hafta Başlanacak</a>
                        </div>
                        <div class="pys-stat-value" id="start-this-week">
                            <div class="pys-loading-spinner"></div>
                        </div>
                    </div>
                </div>

            </div>
                <div class="pys-stat-item">
                    <div class="pys-stat-icon pys-stat-watched">
                        <i class="fas fa-eye"></i>
                    </div>
                    <div class="pys-stat-content">
                        <div class="pys-stat-label">
                            <a href="${BASE_URL}/issues?set_filter=1&f[]=status_id&op[status_id]=o&f[]=watcher_id&op[watcher_id]==&v[watcher_id][]=me" target="_blank">İzlediğim İşler</a>
                        </div>
                        <div class="pys-stat-value" id="watched-issues">
                            <div class="pys-loading-spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="pys-card pys-card-secondary">
            <div class="pys-card-header">
                <h3><i class="fas fa-stopwatch"></i> Zaman Özeti</h3>
                <div class="pys-new-btn" title="Yeni Zaman Girişi">
                    <a href="https://pys.koton.com.tr/issues/33605/time_entries/new" style="display: flex; align-items: center; gap: 5px;" title="Yeni Zaman Girişi">
                        <i class="fas fa-plus"></i>
                    </a>
                </div>
            </div>
            <div class="pys-card-body pys-time-summary">
                <div class="pys-time-display">
                    <div class="pys-time-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="pys-time-content-row">
                        <div class="pys-time-content">
                            <div class="pys-time-label"><i class="fas fa-calendar-days"></i> Bu Ay</div>

                            <div class="pys-time-value" id="time-spent-this-month">
                                <div class="pys-loading-spinner"></div>

                            </div>
                            <div class="pys-time-unit">saat</div>
                        </div>
                        <div class ="pys-divider"> </div>
                        <div class="pys-time-content">
                            <div class="pys-time-label">
                                <i class="fas fa-calendar-week"></i>
                                <a href="${BASE_URL}/time_entries?set_filter=1&sort=subject&f[]=user_id&op[user_id]==&v[user_id][]=me&f[]=spent_on&op[spent_on]=m&group_by=created_on" target="_blank">Bu Hafta</a>
                            </div>
                            <div class="pys-time-value" id="time-spent-this-week">
                                <div class="pys-loading-spinner"></div>
                            </div>
                            <div class="pys-time-unit">saat</div>
                        </div>
                        <div class ="pys-divider"> </div>
                        <div class="pys-time-content">
                            <div class="pys-time-label">
                                <i class="fas fa-calendar-day"></i>
                                <a href="${BASE_URL}/time_entries?set_filter=1&sort=subject&f[]=user_id&op[user_id]==&v[user_id][]=me&f[]=spent_on&op[spent_on]=t&group_by=created_on" target="_blank">Bugün</a>
                            </div>
                            <div class="pys-time-value" id="time-spent-this-day">
                                <div class="pys-loading-spinner"></div>
                            </div>
                            <div class="pys-time-unit">saat</div>
                        </div>
                    </div>
                </div>

                <div class="pys-time-link">
                    <a href="${BASE_URL}/time_entries?set_filter=1&sort=subject&f[]=user_id&op[user_id]==&v[user_id][]=me&f[]=spent_on&op[spent_on]=m&group_by=created_on" target="_blank" class="pys-btn pys-btn-outline">
                        <i class="fas fa-external-link-alt"></i> Detayları Görüntüle
                    </a>
                </div>

                <h4 class="pys-time-table-header"><i class="fas fa-list-ol"></i> Son 10 Zaman Kaydı</h4>
                <div class="pys-time-table-wrapper">
                    <table class="pys-time-table">
                        <thead>
                            <tr>
                                <th>Aktivite</th>
                                <th>Issue</th>
                                <th>Notlar</th>
                                <th>Saat</th>
                                <th class="th-actions"><i class="fa-solid fa-ellipsis-h" title="Actions"></i></th>
                            </tr>
                        </thead>
                        <tbody id="pys-time-table-body">
                            <tr>
                                <td colspan="5">Yükleniyor...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="pys-card pys-card-tertiary">
            <div class="pys-card-header">
                <h3><i class="fas fa-chart-pie"></i> Aktivite Dağılımı</h3>
                <select id="pys-card-pie-select" name="tarihSecimi">
                  <option value="m">Bu Ay</option>
                  <option value="w">Bu Hafta</option>
                  <option value="t">Bugün</option>
                </select>
            </div>
            <div class="pys-card-body">
                <canvas id="activity-pie-chart" width="300" height="300"></canvas>
            </div>
        </div>
    </div>

    <div class="pys-dashboard-footer">
        <div class="pys-last-updated">
            Son güncellenme: <span id="pys-last-update">-</span>
        </div>
    </div>
</div>

`;

  const target = document.querySelector("#content");
  if (target) {
    target.insertAdjacentHTML("afterbegin", dashboardHTML);

    // API anahtarını sıfırlamak için buton ekle
    const resetBtn = document.createElement("button");
    resetBtn.className = "pys-btn";
    resetBtn.title = "API Anahtarını sıfırla";
    resetBtn.innerHTML = `<i class="fas fa-lock"></i>`;
    resetBtn.onclick = function () {
      localStorage.removeItem("pysRedmineApiKey");
      alert("API anahtarı sıfırlandı. Sayfa yeniden yüklenecek.");
      location.reload();
    };

    const lastUpdatedDiv = document.querySelector(".pys-last-updated");
    if (lastUpdatedDiv) {
      lastUpdatedDiv.appendChild(resetBtn);
    }

    let selectedUserId = localStorage.getItem("pysSelectedUserId") || "me";
    const userSelect = document.getElementById("pys-user-select");
    const loadUserBtn = document.getElementById("pys-load-user-data");
    const addUserOptionBtn = document.getElementById("pys-add-user-option"); // Yeni buton

    // Fetch and populate users, then load all data
    fetchUsersAndPopulateSelect(function () {
      // This callback ensures loadAllData runs AFTER select is fully populated and its value is set
      selectedUserId = userSelect.value; // Get the currently set value from the select
      loadAllData(selectedUserId);
    });

    // Event listener for user select change
    if (userSelect) {
      userSelect.addEventListener("change", function () {
        selectedUserId = this.value;
        localStorage.setItem("pysSelectedUserId", selectedUserId);
        loadAllData(selectedUserId); // Reload data based on new selection
      });
    }

    // Event listener for load user data button
    if (loadUserBtn) {
      loadUserBtn.addEventListener("click", function () {
        loadAllData(selectedUserId);
      });
    }

    // NEW: Event listener for add user option button
    if (addUserOptionBtn) {
      addUserOptionBtn.addEventListener("click", function () {
        const userName = prompt("Yeni kullanıcı adını girin (örn: John Doe):");
        if (!userName) {
          alert("Kullanıcı adı boş bırakılamaz.");
          return;
        }
        const userId = prompt(
          `"${userName}" için kullanıcı ID'sini girin (Redmine'daki ID):`
        );
        if (!userId || isNaN(userId)) {
          alert("Geçerli bir kullanıcı ID'si girilmelidir.");
          return;
        }

        let customUsers = JSON.parse(
          localStorage.getItem("pysCustomUsers") || "[]"
        );
        // Check if user already exists
        if (customUsers.some((u) => u.id === userId)) {
          alert("Bu kullanıcı ID'si zaten mevcut.");
          return;
        }

        customUsers.push({ id: userId, name: userName });
        localStorage.setItem("pysCustomUsers", JSON.stringify(customUsers));

        // Re-populate the select to include the new user, then select it and load data
        fetchUsersAndPopulateSelect(function () {
          userSelect.value = userId;
          selectedUserId = userId; // Update selectedUserId after setting select value
          localStorage.setItem("pysSelectedUserId", selectedUserId);
          loadAllData(selectedUserId);
        });
      });
    }

    // Refresh butonu event listener
    document
      .getElementById("pys-refresh")
      .addEventListener("click", function () {
        var innerElement = this.querySelector("i"); // i yerine başka bir tag veya class seçebilirsin
        if (innerElement) {
          innerElement.classList.add("pys-loading");
        }

        loadAllData(selectedUserId); // Pass selected user ID

        const refreshBtn = this;
        // Küçük bir gecikme ile kaldırmak için:
        setTimeout(() => {
          // var innerElement = refreshBtn.querySelector("i");
          if (innerElement) {
            innerElement.classList.remove("pys-loading");
          }
        }, 1200);
      });

    document.querySelectorAll(".pys-stat-item").forEach(function (item) {
      item.addEventListener("click", function (e) {
        // Tıklanan yer zaten linkse, tekrar işlem yapma
        if (e.target.tagName.toLowerCase() === "a") return;

        // İçerideki linki bul
        const link = item.querySelector("a");
        if (link) {
          // Yeni sekmede aç
          window.open(link.href, "_blank");
        }
      });
    });

    document.querySelectorAll(".pys-new-btn").forEach(function (item) {
      item.addEventListener("click", function (e) {
        // Eğer tıklanan öğe veya üstlerinden biri <a> ise, kendi davranışı çalışsın, ekstra işlem yapma
        if (e.target.closest("a")) return;

        const link = item.querySelector("a");
        if (link) {
          window.open(link.href, "_self");
        }
      });
    });
  }

  // fetchUsersAndPopulateSelect now accepts a callback
  function fetchUsersAndPopulateSelect(callback) {
    ensureApiKey();
    const userSelect = document.getElementById("pys-user-select");
    if (!userSelect) {
      console.error("User select element not found.");
      if (callback) callback();
      return;
    }

    // Clear existing options
    userSelect.innerHTML = "";

    // Add default 'me' option
    const meOption = document.createElement("option");
    meOption.value = "me";
    meOption.textContent = "<<me>>";
    userSelect.appendChild(meOption);

    // Add custom users from localStorage
    const customUsers = JSON.parse(
      localStorage.getItem("pysCustomUsers") || "[]"
    );
    customUsers.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.name;
      userSelect.appendChild(option);
    });

    // No longer fetching users from users.json as per user request.

    // Restore the previously selected value AFTER all options are added
    userSelect.value = localStorage.getItem("pysSelectedUserId") || "me";

    if (callback) callback(); // Call the callback after all operations are done
  }

  function loadAllData(userId) {
    updateLastUpdateTime();
    ensureApiKey();
    // İş sayıları
    fetchCount(
      {
        "f[]": ["assigned_to_id", "status_id"],
        "op[assigned_to_id]": "=",
        "v[assigned_to_id][]": [userId], // Use userId
        "op[status_id]": "o",
      },
      "#open-issues",
      userId // Pass userId for link modification
    );

    fetchCount(
      {
        "f[]": ["assigned_to_id", "status_id"],
        "op[assigned_to_id]": "=",
        "v[assigned_to_id][]": [userId],
        "op[status_id]": "=",
        "v[status_id][]": "17",
      },
      "#new-issues",
      userId // Pass userId for link modification
    );

    fetchCount(
      {
        "f[]": ["assigned_to_id", "status_id", "due_date"],
        "op[assigned_to_id]": "=",
        "v[assigned_to_id][]": [userId], // Use userId
        "op[status_id]": "o",
        "op[due_date]": "<=",
        "v[due_date][]": [YESTERDAY],
      },
      "#overdue-issues",
      userId // Pass userId for link modification
    );

    fetchCount(
      {
        "f[]": ["assigned_to_id", "status_id", "due_date"],
        "op[assigned_to_id]": "=",
        "v[assigned_to_id][]": [userId], // Use userId
        "op[status_id]": "o",
        "op[due_date]": "w",
      },
      "#due-this-week-issues",
      userId // Pass userId for link modification
    );

    fetchCount(
      {
        "f[]": ["assigned_to_id", "status_id", "due_date"],
        "op[assigned_to_id]": "=",
        "v[assigned_to_id][]": [userId], // Use userId
        "op[status_id]": "o",
        "op[due_date]": "t",
      },
      "#due-today-issues",
      userId // Pass userId for link modification
    );

    fetchCount(
      {
        "f[]": ["assigned_to_id", "status_id", "due_date"],
        "op[assigned_to_id]": "=",
        "v[assigned_to_id][]": [userId], // Use userId
        "op[status_id]": "o",
        "op[due_date]": "m",
      },
      "#due-this-month-issues",
      userId // Pass userId for link modification
    );

    fetchCount(
      {
        "f[]": ["assigned_to_id", "status_id", "closed_on"],
        "op[assigned_to_id]": "=",
        "v[assigned_to_id][]": [userId], // Use userId
        "op[status_id]": "c",
        "op[closed_on]": "m",
      },
      "#completed-this-month",
      userId // Pass userId for link modification
    );

    fetchCount(
      {
        "f[]": ["cf_20", "status_id", "start_date"],
        "op[cf_20]": "=",
        "v[cf_20][]": [userId], // Use userId
        "op[status_id]": "o",
        "op[start_date]": "w",
      },
      "#start-this-week",
      userId // Pass userId for link modification
    );

    fetchCount(
      {
        "f[]": ["watcher_id", "status_id"],
        "op[status_id]": "o",
        "op[watcher_id]": "=",
        "v[watcher_id][]": [userId], // Use userId
      },
      "#watched-issues",
      userId // Pass userId for link modification
    );

    // Bu ayki harcanan toplam zaman
    fetchTimeSpentThisMonth(
      {
        "f[]": ["user_id", "spent_on"],
        "op[user_id]": "=",
        "v[user_id][]": [userId], // Use userId
        "op[spent_on]": "m",
        "group_by":"created_on",
      },
      "#time-spent-this-month",
      userId // Pass userId for link modification
    );

    fetchTimeSpentThisMonth(
      {
        "f[]": ["user_id", "spent_on"],
        "op[user_id]": "=",
        "v[user_id][]": [userId], // Use userId
        "op[spent_on]": "w",
        "group_by":"created_on",
      },
      "#time-spent-this-week",
      userId // Pass userId for link modification
    );

    fetchTimeSpentThisMonth(
      {
        "f[]": ["user_id", "spent_on"],
        "op[user_id]": "=",
        "v[user_id][]": [userId], // Use userId
        "op[spent_on]": "t",
        "group_by":"created_on",
      },
      "#time-spent-this-day",
      userId // Pass userId for link modification
    );

    fetchRecentTimeEntries(userId); // Pass userId
    const savedPieSelectValue =
      localStorage.getItem("pysPieSelectValue") || "m";
    document.getElementById("pys-card-pie-select").value = savedPieSelectValue;
    fetchTimeSpentForChart(savedPieSelectValue, userId); // Pass userId

    // Seçim değiştiğinde grafiği güncelle
    const pieSelect = document.getElementById("pys-card-pie-select");
    if (pieSelect) {
      pieSelect.addEventListener("change", function () {
        const selectedValue = this.value;
        fetchTimeSpentForChart(selectedValue, userId); // Pass userId
        localStorage.setItem("pysPieSelectValue", selectedValue);
      });
    }
  }

  function fetchCount(params, selector, userId) {
    const url = new URL(`${BASE_URL}/issues.json`);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("limit", 1);

    // Modify the link within the element to reflect the selected user
    const labelLink = document
      .querySelector(selector)
      ?.previousElementSibling?.querySelector("a");
    if (labelLink) {
      let originalHref = labelLink.href;
      // Replace 'me' or any numeric ID with the actual userId or keep 'me' if userId is 'me'
      const userIdParam = userId === "me" ? "me" : userId;
      originalHref = originalHref.replace(
        /v\[assigned_to_id\]\[\]=(me|\d+)/g,
        `v[assigned_to_id][]=${userIdParam}`
      );
      originalHref = originalHref.replace(
        /v\[cf_20\]\[\]=(me|\d+)/g,
        `v[cf_20][]=${userIdParam}`
      );
      originalHref = originalHref.replace(
        /v\[watcher_id\]\[\]=(me|\d+)/g,
        `v[watcher_id][]=${userIdParam}`
      );
      originalHref = originalHref.replace(
        /v\[user_id\]\[\]=(me|\d+)/g,
        `v[user_id][]=${userIdParam}`
      ); // Add this for consistency, though it's typically for time entries
      labelLink.href = originalHref;
    }

    for (const key in params) {
      const values = Array.isArray(params[key]) ? params[key] : [params[key]];
      for (const val of values) {
        url.searchParams.append(key, val);
      }
    }

    GM_xmlhttpRequest({
      method: "GET",
      url: url.toString(),
      headers: { "Content-Type": "application/json" },
      onload: function (response) {
        try {
          const data = JSON.parse(response.responseText);
          const element = document.querySelector(selector);
          const count = data.total_count ?? 0;

          element.innerHTML = `<span class="pys-count-number">${count}</span>`;

          // Animate the number
          animateNumber(element.querySelector(".pys-count-number"), count);
        } catch (err) {
          console.error("Veri çekme hatası:", err);
          document.querySelector(selector).innerHTML =
            '<span class="pys-error">Hata</span>';
        }
      },
      onerror: function () {
        document.querySelector(selector).innerHTML =
          '<span class="pys-error">API Hatası</span>';
      },
    });
  }

  function fetchTimeSpentThisMonth(params, selector, userId) {
    const limit = 100;
    let offset = 0;
    let allEntries = [];

    const baseUrl = new URL(`${BASE_URL}/time_entries.json`);
    baseUrl.searchParams.set("key", API_KEY);

    for (const key in params) {
      const values = Array.isArray(params[key]) ? params[key] : [params[key]];
      for (const val of values) {
        baseUrl.searchParams.append(key, val);
      }
    }

    async function fetchAllPages() {
      while (true) {
        const url = new URL(baseUrl);
        url.searchParams.set("limit", limit);
        url.searchParams.set("offset", offset);

        const response = await new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: "GET",
            url: url.toString(),
            headers: { "Content-Type": "application/json" },
            onload: (res) => resolve(JSON.parse(res.responseText)),
            onerror: reject,
          });
        });

        if (!response.time_entries || response.time_entries.length === 0) break;

        allEntries = allEntries.concat(response.time_entries);
        offset += limit;

        if (offset >= response.total_count) break;
      }

      // Toplam saat hesapla
      const totalHours = allEntries.reduce(
        (acc, te) => acc + (te.hours || 0),
        0
      );

      const element = document.querySelector(selector);
      element.innerHTML = `<span class="pys-time-number">${totalHours.toFixed(
        1
      )}</span>`;
      animateNumber(element.querySelector(".pys-time-number"), totalHours, 1);
    }

    fetchAllPages().catch((error) => {
      console.error("fetchTimeSpentThisMonth hata:", error);
      document.querySelector(
        selector
      ).innerHTML = `<span class="pys-error">API Hatası</span>`;
    });
  }

  function fetchTimeSpentForChart(spent_on_op, userId) {
    const limit = 100;
    let offset = 0;
    let allEntries = [];

    async function fetchAllPages() {
      while (true) {
        const url = new URL(`${BASE_URL}/time_entries.json`);
        url.searchParams.set("key", API_KEY);
        url.searchParams.set("limit", limit);
        url.searchParams.set("offset", offset);

        url.searchParams.append("f[]", "user_id");
        url.searchParams.set("op[user_id]", "=");
        url.searchParams.append("v[user_id][]", userId);

                url.searchParams.append("f[]", "spent_on");
                url.searchParams.set("op[spent_on]", spent_on_op);

        const response = await new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: "GET",
            url: url.toString(),
            headers: { "Content-Type": "application/json" },
            onload: (res) => resolve(JSON.parse(res.responseText)),
            onerror: reject,
          });
        });

        if (!response.time_entries || response.time_entries.length === 0) break;

        allEntries = allEntries.concat(response.time_entries);
        offset += limit;

        if (offset >= response.total_count) break;
      }

      drawActivityPieChart(allEntries);
    }

    fetchAllPages().catch((err) => {
      console.error("fetchTimeSpentForChart hata:", err);
    });
  }

  function fetchRecentTimeEntries(userId) {
    const url = new URL(`${BASE_URL}/time_entries.json`);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("limit", 10);
    url.searchParams.set("sort", "spent_on:desc");
    url.searchParams.set("sort", "created_on:desc");

    // Sadece bana ait olanları getir
    url.searchParams.set("f[]", "user_id");
    url.searchParams.set("op[user_id]", "=");
    url.searchParams.set("v[user_id][]", userId); // Use userId
    url.searchParams.set("include", "custom_fields");

    GM_xmlhttpRequest({
      method: "GET",
      url: url.toString(),
      headers: { "Content-Type": "application/json" },
      onload: function (response) {
        try {
          const data = JSON.parse(response.responseText);
          const tbody = document.getElementById("pys-time-table-body");
          tbody.innerHTML = "";

          if (!data.time_entries || data.time_entries.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">Kayıt bulunamadı</td></tr>`;
            return;
          }

          data.time_entries.forEach((entry) => {
            const activity = entry.activity?.name || "-";
            const issueId = entry.issue?.id || "";
            const issueLink = issueId
              ? `<a href="${BASE_URL}/issues/${issueId}" target="_blank">#${issueId}</a>`
              : "-";

            // Custom field 4: Notlar
            let notes = "-";
            const cf4 = entry.custom_fields?.find((cf) => cf.id === 4);
            if (cf4 && cf4.value) {
              notes = Array.isArray(cf4.value)
                ? cf4.value.join(", ")
                : cf4.value;
            }

            const hours = entry.hours != null ? entry.hours.toFixed(1) : "0.0";
            const editLink = `<a title="Edit" href="/time_entries/${entry.id}/edit" data-iconified="true" target="_blank"> <i class="fa-solid fa-pen-to-square" title="Edit" style="margin-left: 8px;"></i></a>`;

            tbody.insertAdjacentHTML(
              "beforeend",
              `<tr>
                            <td>${activity}</td>
                            <td>${issueLink}</td>
                            <td>${notes}</td>
                            <td style="text-align:right;">${hours}</td>
                            <td> ${editLink}</td>
                        </tr>`
            );
          });
        } catch (err) {
          console.error("Zaman tablosu hatası:", err);
        }
      },
      onerror: function () {
        console.error("Zaman tablosu yüklenemedi");
      },
    });
  }
  // --- NEW CODE END ---

  let pieChartInstance = null;
  function drawActivityPieChart(timeEntries) {
    if (pieChartInstance) {
      pieChartInstance.destroy();
    }

    Chart.register(ChartDataLabels);

    const activityMap = new Map();

    timeEntries.forEach((entry) => {
      const activityName = entry.activity ? entry.activity.name : "Diğer";
      activityMap.set(
        activityName,
        (activityMap.get(activityName) || 0) + (entry.hours || 0)
      );
    });

    const labels = [...activityMap.keys()];
    const data = [...activityMap.values()];
    const colors = labels.map(
      (_, i) => `hsl(${((i * 360) / labels.length) % 360}, 70%, 60%)`
    );

    const ctx = document.getElementById("activity-pie-chart").getContext("2d");

    pieChartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            hoverOffset: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: "#fff",
            font: {
              weight: "bold",
              size: 12,
            },
            formatter: function (value, context) {
              const data = context.chart.data.datasets[0].data;
              const sorted = [...data].sort((a, b) => b - a);
              const top3 = sorted.slice(0, 3);
              return top3.includes(value) ? value.toFixed(1) : null;
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: ${context.parsed.toFixed(1)} saat`;
              },
            },
          },
          legend: {
            position: "left",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              boxWidth: 10,
            },
          },
        },
        animation: {
          animateRotate: true,
          duration: 1000,
        },
      },
      plugins: [ChartDataLabels],
    });
  }

  function animateNumber(element, targetValue, decimals = 0) {
    const startValue = 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateNumber(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * easeOut;

      element.textContent =
        decimals > 0
          ? currentValue.toFixed(decimals)
          : Math.round(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    }

    requestAnimationFrame(updateNumber);
  }

  function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    document.getElementById("pys-last-update").textContent = timeString;
  }
})();
