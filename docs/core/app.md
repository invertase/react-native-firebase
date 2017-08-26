# App - firebase.app(): FirebaseApp

RNFirebase supports both initializing apps natively and also via js code over the RN bridge.

Apps initialized natively are available immediately at app runtime, there is no need to call `initializeApp` for them.

For example, to access the default app initialized via the `Google-Services` `plist` or `json` file:

```js
import firebase from 'react-native-firebase';

const defaultApp = firebase.app();

defaultApp.database().ref('foobar').once('value', (snapshot) => {
  // snapshot from default app
});

// get the default app name/options that were initialized natively
console.log("name", defaultApp.name);
console.log("apiKey", defaultApp.options.apiKey);
console.log("applicationId", defaultApp.options.applicationId);
console.log("databaseUrl", defaultApp.options.databaseUrl);
console.log("messagingSenderId", defaultApp.options.messagingSenderId);
console.log("projectId", defaultApp.options.projectId);
console.log("storageBucket", defaultApp.options.projectId);
```


<!-- TODO api ref docs: -->
 <!-- - name: String -->
 <!-- - options: Object -->
 <!-- - delete(): Promise -->


