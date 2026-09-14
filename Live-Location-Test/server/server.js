const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const frontendPath = path.join(__dirname, '..', 'frontend');

let latestLocation = null;

app.use(express.json({ limit: '10kb' }));
app.use(express.static(frontendPath));
app.use('/frontend', express.static(frontendPath));

app.get('/api/location', (_request, response) => {
  response.json({ location: latestLocation });
});

app.post('/api/location', (request, response) => {
  const { latitude, longitude } = request.body || {};

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return response.status(400).json({
      error: 'Latitude must be between -90 and 90 and longitude between -180 and 180.'
    });
  }

  latestLocation = {
    latitude,
    longitude,
    updatedAt: new Date().toISOString()
  };

  response.status(201).json({ location: latestLocation });
});

app.get('/', (_request, response) => {
  response.redirect('/frontend/viewer/viewer.html');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Live location test is running at http://localhost:${port}`);
});
