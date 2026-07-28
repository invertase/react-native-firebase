import { getApp } from '@react-native-firebase/app';
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
  httpsCallableFromUrl,
  HttpsErrorCode,
  SDK_VERSION,
  type HttpsCallableOptions,
  type HttpsCallable,
  type HttpsCallableResult,
  type Functions,
} from '.';

const functionsInstance: Functions = getFunctions();
console.log(functionsInstance.app.name);

const functionsWithApp = getFunctions(getApp());
console.log(functionsWithApp.app.name);

const functionsWithRegion = getFunctions(getApp(), 'us-central1');
console.log(functionsWithRegion.app.name);

connectFunctionsEmulator(functionsInstance, 'localhost', 5001);

const callableOptions: HttpsCallableOptions = { timeout: 5000 };
console.log(callableOptions.timeout);

const callable: HttpsCallable<string, number> = httpsCallable(functionsInstance, 'test');
callable('test').then((result: HttpsCallableResult<number>) => {
  console.log(result.data);
});

const callableFromUrl = httpsCallableFromUrl<string, number>(
  functionsInstance,
  'https://example.com/callable',
  { timeout: 5000 },
);
callableFromUrl('data').then((result: HttpsCallableResult<number>) => {
  console.log(result.data);
});

console.log(HttpsErrorCode.ABORTED);
console.log(SDK_VERSION);
