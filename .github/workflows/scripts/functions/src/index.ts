import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('{ "data": "Hello from Firebase!" }');
});

export const sleeper = functions.https.onCall(async data => {
  functions.logger.info('Sleeper function starting');
  return await new Promise(() =>
    setTimeout(() => functions.logger.info('done sleeping'), data?.delay ?? 3000),
  );
});

export { testFunctionCustomRegion } from './testFunctionCustomRegion';
export { testFunctionDefaultRegion } from './testFunctionDefaultRegion';
export { testFunctionRemoteConfigUpdate } from './testFunctionRemoteConfigUpdate';
