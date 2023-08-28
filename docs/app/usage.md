---
title: Core/App
description: Functionality & examples of using the Core/App dependency with React Native Firebase.
icon: //static.invertase.io/assets/social/firebase-logo.png
next: /app/json-config
previous: /storage/usage
---

The App module is available by default once you have installed the React Native Firebase library by following the
[Getting Started](/) documentation. The App module currently provides the following functionality:

- Creating [Secondary Firebase App Instances](#secondary-apps).
- Exposing [Utilities](/app/utils) to aid development.

# Secondary Apps

Unlike the Firebase Web SDK, there is no need to manually call the [`initializeApp`](https://firebase.google.com/docs/web/setup#add-sdks-initialize)
method with your project credentials. The native Android & iOS SDKs automatically connect to your Firebase project using
the credentials provided during the [Getting Started](/) installation steps. The app module does however provide support
for manually initializing secondary Firebase app instances.

Currently, the native Firebase SDKs only provide functionality for creating secondary apps on the following services:

- [App Check](/app-check/usage).
- [Authentication](/auth/usage).
- [Realtime Database](/database/usage).
- [Cloud Firestore](/firestore/usage).
- [Cloud Functions](/functions/usage).
- [Cloud Storage](/storage/usage).
- [ML](/ml/usage).
- [Installations](/installations/usage).
- [Remote Config](/remote-config/usage).

## Initializing secondary apps

The module exposes an `initializeApp` method which accepts arguments containing the credentials and options for your secondary
apps:

```js
import firebase from '@react-native-firebase/app';

// Your secondary Firebase project credentials...
const credentials = {
  clientId: '',
  appId: '',
  apiKey: '',
  databaseURL: '',
  storageBucket: '',
  messagingSenderId: '',
  projectId: '',
};

const config = {
  name: 'SECONDARY_APP',
};

await firebase.initializeApp(credentials, config);
```

Note that if you use multiple platforms, you will need to use the credentials relevant to that platform:

```js
import firebase from '@react-native-firebase/app';
import { Platform } from 'react-native';

// Your secondary Firebase project credentials for Android...
const androidCredentials = {
  clientId: '',
  appId: '',
  apiKey: '',
  databaseURL: '',
  storageBucket: '',
  messagingSenderId: '',
  projectId: '',
};

// Your secondary Firebase project credentials for iOS...
const iosCredentials = {
  clientId: '',
  appId: '',
  apiKey: '',
  databaseURL: '',
  storageBucket: '',
  messagingSenderId: '',
  projectId: '',
};

// Select the relevant credentials
const credentials = Platform.select({
  android: androidCredentials,
  ios: iosCredentials,
});

const config = {
  name: 'SECONDARY_APP',
};

await firebase.initializeApp(credentials, config);
```

Once created, you can confirm the app instance has been created by accessing the `apps` property on the module:

```js
const apps = firebase.apps;

apps.forEach(app => {
  console.log('App name: ', app.name);
});
```

## Switching app instance

You can switch app instances at any time whilst developing by calling the `app` method with the name of the secondary app:

```js
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';

// Example using auth
firebase.app('SECONDARY_APP').auth().currentUser;
```

Or pass the secondary app instance you created above directly to the desired module, for example:

```js
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

// create secondary app as described above
const secondaryApp = await firebase.initializeApp(credentials, config);

// Example using auth with passing the secondary app instance
auth(secondaryApp).currentUser;
```

## Deleting instances

You can delete any secondary instances by calling the `delete` method on the instance:

```js
await firebase.app('SECONDARY_APP').delete();
```
