# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [8.2.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.1.2...@react-native-firebase/auth@8.2.0) (2020-07-10)

### Features

- **auth:** verifyBeforeUpdateEmail API ([#3862](https://github.com/invertase/react-native-firebase/issues/3862)) ([aaff624](https://github.com/invertase/react-native-firebase/commit/aaff62402544d8783007b6b47b8406019cc48c84))

## [8.1.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.1.1...@react-native-firebase/auth@8.1.2) (2020-07-09)

**Note:** Version bump only for package @react-native-firebase/auth

## [8.1.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.1.0...@react-native-firebase/auth@8.1.1) (2020-07-07)

**Note:** Version bump only for package @react-native-firebase/auth

# [8.1.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.0.10...@react-native-firebase/auth@8.1.0) (2020-07-07)

### Features

- **android,ios:** upgrade native SDK versions ([#3881](https://github.com/invertase/react-native-firebase/issues/3881)) ([6cb68a8](https://github.com/invertase/react-native-firebase/commit/6cb68a8ea808392fac3a28bdb1a76049c7b52e86))

## [8.0.10](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.0.9...@react-native-firebase/auth@8.0.10) (2020-07-05)

**Note:** Version bump only for package @react-native-firebase/auth

## [8.0.9](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.0.8...@react-native-firebase/auth@8.0.9) (2020-06-30)

**Note:** Version bump only for package @react-native-firebase/auth

## [8.0.8](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.0.7...@react-native-firebase/auth@8.0.8) (2020-06-26)

**Note:** Version bump only for package @react-native-firebase/auth

## [8.0.7](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.0.6...@react-native-firebase/auth@8.0.7) (2020-06-22)

**Note:** Version bump only for package @react-native-firebase/auth

## [8.0.6](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.0.5...@react-native-firebase/auth@8.0.6) (2020-06-18)

### Bug Fixes

- **auth,android:** too-many-requests code now correctly returned ([#3795](https://github.com/invertase/react-native-firebase/issues/3795)) ([c799472](https://github.com/invertase/react-native-firebase/commit/c7994720b14114ac70540744794d8b645e2209e0))

## [8.0.5](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.0.4...@react-native-firebase/auth@8.0.5) (2020-06-10)

**Note:** Version bump only for package @react-native-firebase/auth

## [8.0.4](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.0.3...@react-native-firebase/auth@8.0.4) (2020-06-03)

**Note:** Version bump only for package @react-native-firebase/auth

## [8.0.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.0.2...@react-native-firebase/auth@8.0.3) (2020-06-01)

**Note:** Version bump only for package @react-native-firebase/auth

## [8.0.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.0.1...@react-native-firebase/auth@8.0.2) (2020-05-29)

**Note:** Version bump only for package @react-native-firebase/auth

## [8.0.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.0.0...@react-native-firebase/auth@8.0.1) (2020-05-29)

**Note:** Version bump only for package @react-native-firebase/auth

# [8.0.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@7.1.0...@react-native-firebase/auth@8.0.0) (2020-05-28)

- fix!(auth): confirm code returns User instead of UserCredential (#3684) ([71a1120](https://github.com/invertase/react-native-firebase/commit/71a1120337acd73d2483103f2acd560e8e99a335)), closes [#3684](https://github.com/invertase/react-native-firebase/issues/3684)

### BREAKING CHANGES

- `confirm(verificationCode)` now correctly returns an instance of `UserCredentials` instead of `User`. You can access `User` from the `.user` property on the `UserCredentials` instance.

# [7.1.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@7.0.2...@react-native-firebase/auth@7.1.0) (2020-05-22)

### Features

- update native Firebase SDK versions ([#3663](https://github.com/invertase/react-native-firebase/issues/3663)) ([4db9dbc](https://github.com/invertase/react-native-firebase/commit/4db9dbc3ec20bf96de0efad15000f00b41e4a799))

## [7.0.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@7.0.1...@react-native-firebase/auth@7.0.2) (2020-05-15)

### Bug Fixes

- **auth:** use correct code on network exception ([#3655](https://github.com/invertase/react-native-firebase/issues/3655)) ([8bcf5c9](https://github.com/invertase/react-native-firebase/commit/8bcf5c945db5614835630b6d0cf4951c4a5b2a2d)), closes [#3654](https://github.com/invertase/react-native-firebase/issues/3654)

## [7.0.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@7.0.0...@react-native-firebase/auth@7.0.1) (2020-05-13)

**Note:** Version bump only for package @react-native-firebase/auth

## [7.0.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@7.0.0...@react-native-firebase/auth@7.0.0) (2020-05-13)

- feat!: all packages should depend on core (#3613) ([252a423](https://github.com/invertase/react-native-firebase/commit/252a4239e98a0f2a55c4afcd2d82e4d5f97e65e9)), closes [#3613](https://github.com/invertase/react-native-firebase/issues/3613)

### Features

- **ios:** podspecs now utilize CoreOnly instead of Core ([#3575](https://github.com/invertase/react-native-firebase/issues/3575)) ([35285f1](https://github.com/invertase/react-native-firebase/commit/35285f1655b16d05e6630fc556f95cccfb707ee4))

### BREAKING CHANGES

- breaking change to mark new internal versioning requirements.
