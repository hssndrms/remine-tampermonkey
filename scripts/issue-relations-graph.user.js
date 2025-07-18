// ==UserScript==
// @name         Redmine Issue Relations Graph
// @namespace    https://pys.koton.com.tr
// @version      0.1
// @description  Redmine issue ilişkilerini görsel olarak gösterir
// @author       GitHub Copilot
// @match        https://pys.koton.com.tr/issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://pys.koton.com.tr
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/issue-relations-graph.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/issue-relations-graph.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // D3.js yükle
    function loadD3(callback) {
        if (window.d3) return callback();
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    // CSS yükle
    function loadCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/issue-relations-graph.css';
        document.head.appendChild(link);
    }

    // relations.json'dan ilişkileri al
    function fetchRelations(callback) {
        // Redmine'da relations.json endpointi genellikle /issues/<id>/relations.json şeklindedir
        const issueIdMatch = window.location.pathname.match(/issues\/(\d+)/);
        if (!issueIdMatch) return;
        const issueId = issueIdMatch[1];
        fetch(`/issues/${issueId}/relations.json`).then(r => r.json()).then(data => {
            callback(issueId, data.relations || []);
        });
    }

    // Buton ve modal ekle
    function addButton() {
        const relationsBox = document.querySelector('#relations');
        if (!relationsBox) return;
        const btn = document.createElement('button');
        btn.textContent = 'İlişki Haritası';
        btn.className = 'relations-graph-btn';
        btn.style.margin = '8px 0';
        relationsBox.appendChild(btn);

        const modal = document.createElement('div');
        modal.className = 'relations-graph-modal';
        modal.style.display = 'none';
        modal.innerHTML = '<div class="relations-graph-modal-content"><span class="relations-graph-close">&times;</span><div id="relations-graph"></div></div>';
        relationsBox.appendChild(modal);

        btn.onclick = function() {
            modal.style.display = 'block';
            loadD3(() => {
                fetchRelations(drawGraph);
            });
        };
        modal.querySelector('.relations-graph-close').onclick = function() {
            modal.style.display = 'none';
        };
    }

    // Grafik çizimi
    function drawGraph(issueId, relations) {
        const container = document.getElementById('relations-graph');
        container.innerHTML = '';
        // Düğüm ve kenar verisi oluştur
        const nodes = [{id: issueId, label: `#${issueId}`, main: true}];
        const edges = [];
        const relationTypes = {
            'relates': {color: '#888', arrow: 'none', label: 'Relates'},
            'blocks': {color: '#e74c3c', arrow: 'end', label: 'Blocks'},
            'blocked': {color: '#e67e22', arrow: 'start', label: 'Blocked by'},
            'duplicates': {color: '#3498db', arrow: 'end', label: 'Duplicates'},
            'duplicated': {color: '#2980b9', arrow: 'start', label: 'Duplicated by'},
            'precedes': {color: '#16a085', arrow: 'end', label: 'Precedes'},
            'follows': {color: '#27ae60', arrow: 'start', label: 'Follows'}
        };
        relations.forEach(rel => {
            nodes.push({id: rel.issue_id.toString(), label: `#${rel.issue_id}`});
            let type = relationTypes[rel.relation_type] || {color:'#aaa', arrow:'none', label:rel.relation_type};
            edges.push({source: rel.issue_id.toString(), target: issueId, type});
        });
        // D3.js ile çiz
        const width = 500, height = 350;
        const svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height);
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(edges).id(d => d.id).distance(120))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width/2, height/2));
        // Kenarlar
        svg.append('g').selectAll('line')
            .data(edges)
            .enter().append('line')
            .attr('stroke', d => d.type.color)
            .attr('stroke-width', 2);
        // Düğümler
        const node = svg.append('g').selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('r', d => d.main ? 18 : 14)
            .attr('fill', d => d.main ? '#2ecc40' : '#3498db')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));
        // Etiketler
        svg.append('g').selectAll('text')
            .data(nodes)
            .enter().append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 5)
            .attr('font-size', '14px')
            .attr('fill', '#222')
            .text(d => d.label)
            .style('cursor','pointer')
            .on('click', d => {
                window.open(`/issues/${d.id}`, '_blank');
            });
        simulation.on('tick', () => {
            svg.selectAll('line')
                .attr('x1', d => nodes.find(n=>n.id===d.source).x)
                .attr('y1', d => nodes.find(n=>n.id===d.source).y)
                .attr('x2', d => nodes.find(n=>n.id===d.target).x)
                .attr('y2', d => nodes.find(n=>n.id===d.target).y);
            svg.selectAll('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
            svg.selectAll('text')
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    loadCSS();
    addButton();
})();
