# React Native Firebase

RNFirebase makes using the latest [Firebase](http://firebase.com) with React Native straight-forward.

```
npm i react-native-firebase --save
```

[![Gitter](https://badges.gitter.im/invertase/react-native-firebase.svg)](https://gitter.im/invertase/react-native-firebase?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm version](https://img.shields.io/npm/v/react-native-firebase.svg)](https://www.npmjs.com/package/react-native-firebase)
[![License](https://img.shields.io/npm/l/react-native-firebase.svg)](/LICENSE)

RNFirebase is a _light-weight_ layer sitting on-top of the native Firebase libraries for both iOS and Android which mirrors the React Native JS api as closely as possible.

## RNFirebase vs Firebase Web SDK

Although the [Firebase Web SDK](https://www.npmjs.com/package/firebase) library will work with React Native, it is built for the web.

RNFirebase provides a JavaScript bridge to the native Firebase SDKs for both iOS and Android. The Firebase processes will run on the native thread, allowing the rest of your app to run on the [JS thread](https://facebook.github.io/react-native/docs/performance.html#javascript-frame-rate). The Firebase Web SDK also runs on the JS thread, therefore potentially affecting the frane rate causing jank with animations, touch events etc. All in, RNFirebase provides much faster performance (~2x) over the web SDK.

The native SDKs allow allow us to hook into device events which are not possible with the web SDK, for example crash reporting, offiline realtime database support, analyics and more!

## Test app

To help ensure changes and features work across both iOS & Android, we've developed an app specifically to test `react-native-firebase` against the [`firebase` web SDK](https://www.npmjs.com/package/firebase). Please see the [`react-native-firebase-tests`](https://github.com/invertase/react-native-firebase-tests) repository for more information.

## Examples app

There's currently a work in progress [examples app](https://github.com/invertase/react-native-firebase-examples) which aims to demonstrate various real world use-case scenarios with React Native & Firebase. We welcome any new examples or updates to existing ones.

## Documentation

RNFirebase aims to replicate the Firebase Web SDK as closely as possible. Because of this, the documentation focuses around the installation, differences & best practices of this library. Please see the [Firebase Web SDK](https://firebase.google.com/docs/reference/js/) documentation for Firebase functionality.

> If you find any discrepancies between the two libraries, please raise an issue or PR.

* Installation
  * [iOS](docs/installation.ios.md)
  * [Android](docs/installation.android.md)
* [Firebase Setup](docs/firebase-setup.md)
* API
  * [Authentication](docs/api/authentication.md)
  * [Analytics](docs/api/analytics.md)
  * [Storage](docs/api/storage.md)
  * [Realtime Database](docs/api/database.md)
  * [Presence](docs/api/presence.md)
  * [ServerValue](docs/api/server-value.md)
  * [Cloud Messaging](docs/api/cloud-messaging.md)
  * [Remote Config](docs/api/remote-config.md)
  * [Events](docs/api/events.md)

## Contributing

We welcome any contribution to the repository. Please ensure your changes to the JavaScript code follow the styling guides controlled by ESlint. Changes to native code should be kept clean and follow the standard of existing code.

Changes to existing code should ensure all relevant tests on the test app pass. Any new features should have new tests created and ensure all existing tests pass.

## License

- MIT
