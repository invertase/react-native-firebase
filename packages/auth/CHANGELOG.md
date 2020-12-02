# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [10.1.1](https://github.com/invertase/react-native-firebase/compare/v10.1.0...v10.1.1) (2020-12-02)

**Note:** Version bump only for package @react-native-firebase/auth

# [10.1.0](https://github.com/invertase/react-native-firebase/compare/v10.0.0...v10.1.0) (2020-11-26)

**Note:** Version bump only for package @react-native-firebase/auth

# [10.0.0](https://github.com/invertase/react-native-firebase/compare/fc8c4c0622f8e6814879d0306f66012df5b83cd8...v10.0.0) (2020-11-17)

### Bug Fixes

- **auth, android:** fixed user collision handling with apple sign-in ([#4487](https://github.com/invertase/react-native-firebase/issues/4487)) ([6a8f8ad](https://github.com/invertase/react-native-firebase/commit/6a8f8ad9b05d9510948206cc9837547cab124c63))
- **auth, android:** gracefully handle exception creating PhoneCredential ([8ead604](https://github.com/invertase/react-native-firebase/commit/8ead60431c2aae4193ed79eb10dc3b43480c5d77))
- **auth, android:** handle failure to upgrade anonymous user ([41fad36](https://github.com/invertase/react-native-firebase/commit/41fad3629437059a5e81d29f82c79589286aaea2)), closes [#4487](https://github.com/invertase/react-native-firebase/issues/4487)

### Features

- **auth, emulator:** add useEmulator javascript code + jest tests ([532adb5](https://github.com/invertase/react-native-firebase/commit/532adb569413e8a5e5077d5f47582a0a300b3045))
- **auth, emulator:** implement native useEmulator calls ([81369a0](https://github.com/invertase/react-native-firebase/commit/81369a089e3ffc5be53d7651fa5a9dacf5bfa7b6))

### BREAKING CHANGES

- breaking change to mark new internal versioning requirements.

## [9.3.5](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.3.4...@react-native-firebase/auth@9.3.5) (2020-11-10)

**Note:** Version bump only for package @react-native-firebase/auth

## [9.3.4](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.3.3...@react-native-firebase/auth@9.3.4) (2020-11-10)

### Bug Fixes

- **ios, auth:** move to non-deprecated upstream APIs ([1f2a109](https://github.com/invertase/react-native-firebase/commit/1f2a109d4e04bc10a5a0b93b3bebe78ec9be313b))

## [9.3.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.3.2...@react-native-firebase/auth@9.3.3) (2020-11-10)

### Bug Fixes

- **auth, android:** fixed user collision handling with apple sign-in ([#4487](https://github.com/invertase/react-native-firebase/issues/4487)) ([6a8f8ad](https://github.com/invertase/react-native-firebase/commit/6a8f8ad9b05d9510948206cc9837547cab124c63))

## [9.3.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.3.1...@react-native-firebase/auth@9.3.2) (2020-10-30)

**Note:** Version bump only for package @react-native-firebase/auth

## [9.3.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.3.0...@react-native-firebase/auth@9.3.1) (2020-10-16)

**Note:** Version bump only for package @react-native-firebase/auth

# [9.3.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.2.7...@react-native-firebase/auth@9.3.0) (2020-10-07)

### Features

- **auth:** Access to FIRAuthErrorUserInfoUpdatedCredentialKey with Apple Sign In ([#4359](https://github.com/invertase/react-native-firebase/issues/4359)) ([5851bd0](https://github.com/invertase/react-native-firebase/commit/5851bd0a92e4b6b9cda4eed8dd1dd06a45e5826b))

## [9.2.7](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.2.6...@react-native-firebase/auth@9.2.7) (2020-09-30)

**Note:** Version bump only for package @react-native-firebase/auth

## [9.2.6](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.2.5...@react-native-firebase/auth@9.2.6) (2020-09-30)

### Bug Fixes

- **types:** enable TypeScript libCheck & resolve type conflicts ([#4306](https://github.com/invertase/react-native-firebase/issues/4306)) ([aa8ee8b](https://github.com/invertase/react-native-firebase/commit/aa8ee8b7e83443d2c1664993800e15faf4b59b0e))

## [9.2.5](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.2.4...@react-native-firebase/auth@9.2.5) (2020-09-30)

**Note:** Version bump only for package @react-native-firebase/auth

## [9.2.4](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.2.3...@react-native-firebase/auth@9.2.4) (2020-09-17)

**Note:** Version bump only for package @react-native-firebase/auth

## [9.2.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.2.2...@react-native-firebase/auth@9.2.3) (2020-09-17)

### Bug Fixes

- **ios, podspec:** depend on React-Core instead of React ([#4275](https://github.com/invertase/react-native-firebase/issues/4275)) ([fd1a2be](https://github.com/invertase/react-native-firebase/commit/fd1a2be6b6ab1dec89e5dce1fc237435c3e1d510))

## [9.2.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.2.1...@react-native-firebase/auth@9.2.2) (2020-09-11)

**Note:** Version bump only for package @react-native-firebase/auth

## [9.2.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.2.0...@react-native-firebase/auth@9.2.1) (2020-09-04)

### Bug Fixes

- **auth, types:** allow null in photo and name for profile update ([#4179](https://github.com/invertase/react-native-firebase/issues/4179)) ([b4436ea](https://github.com/invertase/react-native-firebase/commit/b4436ea26212f3f5b7d3bdb47ab1891c31ebe59e))

# [9.2.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.1.2...@react-native-firebase/auth@9.2.0) (2020-09-02)

### Features

- **auth, android:** apple sign in support in android ([#4188](https://github.com/invertase/react-native-firebase/issues/4188)) ([c6e77a8](https://github.com/invertase/react-native-firebase/commit/c6e77a8c34c632eba119dc30a320675a142dabce))

## [9.1.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.1.1...@react-native-firebase/auth@9.1.2) (2020-08-28)

**Note:** Version bump only for package @react-native-firebase/auth

## [9.1.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.1.0...@react-native-firebase/auth@9.1.1) (2020-08-26)

**Note:** Version bump only for package @react-native-firebase/auth

# [9.1.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@9.0.0...@react-native-firebase/auth@9.1.0) (2020-08-26)

### Features

- bump firebase sdk versions, add GoogleApi dep, use Android API29 ([#4122](https://github.com/invertase/react-native-firebase/issues/4122)) ([728f418](https://github.com/invertase/react-native-firebase/commit/728f41863832d21230c6eb1f55385284fef03c09))

# [9.0.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.3.3...@react-native-firebase/auth@9.0.0) (2020-08-20)

- refactor(auth)!: setLanguageCode no longer a setter (#3922) ([400cfb4](https://github.com/invertase/react-native-firebase/commit/400cfb4007984bb0fa944ec75005bb6bd2f0231b)), closes [#3922](https://github.com/invertase/react-native-firebase/issues/3922)

### BREAKING CHANGES

- use setLanguageCode(), not direct property access, to set language code now

## [8.3.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.3.2...@react-native-firebase/auth@8.3.3) (2020-08-15)

**Note:** Version bump only for package @react-native-firebase/auth

## [8.3.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.3.1...@react-native-firebase/auth@8.3.2) (2020-08-15)

### Bug Fixes

- making auth and firestore observable compatible ([#4078](https://github.com/invertase/react-native-firebase/issues/4078)) ([d8410df](https://github.com/invertase/react-native-firebase/commit/d8410dfdae345f60ed7ea21fbe7f6af7632127e3))

## [8.3.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.3.0...@react-native-firebase/auth@8.3.1) (2020-08-03)

**Note:** Version bump only for package @react-native-firebase/auth

# [8.3.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/auth@8.2.0...@react-native-firebase/auth@8.3.0) (2020-08-03)

### Features

- use latest android & ios Firebase SDKs version ([#3956](https://github.com/invertase/react-native-firebase/issues/3956)) ([e7b4bb3](https://github.com/invertase/react-native-firebase/commit/e7b4bb31b05985c044b1f01625a43e364bb653ef))

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
