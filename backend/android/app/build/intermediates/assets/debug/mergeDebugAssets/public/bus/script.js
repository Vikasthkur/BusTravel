const busId = new URLSearchParams(window.location.search).get('id');
const apiBase = window.BUSTRAVEL_API || 'http://localhost:3000';
const message = document.querySelector('#message');

if (!busId) {
	message.textContent = 'No bus was selected.';
} else {
	fetch(`${apiBase}/api/buses/${encodeURIComponent(busId)}`).then(async (response) => {
		const result = await response.json();
		if (!response.ok) return message.textContent = result.error || 'Bus not found.';
		const bus = result.bus;
		document.querySelector('#busName').textContent = bus.name;
		document.querySelector('#busNumber').textContent = bus.plate_number;
		document.querySelector('#busType').textContent = bus.bus_type;
		document.querySelector('#route').textContent = `${bus.starting_point} → ${bus.destination}`;
		document.querySelector('#stops').innerHTML = bus.stops.map((stop) => `<li>${stop}</li>`).join('');
		document.querySelector('#liveState').textContent = bus.live_enabled && bus.liveLocation ? '● Live location available' : '● Live location is OFF';
		document.querySelector('#liveState').style.color = bus.live_enabled && bus.liveLocation ? '#0d6b68' : '#ff8a5b';
		document.querySelector('#liveButton').href = `../live-location/index.html?busId=${bus.id}`;
	}).catch(() => { message.textContent = 'Cannot connect to server.'; });
}