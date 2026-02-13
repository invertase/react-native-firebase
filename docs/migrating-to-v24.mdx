---
title: Migrating to v24
description: Migrate to React Native Firebase v24.
previous: /migrate-to-v23
---

# Firestore

Version 24 introduces `withConverter` functionality from Firebase JS SDK. Due to the differences in types between references and queries in namespace vs modular API, and the namespaced APIs deprecation cycle being effectively complete with the API set for removal, we have adopted the modular API typing in general for firestore APIs.

Reference and query types have been updated to support input of two generic types (`AppModelType`, `DbModelType`).

Additionally, to match the JS SDK, they are now exported separately at the root, instead of through `FirebaseFirestoreTypes`.

Most commonly these types will be affected: `CollectionReference`, `DocumentReference`, `DocumentSnapshot`, `QueryDocumentSnapshot`, `QuerySnapshot`, `Query`.

```js
// Previously
import { doc, getFirestore, onSnapshot, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

onSnapshot(doc(getFirestore(), 'foo', 'foo'), {
  next: (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
    console.log(snapshot.get('foo'));
  },
});
```

```js
// Now
import { doc, getFirestore, onSnapshot, DocumentSnapshot } from '@react-native-firebase/firestore';

onSnapshot(doc(getFirestore(), 'foo', 'foo'), {
  next: (snapshot: DocumentSnapshot) => {
    console.log(snapshot.get('foo'));
  },
});
```
