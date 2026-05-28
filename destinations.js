(function () {
  const grid = document.getElementById('countryGrid');
  const status = document.getElementById('countryStatus');
  const regionSelect = document.getElementById('regionSelect');
  const searchInput = document.getElementById('searchInput');
  let cache = [];

  async function loadRegion(region) {
    status.textContent = 'Loading countries…';
    grid.innerHTML = '';
    try {
      const url = `https://restcountries.com/v3.1/region/${encodeURIComponent(region)}?fields=name,capital,region,subregion,population,languages,currencies,flags,cca2`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      cache = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
      render(cache);
      status.textContent = `Showing ${cache.length} countries in ${region}.`;
    } catch (e) {
      status.textContent = 'Could not load countries right now. Please retry in a moment.';
    }
  }

  function render(list) {
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = '<p class="empty-state" style="grid-column:1/-1;">No matches.</p>';
      return;
    }
    // Loop / iterator requirement
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      const card = document.createElement('article');
      card.className = 'country-card';
      const languages = c.languages ? Object.values(c.languages).join(', ') : '—';
      const currencyKey = c.currencies ? Object.keys(c.currencies)[0] : null;
      const currency = currencyKey ? `${c.currencies[currencyKey].name} (${currencyKey})` : '—';
      card.innerHTML = `
        <img class="country-flag" src="${c.flags?.png || ''}" alt="${c.flags?.alt || c.name.common + ' flag'}" loading="lazy" />
        <div class="country-body">
          <h3>${c.name.common}</h3>
          <p><strong>Capital:</strong> ${(c.capital && c.capital[0]) || '—'}</p>
          <p><strong>Languages:</strong> ${languages}</p>
          <p><strong>Currency:</strong> ${currency}</p>
          <p><strong>Population:</strong> ${c.population.toLocaleString()}</p>
        </div>`;
      grid.appendChild(card);
    }
  }

  function applySearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { render(cache); return; }
    const filtered = cache.filter((c) => c.name.common.toLowerCase().includes(q));
    render(filtered);
  }

  regionSelect.addEventListener('change', () => loadRegion(regionSelect.value));
  searchInput.addEventListener('input', applySearch);

  loadRegion(regionSelect.value);
})();
