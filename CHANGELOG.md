# v6.0.0

This version is effectively a re-write with the goal of splitting every module into it's own package (simplifies maintenance
for contributors and also installation for users) and bringing each Firebase module up to 100% testing coverage and 100%
Firebase API Coverage.

Many of the manual native installation steps for Android & iOS have been removed / internally automated
and most modules can now be used just by linking it (e.g. `react-native link @react-native-firebase/analytics`).

The following modules are completed and published to NPM on the `alpha` tag ready to be consumed:

| Name                                     |                                                                                    Downloads                                                                                    |                                                        Coverage                                                         |
| ---------------------------------------- | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------: |
| [Analytics](/packages/analytics)         |   [![badge](https://img.shields.io/npm/dm/@react-native-firebase/analytics.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/analytics)   |   [![badge](https://api.rnfirebase.io/coverage/analytics/badge)](https://api.rnfirebase.io/coverage/analytics/detail)   |
| [App](/packages/app)                     |         [![badge](https://img.shields.io/npm/dm/@react-native-firebase/app.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/app)         |         [![badge](https://api.rnfirebase.io/coverage/app/badge)](https://api.rnfirebase.io/coverage/app/detail)         |
| [Cloud Functions](/packages/functions)   |   [![badge](https://img.shields.io/npm/dm/@react-native-firebase/functions.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/functions)   |   [![badge](https://api.rnfirebase.io/coverage/functions/badge)](https://api.rnfirebase.io/coverage/functions/detail)   |
| [Crashlytics](/packages/crashlytics)     | [![badge](https://img.shields.io/npm/dm/@react-native-firebase/crashlytics.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/crashlytics) | [![badge](https://api.rnfirebase.io/coverage/crashlytics/badge)](https://api.rnfirebase.io/coverage/crashlytics/detail) |
| [In-app Messaging](/packages/fiam)       |        [![badge](https://img.shields.io/npm/dm/@react-native-firebase/fiam.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/fiam)        |        [![badge](https://api.rnfirebase.io/coverage/fiam/badge)](https://api.rnfirebase.io/coverage/fiam/detail)        |
| [Instance ID](/packages/iid)             |         [![badge](https://img.shields.io/npm/dm/@react-native-firebase/iid.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/iid)         |         [![badge](https://api.rnfirebase.io/coverage/iid/badge)](https://api.rnfirebase.io/coverage/iid/detail)         |
| [Performance Monitoring](/packages/perf) |        [![badge](https://img.shields.io/npm/dm/@react-native-firebase/perf.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/perf)        |        [![badge](https://api.rnfirebase.io/coverage/perf/badge)](https://api.rnfirebase.io/coverage/perf/detail)        |
| [Utils](/packages/utils)                 |       [![badge](https://img.shields.io/npm/dm/@react-native-firebase/utils.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/utils)       |       [![badge](https://api.rnfirebase.io/coverage/utils/badge)](https://api.rnfirebase.io/coverage/utils/detail)       |

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
- [NEW][🔥] In an effort to further reduce manual native code changes when integrating and configuring React Native Firebase; we have added support for configuring various Firebase services & features via a `firebase.json` file in your project root.
- [NEW][ios] CocoaPods static framework support for all modules (you can use `use_frameworks!` without issues relating to this lib)
- [NEW][ios] Implemented a CocoaPods Firebase React Native modules auto-loader script for your Podfile; you only need to change your Podfile once (to add the script); this script will then automatically include all React Native Firebase modules found in your `node_modules` directory as Pods, manage additional required build phases (e.g. auto adds the crashlytics build phase (`/Fabric/Run`)), and allows the `firebase.json` functionality to work. [Example Podfile](https://github.com/invertase/react-native-firebase/blob/master/tests/ios/Podfile) with script included and sample `pod install` logs:
  ![pod install image](https://i.imgur.com/XOqw5Jq.png)

## App

- [NEW] Added `appConfig` & method support for `setAutomaticDataCollectionEnabled` & `automaticResourceManagement`
- [NEW] Added app `options` support for `gaTrackingId`
- [NEW] The `[DEFAULT]` Firebase app can now be safely initialised in JS, however this has some caveats;
  - Firebase services such as Performance Monitoring & Remote Config require the default app to be initialised through the plist/json file.
- [BREAKING] Waiting for apps to init via `.onReady()` has been removed. `initializeApp()` now returns a promise to the same effect
- [BREAKING] Trying to initialise the `[DEFAULT]` Firebase app in JS when it was already initialised natively will now throw an error (formerly warned)

## Analytics

- [NEW] Added support for `resetAnalyticsData()`
- [INTERNAL] `setUserProperties` now iterates properties natively (formerly 1 native call per property)
- [BREAKING] all analytics methods now return a Promise, rather than formerly being 'fire and forget'

## Crashlytics

- [NEW] JavaScript stack traces now automatically captured and parsed
  ![js stack trace preview](https://pbs.twimg.com/media/D07RPDMW0AA7TTv.jpg:large)
- [NEW] Optionally enable automatic reporting of JavaScript unhandled Promise rejections
- [NEW] Added support for `setUserName(userName: string)`
- [NEW] Added support for `setUserEmail(userEmail: string)`
- [NEW] Added support for `isCrashlyticsCollectionEnabled: boolean`
- [NEW][android] Added support for [Crashlytics NDK](https://docs.fabric.io/android/crashlytics/ndk.html#using-gradle) reporting. This allows Crashlytics to capture Yoga related crashes generated from React Native.
- [NEW][🔥] Added `firebase.json` support for `crashlytics_ndk_enabled`, this toggles NDK support as mentioned above, defaults to `true`
- [NEW][🔥] Added `firebase.json` support for `crashlytics_debug_enabled`, this toggles Crashlytics native debug logging, defaults to `false`
- [NEW][🔥] Added `firebase.json` support for `crashlytics_auto_collection_enabled`, this toggles Crashlytics error reporting, this is useful for user opt-in first flows, e.g. set to `false` and when your user agrees to opt-in then call `setCrashlyticsCollectionEnabled(true)` in your app, defaults to `true`
- [BUGFIX][android] `crash()` now correctly crashes without being caught by React Native's RedBox
- [BREAKING] `setBoolValue`, `setFloatValue`, `setIntValue` & `setStringValue` have been removed and replaced with two new methods (the Crashlytics SDK converted all these into strings internally anyway):
  - `setAttribute(key: string, value: string): Promise<null>` - set a singular key value to show alongside any subsequent crash reports
  - `setAttributes(values: { [key: string]: string }): Promise<null>` - set multiple key values to show alongside any subsequent crash reports
- [BREAKING] all methods except `crash`, `log` & `recordError` now return a `Promise` that resolves when complete
- [BREAKING] `recordError(code: number, message: string)`'s fn signature changed to `recordError(error: Error)` - now accepts a JS Error class instance
- [BREAKING] `setUserIdentifier()` has been renamed to `setUserId()` to match analytics implementation
- [BREAKING] `enableCrashlyticsCollection()`'s fn signature changed to `setCrashlyticsCollectionEnabled(enabled: boolean)`
  - This can be used in all scenarios (formerly only able to use this when automatic initialization of crashlytics was disabled)
  - Changes do not take effect until the next app startup
  - This persists between app restarts and only needs to be called once, can be used in conjunction with `isCrashlyticsCollectionEnabled` to reduce bridge startup traffic - though calling multiple times is still allowed

## Functions <a href="https://api.rnfirebase.io/coverage/functions/detail"><img src="https://api.rnfirebase.io/coverage/functions/badge?style=flat-square" alt="Coverage"></a>

- [BUGFIX] Fixed an issue where `useFunctionsEmulator` does not persist natively (Firebase iOS SDK requires chaining this method before other calls and does not modify the instance, Android however persists this)

## In-App Messaging (fiam) - **[NEW]**

- [NEW] Added support for `firebase.fiam().isMessagesDisplaySuppressed: boolean;`
- [NEW] Added support for `firebase.fiam().setMessagesDisplaySuppressed(enabled: boolean): Promise<null>;`
- [NEW] Added support for `firebase.fiam().isAutomaticDataCollectionEnabled: boolean;`
- [NEW] Added support for `firebase.fiam().setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null>;`

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
