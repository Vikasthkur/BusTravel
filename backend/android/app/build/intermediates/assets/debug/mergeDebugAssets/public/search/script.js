const query = new URLSearchParams(window.location.search);
document.querySelector('#from').value = query.get('from') || '';
document.querySelector('#to').value = query.get('to') || '';

document.querySelector('#searchForm').addEventListener('submit', async (event) => {
	event.preventDefault();
	const fields = event.currentTarget.querySelectorAll('input');
	const response = await fetch(`${window.BUSTRAVEL_API || 'http://localhost:3000'}/api/buses?from=${encodeURIComponent(fields[0].value)}&to=${encodeURIComponent(fields[1].value)}`);
	const result = await response.json();
	const list = document.querySelector('#busList') || document.createElement('div');
	list.id = 'busList';
	if (!list.parentElement) event.currentTarget.after(list);
	list.innerHTML = '';
	document.querySelector('#message').textContent = result.buses.length ? `${result.buses.length} bus(es) found.` : 'No buses found for this route.';
	result.buses.forEach((bus) => { const card = document.createElement('article'); card.className = 'bus-card'; card.innerHTML = `<h2>■ ${bus.name}</h2><p>${bus.plate_number}</p><p>${bus.starting_point} → ${bus.destination}</p><p>${bus.live_enabled && bus.liveLocation ? '● Live location available' : '● Location off'}</p><a href="../bus/index.html?id=${bus.id}">View Bus</a>`; list.append(card); });
});