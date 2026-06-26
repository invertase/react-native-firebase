import { getApp } from '@react-native-firebase/app';
import {
  getInAppMessaging,
  isMessagesDisplaySuppressed,
  setMessagesDisplaySuppressed,
  isAutomaticDataCollectionEnabled,
  setAutomaticDataCollectionEnabled,
  triggerEvent,
  SDK_VERSION,
  type InAppMessaging,
} from '.';

// modular API functions
const modularInAppMessaging1 = getInAppMessaging();
console.log(modularInAppMessaging1.app.name);

const modularInAppMessaging2 = getInAppMessaging(getApp());
console.log(modularInAppMessaging2.app.name);

// modular public types
const modularInstance: InAppMessaging = getInAppMessaging();
const modularWithNamedApp: InAppMessaging = getInAppMessaging(getApp());
console.log(modularInstance.app.name);
console.log(modularWithNamedApp.app.name);

console.log(isMessagesDisplaySuppressed(modularInstance));
console.log(isAutomaticDataCollectionEnabled(modularInstance));

setMessagesDisplaySuppressed(modularInstance, true).then(() => {
  console.log('Modular messages display suppressed');
});

setAutomaticDataCollectionEnabled(modularInstance, false).then(() => {
  console.log('Modular automatic data collection disabled');
});

triggerEvent(modularInstance, 'modular-test-event').then(() => {
  console.log('Modular event triggered');
});

// named SDK_VERSION export
const sdkVersion: string = SDK_VERSION;
console.log(sdkVersion);
