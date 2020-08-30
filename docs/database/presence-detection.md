---
title: Presence Detection
description: Show a realtime list of online users with Realtime Database.
next: /dynamic-links/usage
previous: /database/offline-support
---

Realtime Database provides the ability to trigger events on the Firebase servers whenever a device is disconnected. This
could be whenever a user has no access to a network or when they quit the app.

One use-case using this functionality is to build a simple presence detection system, whereby we can hold a realtime list
of users currently online within our application. This could be useful when building a chat application
and you wish to view which of your users are currently online.

# Setup

To get started, we first need a location to store our online users.

To keep things simple we'll assume the user is authenticated (e.g. with [Firebase Authentication](/auth)) so we can use their unique user identifier.

Whenever the application opens, [write a new value](/database/usage#writing-data) on a reference node (e.g. `/online/:userId`):

```jsx
import React, { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

function App() {
  useEffect(() => {
    // Assuming user is logged in
    const userId = auth().currentUser.uid;

    const reference = database().ref(`/online/${userId}`);

    // Set the /users/:userId value to true
    reference.set(true).then(() => console.log('Online presence set'));
  }, []);
}
```

Whenever the application boots and can connect to the remote server, the value will be written to the database indicating the user is online.

# On Disconnect

Next we need to remove the value when our user disconnects. Typically you would execute this functionality from the device
itself, however this presents a problem.

If the device suddenly goes offline, or is quit, the app can no longer execute code or connect to Firebase. Luckily, the
Realtime Database API provides a way to execute code on the Firebase servers whenever the connection between an app & server
is lost.

The `onDisconnect` method on a reference returns a new [`OnDisconnect`](/reference/database/ondisconnect) instance. This instance
provides functionality to remove or set data whenever a client disconnects. Using the
[`remove`](/reference/database/ondisconnect#remove) method we can remove the node on the database if the client disconnects:

```jsx
import React, { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

function App() {
  useEffect(() => {
    // Assuming user is logged in
    const userId = auth().currentUser.uid;

    const reference = database().ref(`/online/${userId}`);

    // Set the /users/:userId value to true
    reference.set(true).then(() => console.log('Online presence set'));

    // Remove the node whenever the client disconnects
    reference
      .onDisconnect()
      .remove()
      .then(() => console.log('On disconnect function configured.'));
  }, []);
}
```

The above code demonstrates a very simple but powerful way to track which users are currently online.
