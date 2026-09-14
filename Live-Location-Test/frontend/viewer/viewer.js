const map = L.map('map').setView([20, 0], 2);
const status = document.querySelector('#status');
let marker = null;
const busId = new URLSearchParams(window.location.search).get('busId') || '101';
const firebaseDatabase = window.getFirebaseLocationStore();

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function renderLocation(location) {
  if (!location) {
    status.textContent = `Waiting for Bus #${busId} to share a location...`;
    return;
  }

  const point = [location.latitude, location.longitude];
  if (!marker) {
    marker = L.marker(point).addTo(map);
    map.setView(point, 16);
  } else {
    marker.setLatLng(point);
  }
  marker.bindPopup(`Bus #${busId}<br>Updated ${new Date(location.updatedAt).toLocaleTimeString()}`);
  status.textContent = `Bus #${busId} · Latest point: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}

async function refreshLocalLocation() {
  try {
    const response = await fetch('/api/location', { cache: 'no-store' });
    if (!response.ok) throw new Error('The server returned an error.');

    renderLocation((await response.json()).location);
  } catch (error) {
    status.textContent = `Could not load location: ${error.message}`;
  }
}

if (firebaseDatabase) {
  firebaseDatabase.ref(`buses/${busId}/location`).on('value', (snapshot) => renderLocation(snapshot.val()));
} else {
  refreshLocalLocation();
  window.setInterval(refreshLocalLocation, 2_000);
}
