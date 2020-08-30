# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [9.0.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@9.0.1...@react-native-firebase/remote-config@9.0.2) (2020-08-30)

**Note:** Version bump only for package @react-native-firebase/remote-config

## [9.0.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@9.0.0...@react-native-firebase/remote-config@9.0.1) (2020-08-28)

**Note:** Version bump only for package @react-native-firebase/remote-config

# [9.0.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@8.2.1...@react-native-firebase/remote-config@9.0.0) (2020-08-28)

- docs(remote-config)!: update docs to be explicit about new behavior (#4169) ([02527a0](https://github.com/invertase/react-native-firebase/commit/02527a06b8ee4d2b68e8ece739ac8d60e46b371c)), closes [#4169](https://github.com/invertase/react-native-firebase/issues/4169)

### Bug Fixes

- **remote-config:** fetch/activate boolean ([#4157](https://github.com/invertase/react-native-firebase/issues/4157)) ([9058dca](https://github.com/invertase/react-native-firebase/commit/9058dca0f66f7dead8c11831c0819528a868e3ae))

### BREAKING CHANGES

#### fetchAndActivate

        Previous behaviour returned a boolean indicating if config values were activated
        New behaviour returns a boolean indicating if any config values were fetched remotely.

#### activate

        Previous behaviour returned a boolean indicating if config values were activated
        New behaviour returns a boolean indicating if any local config values were activated.

## [8.2.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@8.2.0...@react-native-firebase/remote-config@8.2.1) (2020-08-26)

**Note:** Version bump only for package @react-native-firebase/remote-config

# [8.2.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@8.1.4...@react-native-firebase/remote-config@8.2.0) (2020-08-26)

### Features

- bump firebase sdk versions, add GoogleApi dep, use Android API29 ([#4122](https://github.com/invertase/react-native-firebase/issues/4122)) ([728f418](https://github.com/invertase/react-native-firebase/commit/728f41863832d21230c6eb1f55385284fef03c09))

## [8.1.4](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@8.1.3...@react-native-firebase/remote-config@8.1.4) (2020-08-25)

### Bug Fixes

- **ios, analytics:** remove now-optional analytics dependencies ([#4131](https://github.com/invertase/react-native-firebase/issues/4131)) ([fdb5e9f](https://github.com/invertase/react-native-firebase/commit/fdb5e9f5786822343b11d3257d9f466a9d593fa4))

## [8.1.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@8.1.2...@react-native-firebase/remote-config@8.1.3) (2020-08-15)

**Note:** Version bump only for package @react-native-firebase/remote-config

## [8.1.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@8.1.1...@react-native-firebase/remote-config@8.1.2) (2020-08-15)

### Bug Fixes

- **remote-config:** error calling getValue() before fetch ([#4068](https://github.com/invertase/react-native-firebase/issues/4068)) ([8619d72](https://github.com/invertase/react-native-firebase/commit/8619d7223172c08bea3807e8141d246e51aeec90))

## [8.1.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@8.1.0...@react-native-firebase/remote-config@8.1.1) (2020-08-03)

**Note:** Version bump only for package @react-native-firebase/remote-config

# [8.1.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.2.3...@react-native-firebase/remote-config@8.1.0) (2020-08-03)

### Features

- use latest android & ios Firebase SDKs version ([#3956](https://github.com/invertase/react-native-firebase/issues/3956)) ([e7b4bb3](https://github.com/invertase/react-native-firebase/commit/e7b4bb31b05985c044b1f01625a43e364bb653ef))

## [8.0.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.2.2...@react-native-firebase/remote-config@8.0.0) (2020-07-23)

This release is aimed at aligning the API to match the Firebase Web SDK as well as introducing support for multiple Firebase apps.

**Pull Request**: [#3537](https://github.com/invertase/react-native-firebase/pull/3537)

### RemoteConfig Module

```js
const remoteConfig = firebase.remoteConfig();
```

#### Updates

- added `ensureInitialized` API.
- added `reset` API for android only
- `console.warn()` if user tries to set `defaultConfig` which is part of web sdk.
- `console.warn()` if user tries to set `settings` which is part of web sdk.
- `console.warn()` if user tries to set `setLogLevel` which is part of web sdk.

### RemoteConfig.setConfigSettings()

```js
const remoteConfig = firebase.remoteConfig().setConfigSettings({});
```

#### Updates

- can set 'minimumFetchIntervalMillis' in `setConfigSettings` to match web sdk.
- can set 'fetchTimeMillis' in `setConfigSettings` to match web sdk.

#### Removed

- `isDeveloperModeEnabled` from config settings and console.warn() if tried to set.
- `minimumFetchInterval` config setting and console.warn() if tried to set.

### RemoteConfig.getValue(key)

```js
const remoteConfig = firebase.remoteConfig().getValue('key');
```

#### Updates

- `asBoolean()` resolves value to a boolean.
- `asNumber()` resolves value to a number.
- `asString()` resolves value to a string.
- `getSource()` source of the property.

#### Removed

- `value` removed property. Not sure how to warn users it is no longer available
- `source` removed property. Again, not sure how to warn users.

### Internal Changes

- Switched to `setConfigSettingsAsync` for Android, nothing similar for iOS.
- Switched to `fetchAndActivate` API for both platforms.
- Switched to async `activate` API for iOS. No changes needed for Android.
- Multiple Firebase apps now supported on both platforms.

## [7.2.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.2.1...@react-native-firebase/remote-config@7.2.2) (2020-07-09)

**Note:** Version bump only for package @react-native-firebase/remote-config

## [7.2.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.2.0...@react-native-firebase/remote-config@7.2.1) (2020-07-07)

**Note:** Version bump only for package @react-native-firebase/remote-config

# [7.2.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.1.8...@react-native-firebase/remote-config@7.2.0) (2020-07-07)

### Features

- **android,ios:** upgrade native SDK versions ([#3881](https://github.com/invertase/react-native-firebase/issues/3881)) ([6cb68a8](https://github.com/invertase/react-native-firebase/commit/6cb68a8ea808392fac3a28bdb1a76049c7b52e86))

## [7.1.8](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.1.7...@react-native-firebase/remote-config@7.1.8) (2020-07-05)

**Note:** Version bump only for package @react-native-firebase/remote-config

## [7.1.7](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.1.6...@react-native-firebase/remote-config@7.1.7) (2020-06-30)

**Note:** Version bump only for package @react-native-firebase/remote-config

## [7.1.6](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.1.5...@react-native-firebase/remote-config@7.1.6) (2020-06-26)

**Note:** Version bump only for package @react-native-firebase/remote-config

## [7.1.5](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.1.4...@react-native-firebase/remote-config@7.1.5) (2020-06-22)

**Note:** Version bump only for package @react-native-firebase/remote-config

## [7.1.4](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.1.3...@react-native-firebase/remote-config@7.1.4) (2020-06-10)

**Note:** Version bump only for package @react-native-firebase/remote-config

## [7.1.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.1.2...@react-native-firebase/remote-config@7.1.3) (2020-06-03)

**Note:** Version bump only for package @react-native-firebase/remote-config

## [7.1.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.1.1...@react-native-firebase/remote-config@7.1.2) (2020-05-29)

**Note:** Version bump only for package @react-native-firebase/remote-config

## [7.1.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.1.0...@react-native-firebase/remote-config@7.1.1) (2020-05-29)

**Note:** Version bump only for package @react-native-firebase/remote-config

# [7.1.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.0.1...@react-native-firebase/remote-config@7.1.0) (2020-05-22)

### Features

- update native Firebase SDK versions ([#3663](https://github.com/invertase/react-native-firebase/issues/3663)) ([4db9dbc](https://github.com/invertase/react-native-firebase/commit/4db9dbc3ec20bf96de0efad15000f00b41e4a799))

## [7.0.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.0.0...@react-native-firebase/remote-config@7.0.1) (2020-05-13)

**Note:** Version bump only for package @react-native-firebase/remote-config

## [7.0.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/remote-config@7.0.0...@react-native-firebase/remote-config@7.0.0) (2020-05-13)

- feat!: all packages should depend on core (#3613) ([252a423](https://github.com/invertase/react-native-firebase/commit/252a4239e98a0f2a55c4afcd2d82e4d5f97e65e9)), closes [#3613](https://github.com/invertase/react-native-firebase/issues/3613)

### Features

- **ios:** podspecs now utilize CoreOnly instead of Core ([#3575](https://github.com/invertase/react-native-firebase/issues/3575)) ([35285f1](https://github.com/invertase/react-native-firebase/commit/35285f1655b16d05e6630fc556f95cccfb707ee4))

### BREAKING CHANGES

- breaking change to mark new internal versioning requirements.
