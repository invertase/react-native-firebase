const assert = require('assert');
const functions = require('firebase-functions');

const TEST_DATA = require('./test-data');

exports.runTestWithRegion = functions
  .region('europe-west1')
  .https.onCall(() => 'europe-west1');

exports.runTest = functions.https.onCall(data => {
  console.log(Date.now(), data);

  if (typeof data === 'undefined') {
    return 'undefined';
  }

  if (typeof data === 'string') {
    return 'string';
  }

  if (typeof data === 'number') {
    return 'number';
  }

  if (typeof data === 'boolean') {
    return 'boolean';
  }

  if (data === null) {
    return 'null';
  }

  if (Array.isArray(data)) {
    return 'array';
  }

  const { type, asError, inputData } = data;
  if (!Object.hasOwnProperty.call(TEST_DATA, type)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid test requested.'
    );
  }

  const outputData = TEST_DATA[type];

  try {
    assert.deepEqual(outputData, inputData);
  } catch (e) {
    console.error(e);
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Input and Output types did not match.',
      e.message
    );
  }

  // all good
  if (asError) {
    throw new functions.https.HttpsError(
      'cancelled',
      'Response data was requested to be sent as part of an Error payload, so here we are!',
      outputData
    );
  }

  return outputData;
});
