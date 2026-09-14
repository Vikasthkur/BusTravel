const assert = require('node:assert/strict');

const baseUrl = `http://127.0.0.1:${process.env.PORT || 3001}`;
const uniqueEmail = `test-${Date.now()}@example.com`;

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  assert.ok(response.ok, `${path} failed: ${JSON.stringify(body)}`);
  return body;
}

(async () => {
  const account = await request('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'API Test Owner', email: uniqueEmail, password: 'test-password-123' })
  });
  assert.ok(account.token);

  const login = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: uniqueEmail, password: 'test-password-123' })
  });
  assert.ok(login.token);

  const created = await request('/api/buses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` },
    body: JSON.stringify({ name: 'API Express', plateNumber: 'MP 99 ZZ 0001', busType: 'Express', startingPoint: 'Sagar', destination: 'Bhopal', stops: ['Stop 1', 'Stop 2'] })
  });
  assert.equal(created.bus.name, 'API Express');

  const search = await request('/api/buses?from=Sagar&to=Bhopal');
  assert.ok(search.buses.some((bus) => bus.id === created.bus.id));

  const updated = await request(`/api/buses/${created.bus.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` },
    body: JSON.stringify({ name: 'Updated Express', plateNumber: 'MP 99 ZZ 0001', busType: 'Express', startingPoint: 'Sagar', destination: 'Bhopal', stops: ['New Stop'] })
  });
  assert.equal(updated.bus.name, 'Updated Express');

  const locationOff = await request(`/api/buses/${created.bus.id}/location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` },
    body: JSON.stringify({ enabled: false })
  });
  assert.equal(locationOff.bus.liveLocation, null);

  const deleted = await fetch(`${baseUrl}/api/buses/${created.bus.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${login.token}` } });
  assert.equal(deleted.status, 204);
  console.log('API tests passed: signup, login, add bus, and search');
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
