---
title: Platforms
description: Learn the platforms React Native Firebase SDK supports.
next: /release-notes
---

## Status

By default React Native Firebase supports multiple platforms using the native Firebase SDK's:

- Android
- iOS

However, for platforms that we don't provide a Native Module for, React Native Firebase instead implements a fallback Firebase JS SDK implementation to support
these 'Other' platforms, e.g.;

- Web
- macOS
- Windows
- ...and any other RN based environment.

Below is a table outlining which Firebase modules are supported on each platform in React Native Firebase:

| Firebase Service | Android | iOS | Other |
| ---------------- | :-----: | :-: | :---: |
| analytics        |   🟢    | 🟢  |  🟢   |
| app-check        |   🟢    | 🟠  |  🟠   |
| app-distribution |   🟢    | 🟢  |  🔴   |
| app              |   🟢    | 🟢  |  🟢   |
| auth             |   🟢    | 🟢  |  🟠   |
| crashlytics      |   🟢    | 🟢  |  🔴   |
| database         |   🟢    | 🟢  |  🟢   |
| dynamic-links    |   🟢    | 🟢  |  🔴   |
| firestore        |   🟢    | 🟢  |  🟠   |
| functions        |   🟢    | 🟢  |  🟢   |
| in-app-messaging |   🟢    | 🟢  |  🔴   |
| installations    |   🟢    | 🟢  |  🔴   |
| messaging        |   🟢    | 🟢  |  🔴   |
| ml               |   🟢    | 🟢  |  🔴   |
| perf             |   🟢    | 🟢  |  🔴   |
| remote-config    |   🟢    | 🟢  |  🟢   |
| storage          |   🟢    | 🟢  |  🟠   |

- 🟢 (supported)
- 🟠 (partial support) - see notes below
- 🔴 (not supported)

## Other Platforms

Whenever the React Native Firebase SDK is running on platforms other than Android or iOS, the internal implementation uses a fallback platform which is implemented in JavaScript, using the [Firebase JavaScript Modular SDK](https://firebase.google.com/docs/reference/js).

No implementation changes are required to use the React Native Firebase SDK on other platforms, as the JavaScript implementation is automatically used when a native platform is not available. This allows you to use the same API across all platforms, regardless of the underlying implementation.

### Module Support

There are some minor limitations or differences in behavior compared to the native platforms. Where a particular method is not supported, an error will be thrown with a code of `unsupported` to indicate the method is not available on the current platform.

Details of these limitations are summarized below.

#### Analytics

The other platform implementation of Analytics does not capture automatic metrics like screen view, you must call `logEvent` and other logging based methods to send your events to Firebase.

- [Screen Tracking Guide](/analytics/screen-tracking)

#### App Check

App Check for other platforms only supports the `CustomProvider` provider. Here's how to setup your own custom provider:

- [Implement server suport to get tokens](https://firebase.google.com/docs/app-check/custom-provider)
- Create a custom provider in your app:

```js
import firebase, { CustomProvider, initializeAppCheck } from '@react-native-firebase/app-check';

const myCustomProvider = new CustomProvider({
  async getToken: () => {
    // TODO: Get the token from your server, e.g. if using a cloud function call the function.
    const tokenFromServer = 'some-token-from-server';
    const expirationFromServer = 1000 * 60 * 60; // 1 hour
    const appCheckToken = {
      token: tokenFromServer,
      expireTimeMillis: expirationFromServer * 1000
    };
    return appCheckToken;
  }
});

// Configure the provider (modular API)
initializeAppCheck(firebaseApp, {
  provider: myCustomProvider
});

// Or configure the provider (v8 API)
firebase.appCheck().initializeAppCheck({ provider: myCustomProvider });
```

#### Authentication

Multi-factor authentication is not supported on other platforms.

Phone authentication methods are unsupported, specifically:

- `signInWithProvider`
- `signInWithPhoneNumber`
- `verifyPhoneNumberForMultiFactor`
- `confirmationResultConfirm`
- `verifyPhoneNumber`
- `reauthenticateWithProvider`

#### Database

Offline persistence is not supported on other platforms.

Unsupported methods:

- `keepSynced` - for offline persistence

#### Firestore

For performance reasons and to reduce the size of the JavaScript bundle, the Other platform implementation in
React Native Firebase uses the JavaScript [lite](https://firebase.google.com/docs/reference/js/firestore_lite) SDK,
which does not support methods related to offline & persistence.

Specifically, the following methods are not supported:

- `loadBundle`
- `clearPersistence` - for offline persistence
- `disableNetwork` - for offline persistence
- `enableNetwork` - for offline persistence
- `namedQuery`
- `onSnapshot` (for both `CollectionReference` & `DocumentReference`)
- `GetOptions.source`

#### Storage

No-op methods:

- `setMaxDownloadRetryTime` (does not throw, but has no effect)

Unsupported methods:

- `writeToFile`
- `putFile`
