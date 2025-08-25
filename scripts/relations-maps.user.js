// ==UserScript==
// @name         PYS İlişki Haritası
// @namespace    http://tampermonkey.net/
// @version      2025-08-25
// @description  Redmine issue'lar için modern görünümlü ilişki haritası
// @author       hssndrms
// @match        https://pys.koton.com.tr/issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/relations-maps.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/relations-maps.user.js
// @grant        none
// @require      https://d3js.org/d3.v7.min.js
// ==/UserScript==

(function() {
    'use strict';

    // İlişki türü çevirileri ve ikonları
    const relationConfig = {
        'relates': {
            label: 'İlişkili',
            icon: '<i class="fas fa-link"></i>',
            outgoing: 'ile ilişkili',
            incoming: 'tarafından ilişkilendirildi'
        },
        'blocks': {
            label: 'Engelliyor',
            icon: '<i class="fa-solid fa-ban"></i>',
            outgoing: 'engelleniyor',
            incoming: 'engelliyor'
        },
        'blocked': {
            label: 'Engelleniyor',
            icon: '<i class="fa-solid fa-ban"></i>',
            outgoing: 'engelliyor',
            incoming: 'engelleniyor'
        },
        'precedes': {
            label: 'Sonra Geliyor',
            icon: '<i class="fa-solid fa-forward"></i>',
            outgoing: 'den önce geliyor',
            incoming: 'den sonra geliyor'
        },
        'follows': {
            label: 'Önce Geliyor',
            icon: '<i class="fa-solid fa-backward"></i>',
            outgoing: 'den sonra geliyor',
            incoming: 'den önce geliyor'
        },
        'duplicates': {
            label: 'Tekrarı',
            icon: '<i class="fa-solid fa-repeat"></i>',
            outgoing: 'nın tekrarı',
            incoming: 'tekrarlanıyor'
        },
        'subtask_of': {
            label: 'Alt Görev',
            icon: '<i class="fa-solid fa-diagram-subtask"></i>',
            outgoing: 'nın alt görevi',
            incoming: 'nın ana görevi'
        },
        'copied_to': {
            label: 'Kopyalandı',
            icon: '<i class="fas fa-copy"></i>',
            outgoing: 'den kopyalandı',
            incoming: 'e kopyalandı'
        }
    };

    // Tamamlanmış durumlar (Redmine'da genellikle closed durumları)
    const COMPLETED_STATUS_IDS = [5, 6]; // Bu değerleri sisteminize göre ayarlayın
    const COMPLETED_STATUS_NAMES = ['Closed', 'Resolved', 'Done', 'Completed', 'Kapandı', 'Çözüldü', 'Tamamlandı'];

    // LocalStorage anahtarları
    const STORAGE_KEYS = {
        HIDE_COMPLETED: 'pysRelationMap_hideCompleted'
    };

    // Ayarları yükle
    function loadSettings() {
        const hideCompleted = localStorage.getItem(STORAGE_KEYS.HIDE_COMPLETED);
        return {
            hideCompleted: hideCompleted === 'true'
        };
    }

    // Ayarları kaydet
    function saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.HIDE_COMPLETED, settings.hideCompleted.toString());
    }

    // Mevcut issue ID'sini al
    function getCurrentIssueId() {
        const match = window.location.pathname.match(/\/issues\/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    // API'den issue verilerini al
    async function fetchIssueData(issueId) {
        try {
            const apiKey = localStorage.getItem('pysRedmineApiKey');
            if (!apiKey) throw new Error('API anahtarı bulunamadı (pysRedmineApiKey)');

            const response = await fetch(`/issues/${issueId}.json?include=relations`, {
                headers: {
                    'X-Redmine-API-Key': apiKey
                }
            });
            if (!response.ok) throw new Error('API hatası');
            return await response.json();
        } catch (error) {
            console.error('Issue verileri alınamadı:', error);
            return null;
        }
    }

    // İlişkili issue'ların detaylarını al
    async function fetchRelatedIssuesDetails(relations) {
        const apiKey = localStorage.getItem('pysRedmineApiKey');
        if (!apiKey) return [];

        const issueIds = relations.map(r => r.targetId);
        const promises = issueIds.map(async (issueId) => {
            try {
                const response = await fetch(`/issues/${issueId}.json`, {
                    headers: {
                        'X-Redmine-API-Key': apiKey
                    }
                });
                if (!response.ok) throw new Error(`API hatası: ${response.status}`);
                const data = await response.json();
                return {
                    id: issueId,
                    status: data.issue.status,
                    subject: data.issue.subject
                };
            } catch (error) {
                console.error(`Issue ${issueId} detayları alınamadı:`, error);
                return {
                    id: issueId,
                    status: { id: 0, name: 'Bilinmiyor' },
                    subject: 'Başlık alınamadı'
                };
            }
        });

        return await Promise.all(promises);
    }

    // Issue'ın tamamlanmış olup olmadığını kontrol et
    function isIssueCompleted(status) {
        if (!status) return false;

        // ID kontrolü
        if (COMPLETED_STATUS_IDS.includes(status.id)) {
            return true;
        }

        // İsim kontrolü (büyük/küçük harf duyarlı olmayan)
        const statusName = status.name.toLowerCase();
        return COMPLETED_STATUS_NAMES.some(name => statusName.includes(name.toLowerCase()));
    }

    // İlişkileri analiz et
    function analyzeRelations(relations, currentIssueId) {
        return relations.map(relation => {
            const isOutgoing = relation.issue_id === currentIssueId;
            const targetId = isOutgoing ? relation.issue_to_id : relation.issue_id;
            const relationType = relation.relation_type;

            // Gelen ilişkiler için ters çevir
            let displayType = relationType;
            if (!isOutgoing) {
                const reverseMap = {
                    'blocks': 'blocked',
                    'precedes': 'follows',
                    'follows': 'precedes',
                    'duplicates': 'duplicated',
                    'subtask_of': 'parent_task',
                    'copied_to': 'copied_from'
                };
                displayType = reverseMap[relationType] || relationType;
            }

            return {
                ...relation,
                targetId,
                isOutgoing,
                displayType,
                config: relationConfig[displayType] || relationConfig[relationType]
            };
        });
    }

    // Ayarlar panelini oluştur
    function createSettingsPanel(currentSettings, onSettingsChange) {
        const settingsPanel = document.createElement('div');
        settingsPanel.className = 'relation-map-settings';
        settingsPanel.innerHTML = `
            <div class="settings-row">
                <label class="settings-checkbox">
                    <input type="checkbox" id="hideCompletedCheckbox" ${currentSettings.hideCompleted ? 'checked' : ''}>
                    <span class="label-text">Tamamlanmış işleri gizle</span>
                </label>
            </div>
        `;

        const checkbox = settingsPanel.querySelector('#hideCompletedCheckbox');
        checkbox.addEventListener('change', (e) => {
            const newSettings = {
                ...currentSettings,
                hideCompleted: e.target.checked
            };
            saveSettings(newSettings);
            onSettingsChange(newSettings);
        });

        return settingsPanel;
    }

    // İlişki haritasını oluştur
    function createRelationMap(relations, relatedIssuesDetails, currentIssueId, settings) {
        // İlişkileri filtrele
        const filteredRelations = relations.filter(relation => {
            if (!settings.hideCompleted) return true;

            const issueDetail = relatedIssuesDetails.find(detail => detail.id === relation.targetId);
            return issueDetail ? !isIssueCompleted(issueDetail.status) : true;
        });

        const container = document.createElement('div');
        container.className = 'relation-map-container show';

        // Ayarlar panel referansı için
        let settingsPanel;

        const updateContent = (newSettings) => {
            const content = container.querySelector('.relation-map-content');
            const newFilteredRelations = relations.filter(relation => {
                if (!newSettings.hideCompleted) return true;

                const issueDetail = relatedIssuesDetails.find(detail => detail.id === relation.targetId);
                return issueDetail ? !isIssueCompleted(issueDetail.status) : true;
            });

            content.innerHTML = newFilteredRelations.length === 0 ?
                '<div class="no-relations">Bu kriterlere uygun ilişki bulunamadı</div>' :
                newFilteredRelations.map(relation => {
                    const issueDetail = relatedIssuesDetails.find(detail => detail.id === relation.targetId);
                    const isCompleted = issueDetail ? isIssueCompleted(issueDetail.status) : false;

                    return `
                        <div class="relation-item ${relation.displayType} ${isCompleted ? 'completed' : ''}">
                            <div class="relation-icon">
                                ${relation.config.icon}
                            </div>
                            <div class="relation-details">
                                <div class="relation-type">
                                    ${relation.config.label}
                                    <span class="direction-arrow">
                                        ${relation.isOutgoing ? '<i class="fa-solid fa-arrow-right"></i>' : '<i class="fa-solid fa-arrow-left"></i>'}
                                    </span>
                                    ${isCompleted ? '<span class="completed-badge">✓</span>' : ''}
                                </div>
                                <div class="relation-target">
                                    <a href="/issues/${relation.targetId}" class="relation-link">
                                        Issue #${relation.targetId}
                                    </a>
                                    ${issueDetail ? `<div class="issue-subject">${issueDetail.subject}</div>` : ''}
                                    ${issueDetail ? `<div class="issue-status">${issueDetail.status.name}</div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
        };

        container.innerHTML = `
            <div class="relation-map-header">
                <h3 class="relation-map-title"><i class="fa-solid fa-map"></i> İlişki Haritası</h3>
                <div class="header-actions">
                    <button class="settings-toggle-btn" title="Ayarlar">
                        <i class="fa-solid fa-gear"></i>
                    </button>
                    <button class="close-btn" onclick="this.closest('.relation-map-container').remove()">×</button>
                </div>
            </div>
            <div class="relation-map-content">
                ${filteredRelations.length === 0 ?
                    '<div class="no-relations">Bu kriterlere uygun ilişki bulunamadı</div>' :
                    filteredRelations.map(relation => {
                        const issueDetail = relatedIssuesDetails.find(detail => detail.id === relation.targetId);
                        const isCompleted = issueDetail ? isIssueCompleted(issueDetail.status) : false;

                        return `
                            <div class="relation-item ${relation.displayType} ${isCompleted ? 'completed' : ''}">
                                <div class="relation-icon">
                                    ${relation.config.icon}
                                </div>
                                <div class="relation-details">
                                    <div class="relation-type">
                                        ${relation.config.label}
                                        <span class="direction-arrow">
                                            ${relation.isOutgoing ? '<i class="fa-solid fa-arrow-right"></i>' : '<i class="fa-solid fa-arrow-left"></i>'}
                                        </span>
                                        ${isCompleted ? '<span class="completed-badge">✓</span>' : ''}
                                    </div>
                                    <div class="relation-target">
                                        <a href="/issues/${relation.targetId}" class="relation-link">
                                            Issue #${relation.targetId}
                                        </a>
                                        ${issueDetail ? `<div class="issue-subject">${issueDetail.subject}</div>` : ''}
                                        ${issueDetail ? `<div class="issue-status">${issueDetail.status.name}</div>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')
                }
            </div>
        `;

        // Ayarlar panelini ekle
        settingsPanel = createSettingsPanel(settings, updateContent);
        container.appendChild(settingsPanel);

        // Ayarlar toggle butonu event listener
        const settingsToggleBtn = container.querySelector('.settings-toggle-btn');
        settingsToggleBtn.addEventListener('click', () => {
            settingsPanel.classList.toggle('show');
        });

        return container;
    }

    // Toggle butonu oluştur
    function createToggleButton() {
        const button = document.createElement('button');
        button.className = 'toggle-btn';
        button.innerHTML = '<i class="fa-solid fa-map"></i>';
        button.title = 'İlişki Haritasını Göster';

        button.addEventListener('click', async () => {
            // Mevcut haritayı kapat
            const existing = document.querySelector('.relation-map-container');
            if (existing) {
                existing.remove();
                return;
            }

            const currentIssueId = getCurrentIssueId();
            if (!currentIssueId) {
                alert('Issue ID bulunamadı!');
                return;
            }

            button.innerHTML = '<i class="fa-solid fa-hourglass-start"></i>';
            button.disabled = true;

            try {
                const issueData = await fetchIssueData(currentIssueId);

                if (!issueData || !issueData.issue) {
                    alert('Issue verileri alınamadı!');
                    return;
                }

                const relations = issueData.issue.relations || [];
                const analyzedRelations = analyzeRelations(relations, currentIssueId);

                // İlişkili issue'ların detaylarını al
                const relatedIssuesDetails = await fetchRelatedIssuesDetails(analyzedRelations);

                const settings = loadSettings();
                const mapContainer = createRelationMap(analyzedRelations, relatedIssuesDetails, currentIssueId, settings);

                document.body.appendChild(mapContainer);

            } catch (error) {
                console.error('Hata:', error);
                alert('Bir hata oluştu: ' + error.message);
            } finally {
                button.innerHTML = '<i class="fa-solid fa-map"></i>';
                button.disabled = false;
            }
        });

        return button;
    }

    // Ana fonksiyon
    function init() {
        // Sadece issue sayfalarında çalış
        if (!getCurrentIssueId()) return;

        // Toggle butonunu ekle
        const toggleButton = createToggleButton();

        const relationsDiv = document.getElementById('relations');
        if (relationsDiv) {
            relationsDiv.insertBefore(toggleButton, relationsDiv.firstChild);
        } else {
            // Eğer #relations div'i yoksa body'ye ekle
            document.body.appendChild(toggleButton);
        }
    }

    // Sayfa yüklendiğinde başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();