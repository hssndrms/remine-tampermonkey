// ==UserScript==
// @name         PYS Time Report Pie Chart
// @namespace    https://pys.koton.com.tr
// @version      2025-07-09
// @description  Redmine time report pie chart (Activity vs Total Time)
// @author       hssndrms
// @match        https://pys.koton.com.tr/time_entries/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.redmine.org/
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/chart.js
// @require      https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels
// @downloadURL  https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/time-report-piechart.user.js
// @updateURL    https://raw.githubusercontent.com/hssndrms/remine-tampermonkey/master/scripts/time-report-piechart.user.js
// ==/UserScript==
(function() {
    'use strict';

    // Dinamik renk paleti generator
    function generateColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * 360 / count) % 360;
            colors.push(`hsl(${hue}, 70%, 50%)`);
        }
        return colors;
    }

    function parseTime(hoursCell) {
        const intSpan = hoursCell.querySelector('.hours-int');
        const decSpan = hoursCell.querySelector('.hours-dec');
        const hours = intSpan ? parseInt(intSpan.textContent) : 0;
        const minutes = decSpan ? parseInt(decSpan.textContent.replace(':', '')) : 0;
        return hours + (minutes / 60);
    }

    const table = document.querySelector('#time-report');
    if (!table) return;

    // Dinamik olarak "Total time" sütununun indeksini bul
    const headerCells = table.querySelectorAll('thead th');
    let totalColIndex = -1;
    headerCells.forEach((th, index) => {
        if (th.textContent.trim() === 'Total time') {
            totalColIndex = index;
        }
    });

    if (totalColIndex === -1) return;

    const rows = table.querySelectorAll('tbody tr.last-level');
    const activities = [];
    const times = [];

    rows.forEach(row => {
        const activity = row.querySelector('td.name').textContent.trim();
        const totalTimeCell = row.querySelectorAll('td.hours')[totalColIndex - 1];
        const time = parseTime(totalTimeCell);
        if (time > 0) {
            activities.push(activity);
            times.push(time);
        }
    });

    // Grafik için div ekle
    const chartDiv = document.createElement('div');
    chartDiv.style.width = '400px';
    chartDiv.style.height = '400px';
    chartDiv.style.marginTop = '10px';
    chartDiv.className = 'pie-chart-time';

    const canvas = document.createElement('canvas');
    chartDiv.appendChild(canvas);

    table.parentNode.insertBefore(chartDiv, table.nextSibling);

    // Dinamik renkler oluştur
    const dynamicColors = generateColors(activities.length);

    // Pie chart çiz (geliştirilmiş versiyonu)
    const chart = new Chart(canvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: activities,
            datasets: [{
                data: times,
                backgroundColor: dynamicColors,
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20
                }
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 12
                        }
                    }
                },
                datalabels: {
                    color: '#ffffff',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 4,
                    padding: 4,
                    anchor: 'end',
                    align: 'end',
                    offset: 10,
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((sum, val) => sum + val, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${value.toFixed(2)}h\n(${percentage}%)`;
                    },
                    font: {
                        size: 10,
                        weight: 'bold'
                    },
                    // Çizgi ile bağlantı
                    clip: false,
                    display: function(context) {
                        return context.dataset.data[context.dataIndex] > 0;
                    },
                    // Datalabel konumlarını optimize et
                    listener: {
                        enter: function(context) {
                            context.style.backgroundColor = 'rgba(0,0,0,0.9)';
                        },
                        leave: function(context) {
                            context.style.backgroundColor = 'rgba(0,0,0,0.7)';
                        }
                    }
                }
            },
            // Chart'ı canvas'ın üst kısmına yaklaştır
            maintainAspectRatio: false,
            elements: {
                arc: {
                    borderAlign: 'inner'
                }
            }
        },
        plugins: [ChartDataLabels]
    });
})();