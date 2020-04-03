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

**React Native Firebase** is a collection of official React Native modules connecting you to Firebase services; each module is a light-weight javascript layer connecting you to the native Firebase SDKs for both iOS and Android.

React Native Firebase is built with four key principals in mind;

- 🧪 **Well tested**
  - every module is extensively tested to >95% coverage
- 👁 **Well typed**
  - first class support for Typescript included
- 📄 **Well documented**
  - full reference & installation documentation alongside detailed guides and FAQs
- 🔥 **Mirrors official Firebase Web SDK**
  - functions as a drop-in replacement for the Firebase Web SDK in React Native
  - maximises cross-platform code re-usability e.g. re-using code on web platforms

## Firebase Modules

This is the root of the monorepo for React Native Firebase, if you're looking for a specific package please select the package link from below.

The main package that you interface with is `App` (`@react-native-firebase/app`)

| Name                                                     |                                                                                            Downloads                                                                                            |                                                                Coverage                                                                 |
| -------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------: |
| [AdMob](/packages/admob)                                 |               [![badge](https://img.shields.io/npm/dm/@react-native-firebase/admob.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/admob)               |               [![badge](https://api.rnfirebase.io/coverage/admob/badge)](https://api.rnfirebase.io/coverage/admob/detail)               |
| [Analytics](/packages/analytics)                         |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/analytics.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/analytics)           |           [![badge](https://api.rnfirebase.io/coverage/analytics/badge)](https://api.rnfirebase.io/coverage/analytics/detail)           |
| [App](/packages/app)                                     |                 [![badge](https://img.shields.io/npm/dm/@react-native-firebase/app.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/app)                 |                 [![badge](https://api.rnfirebase.io/coverage/app/badge)](https://api.rnfirebase.io/coverage/app/detail)                 |
| [Authentication](/packages/auth)                         |                [![badge](https://img.shields.io/npm/dm/@react-native-firebase/auth.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/auth)                |                [![badge](https://api.rnfirebase.io/coverage/auth/badge)](https://api.rnfirebase.io/coverage/auth/detail)                |
| [Cloud Firestore](/packages/firestore)                   |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/firestore.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/firestore)           |           [![badge](https://api.rnfirebase.io/coverage/firestore/badge)](https://api.rnfirebase.io/coverage/firestore/detail)           |
| [Cloud Functions](/packages/functions)                   |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/functions.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/functions)           |           [![badge](https://api.rnfirebase.io/coverage/functions/badge)](https://api.rnfirebase.io/coverage/functions/detail)           |
| [Cloud Messaging](/packages/messaging)                   |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/messaging.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/messaging)           |           [![badge](https://api.rnfirebase.io/coverage/messaging/badge)](https://api.rnfirebase.io/coverage/messaging/detail)           |
| [Cloud Storage](/packages/storage)                       |             [![badge](https://img.shields.io/npm/dm/@react-native-firebase/storage.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/storage)             |             [![badge](https://api.rnfirebase.io/coverage/storage/badge)](https://api.rnfirebase.io/coverage/storage/detail)             |
| [Crashlytics](/packages/crashlytics)                     |         [![badge](https://img.shields.io/npm/dm/@react-native-firebase/crashlytics.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/crashlytics)         |         [![badge](https://api.rnfirebase.io/coverage/crashlytics/badge)](https://api.rnfirebase.io/coverage/crashlytics/detail)         |
| [Dynamic Links](/packages/dynamic-links)                 |       [![badge](https://img.shields.io/npm/dm/@react-native-firebase/dynamic-links.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/dynamic-links)       |       [![badge](https://api.rnfirebase.io/coverage/dynamic-links/badge)](https://api.rnfirebase.io/coverage/dynamic-links/detail)       |
| [In-app Messaging](/packages/in-app-messaging)           |    [![badge](https://img.shields.io/npm/dm/@react-native-firebase/in-app-messaging.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/in-app-messaging)    |    [![badge](https://api.rnfirebase.io/coverage/in-app-messaging/badge)](https://api.rnfirebase.io/coverage/in-app-messaging/detail)    |
| [Instance ID](/packages/iid)                             |                 [![badge](https://img.shields.io/npm/dm/@react-native-firebase/iid.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/iid)                 |                 [![badge](https://api.rnfirebase.io/coverage/iid/badge)](https://api.rnfirebase.io/coverage/iid/detail)                 |
| [ML Kit Natural Language](/packages/ml-natural-language) | [![badge](https://img.shields.io/npm/dm/@react-native-firebase/ml-natural-language.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/ml-natural-language) | [![badge](https://api.rnfirebase.io/coverage/ml-natural-language/badge)](https://api.rnfirebase.io/coverage/ml-natural-language/detail) |
| [ML Kit Vision](/packages/ml-vision)                     |           [![badge](https://img.shields.io/npm/dm/@react-native-firebase/ml-vision.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/ml-vision)           |           [![badge](https://api.rnfirebase.io/coverage/ml-vision/badge)](https://api.rnfirebase.io/coverage/ml-vision/detail)           |
| [Performance Monitoring](/packages/perf)                 |                [![badge](https://img.shields.io/npm/dm/@react-native-firebase/perf.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/perf)                |                [![badge](https://api.rnfirebase.io/coverage/perf/badge)](https://api.rnfirebase.io/coverage/perf/detail)                |
| [Realtime Database](/packages/database)                  |            [![badge](https://img.shields.io/npm/dm/@react-native-firebase/database.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/database)            |            [![badge](https://api.rnfirebase.io/coverage/database/badge)](https://api.rnfirebase.io/coverage/database/detail)            |
| [Remote Config](/packages/remote-config)                 |       [![badge](https://img.shields.io/npm/dm/@react-native-firebase/remote-config.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@react-native-firebase/remote-config)       |       [![badge](https://api.rnfirebase.io/coverage/remote-config/badge)](https://api.rnfirebase.io/coverage/remote-config/detail)       |

## Documentation

- [Quick Start](https://rnfirebase.io/)
- [Reference API](https://rnfirebase.io/reference)

## Contributing

- [Overview](https://rnfirebase.io/contributing)
- [Issues & PRs](https://rnfirebase.io/contributing#issues--prs)
- [Documentation](https://rnfirebase.io/contributing#documentation)
- [Community](https://rnfirebase.io/contributing#community)
- [Code of Conduct](/CODE_OF_CONDUCT.md)

## License

- See [LICENSE](/LICENSE)

---

<p>
  <img align="left" width="75px" src="https://static.invertase.io/assets/invertase-logo-small.png">
  <p align="left">
    Built and maintained with 💛 by <a href="https://invertase.io">Invertase</a>.
  </p>
</p>

---
