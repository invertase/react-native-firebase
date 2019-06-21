<p align="left">
  <a href="https://invertase.io/oss/react-native-firebase">
    <img width="160px" src="https://i.imgur.com/JIyBtKW.png"><br/>
  </a>
  <h4 align="center">React Native Firebase - Instance ID</h2>
</p>

<p align="left">
  <a href="https://api.rnfirebase.io/coverage/iid/detail"><img src="https://api.rnfirebase.io/coverage/iid/badge?style=flat-square" alt="Coverage"></a>
  <a href="https://www.npmjs.com/package/@react-native-firebase/iid"><img src="https://img.shields.io/npm/dm/@react-native-firebase/iid.svg?style=flat-square" alt="NPM downloads"></a>
  <a href="https://www.npmjs.com/package/@react-native-firebase/iid"><img src="https://img.shields.io/npm/v/@react-native-firebase/iid.svg?style=flat-square" alt="NPM version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/npm/l/react-native-firebase.svg?style=flat-square" alt="License"></a>
  <a href="#backers"><img src="https://opencollective.com/react-native-firebase/backers/badge.svg?style=flat-square" alt="Backers on Open Collective"></a>
  <a href="#sponsors"><img src="https://opencollective.com/react-native-firebase/sponsors/badge.svg?style=flat-square" alt="Sponsors on Open Collective"></a>
  <a href="https://discord.gg/C9aK28N"><img src="https://img.shields.io/discord/295953187817521152.svg?logo=discord&style=flat-square&colorA=7289da&label=discord" alt="Chat"></a>
  <a href="https://twitter.com/rnfirebase"><img src="https://img.shields.io/twitter/follow/rnfirebase.svg?style=social&label=Follow" alt="Follow on Twitter"></a>
</p>

---

> This is for the upcoming v6.0.0 release of React Native Firebase, please use the [react-native-firebase](https://www.npmjs.com/package/react-native-firebase) package instead, unless you're early adopting/testing the new packages - in which case please use the latest alpha/beta/next tag release on npm and not the `latest` tagged release for this package.

Firebase Instance ID provides a unique identifier for each instance of your app and a mechanism to authenticate
and authorize actions for it (for example: sending FCM messages).

An Instance ID is long lived except in a few scenarios:

- when you call `delete()`
- the app is restored on a new device
- the user uninstalls/reinstall the app
- [android] the user clears the app data

## Installation

Requires `@react-native-firebase/app` to be installed.

```bash
yarn add @react-native-firebase/iid
react-native link @react-native-firebase/iid
```

## Documentation

- [Guides](https://invertase.io/oss/react-native-firebase/guides?tags=iid)
- [Installation](https://invertase.io/oss/react-native-firebase/v6/iid)
- [Reference](https://invertase.io/oss/react-native-firebase/v6/iid/reference)

## License

- See [LICENSE](/LICENSE)

---

<p>
  <img align="left" width="75px" src="https://static.invertase.io/assets/invertase-logo-small.png"> 
  <p align="left">  
    Built and maintained with 💛 by <a href="https://invertase.io">Invertase</a>.
  </p>
  <p align="left">  
    <a href="https://invertase.io/hire-us">💼 Hire Us</a> | 
    <a href="https://opencollective.com/react-native-firebase">☕️ Sponsor Us</a> | 
    <a href="https://opencollective.com/jobs">‍💻 Work With Us</a>
  </p>
</p>

---
