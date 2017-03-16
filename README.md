# React Native Firebase

RNFirebase makes using the latest [Firebase](http://firebase.com) with React Native straight-forward.

```
npm i react-native-firebase --save
```

[![Gitter](https://badges.gitter.im/invertase/react-native-firebase.svg)](https://gitter.im/invertase/react-native-firebase?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm version](https://img.shields.io/npm/v/react-native-firebase.svg)](https://www.npmjs.com/package/react-native-firebase)
[![License](https://img.shields.io/npm/l/react-native-firebase.svg)](/LICENSE)

RNFirebase is a _light-weight_ layer sitting on-top of the native Firebase libraries for both iOS and Android which mirrors the React Native JS api as closely as possible.

Featuring; authentication, storage, real-time database, presence, analytics, cloud messaging, remote configuration, redux support and more!

## RNFirebase vs Firebase JS lib

Although the [Firebase](https://www.npmjs.com/package/firebase) JavaScript library will work with React Native, it is mainly designed for the web.

The native SDK's are much better for performance compared to the web SDK. The web SDK will run on the same thread as your apps ([JS thread](https://facebook.github.io/react-native/docs/performance.html#javascript-frame-rate)) therefore limiting your JS framerate, potentially affecting things touch events and transitions/animations.

The native SDK's also contains functionality that the web SDK's do not, for example [Analytics](/docs/api/analytics.md) and [Remote Config](/docs/api/remote-config.md).

## Examples app

There's currently a work in progress [examples app](https://github.com/invertase/react-native-firebase-examples) which aims to demonstrate various real world use-case scenarios with React Native & Firebase. We welcome any new examples or updates to existing ones, however please do not overcomplicate them.

## Test app

To help ensure changes and features work across both iOS & Android, we've developed an app specifically to test `react-native-firebase` against the [`firebase` web SDK](https://www.npmjs.com/package/firebase). Please see the [`react-native-firebase-tests`](https://github.com/invertase/react-native-firebase-tests) repository for more information.

## Documentation

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
* [Redux](docs/redux.md)

## Contributing

  - TODO
