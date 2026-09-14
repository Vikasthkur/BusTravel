const apiBase = window.BUSTRAVEL_API || 'http://localhost:3000';
const message = document.querySelector('#message');
const result = document.querySelector('#result');
const map = L.map('map').setView([23, 78], 5);
let marker;
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

async function searchTrain(query) {
  const response = await fetch(`${apiBase}/api/trains/search?query=${encodeURIComponent(query)}`);
  const data = await response.json();
  if (!data.trains.length) throw new Error('No demo train found.');
  const train = data.trains[0];
  document.querySelector('#trainName').textContent = `${train.number} · ${train.name}`;
  document.querySelector('#trainRoute').textContent = `${train.from} → ${train.to}`;
  document.querySelector('#trainStatus').textContent = train.status;
  document.querySelector('#trainEta').textContent = train.eta;
  document.querySelector('#stops').innerHTML = train.stops.map((stop) => `<li>${stop}</li>`).join('');
  const point = [train.location.latitude, train.location.longitude];
  if (marker) marker.setLatLng(point); else marker = L.marker(point).addTo(map);
  map.setView(point, 7);
  result.hidden = false;
  message.textContent = 'Demo data shown. Real tracking needs a railway data provider.';
}

document.querySelector('#searchForm').addEventListener('submit', (event) => {
  event.preventDefault();
  searchTrain(document.querySelector('#query').value).catch((error) => { message.textContent = error.message; });
});
document.querySelector('#pnrButton').addEventListener('click', async () => {
  const pnr = window.prompt('Enter 10-digit PNR (demo):');
  if (!pnr) return;
  const data = await (await fetch(`${apiBase}/api/pnr/${encodeURIComponent(pnr)}`)).json();
  message.textContent = `${data.status}: ${data.train}. ${data.message}`;
});
document.querySelector('#bookingButton').addEventListener('click', async () => {
  const data = await (await fetch(`${apiBase}/api/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trainNumber: '12951', from: 'Mumbai Central', to: 'New Delhi' }) })).json();
  message.textContent = `${data.bookingId}: ${data.message}`;
});
