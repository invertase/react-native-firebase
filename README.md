<p align="center">
  <a href="https://invertase.io/oss/react-native-firebase">
    <img width="180px" src="https://i.imgur.com/JIyBtKW.png"><br/>
  </a>
  <h2 align="center">React Native Firebase</h2>
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

**React Native Firebase** is a _light-weight_ javascript layer connecting you to the native Firebase SDKs for both iOS and Android which aims to mirror the official Firebase Web SDK as closely as possible.

Although the official [Firebase JS SDK](https://www.npmjs.com/package/firebase) will work with React Native; it is mainly built for the web and has a limited feature-set compared to native.

Using the native Firebase SDKs with **React Native Firebase** allows you to consume device SDKs which don't exist on the Firebase JS SDK - for example; Remote Config, Performance Monitoring, Dynamic Links, Analytics and more (see the feature table below for comparison).

---

## Supported Firebase Features

> The Web SDK column indicates what modules/functionality from the Web SDK are usable within React Native.

> '**?**' indicates partial support

| Firebase Features                                                                                                                 | v5.x.x | Web SDK |
| --------------------------------------------------------------------------------------------------------------------------------- | :----: | :-----: |
| **AdMob**                                                                                                                         |   ✅   |   ❌    |
| **Analytics**                                                                                                                     |   ✅   |   ❌    |
| **App Indexing**                                                                                                                  |   ❌   |   ❌    |
| **Authentication**                                                                                                                |   ✅   |   ✅    |
| _-- Phone Auth_                                                                                                                   |   ✅   |   ✅    |
| **Core**                                                                                                                          |   ✅   |   ✅    |
| _-- Multiple Apps_                                                                                                                |   ✅   |   ✅    |
| **Cloud Firestore**                                                                                                               |   ✅   |   ✅    |
| **Cloud Messaging (FCM)**                                                                                                         |   ✅   |   ❌    |
| **Crashlytics**                                                                                                                   |   ✅   |   ❌    |
| **Dynamic Links**                                                                                                                 |   ✅   |   ❌    |
| **[Functions Callable](https://firebase.googleblog.com/2018/04/launching-cloud-functions-for-firebase-1-0.html?m=1)**             |   ✅   |   ✅    |
| **Invites**                                                                                                                       |   ✅   |   ❌    |
| **Instance ID**                                                                                                                   |   ✅   |   ❌    |
| **Performance Monitoring**                                                                                                        |   ✅   |   ❌    |
| **Realtime Database**                                                                                                             |   ✅   |   ✅    |
| _-- Offline Persistence_                                                                                                          |   ✅   |  **?**  |
| **Remote Config**                                                                                                                 |   ✅   |   ❌    |
| **Storage**                                                                                                                       |   ✅   |   ✅    |

---

### Supported versions - React Native / Firebase

> The table below shows the supported versions of React Native and the Firebase SDKs for different versions of `react-native-firebase`.

|                           |  3.3.x   |  4.3.x  |       5.x.x       |
| ------------------------- | :------: | :-----: | :---------------: |
| React Native              | 0.50-52  | 0.52-55 |   ^0.56 - ^0.58   |
| Play Services Android SDK | 11.8.0 + | 15.0.1  |      ^16.0.1      |
| Firebase iOS SDK          | 4.7.0 +  |  5.3.0  | ^5.10.0 - ^5.15.0 |


---

## Documentation

To check out our latest docs, visit [https://invertase.io/oss/react-native-firebase](https://invertase.io/oss/react-native-firebase)

## Questions

For questions and support please use our [Discord chat](https://discord.gg/C9aK28N) or [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native-firebase). The issue list of this repo is **exclusively** for bug reports.

## Issues

Please make sure to complete the issue template before opening an issue. Issues not conforming to the guidelines may be closed immediately.

## Feature Requests

For feature requests please visit our [Feature Request Board](https://boards.invertase.io/react-native-firebase).

## Changelog

Detailed changes for each release are documented in the [releases notes](https://github.com/invertase/react-native-firebase/releases).

---

## Supporting RNFirebase

RNFirebase is an Apache-2.0 licensed open source project. It's an independent project with its ongoing development made possible entirely thanks to the support by these awesome [sponsors](#sponsors) and [backers](#backers). If you'd like to join them, please consider:

- [Become a backer or sponsor on Open Collective](https://opencollective.com/react-native-firebase).

### Sponsors

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

### Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/react-native-firebase#backer)]

<a href="https://opencollective.com/react-native-firebase#backers" target="_blank"><img src="https://opencollective.com/react-native-firebase/backers.svg?width=890"></a>

### Contributing

Please make sure to read the [Contributing Guide](CONTRIBUTING.md) before making a pull request.

Thank you to all the people who have already contributed to RNFirebase!

<a href="graphs/contributors"><img src="https://opencollective.com/react-native-firebase/contributors.svg?width=890" /></a>

<hr>

## License

- See [LICENSE](/LICENSE)
