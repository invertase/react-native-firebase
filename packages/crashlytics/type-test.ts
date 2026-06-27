import { getApp } from '@react-native-firebase/app';
import {
  getCrashlytics,
  checkForUnsentReports,
  deleteUnsentReports,
  didCrashOnPreviousExecution,
  crash,
  log,
  recordError,
  sendUnsentReports,
  setUserId,
  setAttribute,
  setAttributes,
  setCrashlyticsCollectionEnabled,
  SDK_VERSION,
  type Crashlytics,
} from '.';

const crashlytics = getCrashlytics();
console.log(crashlytics.app.name);

const crashlyticsWithApp = getCrashlytics(getApp());
console.log(crashlyticsWithApp.app.name);

const typed: Crashlytics = crashlytics;
console.log(typed.isCrashlyticsCollectionEnabled);

checkForUnsentReports(crashlytics).then((value: boolean) => console.log(value));
deleteUnsentReports(crashlytics).then(() => console.log('deleted'));
didCrashOnPreviousExecution(crashlytics).then((value: boolean) => console.log(value));
log(crashlytics, 'message');
recordError(crashlytics, new Error('test'));
sendUnsentReports(crashlytics);
setUserId(crashlytics, 'user');
setAttribute(crashlytics, 'role', 'admin');
setAttributes(crashlytics, { role: 'admin' });
setCrashlyticsCollectionEnabled(crashlytics, true);
crash(crashlytics);

console.log(SDK_VERSION);
