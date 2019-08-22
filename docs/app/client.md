---
title: Client Initialization
description: Initialization Firebase with the client method.
---

# Client Initialization

> The default firebase app instance can not be initialized via JS. After following the iOS & Android installation guides and correctly setting up your google services plist/json files, the default app is automatically initialized and available for use in react-native-firebase.

App initialization in React Native Firebase is, for the most part, the same as the web SDK, with only a few minor differences.

## Supported Modules

Only some modules on the official Firebase native SDK's support multiple apps, they are as follows:

 - Authentication
 - Database
 - Firestore
 - Functions
 - Instance ID
 - Storage
 - ML Kit Natural Language
 - ML Kit Vision

For further information, view [Firebase Documentation for Multiple Projects](https://firebase.google.com/docs/web/setup#multiple-projects).

# Initialize apps via JavaScript

## Cross Platform Example

```javascript
import { Platform } from 'react-native';
import firebase from '@react-native-firebase/app';

// pluck values from your `GoogleService-Info.plist` you created on the firebase console
const iosConfig = {
  clientId: 'x',
  appId: 'x',
  apiKey: 'x',
  databaseURL: 'x',
  storageBucket: 'x',
  messagingSenderId: 'x',
  projectId: 'x',

  // enable persistence by adding the below flag
  persistence: true,
};

// pluck values from your `google-services.json` file you created on the firebase console
const androidConfig = {
  clientId: 'x',
  appId: 'x',
  apiKey: 'x',
  databaseURL: 'x',
  storageBucket: 'x',
  messagingSenderId: 'x',
  projectId: 'x',

  // enable persistence by adding the below flag
  persistence: true,
};

const kittensApp = firebase.initializeApp(
  // use platform-specific firebase config
        Platform.OS === 'ios' ? iosConfig : androidConfig,
  // name of this app
  'kittens',
).then(app => console.log('initialized apps ->', firebase.apps));
```

# Initialize via Android/iOS native code

If you're familiar with native code you can create apps natively also (or if you are already initializing additional apps natively on app boot) - these apps automatically become available for use inside RNFirebase.

For example, if you created an app natively called `dogs` then the following would work:

```javascript
import firebase from '@react-native-firebase/app';

const dogsApp = firebase.app('dogs');

```

# Deleting an app instance

Currently it's not possible to provide cross platform 'delete app' functionality as the Firebase Android SDK is missing the app delete method, this has been flagged with firebase ([firebase/firebase-ios-sdk#140 (comment)](https://github.com/firebase/firebase-ios-sdk/issues/140#issuecomment-315953708)).
