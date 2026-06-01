// Minimal Wayfare shared helpers used by pages (budget, planner, etc.)
(function () {
	const Wayfare = {
		keys: {
			EXPENSES: 'wayfare:expenses',
			STOPS: 'wayfare:stops',
			SESSIONS: 'wayfare:sessions'
		},

		// Simple in-browser session for demo. Stores current user email in sessionStorage.
		getSession() {
			try { return JSON.parse(sessionStorage.getItem('wayfare:session')) || null; }
			catch (_) { return null; }
		},
		setSession(obj) {
			try { sessionStorage.setItem('wayfare:session', JSON.stringify(obj)); }
			catch (_) { /* ignore */ }
		},

		// Very small currency formatter helper
		formatCurrency(amount, code = 'USD') {
			try {
				return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(amount);
			} catch (_) {
				return (code === 'USD' ? '$' : '') + Number(amount).toFixed(2);
			}
		}
	};

	// expose globally
	window.Wayfare = Wayfare;
})();
