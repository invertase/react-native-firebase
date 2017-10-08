
<div style="text-align: center;">
[![npm version](https://img.shields.io/npm/v/react-native-firebase.svg?style=flat-square)](https://www.npmjs.com/package/react-native-firebase)
[![NPM downloads](https://img.shields.io/npm/dm/react-native-firebase.svg?style=flat-square)](https://www.npmjs.com/package/react-native-firebase)
[![Package Quality](https://npm.packagequality.com/shield/react-native-firebase.svg?style=flat-square)](http://packagequality.com/#?package=react-native-firebase)
[![License](https://img.shields.io/npm/l/react-native-firebase.svg?style=flat-square)](/LICENSE)
[![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg?style=flat-square)](https://discord.gg/t6bdqMs)
[![Donate](https://img.shields.io/badge/Donate-Patreon-green.svg?style=flat-square)](https://www.patreon.com/invertase)
[![Twitter Follow](https://img.shields.io/twitter/follow/rnfirebase.svg?style=social&label=Follow)](https://twitter.com/rnfirebase)
</div>

---


RNFirebase is a _light-weight_ layer sitting on-top of the native Firebase libraries for both iOS and Android which mirrors the Firebase Web SDK as closely as possible.

Although the [Firebase Web SDK](https://www.npmjs.com/package/firebase) library will work with React Native, it is mainly built for the web.

RNFirebase provides a JavaScript bridge to the native Firebase SDKs for both iOS and Android therefore Firebase will run on the native thread, allowing the rest of your app to run on the [JS thread](https://facebook.github.io/react-native/docs/performance.html#javascript-frame-rate). The Firebase Web SDK also runs on the JS thread, therefore potentially affecting the frame rate causing jank with animations, touch events etc.

The native SDKs also allow us to hook into device sdk's which are not possible with the web SDK, for example crash reporting, offline realtime database support, analyics and more!

All in all, RNFirebase provides much faster performance (~2x) over the web SDK and provides device sdk's not found in the web sdk (see the feature table below).

---

## Supported Firebase Features
> The Web SDK column indicates what modules/functionality from the Web SDK are usable within React Native.


> '**?**' indicates partial support

| Firebase Features      | v1.x.x  | v2.x.x  | v3.x.x | Web SDK |
| ---------------------- | :---: | :---: | :---: | :---: |
| **AdMob**                  | ❌ | ✅ | ✅ | ❌ |
| **Analytics**              | ✅ | ✅ | ✅ | ❌ |
| **App Indexing**           | ❌ | ❌ | ❌ | ❌ |
| **Authentication**         | ✅ | ✅ | ✅ | ✅ |
| _-- Phone Auth_            | ❌ | ❌ | ✅ | ❌ |
| **Core**                   | ❌ |**?**| ✅ | ✅ |
|  _-- Multiple Apps_        | ❌ | ❌ | ✅ | ✅ |
| **Cloud Messaging (FCM)**  | ✅ | ✅ | ✅ |**?**|
| **Crash Reporting**        | ✅ | ✅ | ✅ | ❌ |
| **Dynamic Links**          | ❌ | ❌ | ✅ | ❌ |
| **Firestore**              | ❌ | ❌ | ✅ | ❌ |
| **Invites**                | ❌ | ❌ | ❌ | ❌ |
| **Performance Monitoring** | ✅ | ✅ | ✅ | ❌ |
| **Realtime Database**      | ✅ | ✅ | ✅ | ✅ |
| _-- Offline Persistence_   | ✅ | ✅ | ✅ |**?**|
| _-- Transactions_          | ✅ | ✅ | ✅ | ✅ |
| **Remote Config**          | ✅ | ✅ | ✅ | ❌ |
| **Storage**                | ✅ | ✅ | ✅ |**?**|

---
### Supported versions - React Native / Firebase

> The table below shows the supported versions of React Native and the Firebase SDKs for different versions of `react-native-firebase`

|                        | 1.X.X       | 2.0.X       | 2.1.X / 2.2.X   | 3.0.X    |
|------------------------|-------------|-------------|-----------------|----------|
| React Native           | 0.36 - 0.39 | 0.40 - 0.46 | 0.47 +          | 0.48 +   |
| Firebase Android SDK   | 10.2.0 +    | 11.0.0 +    | 11.0.0 +        | 11.4.2 + |
| Firebase iOS SDK       | 3.15.0 +    | 4.0.0 +     | 4.0.0 +         | 4.3.0 +  |
