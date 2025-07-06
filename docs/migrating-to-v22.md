---
title: Migrating to v22
description: Migrate to React Native Firebase v22.
previous: /
next: /typescript
---

# Switching off warning logs

You may notice a lot of console warning logs as we deprecate the existing namespaced API. If you would like to switch these logs off, you may set the following global property to `true` anywhere before you initialize Firebase.

```js
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
```

# Enabling deprecation strict modes

You may enable a feature for the API migration which will throw a javascript error immediately when any namespaced API usage is detected.

This is useful to help you quickly locate any remaining usage of the deprecated namespace API via examination of the line numbers in the stack trace.

Note that there may be modular API implementation errors within the react-native-firebase modules, this may still be useful as a troubleshooting aid when collaborating with the maintainers to correct these errors.

```js
globalThis.RNFB_MODULAR_DEPRECATION_STRICT_MODE = true;
```

# Migrating to React Native modular API

If you are familiar with the Firebase JS SDK, the upgrade will be a familiar process, following similar steps to [the migration guide](https://firebase.google.com/docs/web/modular-upgrade#refactor_to_the_modular_style) for firebase-js-sdk.

React Native Firebase uses the same API as the official [Firebase JS SDK modular API documentation](https://firebase.google.com/docs/reference/js) so the same migration steps apply here, except there is no need for special "compat" imports as an intermediate step.

The process will always follow the same steps for every API you use:

- determine the new modular API function for the old namespaced API you are using
- import that new modular API function
- change the call from using the firebase module to access the API and passing parameters, to the new style of using the modular API function, passing in the firebase module object(s) required for it to work and then the parameters.

In the end, it should be a very mechanical process and can be done incrementally, one API call at a time.

There are concrete examples below to show the process

## Firestore Deprecation Example

### Namespaced (deprecated) Query

You ought to move away from the following way of making Firestore queries. The React Native Firebase namespaced API is being completely removed in React Native Firebase v22:

```js
import firestore from '@react-native-firebase/firestore';

const db = firestore();

const querySnapshot = await db.collection('cities').where('capital', '==', true).get();

querySnapshot.forEach(doc => {
  console.log(doc.id, ' => ', doc.data());
});
```

### Modular Query

This is how the same query would look using the new, React Native Firebase modular API:

```js
import { collection, query, where, getDocs, getFirestore } from '@react-native-firebase/firestore';

const db = getFirestore();

const q = query(collection(db, 'cities'), where('capital', '==', true));

const querySnapshot = await getDocs(q);

querySnapshot.forEach(doc => {
  console.log(doc.id, ' => ', doc.data());
});
```

For more examples of requesting Firestore data, see the official Firebase documentation for [Get data with Cloud Firestore](https://firebase.google.com/docs/firestore/query-data/get-data).

### Migration Help

You will find code snippets for "Web namespaced API" and "Web modular API" throughout the official Firebase documentation. Update your code to use "Web modular API". Here are some links to help you get started:

- [Firestore](https://firebase.google.com/docs/firestore/quickstart)
- [Auth](https://firebase.google.com/docs/auth/web/start)
- [RTDB](https://firebase.google.com/docs/database/web/start)
- [Storage](https://firebase.google.com/docs/storage/web/start)
- [Remote Config](https://firebase.google.com/docs/remote-config/get-started?platform=web)
- [Messaging](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Functions](https://firebase.google.com/docs/functions/callable)
- [App Check](https://firebase.google.com/docs/app-check/web/recaptcha-provider)
- [Analytics](https://firebase.google.com/docs/analytics/get-started)
- [Perf](https://firebase.google.com/docs/perf-mon/get-started-web)
- [Crashlytics](https://github.com/invertase/react-native-firebase/blob/main/packages/crashlytics/lib/modular/index.d.ts) (Crashlytics doesn't exist on Firebase web, this is a link to the type declarations which contains all methods available).
