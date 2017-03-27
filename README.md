# React Native Firebase<img align="left" src="http://i.imgur.com/01XQL0x.png">

[![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://discord.gg/t6bdqMs)
[![Gitter](https://badges.gitter.im/invertase/react-native-firebase.svg)](https://gitter.im/invertase/react-native-firebase?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm version](https://img.shields.io/npm/v/react-native-firebase.svg)](https://www.npmjs.com/package/react-native-firebase)
[![License](https://img.shields.io/npm/l/react-native-firebase.svg)](/LICENSE)

**RNFirebase** makes using [Firebase](http://firebase.com) with React Native simple.
<hr>

### Install
```
npm i react-native-firebase --save
```

#### Platform specific setup guides:
[![ios](https://a.fsdn.com/sd/topics/ios_64.png)](docs/installation.ios.md)   [![android](https://a.fsdn.com/sd/topics/android_64.png)](docs/installation.android.md)

<hr>

### Why

RNFirebase is a _light-weight_ layer sitting on-top of the native Firebase libraries for both iOS and Android which mirrors the Firebase Web SDK as closely as possible.

Although the [Firebase Web SDK](https://www.npmjs.com/package/firebase) library will work with React Native, it is mainly built for the web.

RNFirebase provides a JavaScript bridge to the native Firebase SDKs for both iOS and Android. Firebase will run on the native thread, allowing the rest of your app to run on the [JS thread](https://facebook.github.io/react-native/docs/performance.html#javascript-frame-rate). The Firebase Web SDK also runs on the JS thread, therefore potentially affecting the frame rate causing jank with animations, touch events etc. All in all, RNFirebase provides much faster performance (~2x) over the web SDK.

The native SDKs also allow us to hook into device sdk's which are not possible with the web SDK, for example crash reporting, offline realtime database support, analyics and more!

<hr>

### Test app

To help ensure changes and features work across both iOS & Android, we've developed an app specifically to test `react-native-firebase` against the [`firebase` web SDK](https://www.npmjs.com/package/firebase). Please see the [`react-native-firebase-tests`](https://github.com/invertase/react-native-firebase-tests) repository for more information.

<hr>

### Examples app

There's currently a work in progress [examples app](https://github.com/invertase/react-native-firebase-examples) which aims to demonstrate various real world use-case scenarios with React Native & Firebase. We welcome any new examples or updates to existing ones.

<hr>

### Documentation

RNFirebase aims to replicate the Firebase Web SDK as closely as possible. Because of this, the documentation focuses around the installation, differences & best practices of this library. Please see the [Firebase Web SDK](https://firebase.google.com/docs/reference/js/) documentation for Firebase functionality.

> If you find any discrepancies between the two libraries, please raise an issue or PR.

* [Firebase Setup](docs/firebase-setup.md)
* API
  * [Authentication](docs/api/authentication.md)
  * [Realtime Database](docs/api/database.md)
  * [Analytics](docs/api/analytics.md)
  * [Storage](docs/api/storage.md)
  * [Messaging](docs/api/cloud-messaging.md)
  * [Crash](docs/api/crash.md)
  * [Transactions](docs/api/transactions.md)

<hr>

### Contributing

We welcome any contribution to the repository. Please ensure your changes to the JavaScript code follow the styling guides controlled by ESlint. Changes to native code should be kept clean and follow the standard of existing code.

Changes to existing code should ensure all relevant tests on the test app pass. Any new features should have new tests created and ensure all existing tests pass.

**Project board:** https://github.com/invertase/react-native-firebase/projects

<hr>

### License

- MIT
