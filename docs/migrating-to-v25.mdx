---
title: Migrating to v25
description: Migrate to React Native Firebase v25.
previous: /migrating-to-v24
next: /typescript
---

# App Check

Version 25 aligns App Check's modular exports more closely with the Firebase JS SDK. If your app uses the modular API, import App Check types and helpers directly from `@react-native-firebase/app-check` instead of routing modular code through `FirebaseAppCheckTypes`.

The most common updates are:

- Import modular helpers such as `initializeAppCheck`, `getToken`, `getLimitedUseToken`, `setTokenAutoRefreshEnabled`, and `onTokenChanged` from the package root.
- Import modular types such as `AppCheck` and `AppCheckTokenResult` from the package root.
- Keep using `ReactNativeFirebaseAppCheckProvider` on React Native when you need native provider selection for Android / Apple / web.

```js
// Previously
import appCheck, { FirebaseAppCheckTypes } from '@react-native-firebase/app-check';

const instance = appCheck();

instance.getToken().then((result: FirebaseAppCheckTypes.AppCheckTokenResult) => {
  console.log(result.token);
});
```

```js
// Now
import { getApp } from '@react-native-firebase/app';
import {
  AppCheckTokenResult,
  ReactNativeFirebaseAppCheckProvider,
  initializeAppCheck,
  getToken,
} from '@react-native-firebase/app-check';

const provider = new ReactNativeFirebaseAppCheckProvider();

provider.configure({
  android: {
    provider: __DEV__ ? 'debug' : 'playIntegrity',
  },
  apple: {
    provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
  },
  web: {
    provider: 'reCaptchaV3',
    siteKey: 'your-recaptcha-site-key',
  },
});

const appCheck = await initializeAppCheck(getApp(), {
  provider,
  isTokenAutoRefreshEnabled: true,
});

const result: AppCheckTokenResult = await getToken(appCheck);
console.log(result.token);
```

If you do not need to reuse a provider instance, you can now also pass the React Native provider configuration inline through `providerOptions`:

```js
import { getApp } from '@react-native-firebase/app';
import { initializeAppCheck } from '@react-native-firebase/app-check';

await initializeAppCheck(getApp(), {
  provider: {
    providerOptions: {
      android: {
        provider: __DEV__ ? 'debug' : 'playIntegrity',
      },
      apple: {
        provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
      },
      web: {
        provider: 'reCaptchaV3',
        siteKey: 'your-recaptcha-site-key',
      },
    },
  },
  isTokenAutoRefreshEnabled: true,
});
```
