---
title: Authentication Quick Start
description: Getting started with Authentication in React Native Firebase
---

# Auth Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the projects [quick start](/quick-start) guide.

Install this module with Yarn:

```bash
yarn add @react-native-firebase/auth
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

The Authentication package provides a JavaScript API which mimics the Firebase Web SDK.

Import the Analytics package into your project:

```js
import auth from '@react-native-firebase/auth';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/auth';
```

### Subscribe to auth state changes

Whenever a user performs an actions with your application, such as sign-in or signs-out, it is possible to subscribe
to the events in real time using the `onAuthStateChanged` method.

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import auth from '@react-native-firebase/auth';

function App() {
  // Set an initilizing state whilst Firebase connects
  const [initilizing, setInitilizing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initilizing) setInitilizing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initilizing) return null;

  if (!user) {
    return (
      <View>
        <Text>Login</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome {user.email}</Text>
    </View>
  );
}
```

### Persisting the users auth state

On web based applications, the Firebase Web SDK takes advantage of features such as cookies and localstorage to persist
the users authenticated state across sessions. The native Firebase SDKs also provide this functionality using device native
SDKs, ensuring that a users previous authentication state between app sessions is persisted.

The user is able to clear their state by deleting the apps data/cache from the device settings.

### Auth providers

React Native Firebase provides access to the majority of authentication providers available, including social providers
including Facebook, Google, Twitter and Github, along with phone/SMS authentication.

<Grid columns="2">
	<Block
		icon="share"
		color="#4caf50"
		title="Social Auth"
		to="/social-auth"
	>
    Authenticate your users with popular social providers such as Facebook, Twitter, Google, Github or your own custom provider.
	</Block>
	<Block
		icon="perm_phone_msg"
		color="#2196f3"
		title="Phone Auth"
		to="/phone-auth"
	>
    Phone authentication allows users to sign in to Firebase using their phone as the authenticator. 
	</Block>
</Grid>

#### Anonymous Sign In

Some applications don't require authentication, which make it tricky to identify what users are doing throughout your app.
If connecting with external APIs, it is also useful to add an extra layer of security by ensuring the users request is
from the app. This can be achieved with the `signInAnonymously` method, which creates a new anonymous user which is
persisted, allowing you to integrate with other services such as Analytics by providing a user ID.

```js
import auth from '@react-native-firebase/auth';

async function bootstrap() {
  try {
    await auth().signInAnonymously();
  } catch (e) {
    switch (e.code) {
      case 'auth/operation-not-allowed':
        console.log('Enable anonymous in your firebase console.');
        break;
      default:
        console.error(e);
        break;
    }
  }
}
```

#### Email/Password Sign In

Email/password sign in is a common method for user sign in on applications. This requires the user to provide
an email address and secure password. Users can both register and sign in using a method called
`createUserWithEmailAndPassword`, or sign in to an existing account with `signInWithEmailAndPassword`.

Users must first register using the `createUserWithEmailAndPassword` method
and then sign in with the `signInWithEmailAndPassword` method.

```js
import auth from '@react-native-firebase/auth';

async function register(email, password) {
  try {
    await auth().createUserWithEmailAndPassword(email, password);
  } catch (e) {
    console.error(e.message);
  }
}
```
