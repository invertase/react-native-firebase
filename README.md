# React Native Firebase<a href="https://rnfirebase.io"><img align="left" src="http://i.imgur.com/01XQL0x.png"></a>

[![Backers on Open Collective](https://opencollective.com/react-native-firebase/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/react-native-firebase/sponsors/badge.svg)](#sponsors) [![npm version](https://img.shields.io/npm/v/react-native-firebase.svg?style=flat-square)](https://www.npmjs.com/package/react-native-firebase)
[![NPM downloads](https://img.shields.io/npm/dm/react-native-firebase.svg?style=flat-square)](https://www.npmjs.com/package/react-native-firebase)
[![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg?style=flat-square)](https://discord.gg/t6bdqMs)
[![Donate](https://img.shields.io/badge/Donate-Patreon-green.svg?style=flat-square)](https://www.patreon.com/invertase)
[![Twitter Follow](https://img.shields.io/twitter/follow/rnfirebase.svg?style=social&label=Follow)](https://twitter.com/rnfirebase)


**RNFirebase** makes using [Firebase](http://firebase.com) with React Native simple. 

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

## Contributors

This project exists thanks to all the people who contribute. [[Contribute]](CONTRIBUTING.md).
<a href="graphs/contributors"><img src="https://opencollective.com/react-native-firebase/contributors.svg?width=890" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/react-native-firebase#backer)]

<a href="https://opencollective.com/react-native-firebase#backers" target="_blank"><img src="https://opencollective.com/react-native-firebase/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/react-native-firebase#sponsor)]

<a href="https://opencollective.com/react-native-firebase/sponsor/0/website" target="_blank"><img src="https://opencollective.com/react-native-firebase/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/react-native-firebase/sponsor/1/website" target="_blank"><img src="https://opencollective.com/react-native-firebase/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/react-native-firebase/sponsor/2/website" target="_blank"><img src="https://opencollective.com/react-native-firebase/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/react-native-firebase/sponsor/3/website" target="_blank"><img src="https://opencollective.com/react-native-firebase/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/react-native-firebase/sponsor/4/website" target="_blank"><img src="https://opencollective.com/react-native-firebase/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/react-native-firebase/sponsor/5/website" target="_blank"><img src="https://opencollective.com/react-native-firebase/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/react-native-firebase/sponsor/6/website" target="_blank"><img src="https://opencollective.com/react-native-firebase/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/react-native-firebase/sponsor/7/website" target="_blank"><img src="https://opencollective.com/react-native-firebase/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/react-native-firebase/sponsor/8/website" target="_blank"><img src="https://opencollective.com/react-native-firebase/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/react-native-firebase/sponsor/9/website" target="_blank"><img src="https://opencollective.com/react-native-firebase/sponsor/9/avatar.svg"></a>



### License

- See [LICENSE](/LICENSE)
