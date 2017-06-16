# React Native Firebase<a href="https://invertase.io/react-native-firebase"><img align="left" src="http://i.imgur.com/01XQL0x.png"></a>

[![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://discord.gg/t6bdqMs)
[![Gitter](https://badges.gitter.im/invertase/react-native-firebase.svg)](https://gitter.im/invertase/react-native-firebase?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm version](https://img.shields.io/npm/v/react-native-firebase.svg)](https://www.npmjs.com/package/react-native-firebase)
[![License](https://img.shields.io/npm/l/react-native-firebase.svg)](/LICENSE)
[![Donate](https://img.shields.io/badge/Donate-Patreon-green.svg)](https://www.patreon.com/invertase)

**RNFirebase** makes using [Firebase](http://firebase.com) with React Native simple.

> [Documentation](https://invertase.io/react-native-firebase)


<hr>

### Install
```bash
npm i react-native-firebase --save
```

> *Pst! [We're working on V2 with loads of new features!](https://github.com/invertase/react-native-firebase/pull/130)*

#### Platform specific setup guides:
[![ios](https://a.fsdn.com/sd/topics/ios_64.png)](http://invertase.io/react-native-firebase/#/installation-ios)   [![android](https://a.fsdn.com/sd/topics/android_64.png)](http://invertase.io/react-native-firebase/#/installation-android)

<hr>

### Why

RNFirebase is a _light-weight_ layer sitting on-top of the native Firebase libraries for both iOS and Android which mirrors the Firebase Web SDK as closely as possible.

Although the [Firebase Web SDK](https://www.npmjs.com/package/firebase) library will work with React Native, it is mainly built for the web.

RNFirebase provides a JavaScript bridge to the native Firebase SDKs for both iOS and Android. Firebase will run on the native thread, allowing the rest of your app to run on the [JS thread](https://facebook.github.io/react-native/docs/performance.html#javascript-frame-rate). The Firebase Web SDK also runs on the JS thread, therefore potentially affecting the frame rate causing jank with animations, touch events etc. All in all, RNFirebase provides much faster performance (~2x) over the web SDK.

The native SDKs also allow us to hook into device sdk's which are not possible with the web SDK, for example crash reporting, offline realtime database support, analyics and more!

---
### Supported Firebase Features

> The Web SDK column indicates what modules from the Firebase Web SDK are usable with React Native.

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

---

### License

- MIT
