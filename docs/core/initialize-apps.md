## Initializing Apps

!> The **default** firebase app instance can **not** be initialized via JS, please setup your google services plist/json files in your android studio / xcode projects. See [Default App](/core/default-app) for more information.

App initialization in RNFirebase is for the most part the same as the web sdk, with only a few minor differences.

### Supported Modules

Only 4 modules on the official firebase native SDK's support multiple apps, they are as follows:

 - Authentication
 - Database
 - Firestore
 - Storage

### Initialize via JavaScript

#### Cross Platform Example

```javascript
import { Platform } from 'react-native';
import firebase from 'react-native-firebase';

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
  // use platform specific firebase config
  Platform.OS === 'ios' ? iosConfig : androidConfig,
  // name of this app
  'kittens',
);

// dynamically created apps aren't available immediately due to the
// asynchronous nature of react native bridging, therefore you must
// wait for an `onReady` state before calling any modules/methods
// otherwise you will most likely run into `app not initialized` exceptions
kittensApp.onReady().then((app) => {
   // --- ready ---
   // use `app` arg, kittensApp var or `app('kittens')` to access modules
   // and their methods. e.g:
   firebase.app('kittens').auth().signInAnonymously().then((user) => {
       console.log('kittensApp user ->', user.toJSON());
   });
});
```

### Initialize via Android/iOS native code

If you're familiar with native code you can create apps natively also (or if you are already initializing additional apps natively on app boot) - these apps automatically become available for use inside RNFirebase.

For example, if you created an app natively called `dogs` then the following would work:

```javascript
import firebase from 'react-native-firebase';

const dogsApp = firebase.app('dogs');

dogsApp.auth().signInAnonymously().then((user) => {
  console.log('dogsApp user ->', user.toJSON());
});
```


### Deleting an app instance

Currently it's not possible to provide cross platform 'delete app' functionality as the Firebase Android SDK is missing the app delete method, this has been flagged with firebase ([firebase/firebase-ios-sdk#140 (comment)](https://github.com/firebase/firebase-ios-sdk/issues/140#issuecomment-315953708)).

