const params = new URLSearchParams(window.location.search);
const apiBase = window.BUSTRAVEL_API || 'http://localhost:3000';
const nearby = params.get('nearby') === 'true';
if (nearby) { document.querySelector('#title').textContent = 'Nearby buses'; document.querySelector('#description').textContent = 'Available buses from the current service area.'; }
fetch(`${apiBase}/api/buses`).then(async (response) => {
	const result = await response.json();
	const list = document.querySelector('#busList');
	if (!result.buses.length) return document.querySelector('#message').textContent = 'No buses are available yet.';
	result.buses.forEach((bus) => { const card = document.createElement('article'); card.className = 'bus-card'; card.innerHTML = `<h2>■ ${bus.name}</h2><p>${bus.plate_number}</p><p>${bus.starting_point} → ${bus.destination}</p><p>${bus.live_enabled ? '● Live location available' : '● Location off'}</p><a href="../bus/index.html?id=${bus.id}">View Bus</a>`; list.append(card); });
}).catch(() => { document.querySelector('#message').textContent = 'Cannot connect to server.'; });