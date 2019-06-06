# v6.0.0

This version is effectively a re-write with the goal of splitting every module into it's own package (simplifies maintenance
for contributors and also installation for users) and bringing each Firebase module up to 100% testing coverage and 100%
Firebase API Coverage.

Many of the manual native installation steps for Android & iOS have been removed / internally automated
and most modules can now be used just by linking it (e.g. `react-native link @react-native-firebase/analytics`).

The following modules are completed and published to NPM on the `alpha` tag ready to be consumed:

| Name                                                      |                                                                                            Downloads                                                                                            |                                                                Coverage                                                                 |
| --------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------: |
| [Analytics](/packages/analytics)                          |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/analytics.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/analytics)           |           [![badge](https://api.rnfirebase.io/coverage/analytics/badge)](https://api.rnfirebase.io/coverage/analytics/detail)           |
| [App](/packages/app)                                      |                 [![badge](https://img.shields.io/npm/dm/@react-native-firebase/app.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/app)                 |                 [![badge](https://api.rnfirebase.io/coverage/app/badge)](https://api.rnfirebase.io/coverage/app/detail)                 |
| [App Invites](/packages/invites)                          |             [![badge](https://img.shields.io/npm/dm/@react-native-firebase/invites.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/invites)             |             [![badge](https://api.rnfirebase.io/coverage/invites/badge)](https://api.rnfirebase.io/coverage/invites/detail)             |
| [Cloud Functions](/packages/functions)                    |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/functions.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/functions)           |           [![badge](https://api.rnfirebase.io/coverage/functions/badge)](https://api.rnfirebase.io/coverage/functions/detail)           |
| [Cloud Storage](/packages/storage)                        |             [![badge](https://img.shields.io/npm/dm/@react-native-firebase/storage.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/storage)             |             [![badge](https://api.rnfirebase.io/coverage/storage/badge)](https://api.rnfirebase.io/coverage/storage/detail)             |
| [Crashlytics](/packages/crashlytics)                      |         [![badge](https://img.shields.io/npm/dm/@react-native-firebase/crashlytics.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/crashlytics)         |         [![badge](https://api.rnfirebase.io/coverage/crashlytics/badge)](https://api.rnfirebase.io/coverage/crashlytics/detail)         |
| [In-app Messaging](/packages/fiam)                        |                [![badge](https://img.shields.io/npm/dm/@react-native-firebase/fiam.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/fiam)                |                [![badge](https://api.rnfirebase.io/coverage/fiam/badge)](https://api.rnfirebase.io/coverage/fiam/detail)                |
| [Instance ID](/packages/iid)                              |                 [![badge](https://img.shields.io/npm/dm/@react-native-firebase/iid.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/iid)                 |                 [![badge](https://api.rnfirebase.io/coverage/iid/badge)](https://api.rnfirebase.io/coverage/iid/detail)                 |
| [ML Kit Natural Language ](/packages/ml-natural-language) | [![badge](https://img.shields.io/npm/dm/@react-native-firebase/ml-natural-language.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/ml-natural-language) | [![badge](https://api.rnfirebase.io/coverage/ml-natural-language/badge)](https://api.rnfirebase.io/coverage/ml-natural-language/detail) |
| [Performance Monitoring](/packages/perf)                  |                [![badge](https://img.shields.io/npm/dm/@react-native-firebase/perf.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/perf)                |                [![badge](https://api.rnfirebase.io/coverage/perf/badge)](https://api.rnfirebase.io/coverage/perf/detail)                |
| [Realtime Database](/packages/database)                   |            [![badge](https://img.shields.io/npm/dm/@react-native-firebase/database.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/database)            |            [![badge](https://api.rnfirebase.io/coverage/database/badge)](https://api.rnfirebase.io/coverage/database/detail)            |
| [Remote Config](/packages/config)                         |              [![badge](https://img.shields.io/npm/dm/@react-native-firebase/config.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/config)              |           [![badge](https://api.rnfirebase.io/coverage/functions/badge)](https://api.rnfirebase.io/coverage/functions/detail)           |
| [Utils](/packages/utils)                                  |               [![badge](https://img.shields.io/npm/dm/@react-native-firebase/utils.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/utils)               |               [![badge](https://api.rnfirebase.io/coverage/utils/badge)](https://api.rnfirebase.io/coverage/utils/detail)               |

---

The following modules are **migration only** for now (migrated from v5 to v6 with minimal changes), what this means:

- no new work done on them (other than migrating to v6 internals)
- no new tests added for them (but all existing tests pass)
- flow types missing (but have TS types)

More work on these will be done in a later alpha release.

| Name                             |                                                                             Downloads                                                                             |                                                 Coverage                                                  |
| -------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------: |
| [Authentication](/packages/auth) | [![badge](https://img.shields.io/npm/dm/@react-native-firebase/auth.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/auth) | [![badge](https://api.rnfirebase.io/coverage/auth/badge)](https://api.rnfirebase.io/coverage/auth/detail) |

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

## App (app)

- [NEW] Added `appConfig` & method support for `setAutomaticDataCollectionEnabled` & `automaticResourceManagement`
- [NEW] Added app `options` support for `gaTrackingId`
- [NEW] The `[DEFAULT]` Firebase app can now be safely initialised in JS, however this has some caveats;
  - Firebase services such as Performance Monitoring & Remote Config require the default app to be initialised through the plist/json file.
- [BREAKING] Waiting for apps to init via `.onReady()` has been removed. `initializeApp()` now returns a promise to the same effect
- [BREAKING] Trying to initialise the `[DEFAULT]` Firebase app in JS when it was already initialised natively will now throw an error (formerly warned)

## App Invites (invites)

- [NEW] Added `createInvitation(title: string, message: string)` method to replace construction an Invite from `new firebase.invites.Invitation` (this is still supported for now)
- [WARNING] Deprecation notice printed when using Invites - it's now deprecated by Firebase and will be removed by January 2020 - the suggested migration path is switching to Dynamic Links and handling the sending of the link yourself.

## Analytics (analytics)

- [NEW] Added support for `resetAnalyticsData()`
- [INTERNAL] `setUserProperties` now iterates properties natively (formerly 1 native call per property)
- [BREAKING] all analytics methods now return a Promise, rather than formerly being 'fire and forget'

## Crashlytics (crashlytics)

> **Blog post announcement**: [[Firebase Crashlytics for React Native](https://invertase.io/blog/firebase-crashlytics-for-react-native?utm_source=github&utm_medium=changelog)]

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

## Functions (functions)

- [BUGFIX] Fixed an issue where `useFunctionsEmulator` does not persist natively (Firebase iOS SDK requires chaining this method before other calls and does not modify the instance, Android however persists this)

## In-App Messaging (fiam) - **[NEW]**

- [NEW] Added support for `firebase.fiam().isMessagesDisplaySuppressed: boolean;`
- [NEW] Added support for `firebase.fiam().setMessagesDisplaySuppressed(enabled: boolean): Promise<null>;`
- [NEW] Added support for `firebase.fiam().isAutomaticDataCollectionEnabled: boolean;`
- [NEW] Added support for `firebase.fiam().setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null>;`

## Instance Id (iid)

- [NEW] Instance Id now supports multiple Firebase apps, e.g. `firebase.app('fooApp').iid().get()`

## Performance Monitoring (perf)

The Performance Monitoring API has had a significant API change as originally highlighted would happen in the v5.x.x docs:
![image](https://user-images.githubusercontent.com/5347038/58876674-b633b780-86c6-11e9-8a74-6b6194c8ab05.png)

- [BREAKING] All `Trace` & `HttpMetric` methods (except for `start` & `stop`) are now synchronous and no longer return a Promise, extra attributes/metrics now only get sent to native when you call `stop`
- [BREAKING] `firebase.perf.Trace.incrementMetric` will now create a metric if it could not be found
- [BREAKING] `firebase.perf.Trace.getMetric` will now return 0 if a metric could not be found
- [NEW] Added support for `firebase.perf().isPerformanceCollectionEnabled: boolean`
- [NEW] Added `firebase.perf().startTrace(identifier: string): Promise<Trace>;` as a convenience method to create and immediately start a Trace

## Remote Config (config)

The Remote Config API has had a significant API change as originally highlighted would happen in the v5.x.x docs:
![image](https://user-images.githubusercontent.com/5347038/58876587-7c62b100-86c6-11e9-81f9-95c26e1485a1.png)

- [BREAKING] All Remote Config values can now be accessed synchronously in JS, see `getValue(key: string): ConfigValue` & `getAll(): ConfigValues` below
  - [BREAKING] These replace all the original async methods: `getValue`, `getValues`, `getKeysByPrefix`
- [BREAKING] `setDefaultsFromResource` now returns a Promise that resolves when completed, this will reject with code `config/resouce_not_found` if the file could not be found
- [BREAKING] `setDefaultsFromResource` now expects a resource file name for Android to match iOS, formerly this required a resource id (something you would not have in RN as this was generated at build time by Android)
  - And example for both platforms can be found in the tests. We'll writeup up a guide for this at some point to show how to use the plist/xml defaults files on each platform.
- [BREAKING] `enableDeveloperMode` has been removed, you can now use `setConfigSettings({ isDeveloperModeEnabled: boolean })` instead
- [BREAKING] `setDefaults` now returns a Promise that resolves when completed
- [NEW] Added a new `fetchAndActivate` method - this fetches the config and activates it without the need to call `activate()` separately
- [NEW] Added the following properties to `firebase.config()`; `lastFetchTime`, `lastFetchStatus` & `isDeveloperModeEnabled`
- [NEW] Added a new `setConfigSettings` method - this allows setting `isDeveloperModeEnabled`, replaces the `enableDeveloperMode` method
  - This is a generic settings function to pre-emotively account for an upcoming future change to the native sdks - more settings to be added.
- [NEW] All previous `get*` methods have been removed and replaced with 2 synchronous methods:
  - `getValue(key: string): ConfigValue` - returns a single configuration value `{ value, source }`
  - `getAll(): ConfigValues` - returns all configuration values e.g. `{ some_key: { value, source }, other_key: { value, source } }`

> **Note**: Multi-apps is not yet supported as the Firebase iOS SDK is missing support for it.

## Cloud Storage (storage)

<!-- TODO(salakar) change link -->

> **Blog post announcement (NOT LIVE YET)**: [[Firebase Cloud Storage for React Native](https://invertase.io/blog?utm_source=github&utm_medium=changelog)]

- [NEW] Added support for `put` (`Blob` | `ArrayBuffer` | `Uint8Array`)
  - `contentType` mime type is automatically inferred from `Blob`
- [NEW] Added support for `putString` and all StringFormat's (raw, base64, base64url & data_url)
  - `contentType` mime type is automatically inferred from `data_url` strings
- [NEW] Added support multiple buckets, e.g. `firebase.app().storage('gs://my-other-bucket')`
- [NEW] Added support `pause()`, `resume()` & `cancel()` for Upload & Download Storage tasks
- [NEW] Added an `error` property to TaskSnapshot's for `error` state events - this is an instance of `NativeFirebaseError` (with `code` & `message`)
- [BREAKING] Removed formerly deprecated `UploadTaskSnapshot.downloadUrl` property, use `StorageReference.getDownloadURL(): Promise<string>` instead
- [BREAKING] `StorageReference.downloadFile()` is now deprecated and will be removed in a later release, please rename usages of this to `getFile()` - renamed to match Native SDKs
- [BREAKING] `firebase.storage.Native` is now deprecated and will be removed in a later release, please rename usages of this to `firebase.storage.Path`
- [BREAKING] `firebase.storage.Native.*` properties have been renamed and deprecated and will be removed in a later release, follow the in-app console warnings on how to migrate
- [BUGFIX][android] Update/set metadata now correctly supports removing metadata values by passing a null property value in `customMetadata`
- [BUGFIX][android] `contentType` mime type is now correctly determined in all scenarios, there was an edge case where it would just use the default value
- [INTERNAL][android] `downloadFile` no longer uses a `StreamDownloadTask`, replaced with the newer `FileDownloadTask`

## Messaging

**MODULE STILL WIP**

- [NEW] Support `setAutoInitEnabled(enabled: boolean)` - this is useful for opt-in first flows

## ML Kit Natural Language (mlKitLanguage) - **[NEW]**

- [NEW] Implemented support for language identification APIs

**Identify a single language:**

```js
const language = await firebase.mlKitLanguage().identifyLanguage('Hello there. General Kenobi.');
console.warn(language); // en

const unknownLanguage = await firebase
  .mlKitLanguage()
  .identifyLanguage('foo bar baz', { confidenceThreshold: 0.9 });
console.warn(language); // und
```

**Identify a multiple languages:**

```js
const identifiedLanguages = firebase.mlKitLanguage().identifyPossibleLanguages('hello world');
console.warn(identifiedLanguages[0].language); // en
```

- [NEW] Implemented support for [Smart Replies](https://firebase.google.com/docs/ml-kit/generate-smart-replies)
- [Example Video](https://twitter.com/mikediarmid/status/1128837402481635331)

```js
const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
conversation.addRemoteUserMessage('Hey, want to get lunch today?', Date.now(), 'jimBobTheGreat');
conversation.addLocalUserMessage('That sounds great!');
conversation.addRemoteUserMessage('Great, does 12pm work for you?', Date.now(), 'jimBobTheGreat');

const suggestedReplies = await conversation.getSuggestedReplies();
console.log(suggestedReplies); // [ { text: 'Sure' }, ...etc ]
```

> ML Kit Translate APIs to come in a later release.

## Realtime Database (database)

The Realtime Database module has had a large re-write, fixing various inconsistencies against the web SDK, along with improving data serialization on the native side by moving intensive work to separate threads. 

- [BREAKING][BUGFIX] The `Reference` class now extends a `Query` class (to match the web SDK). Currently in v5 everything is within the `Reference` class, allowing for incorrect behaviour such as chaining a reference only method to a query, e.g. `ref().orderByKey().once()`. This is now not possible and will cause a standard JavaScript error.
- [BREAKING][BUGFIX] Internal validation for all methods has now been added. With v5 in some cases, incorrect values would be passed to causing native exceptions and potential crashes if not handled.
- [BREAKING][BUGFIX] All query based modifiers are now validated as per the Web SDK spec. In v5 it is possible to chain queries which are not allowed together causing native errors (e.g. `.orderByKey().orderByPriority()`, `.startAt('foo', 'bar').orderByKey()` etc). Doing so in v6 will now throw an error to keep in-line with the Web SDK.
- [BREAKING][BUGFIX] `Reference.push` now correctly mimics the Web SDK, returning a thenable reference.
- [NEW] `DatabaseSnapshot.forEach` now returns the current index key.
- [NEW] Many methods were missing an `onComplete` handler, which is now implemented as per the Web SDK.
- [BUGFIX] `DatabaseSnapshot.forEach` correct iterates over "array" fields in the database.

## App Indexing (indexing) - **[NEW]**

Support for handling an incoming app index URL has been added to React Native Firebase.

- [NEW] Handle the app opening via an app indexing URL with `indexing().getInitialURL()`.
- [NEW] Setup a realtime event listener to handle app indexing URL opening whilst the app is active with `indexing().onOpenURL()`.

> Support for Android events will be integrated post-v6 release.

## Utils

- [NEW] Added support via `isRunningInTestLab` for checking if an Android application is running inside a Firebase Test Lab environment
