# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [7.1.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/messaging@7.1.0...@react-native-firebase/messaging@7.1.1) (2020-05-28)

### Bug Fixes

- **messaging,ios:** crash receiving notification with image ([#3701](https://github.com/invertase/react-native-firebase/issues/3701)) ([f889646](https://github.com/invertase/react-native-firebase/commit/f889646d2ecbede9f06fde67a63e877f14df8ced)), closes [#3447](https://github.com/invertase/react-native-firebase/issues/3447) [#3616](https://github.com/invertase/react-native-firebase/issues/3616) [#3447](https://github.com/invertase/react-native-firebase/issues/3447)

# [7.1.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/messaging@7.0.1...@react-native-firebase/messaging@7.1.0) (2020-05-22)

### Features

- update native Firebase SDK versions ([#3663](https://github.com/invertase/react-native-firebase/issues/3663)) ([4db9dbc](https://github.com/invertase/react-native-firebase/commit/4db9dbc3ec20bf96de0efad15000f00b41e4a799))

## [7.0.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/messaging@7.0.0...@react-native-firebase/messaging@7.0.1) (2020-05-13)

**Note:** Version bump only for package @react-native-firebase/messaging

## [7.0.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/messaging@7.0.0...@react-native-firebase/messaging@7.0.0) (2020-05-13)

- feat!: all packages should depend on core (#3613) ([252a423](https://github.com/invertase/react-native-firebase/commit/252a4239e98a0f2a55c4afcd2d82e4d5f97e65e9)), closes [#3613](https://github.com/invertase/react-native-firebase/issues/3613)

### Bug Fixes

- onTokenChange method causing app to crash ([#3552](https://github.com/invertase/react-native-firebase/issues/3552)) ([1d7cd28](https://github.com/invertase/react-native-firebase/commit/1d7cd28f85d09d35805b59896809ca93aa436285))
- **messaging:** onNotificationOpenedApp callable return type ([#3641](https://github.com/invertase/react-native-firebase/issues/3641)) ([cd5cb23](https://github.com/invertase/react-native-firebase/commit/cd5cb23d6353f617b5af350169e929c88f90aafb))

### Features

- **ios:** podspecs now utilize CoreOnly instead of Core ([#3575](https://github.com/invertase/react-native-firebase/issues/3575)) ([35285f1](https://github.com/invertase/react-native-firebase/commit/35285f1655b16d05e6630fc556f95cccfb707ee4))
- **messaging:** support loc keys on notification payloads ([#3579](https://github.com/invertase/react-native-firebase/issues/3579)) ([9b294b3](https://github.com/invertase/react-native-firebase/commit/9b294b3e161d604aa3c8900355c7b638974ea4ae))

### BREAKING CHANGES

- breaking change to mark new internal versioning requirements.
