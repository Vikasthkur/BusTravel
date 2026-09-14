# BusTravel

BusTravel is a bus information and live tracking application. Booking, payments, driver accounts, and passenger location tracking are intentionally out of scope for the current roadmap.

## Run locally

```powershell
cd backend
npm install
npm start
```

Open `http://localhost:3000` to view the Home page. The backend health endpoint is available at `http://localhost:3000/api/health`.

## Real backend

The backend uses SQLite (`backend/bustravel.sqlite`), bcrypt password hashing, and JWT authentication. Signup, login, Add Bus, My Buses, live-location updates, and route search use the API rather than browser-only demo data.

Run the API tests with:

```powershell
cd backend
npm test
```

## Android build

The Capacitor Android project is in `backend/android`. After installing Android Studio and the Android SDK, configure `ANDROID_HOME` (or `backend/android/local.properties`) and build with:

```powershell
cd backend
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

The debug APK will be generated at `backend/android/app/build/outputs/apk/debug/app-debug.apk`.
