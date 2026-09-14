const button = document.querySelector('#toggleButton');
const status = document.querySelector('#status');
let watchId = null;
const busId = new URLSearchParams(window.location.search).get('busId') || '101';
const firebaseDatabase = window.getFirebaseLocationStore();
const firebaseLocation = firebaseDatabase ? firebaseDatabase.ref(`buses/${busId}/location`) : null;

function setSharingState(isSharing) {
  button.textContent = isSharing ? 'Stop sharing' : 'Start sharing';
  button.dataset.sharing = String(isSharing);
}

async function sendLocation(position) {
  const { latitude, longitude } = position.coords;

  try {
    const location = {
      latitude,
      longitude,
      updatedAt: new Date().toISOString()
    };

    if (firebaseLocation) {
      await firebaseLocation.set(location);
    } else {
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude })
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'The server rejected this location.');
      }
    }

    status.textContent = `Bus #${busId} · Last sent: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  } catch (error) {
    status.textContent = `Could not send location: ${error.message}`;
  }
}

function handleLocationError(error) {
  status.textContent = error.code === error.PERMISSION_DENIED
    ? 'Location permission was denied.'
    : `Could not read location: ${error.message}`;
  navigator.geolocation.clearWatch(watchId);
  watchId = null;
  setSharingState(false);
}

button.addEventListener('click', () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    setSharingState(false);
    status.textContent = 'Sharing is off.';
    return;
  }

  if (!('geolocation' in navigator)) {
    status.textContent = 'This browser does not support GPS location.';
    return;
  }

  status.textContent = 'Requesting location permission...';
  watchId = navigator.geolocation.watchPosition(sendLocation, handleLocationError, {
    enableHighAccuracy: true,
    maximumAge: 10_000,
    timeout: 15_000
  });
  setSharingState(true);
});
