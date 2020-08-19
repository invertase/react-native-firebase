<p align="center">
  <a href="https://rnfirebase.io">
    <img width="160px" src="https://i.imgur.com/JIyBtKW.png"><br/>
  </a>
  <h2 align="center">React Native Firebase - Instance ID</h2>
</p>

<p align="center">
  <a href="https://api.rnfirebase.io/coverage/iid/detail"><img src="https://api.rnfirebase.io/coverage/iid/badge?style=flat-square" alt="Coverage"></a>
  <a href="https://www.npmjs.com/package/@react-native-firebase/iid"><img src="https://img.shields.io/npm/dm/@react-native-firebase/iid.svg?style=flat-square" alt="NPM downloads"></a>
  <a href="https://www.npmjs.com/package/@react-native-firebase/iid"><img src="https://img.shields.io/npm/v/@react-native-firebase/iid.svg?style=flat-square" alt="NPM version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/npm/l/react-native-firebase.svg?style=flat-square" alt="License"></a>
  <a href="https://lerna.js.org/"><img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=flat-square" alt="Maintained with Lerna"></a>
</p>

<p align="center">
  <a href="https://invertase.link/discord"><img src="https://img.shields.io/discord/295953187817521152.svg?style=flat-square&colorA=7289da&label=Chat%20on%20Discord" alt="Chat on Discord"></a>
  <a href="https://twitter.com/rnfirebase"><img src="https://img.shields.io/twitter/follow/rnfirebase.svg?style=flat-square&colorA=1da1f2&colorB=&label=Follow%20on%20Twitter" alt="Follow on Twitter"></a>
  <a href="https://www.facebook.com/groups/rnfirebase"><img src="https://img.shields.io/badge/Follow%20on%20Facebook-4172B8?logo=facebook&style=flat-square&logoColor=fff" alt="Follow on Facebook"></a>
</p>

---

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
```

## Documentation

- [Installation](https://rnfirebase.io/iid/usage)
- [Reference](https://rnfirebase.io/reference/iid)

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
