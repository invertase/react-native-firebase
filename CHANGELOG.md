# v6.0.0

This version is effectively a re-write with the goal of splitting every module into it's own package (simplifies maintenance 
for contributors and also installation for users) and bringing each Firebase module up to 100% testing coverage and 100% 
Firebase API Coverage. 

Many of the manual native installation steps for Android & iOS have been removed / internally automated 
and most modules can now be used just by linking it (e.g. `react-native link @react-native-firebase/analytics`).

The following modules are completed and published to NPM on the `alpha` tag ready to be consumed:

| Name                                     |                                                                                  Downloads                                                                                  |                                                      Coverage                                                       |
| ---------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: |
| [Analytics](/packages/analytics)         | [![badge](https://img.shields.io/npm/dm/@react-native-firebase/analytics.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/analytics) | [![badge](https://api.rnfirebase.io/coverage/analytics/badge)](https://api.rnfirebase.io/coverage/analytics/detail) |
| [App](/packages/app)                     |       [![badge](https://img.shields.io/npm/dm/@react-native-firebase/app.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/app)       |       [![badge](https://api.rnfirebase.io/coverage/app/badge)](https://api.rnfirebase.io/coverage/app/detail)       |
| [Cloud Functions](/packages/functions)   | [![badge](https://img.shields.io/npm/dm/@react-native-firebase/functions.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/functions) | [![badge](https://api.rnfirebase.io/coverage/functions/badge)](https://api.rnfirebase.io/coverage/functions/detail) |
| [Instance ID](/packages/iid)             |       [![badge](https://img.shields.io/npm/dm/@react-native-firebase/iid.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/iid)       |       [![badge](https://api.rnfirebase.io/coverage/iid/badge)](https://api.rnfirebase.io/coverage/iid/detail)       |
| [Performance Monitoring](/packages/perf) |      [![badge](https://img.shields.io/npm/dm/@react-native-firebase/perf.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/perf)      |      [![badge](https://api.rnfirebase.io/coverage/perf/badge)](https://api.rnfirebase.io/coverage/perf/detail)      |
| [Utils](/packages/utils)                 |     [![badge](https://img.shields.io/npm/dm/@react-native-firebase/utils.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/utils)     |     [![badge](https://api.rnfirebase.io/coverage/utils/badge)](https://api.rnfirebase.io/coverage/utils/detail)     |

> If a module you use is not yet listed above please refrain from using v6 for now - attempting to use v6 alongside v5 can cause issues with dependencies.

Please tag any GitHub issues regarding v6 with `[v6]` in the title.

## Migrating from v4 & v5

With the size of the changes mentioned above, it's recommended that you remove all native code/changes previously added
for `react-native-firebase` (except for firebase initialisation code (e.g. `[FIRApp configure];` ios, `apply plugin: 'com.google.gms.google-services'` android).

Additionally, it's recommended to remove any native Firebase dependencies (the Firebase Android/iOS SDKs) in your iOS
`Podfile` and your `android/app/build.gradle` file, e.g. `pod 'Firebase/Core', '~> 5.15.0'` or `implementation "com.google.firebase:firebase-core:16.`,
as we now manage these dependencies and their versions internally.

Once all the old native installation changes have been removed you can follow the install guide below.

> If you're migrating from v4, please ensure you've read up on any breaking changes from v4 to v5 [here](https://rnfirebase.io/docs/v5.x.x/releases/v5.0.0).

### Installing

1. Install the [@react-native-firebase/app](https://github.com/invertase/react-native-firebase/tree/master/packages/app) NPM package (all modules have a hard dependency requirement on this package):

```bash
yarn add @react-native-firebase/app@alpha
react-native link @react-native-firebase/app
```

2. Install the NPM packages for the Firebase services you'd like to use, e.g. for analytics install [@react-native-firebase/analytics](https://github.com/invertase/react-native-firebase/tree/master/packages/analytics). Repeat this step for each Firebase service you require.

```bash
yarn add @react-native-firebase/analytics@alpha
react-native link @react-native-firebase/analytics
```

3. Some Firebase services such as Performance Monitoring require some minor additional native code steps for Android or iOS that can't be abstracted away, e.g. Perf on Android requires the `com.google.firebase.firebase-perf` gradle plugin. Please see the readme for each module (see the table above for links) where these changes are documented; these will later be moved to the new documentation hub.

#### Usage Example

```js
// import the app module
import firebase from '@react-native-firebase/app';

// import the modules you'd like to use
import '@react-native-firebase/analytics';
import '@react-native-firebase/functions';

// use them
await firebase.analytics().setUserId('12345678');
```

Optionally; you can also consume a module directly without needing the default export of `@react-native-firebase/app`, e.g.:

```js
import { firebase } from '@react-native-firebase/analytics';

// use analytics
await firebase.analytics().setUserId('12345678');

// ---- OR ----
import analytics from '@react-native-firebase/analytics';

// use analytics
await analytics().setUserId('12345678');
```

## All Modules

- [INTERNAL] Improved error codes & handling for all Firebase services;
  - Standardised native error to JS conversion
  - [DEVEX] Native promise rejection errors now contain additional properties to aid debugging
- [BUGFIX] All native events are now queued natively until a JS listener is registered. This fixes several race conditions for events like `onMessage`, `onNotification`, `onLink` etc where the event would trigger before JS was ready.

## App

- [NEW] Added `appConfig` & method support for `setAutomaticDataCollectionEnabled` & `automaticResourceManagement`
- [NEW] Added app `options` support for `gaTrackingId`
- [NEW] The `[DEFAULT]` Firebase app can now be safely initialised in JS, however this has some caveats;
  - Firebase services such as Performance Monitoring & Remote Config require the default app to be initialised through the plist/json file.
- [BREAKING] Waiting for apps to init via `.onReady()` has been removed. `initializeApp()` now returns a promise to the same effect
- [BREAKING] Trying to initialise the `[DEFAULT]` Firebase app in JS when it was already initialised natively will now throw an error (formerly warned)

## Analytics

- [NEW] Added support for `resetAnalyticsData()` - this is useful for opt-in first analytics/data collection flows
- [INTERNAL] `setUserProperties` now iterates properties natively (formerly 1 native call per property)
- [BREAKING] all analytics methods now return a Promise, rather than formerly being 'fire and forget'

## Functions <a href="https://api.rnfirebase.io/coverage/functions/detail"><img src="https://api.rnfirebase.io/coverage/functions/badge?style=flat-square" alt="Coverage"></a>

- [BUGFIX] Fixed an issue where `useFunctionsEmulator` does not persist natively (Firebase iOS SDK requires chaining this method before other calls and does not modify the instance, Android however persists this)

## Instance Id (iid)

- [NEW] Instance Id now supports multiple Firebase apps, e.g. `firebase.app('fooApp').iid().get()`

## Performance Monitoring (perf)

- [BREAKING] All `Trace` & `HttpMetric` methods (except for `start` & `stop`) are now synchronous and no longer return a Promise, extra attributes/metrics now only get sent to native when you call `stop`
- [BREAKING] `firebase.perf.Trace.incrementMetric` will now create a metric if it could not be found
- [BREAKING] `firebase.perf.Trace.getMetric` will now return 0 if a metric could not be found
- [NEW] Added support for `firebase.perf().isPerformanceCollectionEnabled: boolean`
- [NEW] Added support for `firebase.perf.Trace.removeMetric(metricName: string)`
- [NEW] Added support for `firebase.perf.Trace.getMetrics(): { [key: string]: number }`

## Messaging

- [NEW] Support `setAutoInitEnabled(enabled: boolean)` - this is useful for opt-in first flows

## Utils

- [NEW] Added support via `isRunningInTestLab` for checking if an Android application is running inside a Firebase Test Lab environment
