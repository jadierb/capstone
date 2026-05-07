// Simple client-side behavior for forms
document.addEventListener('DOMContentLoaded', function () {
	// Booking form handler
	const bookingForm = document.getElementById('booking-form');
	if (bookingForm) {
		bookingForm.addEventListener('submit', function (e) {
			e.preventDefault();
			const name = document.getElementById('traveler-name')?.value || 'Traveler';
			const dest = document.getElementById('destination-choice')?.value || 'destination';
			const date = document.getElementById('travel-date')?.value || 'TBD';
			const pkg = document.getElementById('package-type')?.value || 'standard';
			const result = document.getElementById('booking-result');
			if (result) {
				result.textContent = `${name}, your ${pkg} package to ${dest} on ${date} has been requested. We'll email a quote soon.`;
			}
			bookingForm.reset();
		});
	}

	// Newsletter form handler (used on about.html)
	const newsletterForm = document.getElementById('newsletter-form');
	if (newsletterForm) {
		newsletterForm.addEventListener('submit', function (e) {
			e.preventDefault();
			const email = document.getElementById('newsletter-email')?.value || '';
			const preference = document.getElementById('travel-preference')?.value || '';
			const result = document.getElementById('newsletter-result');
			if (result) {
				result.textContent = `Thanks! ${email} subscribed for ${preference} updates.`;
			}
			newsletterForm.reset();
		});
	}
});
