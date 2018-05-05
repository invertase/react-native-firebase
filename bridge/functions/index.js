const functions = require('firebase-functions');

const TEST_DATA = require('./test-data');

exports.runTest = functions.https.onCall(data => {
  const { type, asError, inputData } = data;
  if (!Object.hasOwnProperty.call(TEST_DATA, type)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid test requested.'
    );
  }

  const outputData = TEST_DATA[type];
  if (typeof outputData !== typeof inputData) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Input and Output types did not match.'
    );
  }

  // cheap deep equality check
  if (JSON.stringify(outputData) !== JSON.stringify(inputData)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Input and Output failed deep equality check.'
    );
  }

  // all good
  if (asError) {
    throw new functions.https.HttpsError(
      'cancelled',
      'Response data was request as part of a Error payload, so here we are!',
      outputData
    );
  }

  return outputData;
});
