if (!localStorage.getItem('busTravelToken')) {
	window.location.href = '../login/index.html';
} else {
	let active = false;
	let watcher;
	const busId = new URLSearchParams(window.location.search).get('busId') || '1';
	const message = document.querySelector('#message');
	const updateState = () => { document.querySelector('#stateText').textContent = active ? 'ON' : 'OFF'; document.querySelector('#stateDot').style.color = active ? '#0d6b68' : '#ff8a5b'; document.querySelector('#toggleButton').textContent = active ? 'Turn OFF' : 'Turn ON'; };
	document.querySelector('#toggleButton').addEventListener('click', () => {
		if (active) { navigator.geolocation.clearWatch(watcher); active = false; fetch(`${window.BUSTRAVEL_API || 'http://localhost:3000'}/api/buses/${busId}/location`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('busTravelToken')}` }, body: JSON.stringify({ enabled: false }) }); updateState(); return; }
		if (!navigator.geolocation) return message.textContent = 'This browser does not support GPS location.';
		message.textContent = 'Requesting bus location permission...';
		watcher = navigator.geolocation.watchPosition(async (position) => {
			const { latitude, longitude } = position.coords;
			const response = await fetch(`${window.BUSTRAVEL_API || 'http://localhost:3000'}/api/buses/${busId}/location`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('busTravelToken')}` }, body: JSON.stringify({ latitude, longitude, enabled: true }) });
			if (!response.ok) return message.textContent = 'Could not update bus location.';
			active = true; message.textContent = `Last location sent: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`; updateState();
		}, () => { message.textContent = 'Location permission was denied.'; }, { enableHighAccuracy: true, maximumAge: 10000 });
	});
}