---
title: Other Platforms
description: Learn how to use the React Natice Firebase SDK on other platforms.
next: /release-notes
---

React Native Firebase supports multiple platforms:

- Android
- iOS
- Other (e.g. web)

## Other Platforms

Whenever the React Native Firebase SDK is running on platforms other than Android or iOS, the internal implementation uses a fallback platform which is implemented in JavaScript, using the [Firebase JavaScript Modular SDK](https://firebase.google.com/docs/reference/js).

No implementation changes are required to use the React Native Firebase SDK on other platforms, as the JavaScript implementation is automatically used when a native platform is not available. This allows you to use the same API across all platforms, regardless of the underlying implementation.

Below is a matrix table of the current status of each module on other platforms:

- 🟢 (implemented)
- 🔴 (not implemented)

| Module | Status |
|-----------|:------:|
| analytics | 🟢 |
| app-check | 🟢 |
| app-distribution | 🔴 |
| app | 🟢 |
| auth | 🟢 |
| crashlytics | 🔴 |
| database | 🟢 |
| dynamic-links | 🔴 |
| firestore | 🟢 |
| functions | 🟢 |
| in-app-messaging | 🔴 |
| installations | 🔴 |
| messaging | 🔴 |
| ml | 🔴 |
| perf | 🔴 |
| remote-config | 🟢 |
| storage | 🟢 |

### Module Support

Please note that even though a module may be marked as implemented, there may be limitations or differences in behavior compared to the native platform. Where a particular method is not supported, an error will be thrown with a code of `unsupported` to indicate the method is not available on the current platform.

#### App Check

TODO

#### Authentication

Multi-factor authentication is not supported on other platforms.

Unsupported methods:

- `signInWithProvider`
- `signInWithPhoneNumber`
- `verifyPhoneNumberForMultiFactor`
- `confirmationResultConfirm`
- `verifyPhoneNumber`
- `reauthenticateWithProvider`

#### Database

Offline persistence is not supported on other platforms.

Unsupported methods:

- `keepSynced`

#### Firestore

Firestore uses the JavaScript [lite](https://firebase.google.com/docs/reference/js/firestore_lite) SDK, thus some features may not be available.

Unsupported methods:

- `loadBundle`
- `clearPersistence`
- `disableNetwork`
- `enableNetwork`
- `namedQuery`
- `onSnapshot` (both CollectionReference & DocumentReference)
- `GetOptions.source` (explicially setting the source to `cache`)

#### Storage

No-op methods:

- `setMaxDownloadRetryTime` (does not throw, but has no effect)

Unsupported methods:

- `writeToFile`
- `putFile`