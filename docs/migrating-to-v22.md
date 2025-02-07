---
title: Migrating to v22
description: Migrate to React Native Firebase v22.
previous: /
next: /typescript
---

# Switching off warning logs

You may notice an influx of console warning logs as we continue deprecating all existing namespaced API. If you would like to switch these logs off, you may set the following global property to `true` anywhere before you initialize Firebase.

```js
globalThis.RNFB_SILENCE_V8_DEPRECATION_WARNINGS = true;
```

# Migrating to React Native modular API

React Native Firebase does not currently have documentation for modular API. A refresh of the React Native Firebase documentation is something we will be aiming to achieve in the near future. We're keen to move the project to TypeScript which will then allow us to generate reference documentation from those types.

However, if you are familiar with the Firebase JS SDK, it will be a much smoother process. React Native Firebase is using the same API as can be found on the official [Firebase JS SDK modular API documentation](https://firebase.google.com/docs/reference/js).

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
