const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('./db');

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET || 'bustravel-local-development-secret';
const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(express.json());
app.use((request, response, next) => {
  const origin = request.headers.origin;
  if (origin === 'http://127.0.0.1:5500' || origin === 'http://localhost:5500') {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (request.method === 'OPTIONS') return response.sendStatus(204);
  next();
});
app.use(express.static(frontendPath));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'BusTravel', database: 'sqlite' });
});

const demoTrains = [
  {
    number: '12951',
    name: 'Mumbai Rajdhani',
    from: 'Mumbai Central',
    to: 'New Delhi',
    status: 'Running 12 minutes late',
    eta: 'Arrives at New Delhi 08:40',
    location: { latitude: 23.2599, longitude: 77.4126 },
    stops: ['Mumbai Central', 'Surat', 'Ratlam', 'Kota', 'New Delhi']
  },
  {
    number: '12002',
    name: 'Bhopal Shatabdi',
    from: 'New Delhi',
    to: 'Bhopal',
    status: 'On time',
    eta: 'Arrives at Bhopal 14:20',
    location: { latitude: 24.5854, longitude: 73.7125 },
    stops: ['New Delhi', 'Agra', 'Gwalior', 'Jhansi', 'Bhopal']
  }
];

app.get('/api/trains/search', (request, response) => {
  const query = String(request.query.query || '').trim().toLowerCase();
  const trains = demoTrains.filter((train) => !query || [train.number, train.name, train.from, train.to].some((value) => value.toLowerCase().includes(query)));
  response.json({ demo: true, trains });
});

app.get('/api/trains/:number', (request, response) => {
  const train = demoTrains.find((item) => item.number === request.params.number);
  if (!train) return response.status(404).json({ error: 'Train not found in demo data.' });
  response.json({ demo: true, train });
});

app.get('/api/pnr/:pnr', (request, response) => {
  response.json({ demo: true, pnr: request.params.pnr, status: 'CNF', train: '12951 Mumbai Rajdhani', message: 'Demo PNR result. Connect a railway API for real status.' });
});

app.post('/api/bookings', (request, response) => {
  const { trainNumber, from, to } = request.body || {};
  if (!trainNumber || !from || !to) return response.status(400).json({ error: 'Train, origin and destination are required.' });
  response.status(201).json({ demo: true, bookingId: `DEMO-${Date.now()}`, status: 'REQUESTED', message: 'Demo booking created. Connect a railway booking API for real reservations.' });
});

function createToken(user) {
  return jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '7d' });
}

function authenticate(request, response, next) {
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    request.user = jwt.verify(token, jwtSecret);
    next();
  } catch (_error) {
    response.status(401).json({ error: 'Authentication required.' });
  }
}

function publicUser(user) {
  return { id: user.id, name: user.full_name, mobile: user.mobile, email: user.email };
}

function getBus(id) {
  const bus = database.prepare('SELECT * FROM buses WHERE id = ?').get(id);
  if (!bus) return null;
  bus.stops = database.prepare('SELECT name FROM stops WHERE bus_id = ? ORDER BY stop_order').all(id).map((stop) => stop.name);
  bus.liveLocation = bus.live_enabled ? database.prepare('SELECT latitude, longitude, recorded_at AS recordedAt FROM live_locations WHERE bus_id = ? ORDER BY id DESC LIMIT 1').get(id) || null : null;
  return bus;
}

app.post('/api/auth/signup', async (request, response) => {
  const { fullName, mobile, email, password } = request.body;
  if (!fullName || !password || (!mobile && !email) || password.length < 8) {
    return response.status(400).json({ error: 'Full name, mobile or email, and an 8-character password are required.' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = database.prepare('INSERT INTO users (full_name, mobile, email, password_hash) VALUES (?, ?, ?, ?)').run(fullName.trim(), mobile?.trim() || null, email?.trim().toLowerCase() || null, passwordHash);
    const user = database.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    response.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    response.status(409).json({ error: error.code === 'SQLITE_CONSTRAINT_UNIQUE' ? 'Mobile or email already registered.' : 'Could not create account.' });
  }
});

app.post('/api/auth/login', async (request, response) => {
  const { identifier, password } = request.body;
  const user = database.prepare('SELECT * FROM users WHERE lower(email) = lower(?) OR mobile = ?').get(identifier?.trim(), identifier?.trim());
  if (!user || !(await bcrypt.compare(password || '', user.password_hash))) return response.status(401).json({ error: 'Invalid login details.' });
  response.json({ token: createToken(user), user: publicUser(user) });
});

app.get('/api/auth/me', authenticate, (request, response) => {
  const user = database.prepare('SELECT * FROM users WHERE id = ?').get(request.user.id);
  if (!user) return response.status(401).json({ error: 'Account not found.' });
  response.json({ user: publicUser(user) });
});

app.get('/api/buses', (request, response) => {
  const { from, to } = request.query;
  let buses;
  if (from && to) {
    buses = database.prepare('SELECT * FROM buses WHERE lower(starting_point) = lower(?) AND lower(destination) = lower(?) ORDER BY name').all(from, to);
  } else {
    buses = database.prepare('SELECT * FROM buses ORDER BY name').all();
  }
  response.json({ buses: buses.map((bus) => getBus(bus.id)) });
});

app.get('/api/buses/:id', (request, response) => {
  const bus = getBus(request.params.id);
  if (!bus) return response.status(404).json({ error: 'Bus not found.' });
  response.json({ bus });
});

app.get('/api/my/buses', authenticate, (request, response) => {
  const buses = database.prepare('SELECT id FROM buses WHERE owner_id = ? ORDER BY name').all(request.user.id).map((bus) => getBus(bus.id));
  response.json({ buses });
});

app.post('/api/buses', authenticate, (request, response) => {
  const { name, plateNumber, busType, startingPoint, destination, stops = [] } = request.body;
  if (!name || !plateNumber || !busType || !startingPoint || !destination || !Array.isArray(stops) || stops.length < 1) return response.status(400).json({ error: 'Bus, route, and at least one stop are required.' });
  const insertBus = database.transaction(() => {
    const result = database.prepare('INSERT INTO buses (owner_id, name, plate_number, bus_type, starting_point, destination) VALUES (?, ?, ?, ?, ?, ?)').run(request.user.id, name.trim(), plateNumber.trim(), busType, startingPoint.trim(), destination.trim());
    const insertStop = database.prepare('INSERT INTO stops (bus_id, stop_order, name) VALUES (?, ?, ?)');
    stops.filter((stop) => String(stop).trim()).forEach((stop, index) => insertStop.run(result.lastInsertRowid, index + 1, String(stop).trim()));
    return getBus(result.lastInsertRowid);
  });
  response.status(201).json({ bus: insertBus() });
});

app.put('/api/buses/:id', authenticate, (request, response) => {
  const { name, plateNumber, busType, startingPoint, destination, stops = [] } = request.body;
  const bus = database.prepare('SELECT id FROM buses WHERE id = ? AND owner_id = ?').get(request.params.id, request.user.id);
  if (!bus) return response.status(404).json({ error: 'Owned bus not found.' });
  if (!name || !plateNumber || !busType || !startingPoint || !destination || !Array.isArray(stops) || stops.length < 1) return response.status(400).json({ error: 'Bus, route, and at least one stop are required.' });
  const updateBus = database.transaction(() => {
    database.prepare('UPDATE buses SET name = ?, plate_number = ?, bus_type = ?, starting_point = ?, destination = ? WHERE id = ?').run(name.trim(), plateNumber.trim(), busType, startingPoint.trim(), destination.trim(), bus.id);
    database.prepare('DELETE FROM stops WHERE bus_id = ?').run(bus.id);
    const insertStop = database.prepare('INSERT INTO stops (bus_id, stop_order, name) VALUES (?, ?, ?)');
    stops.filter((stop) => String(stop).trim()).forEach((stop, index) => insertStop.run(bus.id, index + 1, String(stop).trim()));
    return getBus(bus.id);
  });
  response.json({ bus: updateBus() });
});

app.delete('/api/buses/:id', authenticate, (request, response) => {
  const result = database.prepare('DELETE FROM buses WHERE id = ? AND owner_id = ?').run(request.params.id, request.user.id);
  if (!result.changes) return response.status(404).json({ error: 'Owned bus not found.' });
  response.status(204).end();
});

app.post('/api/buses/:id/location', authenticate, (request, response) => {
  const bus = database.prepare('SELECT id FROM buses WHERE id = ? AND owner_id = ?').get(request.params.id, request.user.id);
  const { latitude, longitude, enabled = true } = request.body;
  if (!bus) return response.status(404).json({ error: 'Owned bus not found.' });
  if (enabled && (!Number.isFinite(latitude) || !Number.isFinite(longitude))) return response.status(400).json({ error: 'Valid latitude and longitude are required.' });
  database.prepare('UPDATE buses SET live_enabled = ? WHERE id = ?').run(enabled ? 1 : 0, bus.id);
  if (enabled) database.prepare('INSERT INTO live_locations (bus_id, latitude, longitude) VALUES (?, ?, ?)').run(bus.id, latitude, longitude);
  response.json({ bus: getBus(bus.id) });
});

app.get('/', (_request, response) => {
  response.redirect('/home/index.html');
});

app.listen(port, () => {
  console.log(`BusTravel is running at http://localhost:${port}`);
});
