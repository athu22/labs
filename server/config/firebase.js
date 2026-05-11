const admin = require('firebase-admin');
const path = require('path');

// Using the service account JSON file you just added
const serviceAccount = require('../lab-association-firebase-adminsdk-fbsvc-cc26b925cf.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully using JSON file.');
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
