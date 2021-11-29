---
title: Offline Support
description: Working with the Realtime Data in offline environments.
next: /database/presence-detection
previous: /database/usage
---

The Realtime Database provides support for offline environments. By default, data will be stored locally on your device
and automatically managed by the Firebase SDKs.

# Enabling Persistence

Persistence is disabled by default when using Realtime Database, however it
[can be changed to be enabled by default in the firebase.json](/database/usage#enabling-persistence). You can also enable persistence programmatically, by calling the `setPersistenceEnabled`
as early on in your application code as possible:

```js
// index.js
import { AppRegistry } from 'react-native';
import database from '@react-native-firebase/database';

database().setPersistenceEnabled(true);

AppRegistry.registerComponent('app', () => App);
```

# Going offline

The API provides a `goOffline` method to force the Realtime Database SDK to go offline, which can be useful for testing.

```js
import database from '@react-native-firebase/database';

await database().goOffline();
```

Once offline, all operations will continue to execute, instead using a local instance of your database to perform writes to.
For example, we write to a record which has a listener whilst offline allowing the listener to be called with the updated data:

```jsx
import React, { useEffect } from 'react';
import database from '@react-native-firebase/database';

function App() {
  useEffect(() => {
    const userAgeRef = database().ref('/users/123/age');

    userAgeRef.on('value', snapshot => {
      console.log('Users age: ', snapshot.val());
    });

    database()
      .goOffline()
      .then(() => {
        return userRef.set(32);
      })
      .then(() => {
        console.log('User updated whilst offline.');
      });
  }, []);
}
```

The above code will first execute the `on` listener with data from the remote database.

Once offline, the `set` method on the reference node will `locally` be set to a new value.

The `on` listener
however will now subscribe to the local database and provide the new value.

This provides the ability to write code which works in both an online and offline environment without worrying about
data synchronization.

# Going online

The `goOnline` method re-connects the Realtime Database with the remote database. Any locally written changes performed
whilst offline will be automatically synchronized with the remote database.

```js
import database from '@react-native-firebase/database';

await database().goOnline();
```

# Local persistence size

By default Firebase Database will use up to `10MB` of disk space to cache data. If the cache grows beyond this size,
Firebase Database will start removing data that hasn't been recently used. If you find that your application caches too
little or too much data, call the `setPersistenceCacheSizeBytes` method to update the default cache size:

```js
import database from '@react-native-firebase/database';

database().setPersistenceCacheSizeBytes(2000000); // 2MB
```
