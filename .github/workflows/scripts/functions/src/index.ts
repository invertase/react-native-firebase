import * as functions from 'firebase-functions/v2';
import { CallableRequest } from 'firebase-functions/v2/https';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorldV2 = functions.https.onRequest((_, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('{ "data": "Hello from Firebase!" }');
});

export const sleeperV2 = functions.https.onCall(
  async (req: CallableRequest<{ delay?: number }>) => {
    functions.logger.info('Sleeper function starting');
    return await new Promise(() => {
      functions.logger.info('Sleeping this long: ' + (req.data.delay ?? 3000));
      setTimeout(() => functions.logger.info('done sleeping'), req.data.delay ?? 3000);
    });
  },
);

export { testFunctionCustomRegion } from './testFunctionCustomRegion';
export { testFunctionDefaultRegionV2 } from './testFunctionDefaultRegion';
export { testFunctionRemoteConfigUpdateV2 } from './testFunctionRemoteConfigUpdate';
export { fetchAppCheckTokenV2 } from './fetchAppCheckToken';
export { sendFCM } from './sendFCM';

export { testFetchStream, testFetch } from './vertexaiFunctions';
