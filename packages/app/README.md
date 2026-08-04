<p align="center">
  <a href="https://rnfirebase.io">
    <img width="160px" src="https://i.imgur.com/JIyBtKW.png"><br/>
  </a>
  <h2 align="center">React Native Firebase</h2>
</p>

<p align="center">
  <a href="https://api.rnfirebase.io/coverage/app/detail"><img src="https://api.rnfirebase.io/coverage/app/badge?style=flat-square" alt="Coverage"></a>
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

## Installation

```bash
yarn add @react-native-firebase/app
```

## Documentation

- [Quick Start](https://rnfirebase.io/app/usage)
- [Reference](https://rnfirebase.io/reference/app)

### Additional Topics

- [Utils](https://rnfirebase.io/app/utils)

## iOS Dependency Resolution: SPM vs CocoaPods

React Native 0.75 and newer use Swift Package Manager by default to resolve
Firebase iOS SDK dependencies. SPM requires dynamic linkage:

```ruby
use_frameworks! :linkage => :dynamic
```

To use CocoaPods instead, add this before any target block in your Podfile:

```ruby
$RNFirebaseDisableSPM = true
```

Expo projects can set the same flag through the config plugin, which adds it
to the generated Podfile during prebuild:

```json
[
  "@react-native-firebase/app",
  {
    "ios": {
      "disableSPM": true
    }
  }
]
```

CocoaPods mode supports static or dynamic linkage. React Native versions older
than 0.75 fall back to CocoaPods automatically.

See the [iOS SPM guide](https://rnfirebase.io/ios-spm) for Xcode 26 setup,
Expo configuration, framework-embedding fallback, and troubleshooting.

## License

- See [LICENSE](/LICENSE)

---

<p>
  <img align="left" width="75px" src="https://static.invertase.io/assets/invertase/invertase-rounded.png">
  <p align="left">
    Built and maintained with 💛 by <a href="https://invertase.io">Invertase</a>.
  </p>
</p>

---
