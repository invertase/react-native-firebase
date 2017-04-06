# Firebase Setup

The RNFirebase library is intended on making it easy to work with [Firebase](https://firebase.google.com/) and provides a small native shim to the Firebase native code.

To add Firebase to your project, make sure to create a project in the [Firebase console](https://firebase.google.com/console)

![Create a new project](http://d.pr/i/17cJ2.png)

Each platform uses a different setup method after creating the project.

## iOS

See the [ios setup guide](./installation.ios.md).

## Android

See the [android setup guide](./installation.android.md).

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

### Configuration Options

| option           | type | Default Value           | Description                                                                                                                                                                                                                                                                                                                                                      |
|----------------|----------|-------------------------|----------------------------------------|
| debug | bool | false | When set to true, RNFirebase will log messages to the console and fire `debug` events we can listen to in `js` |
| persistence | bool | false | When set to true, database persistence will be enabled. |

For instance:

```javascript
import RNFirebase from 'react-native-firebase';

const configurationOptions = {
  debug: true
};

const firebase = RNFirebase.initializeApp(configurationOptions);

export default firebase;
```
