import crashlytics, {
  firebase,
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
} from '.';

console.log(crashlytics().app);

// checks module exists at root
console.log(firebase.crashlytics().app.name);
console.log(firebase.crashlytics().isCrashlyticsCollectionEnabled);

// checks module exists at app level
console.log(firebase.app().crashlytics().app.name);
console.log(firebase.app().crashlytics().isCrashlyticsCollectionEnabled);

// checks statics exist
console.log(firebase.crashlytics.SDK_VERSION);

// checks statics exist on defaultExport
console.log(crashlytics.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks Module instance APIs
const crashlyticsInstance = firebase.crashlytics();
console.log(crashlyticsInstance.isCrashlyticsCollectionEnabled);

crashlyticsInstance.checkForUnsentReports().then((hasUnsent: boolean) => {
  console.log(hasUnsent);
});

crashlyticsInstance.deleteUnsentReports().then(() => {
  console.log('Unsent reports deleted');
});

crashlyticsInstance.didCrashOnPreviousExecution().then((didCrash: boolean) => {
  console.log(didCrash);
});

crashlyticsInstance.crash();

crashlyticsInstance.log('Test log message');

crashlyticsInstance.recordError(new Error('Test error'));
crashlyticsInstance.recordError(new Error('Test error'), 'CustomErrorName');

crashlyticsInstance.sendUnsentReports();

crashlyticsInstance.setUserId('user123').then(() => {
  console.log('User ID set');
});

crashlyticsInstance.setAttribute('key', 'value').then(() => {
  console.log('Attribute set');
});

crashlyticsInstance.setAttributes({ key1: 'value1', key2: 'value2' }).then(() => {
  console.log('Attributes set');
});

crashlyticsInstance.setCrashlyticsCollectionEnabled(true).then(() => {
  console.log('Collection enabled');
});

// checks modular API functions
const crashlyticsModular = getCrashlytics();
console.log(crashlyticsModular.app.name);

checkForUnsentReports(crashlyticsInstance).then((hasUnsent: boolean) => {
  console.log(hasUnsent);
});

deleteUnsentReports(crashlyticsInstance).then(() => {
  console.log('Unsent reports deleted');
});

didCrashOnPreviousExecution(crashlyticsInstance).then((didCrash: boolean) => {
  console.log(didCrash);
});

crash(crashlyticsInstance);

log(crashlyticsInstance, 'Modular log message');

recordError(crashlyticsInstance, new Error('Modular error'));
recordError(crashlyticsInstance, new Error('Modular error'), 'CustomErrorName');

sendUnsentReports(crashlyticsInstance);

setUserId(crashlyticsInstance, 'user123').then(() => {
  console.log('User ID set');
});

setAttribute(crashlyticsInstance, 'key', 'value').then(() => {
  console.log('Attribute set');
});

setAttributes(crashlyticsInstance, { key1: 'value1', key2: 'value2' }).then(() => {
  console.log('Attributes set');
});

setCrashlyticsCollectionEnabled(crashlyticsInstance, true).then(() => {
  console.log('Collection enabled');
});
