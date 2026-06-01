(function () {
	const KEY = window.Wayfare.keys.STOPS;
	const form = document.getElementById('stopForm');
	const tbody = document.getElementById('stopsBody');
	const feedback = document.getElementById('stopFeedback');
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

	function render() {
		const items = getMine();
		tbody.innerHTML = '';
		if (!items.length) {
			tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No stops yet. Add your first stop.</td></tr>';
			return;
		}

		items.forEach((it, idx) => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${it.date ? new Date(it.date).toLocaleDateString() : '—'}</td>
				<td>${escapeHtml(it.location)}</td>
				<td>${escapeHtml(it.notes || '')}</td>
				<td style="white-space:nowrap">
					<button class="btn btn-ghost" data-action="up" data-idx="${idx}">↑</button>
					<button class="btn btn-ghost" data-action="down" data-idx="${idx}">↓</button>
					<button class="btn btn-danger" data-action="remove" data-idx="${idx}">Remove</button>
				</td>`;
			tbody.appendChild(tr);
		});

		tbody.querySelectorAll('button[data-idx]').forEach((btn) => {
			btn.addEventListener('click', () => {
				const idx = Number(btn.getAttribute('data-idx'));
				const action = btn.getAttribute('data-action');
				const items = getMine();
				if (action === 'remove') {
					items.splice(idx, 1);
				} else if (action === 'up' && idx > 0) {
					const tmp = items[idx - 1]; items[idx - 1] = items[idx]; items[idx] = tmp;
				} else if (action === 'down' && idx < items.length - 1) {
					const tmp = items[idx + 1]; items[idx + 1] = items[idx]; items[idx] = tmp;
				}
				setMine(items);
				render();
			});
		});
	}

	function escapeHtml(s) {
		return String(s).replace(/[&<>"']/g, function (m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]; });
	}

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const location = document.getElementById('sLocation').value.trim();
		const date = document.getElementById('sDate').value || '';
		const notes = document.getElementById('sNotes').value.trim();
		if (!location) {
			feedback.className = 'form-feedback error';
			feedback.textContent = 'Please enter a location.';
			return;
		}
		const items = getMine();
		items.push({ location, date, notes, when: new Date().toISOString() });
		setMine(items);
		feedback.className = 'form-feedback success';
		feedback.textContent = `Added ${location}.`;
		form.reset();
		render();
	});

	clearBtn.addEventListener('click', () => {
		if (!confirm('Clear all stops for this account?')) return;
		setMine([]);
		render();
	});

	// initial render
	render();
})();
