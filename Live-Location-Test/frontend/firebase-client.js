function getFirebaseLocationStore() {
  const config = window.BUS_TRAVEL_FIREBASE_CONFIG;
  if (!config || !config.apiKey || !config.databaseURL || !window.firebase) return null;

  if (!firebase.apps.length) firebase.initializeApp(config);
  return firebase.database();
}

window.getFirebaseLocationStore = getFirebaseLocationStore;
