const apiBase = window.BUSTRAVEL_API || '';
const busId = new URLSearchParams(window.location.search).get('busId');
const message = document.querySelector('#message');
const map = L.map('map').setView([20, 0], 5);
let marker = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

async function refreshBusLocation() {
	if (!busId) {
		message.textContent = 'No bus was selected.';
		return;
	}

	try {
		const response = await fetch(`${apiBase}/api/buses/${encodeURIComponent(busId)}`, { cache: 'no-store' });
		const result = await response.json();
		if (!response.ok) throw new Error(result.error || 'Bus not found.');

		const bus = result.bus;
		document.querySelector('#busName').textContent = bus.name;
		document.querySelector('#route').textContent = `${bus.starting_point} → ${bus.destination}`;

		if (!bus.live_enabled || !bus.liveLocation) {
			document.querySelector('#liveState').textContent = '● Live location is currently OFF';
			document.querySelector('#liveState').style.color = '#ff8a5b';
			return;
		}

		const point = [bus.liveLocation.latitude, bus.liveLocation.longitude];
		if (!marker) {
			marker = L.marker(point).addTo(map);
			map.setView(point, 16);
		} else {
			marker.setLatLng(point);
		}
		marker.bindPopup(`Updated ${new Date(`${bus.liveLocation.recordedAt}Z`).toLocaleTimeString()}`);
		document.querySelector('#liveState').textContent = '● Live location available';
		document.querySelector('#liveState').style.color = '#0d6b68';
		message.textContent = `Last update: ${new Date(`${bus.liveLocation.recordedAt}Z`).toLocaleTimeString()}`;
	} catch (error) {
		message.textContent = error.message;
	}
}

refreshBusLocation();
window.setInterval(refreshBusLocation, 5000);
