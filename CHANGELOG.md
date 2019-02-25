# v6.0.0

WIP

## All Modules

- [INTERNAL] Improved error codes & handling for all Firebase services;
  - Standardised native error to JS conversion
  - [DEVEX] Native promise rejection errors now contain additional properties to aid debugging
- [BUGFIX] All native events are now queued natively until a JS listener is registered. This fixes several race conditions for events like `onMessage`, `onNotification`, `onLink` etc where the event would trigger before JS was ready.

## App <a href="https://api.rnfirebase.io/coverage/app/detail"><img src="https://api.rnfirebase.io/coverage/app/badge?style=flat-square" alt="Coverage"></a>

- [NEW] Added `appConfig` & method support for `setAutomaticDataCollectionEnabled` & `automaticResourceManagement`
- [NEW] Added app `options` support for `gaTrackingId`
- [NEW] The `[DEFAULT]` Firebase app can now be safely initialised in JS, however this has some caveats;
  - Firebase services such as Performance Monitoring & Remote Config require the default app to be initialised through the plist/json file.
- [BREAKING] Waiting for apps to init via `.onReady()` has been removed. `initializeApp()` now returns a promise to the same effect
- [BREAKING] Trying to initialise the `[DEFAULT]` Firebase app in JS when it was already initialised natively will now throw an error (formerly warned)

## Analytics <a href="https://api.rnfirebase.io/coverage/analytics/detail"><img src="https://api.rnfirebase.io/coverage/analytics/badge?style=flat-square" alt="Coverage"></a>

- [NEW] Added support for `resetAnalyticsData()` - this is useful for opt-in first analytics/data collection flows
- [INTERNAL] `setUserProperties` now iterates properties natively (formerly 1 native call per property)
- [BREAKING] all analytics methods now return a Promise, rather than formerly being 'fire and forget'

## Functions <a href="https://api.rnfirebase.io/coverage/functions/detail"><img src="https://api.rnfirebase.io/coverage/functions/badge?style=flat-square" alt="Coverage"></a>

- [BUGFIX] Fixed an issue where `useFunctionsEmulator` does not persist natively (Firebase iOS SDK requires chaining this method before other calls and does not modify the instance, Android however persists this)

## Instance Id (iid) <a href="https://api.rnfirebase.io/coverage/iid/detail"><img src="https://api.rnfirebase.io/coverage/iid/badge?style=flat-square" alt="Coverage"></a>

- [NEW] Instance Id now supports multiple Firebase apps, e.g. `firebase.app('fooApp').iid().get()`

## Performance Monitoring (perf) <a href="https://api.rnfirebase.io/coverage/perf/detail"><img src="https://api.rnfirebase.io/coverage/perf/badge?style=flat-square" alt="Coverage"></a>

- [BREAKING] All `Trace` & `HttpMetric` methods (except for `start` & `stop`) are now synchronous and no longer return a Promise, extra attributes/metrics now only get sent to native when you call `stop`
- [BREAKING] `firebase.perf.Trace.incrementMetric` will now create a metric if it could not be found
- [BREAKING] `firebase.perf.Trace.getMetric` will now return 0 if a metric could not be found
- [NEW] Added support for `firebase.perf().isPerformanceCollectionEnabled: boolean`
- [NEW] Added support for `firebase.perf.Trace.removeMetric(metricName: string)`
- [NEW] Added support for `firebase.perf.Trace.getMetrics(): { [key: string]: number }`

## Messaging 

- [NEW] Support `setAutoInitEnabled(enabled: boolean)` - this is useful for opt-in first flows

## Utils <a href="https://api.rnfirebase.io/coverage/utils/detail"><img src="https://api.rnfirebase.io/coverage/utils/badge?style=flat-square" alt="Coverage"></a>

- [NEW] Added support via `isRunningInTestLab` for checking if an Android application is running inside a Firebase Test Lab environment
