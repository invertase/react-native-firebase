
<h1 align="center">
  <img src="https://camo.githubusercontent.com/6c827e5a0bb91259f82a1f4923ab7efa4891b119/687474703a2f2f692e696d6775722e636f6d2f303158514c30782e706e67"/><br>

  React Native Firebase
</h1>

<div style="text-align: center;">
[![npm version](https://img.shields.io/npm/v/react-native-firebase.svg?style=flat-square)](https://www.npmjs.com/package/react-native-firebase)
[![NPM downloads](https://img.shields.io/npm/dm/react-native-firebase.svg?style=flat-square)](https://www.npmjs.com/package/react-native-firebase)
[![Package Quality](http://npm.packagequality.com/shield/react-native-firebase.svg?style=flat-square)](http://packagequality.com/#?package=react-native-firebase)
[![License](https://img.shields.io/npm/l/react-native-firebase.svg?style=flat-square)](/LICENSE)
[![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg?style=flat-square)](https://discord.gg/t6bdqMs)
[![Chat](https://img.shields.io/badge/chat-on%20gitter-a0e7a0.svg?style=flat-square)](https://gitter.im/invertase/react-native-firebase)
[![Donate](https://img.shields.io/badge/Donate-Patreon-green.svg?style=flat-square)](https://www.patreon.com/invertase)
<br />
A well tested Firebase implementation for React Native, supporting both iOS & Android apps.
</div>

---

RNFirebase is a _light-weight_ layer sitting on-top of the native Firebase libraries for both iOS and Android which mirrors the Firebase Web SDK as closely as possible.

Although the [Firebase Web SDK](https://www.npmjs.com/package/firebase) library will work with React Native, it is mainly built for the web.

RNFirebase provides a JavaScript bridge to the native Firebase SDKs for both iOS and Android therefore Firebase will run on the native thread, allowing the rest of your app to run on the [JS thread](https://facebook.github.io/react-native/docs/performance.html#javascript-frame-rate). The Firebase Web SDK also runs on the JS thread, therefore potentially affecting the frame rate causing jank with animations, touch events etc. 

The native SDKs also allow us to hook into device sdk's which are not possible with the web SDK, for example crash reporting, offline realtime database support, analyics and more!

All in all, RNFirebase provides much faster performance (~2x) over the web SDK and provides device sdk's not found in the web sdk (see the feature table below).

---

## Supported Firebase Features
> The Web SDK column indicates what modules from the Firebase Web SDK are usable within React Native.

| Firebase Features      | v1  | [v2](https://github.com/invertase/react-native-firebase/pull/130)  | Web SDK |
| ---------------------- | :---: | :---: | :---: |
| AdMob                  | ❌ | ✅ | ❌ |
| Analytics              | ✅ | ✅ | ❌ |
| App Indexing           | ❌ | ❌ | ❌ |
| Authentication         | ✅ | ✅ | ✅ |
| Cloud Messaging        | ✅ | ✅ | ❌ |
| Crash Reporting        | ✅ | ✅ | ❌ |
| Dynamic Links          | ❌ | ❌ | ❌ |
| Invites                | ❌ | ❌ | ❌ |
| Performance Monitoring | ✅ | ✅ | ❌ |
| Realtime Database      | ✅ | ✅ | ✅ |
|  - Offline Persistance | ✅ | ✅ | ❌ |
| Remote Config          | ✅ | ✅ | ❌ |
| Storage                | ✅ | ✅ | ❌ |

---
### Supported versions - Firebase / React Native

> The table below shows the minimum supported versions of the Firebase SDKs and React Native

|                        | v1  | [v2](https://github.com/invertase/react-native-firebase/pull/130)
| ---------------------- | :---: | :---: |
| React Native           | 0.36.0+ | 0.40.0 + |
| Firebase Android SDK   | 10.2.0+ | 11.0.0 + |
| Firebase iOS SDK       | 3.15.0+ | 4.0.0 +  |
