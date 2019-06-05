---
title: Quick Start
description: Get to grips with the basics of Realtime Database in React Native Firebase
---

# Realtime Database Quick Start

## Installation

Install this module with Yarn:

```bash
yarn add @react-native-firebase/database@alpha
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Once installed, import the Cloud Functions package into your project:

```js
import database from '@react-native-firebase/database';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/database';
```

### Read and Write Data

To read data from the database, a `Reference` to the record is created, then data can be asynchronously fetched via the
`once` method:

```js
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

async function onSignIn() {
  // Get the users ID
  const uid = auth().currentUser.uid;
  
  // Create a reference
  const ref = database().ref(`/users/${uid}`);
  
  // Fetch the data snapshot
  const snapshot = await ref.once('value');
  
  console.log('User data: ', snapshot.val());
}
``` 

To write data to the database, the created `Reference` exposes the `set` method which overwrites the data at the given
data reference:

```js
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

async function onCreateAccount() {
  // Get the users ID
  const uid = auth().currentUser.uid;
  
  // Create a reference
  const ref = database().ref(`/users/${uid}`);
  
  await ref.set({
    uid,
    name: 'Joe Bloggs',
    role: 'admin',
  });
}
``` 

### Realtime Data Sync

Updating your app or UI in realtime as data changes on the database makes building realtime apps such as chat applications
a lot simpler. References creates expose an `on` method, which allows subscriptions to various realtime events such as
data changing, being added, being removed or moved to another location.

```jsx
import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import database from '@react-native-firebase/database';

function Role({ uid }) {
  const [initilizing, setInitilizing] = useState(true);
  const [role, setRole] = useState(null);
  
  // Subscriber handler
  function onRoleChange(snapshot) {
    // Set the role from the snapshot
    setRole(snapshot.val());
    
    // Connection established
    if (initilizing) setInitilizing(false);
  }
  
  useEffect(() => {
    // Create reference
    const ref = database().ref(`/users/${uid}/role`);
    
    // Subscribe to value changes
    ref(`/users/${uid}/role`).on('value', onRoleChange);
    
    // Unsubscribe from changes on unmount
    return () => ref.off('value', onRoleChange);
  }, [uid]);
  
  // Wait for first connection
  if (initilizing) return null;
  
  return <Text>{role}</Text>;
}
```

### FlatList and lists of data

In applications it is common to list repeating data rather than a single value, for example listing a scrollable view of 
games which the user can select and navigate to. If a snapshot value is an array, the snapshot provides `forEach` method
to ensure the data can be displayed in-order as it appears on the database, as the standard `val` method does not 
guarantee order. 

Combining the result with a React Native [`FlatList`](https://facebook.github.io/react-native/docs/flatlist) makes creating
a performant, scrollable list simple:

```jsx
import React, { useState, useEffect } from 'react';
import { Text, FlatList } from 'react-native';
import database from '@react-native-firebase/database';

function Games() {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);

  // Handle snapshot response
  function onSnapshot(snapshot) {
    const list = [];
    
    // Create our own array of games in order
    snapshot.forEach((game) => {
      list.push({
        key: game.id, // Add custom key for FlatList usage
        ...game,
      });
    });
    
    setGames(list);
    setLoading(false);
  }

  useEffect(() => {
    // Create reference
    const ref = database().ref(`/games`);
    ref.once('value', onSnapshot);
  }, [uid]);
  
  if (loading) {
    return <Text>Loading games...</Text>;
  }
  
  return (
    <FlatList
      data={games}
      renderItem={({item}) => <Text>{item.name}</Text>}
    />
  );
}
```

### Enable Offline Capabilities

*TODO* @salakar
