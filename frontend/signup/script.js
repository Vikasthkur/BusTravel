	const form = document.querySelector('#signupForm');
	const fields = form.querySelectorAll('input');
	const message = document.querySelector('#message');
	const passwordField = document.querySelector('#password');
	const confirmPasswordField = document.querySelector('#confirmPassword');

	function validatePasswords() {
		confirmPasswordField.setCustomValidity(passwordField.value === confirmPasswordField.value ? '' : 'Passwords must match.');
	}

	passwordField.addEventListener('input', validatePasswords);
	confirmPasswordField.addEventListener('input', validatePasswords);
	form.addEventListener('submit', async (event) => {
	event.preventDefault();
	validatePasswords();
	if (!form.checkValidity()) return form.reportValidity();
	const password = fields[3].value;
	const confirmPassword = fields[4].value;
	message.textContent = 'Creating your account...';
	try {
		const response = await fetch(`${window.BUSTRAVEL_API || ''}/api/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: fields[0].value.trim(), mobile: fields[1].value.trim(), email: fields[2].value.trim(), password, confirmPassword }) });
		const result = await response.json();
		if (!response.ok) return message.textContent = result.error || 'Could not create account.';
		localStorage.setItem('busTravelToken', result.token);
		localStorage.setItem('busTravelAccount', JSON.stringify({ name: result.user.name, contact: result.user.email || result.user.mobile }));
		window.location.href = '../profile/index.html';
	} catch (_error) {
		message.textContent = 'Cannot connect to server. Start the backend and try again.';
	}
});