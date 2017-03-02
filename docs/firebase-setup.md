# Firebase Setup

The RNFirebase library is intended on making it easy to work with [Firebase](https://firebase.google.com/) and provides a small native shim to the Firebase native code.

To add Firebase to your project, make sure to create a project in the [Firebase console](https://firebase.google.com/console)

![Create a new project](http://d.pr/i/17cJ2.png)

Each platform uses a different setup method after creating the project.

## iOS

After creating a Firebase project, click on the [Add Firebase to your iOS app](http://d.pr/i/3sEL.png) and follow the steps from there to add the configuration file. You do _not_ need to set up a cocoapods project (this is already done through RNFirebase). Make sure not to forget the `Copy Files` phase in iOS.

[Download the Firebase config file](https://support.google.com/firebase/answer/7015592) and place it in your app directory next to your app source code:

![GoogleService-Info.plist](http://d.pr/i/1eGev.png)

Once you download the configuration file, make sure you place it in the root of your Xcode project. Every different Bundle ID (aka, even different project variants needs their own configuration file).

Lastly, due to some dependencies requirements, RNFirebase supports iOS versions 8.0 and up. Make sure to update the minimum version of your iOS app to `8.0`.

## Android

There are several ways to setup Firebase on Android. The _easiest_ way is to pass the configuration settings in JavaScript. In that way, there is no setup for the native platform.

### google-services.json setup
If you prefer to include the default settings in the source of your app, download the `google-services.json` file provided by Firebase in the _Add Firebase to Android_ platform menu in your Firebase configuration console.

Next you'll have to add the google-services gradle plugin in order to parse it.

Add the google-services gradle plugin as a dependency in the *project* level build.gradle
`android/build.gradle`
```java
buildscript {
  // ...
  dependencies {
    // ...
    classpath 'com.google.gms:google-services:3.0.0'
  }
}
```

In your app build.gradle file, add the gradle plugin at the VERY BOTTOM of the file (below all dependencies)
`android/app/build.gradle`
```java
apply plugin: 'com.google.gms.google-services'
```

## Usage

After creating a Firebase project and installing the library, we can use it in our project by importing the library in our JavaScript:

```javascript
import RNFirebase from 'react-native-firebase'
```

We need to tell the Firebase library we want to _configure_ the project. RNFirebase provides a way to configure both the native and the JavaScript side of the project at the same time with a single command:

```javascript
const firebase = new RNFirebase();
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
