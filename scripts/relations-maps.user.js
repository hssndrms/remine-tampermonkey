// ==UserScript==
// @name         PYS İlişki Haritası
// @namespace    http://tampermonkey.net/
// @version      2025-08-04
// @description  Redmine issue'lar için modern görünümlü ilişki haritası
// @author       hssndrms
// @match        https://pys.koton.com.tr/issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
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
                    'copied_to' :'copied_from'
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

    // İlişki haritasını oluştur
    function createRelationMap(relations, currentIssueId) {
        const container = document.createElement('div');
        container.className = 'relation-map-container show';
        container.innerHTML = `
            <div class="relation-map-header">
                <h3 class="relation-map-title"><i class="fa-solid fa-map"></i> İlişki Haritası</h3>
                <button class="close-btn" onclick="this.closest('.relation-map-container').remove()">×</button>
            </div>
            <div class="relation-map-content">
                ${relations.length === 0 ?
            '<div class="no-relations">Bu issue için ilişki bulunamadı</div>' :
        relations.map(relation => `
                        <div class="relation-item ${relation.displayType}">
                            <div class="relation-icon">
                                ${relation.config.icon}
                            </div>
                            <div class="relation-details">
                                <div class="relation-type">
                                    ${relation.config.label}
                                    <span class="direction-arrow">
                                        ${relation.isOutgoing ? '<i class="fa-solid fa-arrow-right"></i>' : '<i class="fa-solid fa-arrow-left"></i>'}
                                    </span>
                                </div>
                                <div class="relation-target">
                                    <a href="/issues/${relation.targetId}" class="relation-link">
                                        Issue #${relation.targetId}
                                    </a>
                                </div>
                            </div>
                        </div>
                    `).join('')
    }
            </div>
        `;

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

            const issueData = await fetchIssueData(currentIssueId);

            button.innerHTML = '<i class="fa-solid fa-map"></i>';
            button.disabled = false;

            if (!issueData || !issueData.issue) {
                alert('Issue verileri alınamadı!');
                return;
            }

            const relations = issueData.issue.relations || [];
            const analyzedRelations = analyzeRelations(relations, currentIssueId);
            const mapContainer = createRelationMap(analyzedRelations, currentIssueId);

            document.body.appendChild(mapContainer);

        });

        return button;
    }

    // Ana fonksiyon
    function init() {
        // Sadece issue sayfalarında çalış
        if (!getCurrentIssueId()) return;

        // addStyles();

        // Toggle butonunu ekle
        const toggleButton = createToggleButton();
        // document.body.appendChild(toggleButton);

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