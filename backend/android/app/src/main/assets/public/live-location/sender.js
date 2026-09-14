if (!localStorage.getItem('busTravelToken')) {
	window.location.href = '../login/index.html';
} else {
	let active = false;
	let watcher = null;
	const busId = new URLSearchParams(window.location.search).get('busId') || '1';
	const apiBase = window.BUSTRAVEL_API || '';
	const message = document.querySelector('#message');
	const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('busTravelToken')}` });
	const updateState = () => {
		document.querySelector('#stateText').textContent = active ? 'ON' : 'OFF';
		document.querySelector('#stateDot').style.color = active ? '#0d6b68' : '#ff8a5b';
		document.querySelector('#toggleButton').textContent = active ? 'Turn OFF' : 'Turn ON';
	};

	fetch(`${apiBase}/api/buses/${busId}`).then((response) => response.json()).then((result) => {
		if (result.bus) {
			document.querySelector('#busName').textContent = result.bus.name;
			document.querySelector('#busRoute').textContent = `${result.bus.starting_point} → ${result.bus.destination}`;
		}
	});

	document.querySelector('#toggleButton').addEventListener('click', async () => {
		if (active) {
			navigator.geolocation.clearWatch(watcher);
			watcher = null;
			await fetch(`${apiBase}/api/buses/${busId}/location`, { method: 'POST', headers: headers(), body: JSON.stringify({ enabled: false }) });
			active = false;
			updateState();
			return;
		}
		if (!navigator.geolocation) {
			message.textContent = 'This browser does not support GPS location.';
			return;
		}
		message.textContent = 'Requesting bus location permission...';
		watcher = navigator.geolocation.watchPosition(async (position) => {
			const { latitude, longitude } = position.coords;
			const response = await fetch(`${apiBase}/api/buses/${busId}/location`, { method: 'POST', headers: headers(), body: JSON.stringify({ latitude, longitude, enabled: true }) });
			if (!response.ok) {
				message.textContent = 'Could not update bus location.';
				return;
			}
			active = true;
			message.textContent = `Last location sent: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
			updateState();
		}, () => {
			message.textContent = 'Location permission was denied.';
			active = false;
			updateState();
		}, { enableHighAccuracy: true, maximumAge: 10000 });
	});
}
