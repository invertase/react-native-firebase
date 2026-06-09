import inAppMessaging, {
  firebase,
  getInAppMessaging,
  isMessagesDisplaySuppressed,
  setMessagesDisplaySuppressed,
  isAutomaticDataCollectionEnabled,
  setAutomaticDataCollectionEnabled,
  triggerEvent,
  SDK_VERSION,
  type InAppMessaging,
  type FirebaseInAppMessagingTypes,
} from '.';

console.log(inAppMessaging().app);

// checks module exists at root
console.log(firebase.inAppMessaging().app.name);
console.log(firebase.inAppMessaging().isMessagesDisplaySuppressed);
console.log(firebase.inAppMessaging().isAutomaticDataCollectionEnabled);

// checks module exists at app level
console.log(firebase.app().inAppMessaging().app.name);
console.log(firebase.app().inAppMessaging().isMessagesDisplaySuppressed);
console.log(firebase.app().inAppMessaging().isAutomaticDataCollectionEnabled);

// checks statics exist
console.log(firebase.inAppMessaging.SDK_VERSION);

// checks statics exist on defaultExport
console.log(inAppMessaging.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists (note: in-app-messaging doesn't support multi-app, but test the pattern)
console.log(firebase.inAppMessaging().app.name);

// checks default export supports app arg
console.log(inAppMessaging().app.name);

// checks Module instance APIs
const inAppMessagingInstance: InAppMessaging = firebase.inAppMessaging();
console.log(inAppMessagingInstance.isMessagesDisplaySuppressed);
console.log(inAppMessagingInstance.isAutomaticDataCollectionEnabled);

inAppMessagingInstance.setMessagesDisplaySuppressed(true).then(() => {
  console.log('Messages display suppressed');
});

inAppMessagingInstance.setAutomaticDataCollectionEnabled(false).then(() => {
  console.log('Automatic data collection disabled');
});

inAppMessagingInstance.triggerEvent('test-event').then(() => {
  console.log('Event triggered');
});

// checks modular API functions
const modularInAppMessaging: InAppMessaging = getInAppMessaging();
console.log(modularInAppMessaging.app.name);

console.log(isMessagesDisplaySuppressed(modularInAppMessaging));

setMessagesDisplaySuppressed(modularInAppMessaging, true).then(() => {
  console.log('Modular messages display suppressed');
});

console.log(isAutomaticDataCollectionEnabled(modularInAppMessaging));

setAutomaticDataCollectionEnabled(modularInAppMessaging, false).then(() => {
  console.log('Modular automatic data collection disabled');
});

triggerEvent(modularInAppMessaging, 'modular-test-event').then(() => {
  console.log('Modular event triggered');
});

// named SDK_VERSION export
const sdkVersion: string = SDK_VERSION;
console.log(sdkVersion);

// deprecated namespace types remain assignable from runtime values
const namespaceModule: FirebaseInAppMessagingTypes.Module = firebase.inAppMessaging();
const namespaceStatics: FirebaseInAppMessagingTypes.Statics = firebase.inAppMessaging;
console.log(namespaceModule.app.name);
console.log(namespaceStatics.SDK_VERSION);
