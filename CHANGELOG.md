# v6.0.0

WIP

## All Modules

- Improved error codes & handling for all Firebase services;
  - Standardised native error to JS conversion
  - Native promise rejection errors now contain additional properties to aid debugging
- All native events are now queued natively until a JS listener is registered. This fixes several race conditions for events like `onMessage`, `onNotification`, `onLink` etc where the event would trigger before JS was ready.

## App

- [NEW] Added `appConfig` & method support for `setAutomaticDataCollectionEnabled` & `automaticResourceManagement`
- [NEW] Added app `options` support for `gaTrackingId`
- [NEW] The `[DEFAULT]` Firebase app can now be safely initialised in JS, however this has some caveats;
  - Firebase services such as Performance Monitoring & Remote Config require the default app to be initialised through the plist/json file.
- [BREAKING] Waiting for apps to init via `.onReady()` has been removed. `initializeApp()` now returns a promise to the same effect
- [BREAKING] Trying to initialise the `[DEFAULT]` Firebase app in JS when it was already initialised natively will now throw an error (formerly warned)

## Analytics

- [NEW] Added support for `resetAnalyticsData()` - this is useful for opt-in first analytics/data collection flows
- `setUserProperties` now iterates properties natively (formerly 1 native call per property)

## Functions

- Fixed an issue where `useFunctionsEmulator` does not persist natively (Firebase Native SDKs require chaining this method before other calls and does not modify the instance)

## Instance Id (iid)

- [NEW] Instance Id now supports multiple Firebase apps, e.g. `firebase.app('fooApp').iid().get()`

## Messaging 

- [NEW] Support `setAutoInitEnabled(enabled: boolean)` - this is useful for opt-in first flows
