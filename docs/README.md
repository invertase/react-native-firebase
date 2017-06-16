
<h1 align="center">
  <img src="https://camo.githubusercontent.com/6c827e5a0bb91259f82a1f4923ab7efa4891b119/687474703a2f2f692e696d6775722e636f6d2f303158514c30782e706e67"/><br>

  React Native Firebase
</h1>

<div style="text-align: center;">
[![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://discord.gg/t6bdqMs)
[![Gitter](https://badges.gitter.im/invertase/react-native-firebase.svg)](https://gitter.im/invertase/react-native-firebase?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm version](https://img.shields.io/npm/v/react-native-firebase.svg)](https://www.npmjs.com/package/react-native-firebase)
[![License](https://img.shields.io/npm/l/react-native-firebase.svg)](/LICENSE)
[![Donate](https://img.shields.io/badge/Donate-Patreon-green.svg)](https://www.patreon.com/invertase)
<br />
A well tested Firebase implementation for React Native, supporting both iOS & Android apps.
</div>

---

RNFirebase is a _light-weight_ layer sitting on-top of the native Firebase libraries for both iOS and Android which mirrors the Firebase Web SDK as closely as possible.

Although the [Firebase Web SDK](https://www.npmjs.com/package/firebase) library will work with React Native, it is mainly built for the web.

RNFirebase provides a JavaScript bridge to the native Firebase SDKs for both iOS and Android. Firebase will run on the native thread, allowing the rest of your app to run on the [JS thread](https://facebook.github.io/react-native/docs/performance.html#javascript-frame-rate). The Firebase Web SDK also runs on the JS thread, therefore potentially affecting the frame rate causing jank with animations, touch events etc. All in all, RNFirebase provides much faster performance (~2x) over the web SDK.

The native SDKs also allow us to hook into device sdk's which are not possible with the web SDK, for example crash reporting, offline realtime database support, analyics and more!

---

## Supported Firebase Features
> The Web SDK column indicates what modules from the Firebase Web SDK are usable within React Native.

| Firebase Features      | v1  | [v2](https://github.com/invertase/react-native-firebase/pull/130)  | Web SDK |
| ---------------------- | :---: | :---: | :---: |
| Analytics              | ✅ | ✅ | ❌ |
| Cloud Messaging        | ✅ | ✅ | ❌ |
| Authentication         | ✅ | ✅ | ✅ |
| Realtime Database      | ✅ | ✅ | ✅ |
|  - Offline Persistance | ✅ | ✅ | ❌ |
| Storage                | ✅ | ✅ | ❌ |
| Performance Monitoring | ✅ | ✅ | ❌ |
| Crash Reporting        | ✅ | ✅ | ❌ |
| Remote Config          | ✅ | ✅ | ❌ |
| App Indexing           | ❌ | ❌ | ❌ |
| Dynamic Links          | ❌ | ❌ | ❌ |
| Invites                | ❌ | ❌ | ❌ |
| AdMob                  | ❌ | ✅ | ❌ |

