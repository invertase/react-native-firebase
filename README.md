<p align="center">
  <a href="https://invertase.io/oss/react-native-firebase">
    <img width="160px" src="https://i.imgur.com/JIyBtKW.png"><br/>
  </a>
  <h4 align="center">React Native Firebase</h2>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-native-firebase"><img src="https://img.shields.io/npm/dm/react-native-firebase.svg?style=flat-square" alt="NPM downloads"></a>
  <a href="https://www.npmjs.com/package/react-native-firebase"><img src="https://img.shields.io/npm/v/react-native-firebase.svg?style=flat-square" alt="NPM version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/npm/l/react-native-firebase.svg?style=flat-square" alt="License"></a>
  <a href="#backers"><img src="https://opencollective.com/react-native-firebase/backers/badge.svg?style=flat-square" alt="Backers on Open Collective"></a>
  <a href="#sponsors"><img src="https://opencollective.com/react-native-firebase/sponsors/badge.svg?style=flat-square" alt="Sponsors on Open Collective"></a>
  <a href="https://discord.gg/C9aK28N"><img src="https://img.shields.io/discord/295953187817521152.svg?logo=discord&style=flat-square&colorA=7289da&label=discord" alt="Chat"></a>
  <a href="https://twitter.com/rnfirebase"><img src="https://img.shields.io/twitter/follow/rnfirebase.svg?style=social&label=Follow" alt="Follow on Twitter"></a>
</p>

---

> **WARNING**: Master branch is the work in progress v6.0.0 version of React Native Firebase, you're probably looking for the current [v5.x.x branch](https://github.com/invertase/react-native-firebase/tree/v5.x.x) instead, please send all PRs for the live version to that branch. You can [learn more about this here](https://blog.invertase.io/react-native-firebase-2019-7e334ca9bcc6).

---

**React Native Firebase** is a collection of official React Native modules connecting you to Firebase services; each module is a light-weight javascript layer connecting you to the native Firebase SDKs for both iOS and Android.

React Native Firebase is built with four key principals in mind;

- 🧪 **Well tested**
  - every module is extensively tested to >95% coverage
- 👁 **Well typed**
  - first class support for both Flow & Typescript included
- 📄 **Well documented**
  - full reference & installation documentation alongside detailed guides and FAQs
- 🔥 **Mirrors official Firebase Web SDK**
  - functions as a drop-in replacement for the Firebase Web SDK in React Native
  - maximises cross-platform code re-usability e.g. re-using code on web platforms

## Firebase Modules

This is the root of the monorepo for React Native Firebase, if you're looking for a specific package please select the package link from below.

The main package that you interface with is `App` (`@react-native-firebase/app`)

| Name                                     |                                                                                      Downloads                                                                                      |                                                          Coverage                                                           |
| ---------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------: |
| [AdMob](/packages/admob)                 |         [![badge](https://img.shields.io/npm/dm/@react-native-firebase/admob.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/admob)         |         [![badge](https://api.rnfirebase.io/coverage/admob/badge)](https://api.rnfirebase.io/coverage/admob/detail)         |
| [Analytics](/packages/analytics)         |     [![badge](https://img.shields.io/npm/dm/@react-native-firebase/analytics.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/analytics)     |     [![badge](https://api.rnfirebase.io/coverage/analytics/badge)](https://api.rnfirebase.io/coverage/analytics/detail)     |
| [App](/packages/app)                     |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/app.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/app)           |           [![badge](https://api.rnfirebase.io/coverage/app/badge)](https://api.rnfirebase.io/coverage/app/detail)           |
| [App Indexing](/packages/indexing)       |      [![badge](https://img.shields.io/npm/dm/@react-native-firebase/indexing.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/indexing)      |      [![badge](https://api.rnfirebase.io/coverage/indexing/badge)](https://api.rnfirebase.io/coverage/indexing/detail)      |
| [App Invites](/packages/invites)         |       [![badge](https://img.shields.io/npm/dm/@react-native-firebase/invites.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/invites)       |       [![badge](https://api.rnfirebase.io/coverage/invites/badge)](https://api.rnfirebase.io/coverage/invites/detail)       |
| [Authentication](/packages/auth)         |          [![badge](https://img.shields.io/npm/dm/@react-native-firebase/auth.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/auth)          |          [![badge](https://api.rnfirebase.io/coverage/auth/badge)](https://api.rnfirebase.io/coverage/auth/detail)          |
| [Cloud Firestore](/packages/firestore)   |     [![badge](https://img.shields.io/npm/dm/@react-native-firebase/firestore.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/firestore)     |     [![badge](https://api.rnfirebase.io/coverage/firestore/badge)](https://api.rnfirebase.io/coverage/firestore/detail)     |
| [Cloud Functions](/packages/functions)   |     [![badge](https://img.shields.io/npm/dm/@react-native-firebase/functions.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/functions)     |     [![badge](https://api.rnfirebase.io/coverage/functions/badge)](https://api.rnfirebase.io/coverage/functions/detail)     |
| [Cloud Messaging](/packages/messaging)   |     [![badge](https://img.shields.io/npm/dm/@react-native-firebase/messaging.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/messaging)     |     [![badge](https://api.rnfirebase.io/coverage/messaging/badge)](https://api.rnfirebase.io/coverage/messaging/detail)     |
| [Cloud Storage](/packages/storage)       |       [![badge](https://img.shields.io/npm/dm/@react-native-firebase/storage.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/storage)       |       [![badge](https://api.rnfirebase.io/coverage/storage/badge)](https://api.rnfirebase.io/coverage/storage/detail)       |
| [Crashlytics](/packages/crashlytics)     |   [![badge](https://img.shields.io/npm/dm/@react-native-firebase/crashlytics.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/crashlytics)   |   [![badge](https://api.rnfirebase.io/coverage/crashlytics/badge)](https://api.rnfirebase.io/coverage/crashlytics/detail)   |
| [Dynamic Links](/packages/links)         |         [![badge](https://img.shields.io/npm/dm/@react-native-firebase/links.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/links)         |         [![badge](https://api.rnfirebase.io/coverage/links/badge)](https://api.rnfirebase.io/coverage/links/detail)         |
| [In-app Messaging](/packages/fiam)       |          [![badge](https://img.shields.io/npm/dm/@react-native-firebase/fiam.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/fiam)          |          [![badge](https://api.rnfirebase.io/coverage/fiam/badge)](https://api.rnfirebase.io/coverage/fiam/detail)          |
| [Instance ID](/packages/iid)             |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/iid.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/iid)           |           [![badge](https://api.rnfirebase.io/coverage/iid/badge)](https://api.rnfirebase.io/coverage/iid/detail)           |
| [ML Kit](/packages/mlkit)                |         [![badge](https://img.shields.io/npm/dm/@react-native-firebase/mlkit.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/mlkit)         |         [![badge](https://api.rnfirebase.io/coverage/mlkit/badge)](https://api.rnfirebase.io/coverage/mlkit/detail)         |
| [Notifications](/packages/notifications) | [![badge](https://img.shields.io/npm/dm/@react-native-firebase/notifications.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/notifications) | [![badge](https://api.rnfirebase.io/coverage/notifications/badge)](https://api.rnfirebase.io/coverage/notifications/detail) |
| [Performance Monitoring](/packages/perf) |          [![badge](https://img.shields.io/npm/dm/@react-native-firebase/perf.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/perf)          |          [![badge](https://api.rnfirebase.io/coverage/perf/badge)](https://api.rnfirebase.io/coverage/perf/detail)          |
| [Realtime Database](/packages/database)  |      [![badge](https://img.shields.io/npm/dm/@react-native-firebase/database.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/database)      |      [![badge](https://api.rnfirebase.io/coverage/database/badge)](https://api.rnfirebase.io/coverage/database/detail)      |
| [Remote Config](/packages/config)        |        [![badge](https://img.shields.io/npm/dm/@react-native-firebase/config.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/config)        |        [![badge](https://api.rnfirebase.io/coverage/config/badge)](https://api.rnfirebase.io/coverage/config/detail)        |
| [Utils](/packages/utils)                 |         [![badge](https://img.shields.io/npm/dm/@react-native-firebase/utils.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/utils)         |         [![badge](https://api.rnfirebase.io/coverage/utils/badge)](https://api.rnfirebase.io/coverage/utils/detail)         |

## Other Packages

React Native Firebase also publishes several other packages, some only used internally, others for public consumption such as Hooks.

| Name                             |                   Description                   |
| -------------------------------- | :---------------------------------------------: |
| [app-types](/packages/app-types) | Common Firebase types used by and all modules.  |
| [common](/packages/common)       |      Common utilities used by all modules.      |
| [hooks](/packages/hooks) (WIP)   | Official React Hooks for React Native Firebase. |

> TODO other packages

## Documentation

- [Guides](#TODO)
- [Installation](#TODO)

## Contributing

- [Contributing](/CONTRIBUTING.md)
- [Code of Conduct](/CODE_OF_CONDUCT.md)
- [Testing](/tests/README.md)

## License

- See [LICENSE](/LICENSE)

---

Built and maintained with 💛 by [Invertase](https://invertase.io).

- [💼 Hire Us](https://invertase.io/hire-us)
- [☕️ Sponsor Us](https://opencollective.com/react-native-firebase)
- [👩‍💻 Work With Us](https://invertase.io/jobs)
