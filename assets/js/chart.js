(function(){
  // Chart.js is only used on the dashboard.
  if (!window.Chart) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Helpers ----------
  const moneyTick = (v)=>{
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    if (Math.abs(n) >= 1000) return `$${Math.round(n/1000)}K`;
    return `$${n}`;
  };

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  function buildSpendSeries(months){
    // Believable CAD values, BC + AB heavy.
    const base = [
      5200, 5600, 5900, 6100, 6400, 6700, 7200, 7600, 8000, 8600, 9100, 9800,
      10400, 11100, 12000, 13200, 14500, 15800, 15100, 14600, 14900, 15500, 16200, 17100,
      18400, 19200, 20500, 21400, 22600, 23200, 24100, 24800, 25600, 26300, 27100, 28379
    ];
    const arr = base.slice(0, months);
    return {
      labels: arr.map((_, i)=>`${i+1}m`),
      values: arr
    };
  }

  // ---------- Chart instances ----------
  let spendChart, categoryChart, approvalChart, savingsChart, forecastChart;

  function initSpend(){
    const el = document.getElementById('spendChart');
    if (!el) return;

    const ctx = el.getContext('2d');
    const months = 36;
    const series = buildSpendSeries(months);
    const budget = new Array(months).fill(40000);
    const target = new Array(months).fill(35000);

    spendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: series.labels,
        datasets: [
          {
            label: 'Spend',
            data: series.values,
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.28
          },
          {
            label: 'Budget cap',
            data: budget,
            borderWidth: 2,
            borderDash: [6, 6],
            pointRadius: 0,
            tension: 0,
          },
          {
            label: 'Target',
            data: target,
            borderWidth: 2,
            borderDash: [2, 6],
            pointRadius: 0,
            tension: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReduced ? false : {duration: 650, easing:'easeOutQuart'},
        plugins: {
          legend: {display: false},
          tooltip: {
            callbacks: {
              label: (ctx)=> `${ctx.dataset.label}: ${moneyTick(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            grid: {color: 'rgba(17,24,39,0.06)'},
            ticks: {maxTicksLimit: 6}
          },
          y: {
            beginAtZero: true,
            suggestedMax: 45000,
            grid: {color: 'rgba(17,24,39,0.06)'},
            ticks: {
              callback: (v)=> moneyTick(v)
            }
          }
        }
      }
    });

    // Range buttons
    document.querySelectorAll('.segmented .seg').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.segmented .seg').forEach(b=>b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const range = Number(btn.dataset.range || 36);
        const s = buildSpendSeries(range);
        spendChart.data.labels = s.labels;
        spendChart.data.datasets[0].data = s.values;
        spendChart.data.datasets[1].data = new Array(range).fill(40000);
        spendChart.data.datasets[2].data = new Array(range).fill(35000);
        spendChart.update();
      });
    });
  }

  function initCategory(){
    const el = document.getElementById('categoryChart');
    if (!el) return;
    const ctx = el.getContext('2d');
    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Automotive', 'Tools', 'Safety', 'Electrical', 'Fleet'],
        datasets: [{
          data: [62, 18, 10, 6, 4],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        animation: prefersReduced ? false : {duration: 650, easing:'easeOutQuart'},
        plugins: {
          legend: {position: 'bottom', labels: {boxWidth: 10, usePointStyle:true}},
          tooltip: {callbacks: {label: (c)=> `${c.label}: ${c.parsed}%`}}
        }
      }
    });
  }

  function initApprovals(){
    const el = document.getElementById('approvalChart');
    if (!el) return;
    const ctx = el.getContext('2d');

    approvalChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Requested', 'Policy check', 'Ops review', 'Finance', 'Approved'],
        datasets: [{
          label: 'Items',
          data: [12, 7, 5, 3, 9],
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReduced ? false : {duration: 650, easing:'easeOutQuart'},
        plugins: {legend: {display:false}},
        scales: {
          x: {grid: {display:false}},
          y: {beginAtZero:true, ticks:{stepSize: 2}, grid:{color: 'rgba(17,24,39,0.06)'}}
        }
      }
    });
  }

  function initSavings(){
    const el = document.getElementById('savingsChart');
    if (!el) return;
    const ctx = el.getContext('2d');

    savingsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Contract pricing', 'Supplier consolidation', 'Auto‑reorder', 'Fewer rush fees'],
        datasets: [{
          label: 'Annual savings (CAD)',
          data: [6200, 5400, 4200, 2620],
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReduced ? false : {duration: 650, easing:'easeOutQuart'},
        plugins: {
          legend: {display:false},
          tooltip: {callbacks: {label: (c)=> `${moneyTick(c.parsed.y)}`}}
        },
        scales: {
          x: {grid: {display:false}},
          y: {beginAtZero:true, grid:{color:'rgba(17,24,39,0.06)'}, ticks:{callback:(v)=> moneyTick(v)}}
        }
      }
    });
  }

  function initForecast(){
    const el = document.getElementById('forecastChart');
    if (!el) return;
    const ctx = el.getContext('2d');

    const labels = ['Today','+3d','+6d','+9d','+12d','+15d'];
    const inventory = [42, 36, 29, 21, 13, 8];
    const threshold = labels.map(()=> 12);

    forecastChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {label: 'Projected stock', data: inventory, borderWidth: 3, pointRadius: 0, tension: 0.3},
          {label: 'Reorder threshold', data: threshold, borderWidth: 2, borderDash: [6,6], pointRadius: 0, tension: 0}
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReduced ? false : {duration: 650, easing:'easeOutQuart'},
        plugins: {legend:{display:false}},
        scales: {
          x: {grid:{display:false}},
          y: {beginAtZero:true, suggestedMax: 50, grid:{color:'rgba(17,24,39,0.06)'}}
        }
      }
    });
  }

  // Set sane defaults (no hardcoded colors—use CSS var mapping via currentColor)
  // We intentionally keep defaults minimal. Colors will inherit from browser palette.
  Chart.defaults.font.family = 'Lato, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  Chart.defaults.color = '#111827';

  // ---------- Init (when tab panes are visible) ----------
  function initAll(){
    try{
      initSpend();
      initCategory();
      initApprovals();
      initSavings();
      initForecast();
    }catch(e){
      // Fail softly in a portfolio prototype.
      console.warn('Chart init failed', e);
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    initAll();

    // Reflow charts on tab switch
    document.querySelectorAll('[data-tabs] .tab').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        setTimeout(()=>{
          [spendChart, categoryChart, approvalChart, savingsChart, forecastChart].forEach(ch=>{ if (ch) ch.resize(); });
        }, 200);
      });
    });
  });
})();
