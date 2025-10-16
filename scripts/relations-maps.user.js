// ==UserScript==
// @name         PYS İlişki Haritası
// @namespace    http://tampermonkey.net/
// @version      2025-10-16.5
// @description  Redmine issue'lar için modern görünümlü ilişki haritası (Tamamlanmış işleri gizle özelliği)
// @author       hssndrms
// @match        https://pys.koton.com.tr/issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/relations-maps.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/relations-maps.user.js
// @grant        none
// @require      https://d3js.org/d3.v7.min.js
// ==/UserScript==

(function () {
    'use strict';

    const API_KEY = localStorage.getItem('pysRedmineApiKey');
    const STORAGE_KEY = 'pysRelationSettings';
    const defaultSettings = { hideCompleted: false, prevDepth: 1, nextDepth: 3 };

    const COMPLETED_STATUS_NAMES = ['Closed', 'Resolved', 'Done', 'Completed', 'Kapandı', 'Çözüldü', 'Tamamlandı'];

    const relationConfig = {
        relates: { label: 'İlişkili', icon: '<i class="fas fa-link"></i>' },
        blocks: { label: 'Engelliyor', icon: '<i class="fa-solid fa-ban"></i>' },
        blocked: { label: 'Engelleniyor', icon: '<i class="fa-solid fa-ban"></i>' },
        precedes: { label: 'Sonra Geliyor', icon: '<i class="fa-solid fa-forward"></i>' },
        follows: { label: 'Önce Geliyor', icon: '<i class="fa-solid fa-backward"></i>' },
        duplicates: { label: 'Tekrarı', icon: '<i class="fa-solid fa-repeat"></i>' },
        subtask_of: { label: 'Alt Görev', icon: '<i class="fa-solid fa-diagram-subtask"></i>' },
        copied_to: { label: 'Kopyalandı', icon: '<i class="fas fa-copy"></i>' },
        copied_from: { label: 'Kopyalandı', icon: '<i class="fas fa-copy"></i>' },
        current: { label: "Bu İş", icon: '<i class="fas fa-circle"></i>' }
    };

    const getSettings = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : defaultSettings;
    };

    const saveSettings = (settings) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    };

    const getIssueId = () => {
        const match = window.location.pathname.match(/\/issues\/(\d+)/);
        return match ? parseInt(match[1]) : null;
    };

    async function fetchIssue(issueId) {
        const res = await fetch(`/issues/${issueId}.json?include=relations`, {
            headers: { 'X-Redmine-API-Key': API_KEY },
        });
        const json = await res.json();
        return json.issue;
    }

    function isIssueCompleted(status) {
        if (!status) return false;
        if (status.id && [5, 6].includes(status.id)) return true;
        const name = status.name?.toLowerCase();
        return COMPLETED_STATUS_NAMES.some(n => name?.includes(n.toLowerCase()));
    }

    const renderCard = (iss, level = 0, type = '', hideCompleted = false) => {
        const relCfg = relationConfig[type] || { label: type, icon: '<i class="fa-solid fa-link"></i>' };
        const isCompleted = isIssueCompleted(iss.status);
        if (hideCompleted && isCompleted) return ''; // Tamamlanmış gizle

        const paddingLeft = level * 16;
        return `
            <div class="relation-item ${type} ${isCompleted ? 'completed' : ''}" style="margin-left:${paddingLeft}px" data-issue-id="${iss.id}">
                <div class="relation-icon">${relCfg.icon}</div>
                <div class="relation-details">
                    <div class="relation-type">
                        ${relCfg.label}
                        <span class="direction-arrow">${
                            type === 'follows' ? '<i class="fa-solid fa-arrow-left"></i>' :
                            type === 'precedes' ? '<i class="fa-solid fa-arrow-right"></i>' : ''
                        }</span>
                        ${isCompleted ? '<span class="completed-badge">✓</span>' : ''}
                    </div>
                    <div class="relation-target">
                        <a href="/issues/${iss.id}" class="relation-link">#${iss.id}</a>
                        <div class="issue-subject">${iss.subject}</div>
                        <div class="issue-status">${iss.status?.name || ''}</div>
                    </div>
                </div>
            </div>`;
    };

    async function fetchDeepRelations(issueId, direction, depth, currentDepth = 0, visited = new Set()) {
        if (currentDepth >= depth || visited.has(issueId)) return [];
        visited.add(issueId);

        const issue = await fetchIssue(issueId);
        const relations = issue.relations || [];

        let targetRelations = relations.filter((r) => {
            if (direction === 'next') return r.relation_type === 'precedes' && r.issue_id === issueId;
            if (direction === 'prev') return r.relation_type === 'precedes' && r.issue_to_id === issueId;
            return false;
        });

        const result = [];
        for (const rel of targetRelations) {
            const nextId = direction === 'next' ? rel.issue_to_id : rel.issue_id;
            const nextIssue = await fetchIssue(nextId);
            result.push({ ...rel, issue: nextIssue });
            const deeper = await fetchDeepRelations(nextId, direction, depth, currentDepth + 1, visited);
            result.push(...deeper);
        }
        return result;
    }

    function createSettingsPanel(settings, onSave) {
        const panel = document.createElement('div');
        panel.className = 'relation-map-settings';
        panel.innerHTML = `
            <div class="settings-row">
                <label class="settings-checkbox">
                    <input type="checkbox" id="hideCompleted" ${settings.hideCompleted ? 'checked' : ''}>
                    <span class="label-text">Tamamlanmış işleri gizle</span>
                </label>
            </div>
            <div class="settings-row">
                <label>Önceki Derinlik:</label>
                <input type="number" id="prevDepth" min="0" max="10" value="${settings.prevDepth}" style="width:60px;">
            </div>
            <div class="settings-row">
                <label>Sonraki Derinlik:</label>
                <input type="number" id="nextDepth" min="0" max="10" value="${settings.nextDepth}" style="width:60px;">
            </div>
            <div class="settings-row" style="text-align:right;">
                <button id="saveSettingsBtn" class="save-btn">
                    <i class="fa-solid fa-floppy-disk"></i> Kaydet
                </button>
            </div>
        `;
        panel.querySelector('#saveSettingsBtn').addEventListener('click', () => {
            const newSettings = {
                hideCompleted: panel.querySelector('#hideCompleted').checked,
                prevDepth: parseInt(panel.querySelector('#prevDepth').value),
                nextDepth: parseInt(panel.querySelector('#nextDepth').value),
            };
            saveSettings(newSettings);
            onSave(newSettings);
            panel.classList.remove('show');
        });
        return panel;
    }

    async function buildRelationMap(issueId, settings) {
        const container = document.createElement('div');
        container.className = 'relation-map-container show';
        container.innerHTML = `
            <div class="relation-map-header">
                <h3 class="relation-map-title"><i class="fa-solid fa-map"></i> İlişki Haritası</h3>
                <div class="header-actions">
                    <button class="settings-toggle-btn" title="Ayarlar"><i class="fa-solid fa-gear"></i></button>
                    <button class="close-btn">×</button>
                </div>
            </div>
            <div class="relation-map-content"><div class="no-relations">Yükleniyor...</div></div>
        `;

        const content = container.querySelector('.relation-map-content');
        const settingsPanel = createSettingsPanel(settings, async (newSettings) => {
            const newMap = await buildRelationMap(issueId, newSettings);
            container.replaceWith(newMap);
        });
        container.appendChild(settingsPanel);

        container.querySelector('.close-btn').onclick = () => container.remove();
        container.querySelector('.settings-toggle-btn').onclick = () => settingsPanel.classList.toggle('show');

        const [prevRels, nextRels, currentIssue] = await Promise.all([
            fetchDeepRelations(issueId, 'prev', settings.prevDepth),
            fetchDeepRelations(issueId, 'next', settings.nextDepth),
            fetchIssue(issueId),
        ]);

        let html = '';
        prevRels.reverse().forEach((r, i) => html += renderCard(r.issue, i, 'follows', settings.hideCompleted));
        html += renderCard(currentIssue, 0, 'current', settings.hideCompleted);
        nextRels.forEach((r, i) => html += renderCard(r.issue, i + 1, 'precedes', settings.hideCompleted));

        const otherRels = currentIssue.relations.filter(r => !['precedes'].includes(r.relation_type));
        if (otherRels.length > 0) {
            html += '<div class="other-relations">';
            for (const r of otherRels) {
                const relIssue = await fetchIssue(r.issue_to_id || r.issue_id);
                html += renderCard(relIssue, 1, r.relation_type, settings.hideCompleted);
            }
            html += '</div>';
        }

        content.innerHTML = html || '<div class="no-relations">İlişki bulunamadı.</div>';
        document.body.appendChild(container);
        return container;
    }

    const settings = getSettings();
    const issueId = getIssueId();
    if (issueId) buildRelationMap(issueId, settings);
})();
