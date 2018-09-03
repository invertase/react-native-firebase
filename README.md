<p align="center">
  <a href="https://rnfirebase.io">
    <img src="https://i.imgur.com/eBNJlHd.png"><br/>
  </a>
  <h1 align="center">React Native Firebase</h2>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-native-firebase"><img src="https://img.shields.io/npm/dm/react-native-firebase.svg?style=flat-square" alt="NPM downloads"></a>
  <a href="https://www.npmjs.com/package/react-native-firebase"><img src="https://img.shields.io/npm/v/react-native-firebase.svg?style=flat-square" alt="NPM version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/npm/l/react-native-firebase.svg?style=flat-square" alt="License"></a>
  <a href="#backers"><img src="https://opencollective.com/react-native-firebase/backers/badge.svg" alt="Backers on Open Collective"></a>
  <a href="#sponsors"><img src="https://opencollective.com/react-native-firebase/sponsors/badge.svg" alt="Sponsors on Open Collective"></a>
  <a href="https://discord.gg/C9aK28N"><img src="https://img.shields.io/discord/295953187817521152.svg?logo=discord&style=flat-square&colorA=7289da&label=discord" alt="Chat"></a>
  <a href="https://twitter.com/rnfirebase"><img src="https://img.shields.io/twitter/follow/rnfirebase.svg?style=social&label=Follow" alt="Follow on Twitter"></a>
</p>

## Introduction

**React Native Firebase** is a _light-weight_ javascript layer connecting you to the native Firebase SDKs for both iOS and Android which aimes to mirror the offical Firebase Web SDK as closely as possible.

Although the official [Firebase JS SDK](https://www.npmjs.com/package/firebase) will work with React Native; it is mainly built for the web and has a limited feature-set compared to native.

Using the native Firebase SDKs with **React Native Firebase** allows you to consume device SDKs which don't exist on the Firebase JS SDK - for example; Remote Config, Performance Monitoring, Dynamic Links, Analytics and more (see the feature table below for comparison).

---

We also support **both** databases: Realtime Database and Cloud Firestore!

---


<!---
[![License](https://img.shields.io/npm/l/react-native-firebase.svg?style=flat-square)](/LICENSE)
-->

<hr>

> [Docs](https://rnfirebase.io/) <b>|</b> [Starter App](https://github.com/invertase/react-native-firebase-starter) <b>|</b> [iOS Install Guide](https://rnfirebase.io/docs/v3.0.*/installation/ios) <b>|</b> [Android Install Guide](https://rnfirebase.io/docs/v3.0.*/installation/android) <b>|</b> [FAQs](https://rnfirebase.io/docs/v3.0.*/faqs) <b>|</b> [Feature Requests](http://invertase.link/requests)

<hr>

### Install
```bash
npm i react-native-firebase --save
```

<hr>

### Why

RNFirebase is a _light-weight_ layer sitting on-top of the native Firebase libraries for both iOS and Android which mirrors the Firebase Web SDK as closely as possible.

Although the [Firebase Web SDK](https://www.npmjs.com/package/firebase) library will work with React Native, it is mainly built for the web.

RNFirebase provides a JavaScript bridge to the native Firebase SDKs for both iOS and Android therefore Firebase will run on the native thread, allowing the rest of your app to run on the [JS thread](https://facebook.github.io/react-native/docs/performance.html#javascript-frame-rate). The Firebase Web SDK also runs on the JS thread, therefore potentially affecting the frame rate causing jank with animations, touch events etc.

The native SDKs also allow us to hook into device sdk's which are not possible with the web SDK, for example crash reporting, offline realtime database support, analytics and more!

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
| **Cloud Firestore**        | ❌ | ❌ | ✅ | ❌ |
| **Cloud Messaging (FCM)**  | ✅ | ✅ | ✅ |**?**|
| **Crash Reporting**        | ✅ | ✅ | ✅ | ❌ |
| **Dynamic Links**          | ❌ | ❌ | ❌ | ❌ |
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

---

### License

- See [LICENSE](/LICENSE)
