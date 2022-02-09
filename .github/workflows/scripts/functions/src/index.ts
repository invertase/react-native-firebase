import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('{ "data": "Hello from Firebase!" }');
});

export { testFunctionCustomRegion } from './testFunctionCustomRegion';
export { testFunctionDefaultRegion } from './testFunctionDefaultRegion';
