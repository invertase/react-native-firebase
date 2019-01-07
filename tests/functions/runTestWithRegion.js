const functions = require('firebase-functions');

module.exports = functions
  .region('europe-west1')
  .https.onCall(() => 'europe-west1');
