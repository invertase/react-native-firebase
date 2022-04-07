<p align="center">
  <a href="https://rnfirebase.io">
    <img width="160px" src="https://i.imgur.com/JIyBtKW.png"><br/>
  </a>
  <h2 align="center">React Native Firebase</h2>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@react-native-firebase/app"><img src="https://img.shields.io/npm/dm/@react-native-firebase/app.svg?style=flat-square" alt="NPM downloads"></a>
  <a href="https://www.npmjs.com/package/@react-native-firebase/app"><img src="https://img.shields.io/npm/v/@react-native-firebase/app.svg?style=flat-square" alt="NPM version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/npm/l/@react-native-firebase/app.svg?style=flat-square" alt="License"></a>
  <a href="https://lerna.js.org/"><img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=flat-square" alt="Maintained with Lerna"></a>
</p>

<p align="center">
  <a href="https://invertase.link/discord"><img src="https://img.shields.io/discord/295953187817521152.svg?style=flat-square&colorA=7289da&label=Chat%20on%20Discord" alt="Chat on Discord"></a>
  <a href="https://twitter.com/rnfirebase"><img src="https://img.shields.io/twitter/follow/rnfirebase.svg?style=flat-square&colorA=1da1f2&colorB=&label=Follow%20on%20Twitter" alt="Follow on Twitter"></a>
  <a href="https://www.facebook.com/groups/rnfirebase"><img src="https://img.shields.io/badge/Follow%20on%20Facebook-4172B8?logo=facebook&style=flat-square&logoColor=fff" alt="Follow on Facebook"></a>
</p>

---

**React Native Firebase** is a collection of official React Native modules connecting you to Firebase services; each module is a light-weight JavaScript layer connecting you to the native Firebase SDKs for both iOS and Android.

React Native Firebase is built with four key principles in mind;

- 🧪 **Well tested**
  - every module is extensively tested to >95% coverage
- 👁 **Well typed**
  - first class support for Typescript included
- 📄 **Well documented**
  - full reference & installation documentation alongside detailed guides and FAQs
- 🔥 **Mirrors official Firebase Web SDK**
  - functions as a drop-in replacement for the Firebase Web SDK in React Native
  - maximizes cross-platform code re-usability e.g. re-using code on web platforms

## Firebase Modules

This is the root of the mono-repo for React Native Firebase, if you're looking for a specific package please select the package link from below.

The main package that you interface with is `App` (`@react-native-firebase/app`)

| Name                                                     | Downloads                                                                                                                                                                                       |                                                                                        
| -------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | 
| [Analytics](/packages/analytics)                         |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/analytics.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/analytics)           |
| [App](/packages/app)                                     |                 [![badge](https://img.shields.io/npm/dm/@react-native-firebase/app.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/app)                 |
| [App Check](/packages/app-check)                         |               [![badge](https://img.shields.io/npm/dm/@react-native-firebase/app-check.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/app-check)       |
| [App Distribution](/packages/app-distribution)           |  [![badge](https://img.shields.io/npm/dm/@react-native-firebase/app-distribution.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/app-distribution)      |
| [Authentication](/packages/auth)                         |                [![badge](https://img.shields.io/npm/dm/@react-native-firebase/auth.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/auth)                |
| [Cloud Firestore](/packages/firestore)                   |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/firestore.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/firestore)           |
| [Cloud Functions](/packages/functions)                   |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/functions.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/functions)           |
| [Cloud Messaging](/packages/messaging)                   |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/messaging.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/messaging)           |
| [Cloud Storage](/packages/storage)                       |             [![badge](https://img.shields.io/npm/dm/@react-native-firebase/storage.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/storage)             |
| [Crashlytics](/packages/crashlytics)                     |         [![badge](https://img.shields.io/npm/dm/@react-native-firebase/crashlytics.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/crashlytics)         |
| [Dynamic Links](/packages/dynamic-links)                 |       [![badge](https://img.shields.io/npm/dm/@react-native-firebase/dynamic-links.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/dynamic-links)       |
| [In-app Messaging](/packages/in-app-messaging)           |    [![badge](https://img.shields.io/npm/dm/@react-native-firebase/in-app-messaging.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/in-app-messaging)    |
| [Installations](/packages/installations)                 |    [![badge](https://img.shields.io/npm/dm/@react-native-firebase/installations.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/installations)          |
| [ML](/packages/ml)                                       |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/ml.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/ml)                         |
| [Performance Monitoring](/packages/perf)                 |                [![badge](https://img.shields.io/npm/dm/@react-native-firebase/perf.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/perf)                |
| [Realtime Database](/packages/database)                  |            [![badge](https://img.shields.io/npm/dm/@react-native-firebase/database.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/database)            |
| [Remote Config](/packages/remote-config)                 |       [![badge](https://img.shields.io/npm/dm/@react-native-firebase/remote-config.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/remote-config)       |

## Documentation

- [Quick Start](https://rnfirebase.io/)
- [Reference API](https://rnfirebase.io/reference)

Looking for the Version 5 documentation? [View legacy documentation](https://v5.rnfirebase.io).

## Contributing

- [Overview](https://github.com/invertase/react-native-firebase/blob/main/CONTRIBUTING.md)
- [Issues](https://github.com/invertase/react-native-firebase/issues)
- [PRs](https://github.com/invertase/react-native-firebase/pulls)
- [Documentation](https://rnfirebase.io)
- [Community](https://github.com/invertase/react-native-firebase/blob/main/CONTRIBUTING.md)
- [Code of Conduct](https://github.com/invertase/meta/blob/main/CODE_OF_CONDUCT.md)

## License

- See [LICENSE](/LICENSE)

---

<p align="center">
  <a href="https://invertase.io/?utm_source=readme&utm_medium=footer&utm_campaign=react-native-firebase">
    <img width="75px" src="https://static.invertase.io/assets/invertase/invertase-rounded-avatar.png">
  </a>
  <p align="center">
    Built and maintained by <a href="https://invertase.io/?utm_source=readme&utm_medium=footer&utm_campaign=react-native-firebase">Invertase</a>.
  </p>
</p>
