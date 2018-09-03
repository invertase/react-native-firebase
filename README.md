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
### Supported Firebase Features

> The Web SDK column indicates what modules from the Firebase Web SDK are usable with React Native.

| Firebase Features      | v1  | v2  | Web SDK |
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
|  - Transactions        | ✅ | ✅ | ✅ |
| Remote Config          | ✅ | ✅ | ❌ |
| Storage                | ✅ | ✅ | ❌ |

---
### Supported versions - React Native / Firebase

> The table below shows the supported version of `react-native-firebase` for different React Native versions

|                                 | v0.36 - v0.39  | v0.40 - v0.46  | v0.47 +
| ------------------------------- | :---: | :---: | :---: |
| react-native-firebase           | 1.X.X | 2.X.X | 2.1.X |

> The table below shows the minimum supported versions of the Firebase SDKs for each version of `react-native-firebase`

|                        | v1  | v2  |
| ---------------------- | :---: | :---: |
| Firebase Android SDK   | 10.2.0+ | 11.0.0 + |
| Firebase iOS SDK       | 3.15.0+ | 4.0.0 +  |

---

### License

- MIT
