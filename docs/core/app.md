## Apps

?> For the **default** app see: [Default App](/core/default-app)

?> For initializing **additional apps** natively and also via js code over the RN bridge see: [Dynamically Initializing Apps](/core/initialize-apps)

### Reading App Options

!> `<app>.options.clientId` is not available on the **Android Firebase SDK** so will return null for Android, see the issue: [firebase/firebase-ios-sdk#140 (comment)](https://github.com/firebase/firebase-ios-sdk/issues/140#issuecomment-315953708)

Just like the Firebase web sdk you can view options used to initialize an app instance in the same way, for example:

```js
import firebase from 'react-native-firebase';

const defaultApp = firebase.app();

// get the default app name/options that the app initialized with
console.log("name", defaultApp.name);
console.log("apiKey", defaultApp.options.apiKey);
console.log("applicationId", defaultApp.options.applicationId);
console.log("databaseUrl", defaultApp.options.databaseUrl);
console.log("messagingSenderId", defaultApp.options.messagingSenderId);
console.log("projectId", defaultApp.options.projectId);
console.log("storageBucket", defaultApp.options.projectId);
```


