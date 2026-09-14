let cameraStream;
const video = document.querySelector('#cameraPreview');
const message = document.querySelector('#message');

function openBusFromCode(value) {
	const match = String(value).match(/(?:bus|bustravel)[/:#-]*(\d+)/i);
	if (match) window.location.href = `../bus/index.html?id=${match[1]}`;
	else message.textContent = 'QR found, but it does not contain a BusTravel bus ID.';
}

async function scanImage(source) {
	if (!('BarcodeDetector' in window)) return message.textContent = 'QR scanning is not supported in this browser. Use a supported mobile browser.';
	const detector = new BarcodeDetector({ formats: ['qr_code'] });
	const codes = await detector.detect(source);
	if (codes[0]?.rawValue) openBusFromCode(codes[0].rawValue);
	else message.textContent = 'No QR code found in this image.';
}

document.querySelector('#cameraButton').addEventListener('click', async () => {
	if (!navigator.mediaDevices?.getUserMedia) return message.textContent = 'Camera access requires HTTPS or localhost.';
	try {
		cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
		video.srcObject = cameraStream;
		video.hidden = false;
		document.querySelector('#scannerIcon').hidden = true;
		document.querySelector('#scannerText').textContent = 'Point the camera at a BusTravel QR code.';
		video.addEventListener('play', async () => { try { await scanImage(video); } catch (_error) { message.textContent = 'Point the camera at a clear QR code.'; } }, { once: true });
	} catch (_error) { message.textContent = 'Camera permission was denied.'; }
});

document.querySelector('#galleryInput').addEventListener('change', async (event) => {
	const image = event.target.files[0];
	if (image) try { await scanImage(image); } catch (_error) { message.textContent = 'Could not scan this image.'; }
});