# Usage

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

## Configuration Options

| option           | type | Default Value           | Description                                                                                                                                                                                                                                                                                                                                                      |
|----------------|----------|-------------------------|----------------------------------------|
| debug | bool | false | When set to true, RNFirebase will log messages to the console and fire `debug` events we can listen to in `js` |
| persistence | bool | false | When set to true, database persistence will be enabled. |
| errorOnMissingPlayServices | bool | true | (Android only) When set to true, will throw an error if Google Play Services isn't installed. |
| promptOnMissingPlayServices | bool | true | (Android only) When set to true, will prompt the user to install Google Play Services if it isn't installed.  This takes precedence over `errorOnMissingPlayServices`.|

For instance:

```javascript
import RNFirebase from 'react-native-firebase';

const configurationOptions = {
  debug: true
};

const firebase = RNFirebase.initializeApp(configurationOptions);

export default firebase;
```
