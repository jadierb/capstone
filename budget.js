(function () {
  const KEY = window.Wayfare.keys.EXPENSES;
  const form = document.getElementById('expenseForm');
  const tbody = document.getElementById('expenseBody');
  const feedback = document.getElementById('expenseFeedback');
  const statCount = document.getElementById('statCount');
  const statTotal = document.getElementById('statTotal');
  const statAvg = document.getElementById('statAvg');
  const statTop = document.getElementById('statTop');
  const clearBtn = document.getElementById('clearAll');

  function ownerId() {
    const s = window.Wayfare.getSession();
    return s ? s.email : 'guest';
  }
  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (_) { return {}; }
  }
  function getMine() { return getAll()[ownerId()] || []; }
  function setMine(arr) {
    const all = getAll();
    all[ownerId()] = arr;
    localStorage.setItem(KEY, JSON.stringify(all));
  }

  // Conservative USD conversion rates for the demo (no live FX API)
  const RATES = { USD: 1, EUR: 1.08, GBP: 1.27, JPY: 0.0067, MXN: 0.057, AUD: 0.65 };

  function toUsd(amount, code) {
    const r = RATES[code] || 1;
    return amount * r;
  }

  function render() {
    const items = getMine();
    tbody.innerHTML = '';
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nothing logged yet.</td></tr>';
    } else {
      // Loop / iterator
      items.forEach((it, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${it.label}</td>
          <td>${it.category}</td>
          <td>${window.Wayfare.formatCurrency(it.amount, it.currency)}</td>
          <td>${new Date(it.when).toLocaleDateString()}</td>
          <td><button class="btn btn-danger" data-idx="${idx}" data-testid="expense-remove-${idx}">Remove</button></td>`;
        tbody.appendChild(tr);
      });
      tbody.querySelectorAll('button[data-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const i = Number(btn.getAttribute('data-idx'));
          setMine(getMine().filter((_, k) => k !== i));
          render();
        });
      });
    }

    // Stats with reduce
    const totalUsd = items.reduce((acc, x) => acc + toUsd(x.amount, x.currency), 0);
    statCount.textContent = items.length;
    statTotal.textContent = window.Wayfare.formatCurrency(totalUsd, 'USD');
    statAvg.textContent = items.length ? window.Wayfare.formatCurrency(totalUsd / items.length, 'USD') : '$0.00';

    // Top category
    if (!items.length) { statTop.textContent = '—'; return; }
    const byCat = {};
    for (let i = 0; i < items.length; i++) {
      const c = items[i].category;
      byCat[c] = (byCat[c] || 0) + toUsd(items[i].amount, items[i].currency);
    }
    let top = '—', topVal = -Infinity;
    Object.keys(byCat).forEach((c) => { if (byCat[c] > topVal) { top = c; topVal = byCat[c]; } });
    statTop.textContent = top.charAt(0).toUpperCase() + top.slice(1);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const label = document.getElementById('eLabel').value.trim();
    const amount = parseFloat(document.getElementById('eAmount').value);
    const currency = document.getElementById('eCurrency').value;
    const category = document.getElementById('eCategory').value;
    if (!label || isNaN(amount) || amount < 0) {
      feedback.className = 'form-feedback error';
      feedback.textContent = 'Add a label and a non-negative amount.';
      return;
    }
    const next = getMine();
    next.push({ label, amount, currency, category, when: new Date().toISOString() });
    setMine(next);
    feedback.className = 'form-feedback success';
    feedback.textContent = `Logged ${window.Wayfare.formatCurrency(amount, currency)} for ${label}.`;
    form.reset();
    render();
  });

  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear all expenses for this account?')) return;
    setMine([]);
    render();
  });

  render();
})();