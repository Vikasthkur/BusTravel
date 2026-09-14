if (!localStorage.getItem('busTravelToken')) {
	window.location.href = '../login/index.html';
} else {
	const stops = document.querySelector('#stops');
	let stopNumber = 2;
	document.querySelector('#addStop').addEventListener('click', () => {
		stopNumber += 1;
		const label = document.createElement('label');
		label.innerHTML = `Stop ${stopNumber}<input required name="stop" placeholder="Enter stop">`;
		stops.append(label);
	});

	document.querySelector('#addBusForm').addEventListener('submit', (event) => {
	    event.preventDefault();
	    const form = new FormData(event.currentTarget);
	    fetch(`${window.BUSTRAVEL_API || 'http://localhost:3000'}/api/buses`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('busTravelToken')}` }, body: JSON.stringify({ name: form.get('name'), plateNumber: form.get('number'), busType: form.get('type'), startingPoint: form.get('start'), destination: form.get('destination'), stops: form.getAll('stop') }) }).then(async (response) => {
	      const result = await response.json();
	      if (!response.ok) return document.querySelector('#message').textContent = result.error;
	      document.querySelector('#message').textContent = 'Bus added successfully. Opening My Buses...';
	      setTimeout(() => { window.location.href = '../mybuses/index.html'; }, 500);
	    });
	});
}