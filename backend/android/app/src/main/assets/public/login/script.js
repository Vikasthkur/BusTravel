document.querySelector('#loginForm').addEventListener('submit', async (event) => {
	event.preventDefault();
	const contact = event.currentTarget.querySelector('input[type="text"]').value.trim();
	const password = event.currentTarget.querySelector('input[type="password"]').value;
	const message = document.querySelector('#message');
	message.textContent = 'Signing in...';
	try {
		const response = await fetch(`${window.BUSTRAVEL_API || ''}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: contact, password }) });
		const result = await response.json();
		if (!response.ok) return message.textContent = result.error || 'Invalid login details.';
		localStorage.setItem('busTravelToken', result.token);
		localStorage.setItem('busTravelAccount', JSON.stringify({ name: result.user.name, contact: result.user.email || result.user.mobile }));
		window.location.href = '../profile/index.html';
	} catch (_error) {
		message.textContent = 'Cannot connect to server. Start the backend and try again.';
	}
});