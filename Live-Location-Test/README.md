# Live Location Test

A minimal two-phone test: Phone A sends GPS coordinates, and Phone B sees the
latest point on an OpenStreetMap + Leaflet map.

## Run locally

1. Install Node.js 18 or newer.
2. Open a terminal in `Live-Location-Test/server`.
3. Run `npm install`, then `npm start`.
4. On the computer, find its local Wi-Fi IP address (for example,
   `192.168.1.20`).
5. On Phone A open
   `http://COMPUTER_IP:3000/frontend/sender/sender.html`.
6. On Phone B open
   `http://COMPUTER_IP:3000/frontend/viewer/viewer.html?busId=101`.
7. Press **Start sharing** on Phone A.

Both phones and the computer must be on the same Wi-Fi network. The server
keeps only the newest location in memory; restarting it clears the location.

## Firebase mode

The test works locally without Firebase. To use Firebase Realtime Database:

1. Create a Firebase project and a Realtime Database.
2. Copy `frontend/firebase-config.js` to a safe local backup and fill in the
   web app config from Firebase (`apiKey`, `authDomain`, `databaseURL`,
   `projectId`, `storageBucket`, `messagingSenderId`, and `appId`).
3. Open both pages with the same `busId`, for example:
   `sender/sender.html?busId=101` and `viewer/viewer.html?busId=101`.
4. Set Realtime Database rules for this private test project. Do not leave
   production data publicly writable.

In Firebase mode the driver writes to `buses/101/location` and the passenger
subscribes to that path in realtime. If the config is empty, the local
`/api/location` fallback is used.

## Important browser note

Phone browsers usually require a secure context (`https://`) for GPS.
`http://localhost` is treated as secure on the computer, but a phone opening
the computer's LAN IP may block location access. If that happens, use an HTTPS
tunnel or local HTTPS certificate for the next testing step.

The map tiles and Leaflet library need internet access even when the Node
server is local.
