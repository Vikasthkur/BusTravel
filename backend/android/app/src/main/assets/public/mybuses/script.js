if (!localStorage.getItem('busTravelToken')) {
	window.location.href = '../login/index.html';
} else {
	fetch(`${window.BUSTRAVEL_API || 'http://localhost:3000'}/api/my/buses`, { headers: { Authorization: `Bearer ${localStorage.getItem('busTravelToken')}` } }).then(async (response) => {
		if (response.status === 401) return window.location.href = '../login/index.html';
		const result = await response.json();
		const list = document.querySelector('#busList') || document.querySelector('main');
		const existingCard = list.querySelector('article');
		if (existingCard) existingCard.remove();
		result.buses.forEach((bus) => { const card = document.createElement('article'); card.innerHTML = `<h2>■ ${bus.name}</h2><p>${bus.plate_number}</p><p>${bus.starting_point} → ${bus.destination}</p><strong class="active">● ${bus.live_enabled ? 'Location Active' : 'Location Off'}</strong><a class="manage" href="../bus/index.html?id=${bus.id}">Manage</a>`; list.insertBefore(card, document.querySelector('.add')); });
	});
}