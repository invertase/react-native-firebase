import { App, initializeApp } from 'firebase-admin/app';
import { logger } from 'firebase-functions/v2';
import { CallableRequest, onRequest, onCall } from 'firebase-functions/v2/https';

let _app: App;

export function getAdminApp(): App {
  if (!_app) {
    _app = initializeApp();
  }
  return _app;
}

export const helloWorldV2 = onRequest((_, response) => {
  logger.info('Hello logs!', { structuredData: true });
  response.send('{ "data": "Hello from Firebase!" }');
});

export const sleeperV2 = onCall(async (req: CallableRequest<{ delay?: number }>) => {
  logger.info('Sleeper function starting');
  return await new Promise(() => {
    logger.info('Sleeping this long: ' + (req.data.delay ?? 3000));
    setTimeout(() => logger.info('done sleeping'), req.data.delay ?? 3000);
  });
});

export { testFunctionCustomRegion } from './testFunctionCustomRegion';
export { testFunctionDefaultRegionV2 } from './testFunctionDefaultRegion';
export { testFunctionRemoteConfigUpdateV2 } from './testFunctionRemoteConfigUpdate';
export { fetchAppCheckTokenV2 } from './fetchAppCheckToken';
export { sendFCM } from './sendFCM';

export { testFetchStream, testFetch } from './vertexaiFunctions';

export {
  testStreamingCallable,
  testProgressStream,
  testComplexDataStream,
  testStreamWithError,
  testStreamResponse,
  testStreamingCallableWithNull,
} from './testStreamingCallable';
