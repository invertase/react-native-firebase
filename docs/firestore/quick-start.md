---
title: Cloud Firestore Quick Start
description: Getting started with Cloud Firestore in React Native Firebase
---

# Cloud Firestore Quick Start

## Module usage

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the project's <Anchor version={false} group={false} href="/quick-start">quick start</Anchor> guide.

The Cloud Firestore module follows the same API as the [Web SDK](https://firebase.google.com/docs/reference/js/firebase.firestore), however takes advantage of the native SDKs. This provides advantages such as improved performance versus using the Web SDK, as all work is carried out natively in separate threads, preventing issues such as [jank](https://facebook.github.io/react-native/docs/performance#js-frame-rate-javascript-thread). The module also works in offline mode, using device storage.

Install this module with Yarn:

```bash
yarn add @react-native-firebase/firestore
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Reading data

Reading data from Firestore can be accomplished using the `get()` method. If reading a single *Document* a `DocumentSnapshot` will be returned:

```js
import firestore from '@react-native-firebase/firestore';

// Read the document for user 'Ada Lovelace':
const documentSnapshot = await firestore()
  .collection('users')
  .doc('alovelace')
  .get();

console.log('User data', documentSnapshot.data());
```

If reading a *Collection* of data  a `QuerySnapshot` class will be returned:

```js
import firestore from '@react-native-firebase/firestore';

// Read the users documents
const querySnapshot = await firestore()
  .collection('users')
  .get();

console.log('Total users', querySnapshot.size);
console.log('User Documents', querySnapshot.docs);
```

It is also possible to subscribe to real time updates, whenever a Collection or Document is added, modified or removed, using the `onSnapshot()` method. This method also returns an unsubscriber function which can later be called to stop receiving updates:

```js
import firestore from '@react-native-firebase/firestore';

// Subscribe to user updates:
const unsubscribe = firestore()
  .collection('users')
  .onSnapshot((querySnapshot) => {
    console.log('Total users', querySnapshot.size);
    console.log('User Documents', querySnapshot.docs);
  });

// Sometime later...
unsubscribe();
```

## Offline capabilities

Firestore provides out of the box support for offline capabilities. When reading and writing data, Firestore uses a local database which synchronises automatically with the server. Firestore functionality continues when users are offline, and automatically handles data migration to the server when they regain connectivity.

This functionality is enabled by default, however it can be disabled if you need it to be disabled (e.g. on apps containing sensitive information). The `settings()` method must be called before any Firestore interaction is performed, otherwise it will only take effect on the next app launch:

```js
import firestore from '@react-native-firebase/firestore';

function bootstrap() {
  await firestore().settings({
    persistence: false, // disable offline persistence
  });
}
```

By default, Firestore stores up to 10MB of data in the local database. If the size grows beyond this, Firestore will start removing data that hasn't been used recently. If you wish to modify this value, you can pass a bytes value to settings, or set the size to unlimited:

```js
import firestore from '@react-native-firebase/firestore';

function bootstrap() {
  await firestore().settings({
    cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED, // unlimited cache size
  });
}
```

## Reacts lifecycle

All queries using Firestore are asynchronous. When reading data on your application, it is best to provide the user with a user experience which indicates that the data is being fetched - especially on slower network connections. To accomplish this, we can make use of [hooks](https://reactjs.org/docs/hooks-intro.html):

```jsx
import React, { useState, useEffect } from 'react';
import { FlatList, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore';

function Users() {
  const [users, setUsers] = useState([]); // Initial empty array of users
  const [loading, setLoading] useState(true); // Set loading to true on component mount

  // On load, fetch our users and subscribe to updates
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .onSnapshot((querySnapshot) => {
        // Add users into an array
        const users = querySnapshot.docs.map((documentSnapshot) => {
          return {
            ...documentSnapshot.data(),
            key: documentSnapshot.id, // required for FlatList
          };
        });

        // Update state with the users array
        setUsers(users);

        // As this can trigger multiple times, only update loading after the first update
        if (loading) {
          setLoading(false);
        }
      });

      return () => unsubscribe(); // Stop listening for updates whenever the component unmounts
  }, []);

  if (loading) {
    return null; // Show a loading spinner
  }

  return (
    <FlatList
      data={users}
      renderItem={({item}) => <Text>{item.key}</Text>}
    />
  );
}
```
