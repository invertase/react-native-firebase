# Firebase Setup

The RNFirebase library is intended on making it easy to work with [Firebase](https://firebase.google.com/) and provides a small native shim to the Firebase native code.

To add Firebase to your project, make sure to create a project in the [Firebase console](https://firebase.google.com/console)

![Create a new project](http://d.pr/i/17cJ2.png)

Each platform uses a different setup method after creating the project.

## iOS

See the [ios setup guide](/installation.ios.md).

## Android

See the [android setup guide](/installation.android.md).

## Usage

After creating a Firebase project and installing the library, we can use it in our project by importing the library in our JavaScript:

```javascript
import RNFirebase from 'react-native-firebase'
```

We need to tell the Firebase library we want to _configure_ the project. RNFirebase provides a way to configure both the native and the JavaScript side of the project at the same time with a single command:

```javascript
const firebase = RNFirebase.initializeApp({
  // config options
});
```

We can pass _custom_ options by passing an object with configuration options. The configuration object will be generated first by the native configuration object, if set and then will be overridden if passed in JS. That is, all of the following key/value pairs are optional if the native configuration is set.

| option           | type | Default Value           | Description                                                                                                                                                                                                                                                                                                                                                      |
|----------------|----------|-------------------------|----------------------------------------|
| debug | bool | false | When set to true, RNFirebase will log messages to the console and fire `debug` events we can listen to in `js` |
| persistence | bool | false | When set to true, database persistence will be enabled. |
| bundleID | string | Default from app `[NSBundle mainBundle]` | The bundle ID for the app to be bundled with |
| googleAppID | string | "" | The Google App ID that is used to uniquely identify an instance of an app. |
| databaseURL | string | "" | The database root (i.e. https://my-app.firebaseio.com) |
| deepLinkURLScheme | string | "" | URL scheme to set up durable deep link service |
| storageBucket | string | "" | The Google Cloud storage bucket name |
| androidClientID | string | "" | The Android client ID used in Google AppInvite when an iOS app has it's android version |
| GCMSenderID | string | "" | The Project number from the Google Developer's console used to configure Google Cloud Messaging |
| trackingID | string | "" | The tracking ID for Google Analytics |
| clientID | string | "" | The OAuth2 client ID for iOS application used to authenticate Google Users for signing in with Google |
| APIKey | string | "" | The secret iOS API key used for authenticating requests from our app |

For instance:

```javascript
const configurationOptions = {
  debug: true
};
const firebase = new RNFirebase(configurationOptions);
firebase.on('debug', msg => console.log('Received debug message', msg))
```
