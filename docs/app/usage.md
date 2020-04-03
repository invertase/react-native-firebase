---
title: Core/App
description: Functionality & examples of using the Core/App dependency with React Native Firebase.
icon: //static.invertase.io/assets/social/firebase-logo.png
next: /app/utils
previous: /storage/usage
---

The App module is available by default once you have installed the React Native Firebase library by following the
[Getting Started](/) documentation. The App module currently provides the following functionality:

- Creating [Secondary Firebase App Instances](#secondary-apps).
- Exposing [Utilities](/app/utils) to aid development.

# Secondary Apps

Unlike the Firebase Web SDK, there is no need to manually call the [`initalizeApp`](https://firebase.google.com/docs/web/setup#add-sdks-initialize)
method with your project credentials. The native Android & iOS SDKs automatically connect to your Firebase project using
the credentials provided during the [Getting Started](/) installation steps. The app module does however provide support
for manually initializing secondary Firebase app instances.

Currently, the native Firebase SDKs only provide functionality for creating secondary apps on the the following services:

- [Authentication](/auth).
- [Realtime Database](/database).
- [Cloud Firestore](/firestore).
- [Cloud Functions](/functions)
- [Cloud Storage](/storage).
- [Instance ID](/iid).
- [ML Kit Natural Language](/ml-language).
- [ML Kit Vision](/ml-vision).
- [Remote Config](/remote-config).

## Initializing secondary apps

The module exposes an `initalizeApp` method which accepts arguments containing the credentials and options for your secondary
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

await firebase.initalizeApp(credentials, config);
```

Once created, you can confirm the app instance has been created by accessing the `apps` property on the module:

```js
console.log(firebase.apps);
```

## Switching app instance

You can switch app instances at any time whilst developing by calling the `app` method:

```js
import firebase from '@react-native-firebase/app';

// Example using auth
firebase.app('SECONDARY_APP').auth().currentUser;
```

The `firebase` instance is also exported on modules for added convenience, for example:

```js
import auth, { firebase } from '@react-native-firebase/auth';
```

## Deleting instances

You can delete any secondary instances by calling the `delete` method on the instance:

```js
await firebase.app('SECONDARY_APP').delete();
```
