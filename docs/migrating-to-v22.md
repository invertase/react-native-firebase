---
title: Migrating to v22
description: Migrate to React Native Firebase v22
previous: /
next: /typescript
---

# Switching off warning logs

You may notice an influx of console warning logs as we continue deprecating all existing namespaced API. If you would like to switch these logs off, you may set the following global property to `true` anywhere before you initialise Firebase.

```js
globalThis.RNFB_SILENCE_V8_DEPRECATION_WARNINGS = true;
```

# Migrating to React Native modular API

React Native Firebase does not currently have documentation for  modular API. A refresh of the React Native Firebase documentation is something we will be aiming to achieve in the near future. We're keen to move the project to TypeScript which will then allow us to generate reference documentation from those types.

However, if you are familiar with the Firebase JS SDK, it will be a much smoother process. React Native Firebase is using the same API as can be found on the official [Firebase JS SDK modular API documentation](https://firebase.google.com/docs/reference/js).

## Firestore example

## deprecated namespaced Query

```js
import firestore from '@react-native-firebase/firestore';

const db = firestore();

const querySnapshot = await db.collection("cities").where("capital", "==", true).get();

querySnapshot.forEach((doc) => {
  console.log(doc.id, " => ", doc.data());
});
```

## modular Query

```js
import { collection, query, where, getDocs, getFirestore } from "@react-native-firebase/firestore";

const db = getFirestore();

const q = query(collection(db, "cities"), where("capital", "==", true));

const querySnapshot = await getDocs(q);

querySnapshot.forEach((doc) => {
  console.log(doc.id, " => ", doc.data());
});
```

For more examples of requesting data, see the official Firebase documentation for [Get data with Cloud Firestore](https://firebase.google.com/docs/firestore/query-data/get-data). You will find code snippets for "Web namespaced API" and "Web modular API". You can find code snippets for both namespaced API and modular API through out the Firebase web documentation.
