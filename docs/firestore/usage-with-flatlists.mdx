---
title: Usage with FlatLists
description: Using Cloud Firestore collections with FlatLists.
next: /firestore/pagination
previous: /firestore/emulator
---

Cloud Firestore provides out of the box support for subscribing to [realtime changes](/firestore/usage#realtime-changes)
on a collection of documents. Whilst building apps with Cloud Firestore, you can easily display lists of a collections
documents using a [`FlatList`](https://reactnative.dev/docs/flatlist.html).

A `FlatList` accepts an array of data, and displays the results in a performance friendly scrollable list. By integrating
a realtime listener with the `FlatList`, whenever data changes without our database it'll automatically and efficiently update
on our application.

# Setup state

First, setup a component which will display the list of data. The component will have 2 separate states; `loading` and
`users`:

```jsx
import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';

function Users() {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [users, setUsers] = useState([]); // Initial empty array of users

  if (loading) {
    return <ActivityIndicator />;
  }

  // ...
}
```

# `useEffect` hook

Next, we'll setup a hook with `useEffect`. This hook will trigger when our components mount, and we'll then subscribe to
the "Users" collection documents:

```jsx
import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';

function Users() {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [users, setUsers] = useState([]); // Initial empty array of users

  useEffect(() => {
    const subscriber = firestore()
      .collection('Users')
      .onSnapshot(() => {
        // see next step
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  // ...
}
```

# Transforming data

With our event handler setup, we can now iterate over the collection documents. Whilst iterating, we need to create an
array of data a `FlatList` accepts. At a minimum, this is an object with a unique `key` property. For this unique property,
we can use the `id` of a document:

```js
useEffect(() => {
  const subscriber = firestore()
    .collection('Users')
    .onSnapshot(querySnapshot => {
      const users = [];

      querySnapshot.forEach(documentSnapshot => {
        users.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id,
        });
      });

      setUsers(users);
      setLoading(false);
    });

  // Unsubscribe from events when no longer in use
  return () => subscriber();
}, []);
```

Once the initial set of documents is returned, we update the `users` state with our raw object data and set the `loading`
state to `false`. We can now

# Integration

With the raw user data in local state, we can now pass this to the `FlatList`:

```jsx
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, FlatList, View, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore';

function Users() {
  // ...

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => (
        <View style={{ height: 50, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>User ID: {item.id}</Text>
          <Text>User Name: {item.name}</Text>
        </View>
      )}
    />
  );
}
```

With little effort, our list will automatically update in realtime whenever a document is added/removed/modified!
This functionality can be further manipulated to respond to user filters via [Querying](/firestore/usage#querying) if required.
