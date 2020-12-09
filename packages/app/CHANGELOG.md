# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [10.1.0](https://github.com/invertase/react-native-firebase/compare/v10.0.0...v10.1.0) (2020-11-26)

### Bug Fixes

- **app:** convert NativeFirebaseError.getStackWithMessage to static to fix crash ([#4619](https://github.com/invertase/react-native-firebase/issues/4619)) ([090b0bb](https://github.com/invertase/react-native-firebase/commit/090b0bb509d4b3a71db9b84096d89effd4e2d865))
- **app, android:** remove firebase-core from dependencies ([#4597](https://github.com/invertase/react-native-firebase/issues/4597)) ([22c615c](https://github.com/invertase/react-native-firebase/commit/22c615c39fe17dbf8915ae08c5d46431713495a0))

# [10.0.0](https://github.com/invertase/react-native-firebase/compare/fc8c4c0622f8e6814879d0306f66012df5b83cd8...v10.0.0) (2020-11-17)

### Features

- **app, ios:** bump firebase-ios-sdk to 7.1.0 from 7.0.0 ([#4533](https://github.com/

### BREAKING CHANGES

- breaking change to mark new internal versioning requirements.

# [9.0.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.4.7...@react-native-firebase/app@9.0.0) (2020-11-10)

### Bug Fixes

- **tests, emulator:** centralize startup, correct CWD ([79c1f80](https://github.com/invertase/react-native-firebase/commit/79c1f801965f74f9fc0233c96f05db103e9f8e84))

### Features

- BREAKING forward-port to firebase-android-sdk v26 / firebase-ios-sdk v7 ([70974d4](https://github.com/invertase/react-native-firebase/commit/70974d41f857a0f7fc09cb5235856d3748b30117)), closes [/firebase.google.com/support/release-notes/android#2020-10-27](https://github.com/invertase/react-native-firebase/issues/2020-10-27) [/firebase.google.com/support/release-notes/ios#version*700*-\_october_26_2020](https://github.com/invertase/react-native-firebase/issues/version_700_-_october_26_2020)

### BREAKING CHANGES

- alter ML imports, check iOS linking, remove old API as noted

## [8.4.7](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.4.6...@react-native-firebase/app@8.4.7) (2020-10-30)

**Note:** Version bump only for package @react-native-firebase/app

## [8.4.6](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.4.5...@react-native-firebase/app@8.4.6) (2020-10-16)

**Note:** Version bump only for package @react-native-firebase/app

**Note:** You _may_ need to re-download your firebase config files (android json / ios plist) to handle changes in the underlying SDKs as they migrate from instance id to installations. A symptom would be `NativeFirebaseError: [messaging/unknown] FIS_AUTH_ERROR`. [Upstream reference doc](https://github.com/firebase/firebase-android-sdk/blob/master/firebase-installations/REQUIRED_FIREBASE_OPTIONS_ANDROID.md#what-do-i-need-to-do) / [Related issue #4466](https://github.com/invertase/react-native-firebase/issues/4466)

## [8.4.5](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.4.4...@react-native-firebase/app@8.4.5) (2020-09-30)

### Bug Fixes

- **types:** enable TypeScript libCheck & resolve type conflicts ([#4306](https://github.com/invertase/react-native-firebase/issues/4306)) ([aa8ee8b](https://github.com/invertase/react-native-firebase/commit/aa8ee8b7e83443d2c1664993800e15faf4b59b0e))

## [8.4.4](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.4.3...@react-native-firebase/app@8.4.4) (2020-09-30)

### Bug Fixes

- **app, ios:** avoid photo API not present on Catalyst ([#4328](https://github.com/invertase/react-native-firebase/issues/4328)) ([86f1f63](https://github.com/invertase/react-native-firebase/commit/86f1f633c06c7f054ff55b802482f36be61580f8))

## [8.4.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.4.2...@react-native-firebase/app@8.4.3) (2020-09-17)

### Bug Fixes

- **ios, podspec:** depend on React-Core instead of React ([#4275](https://github.com/invertase/react-native-firebase/issues/4275)) ([fd1a2be](https://github.com/invertase/react-native-firebase/commit/fd1a2be6b6ab1dec89e5dce1fc237435c3e1d510))

## [8.4.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.4.1...@react-native-firebase/app@8.4.2) (2020-09-11)

### Bug Fixes

- **crashlytics, ios:** explicitly set collection opt in/out ([#4236](https://github.com/invertase/react-native-firebase/issues/4236)) ([cda4c10](https://github.com/invertase/react-native-firebase/commit/cda4c1012737eab8b64e8f8593b623771f5b2734))

## [8.4.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.4.0...@react-native-firebase/app@8.4.1) (2020-08-28)

**Note:** Version bump only for package @react-native-firebase/app

# [8.4.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.3.1...@react-native-firebase/app@8.4.0) (2020-08-26)

### Features

- bump firebase sdk versions, add GoogleApi dep, use Android API29 ([#4122](https://github.com/invertase/react-native-firebase/issues/4122)) ([728f418](https://github.com/invertase/react-native-firebase/commit/728f41863832d21230c6eb1f55385284fef03c09))

**NOTE: UPDATE ALL REACT-NATIVE-FIREBASE PACKAGES TO CURRENT STABLE FOR COMPATIBILITY - [#4154](https://github.com/invertase/react-native-firebase/issues/4154)**

## [8.3.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.3.0...@react-native-firebase/app@8.3.1) (2020-08-15)

### Bug Fixes

- **android, timezones:** timezone offset already millis, do not adjust it ([#4055](https://github.com/invertase/react-native-firebase/issues/4055)) ([8b0e189](https://github.com/invertase/react-native-firebase/commit/8b0e1893b8dc20abcf8c3a09a512c2e8ff6707b1)), closes [#4053](https://github.com/invertase/react-native-firebase/issues/4053)
- **core:** timezone offset issues in utils ([cb6a1d4](https://github.com/invertase/react-native-firebase/commit/cb6a1d41cc8e89fba8a8f81d50cea1c65e7e49ef))
- **Storage:** AL (asset library) methodology deprecated since iOS 8 ([#4054](https://github.com/invertase/react-native-firebase/issues/4054)) ([bf3b252](https://github.com/invertase/react-native-firebase/commit/bf3b25220cde1ae8d5fdbabc217fe20957dbdf8e))

# [8.3.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.2.0...@react-native-firebase/app@8.3.0) (2020-08-03)

### Features

- use latest android & ios Firebase SDKs version ([#3956](https://github.com/invertase/react-native-firebase/issues/3956)) ([e7b4bb3](https://github.com/invertase/react-native-firebase/commit/e7b4bb31b05985c044b1f01625a43e364bb653ef))

# [8.2.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.1.0...@react-native-firebase/app@8.2.0) (2020-07-09)

### Features

- **analytics:** add & deprecate pre-defined analytics events ([#3385](https://github.com/invertase/react-native-firebase/issues/3385)) ([6c53f47](https://github.com/invertase/react-native-firebase/commit/6c53f479d9d86f686d52f258ed51b5dc6a8ef25a))

# [8.1.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.0.1...@react-native-firebase/app@8.1.0) (2020-07-07)

### Features

- **android,ios:** upgrade native SDK versions ([#3881](https://github.com/invertase/react-native-firebase/issues/3881)) ([6cb68a8](https://github.com/invertase/react-native-firebase/commit/6cb68a8ea808392fac3a28bdb1a76049c7b52e86))

## [8.0.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@8.0.0...@react-native-firebase/app@8.0.1) (2020-07-05)

### Bug Fixes

- correct androidResolutionForPlayServices API ([afcd794](https://github.com/invertase/react-native-firebase/commit/afcd79479baf6e371719eb1b14e5d7619e4b7ad6)), closes [#3864](https://github.com/invertase/react-native-firebase/issues/3864)

# [8.0.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.3.1...@react-native-firebase/app@8.0.0) (2020-06-30)

- feat(crashlytics)!: upgrade to new Firebase Crashlytics SDK (#3580) ([cad58e1](https://github.com/invertase/react-native-firebase/commit/cad58e178b43dea461e17fa4a0a3fecd507ba68a)), closes [#3580](https://github.com/invertase/react-native-firebase/issues/3580)

### BREAKING CHANGES

- This is a breaking change to remove the use of the Fabric SDKs.

Co-authored-by: David Buchan-Swanson <david.buchanswanson@gmail.com>
Co-authored-by: Mike Diarmid <mike.diarmid@gmail.com>
[publish]

## [7.3.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.3.0...@react-native-firebase/app@7.3.1) (2020-06-26)

### Bug Fixes

- **app,ios:** build fails when targeting Mac (Project Catalyst) ([13bc6a7](https://github.com/invertase/react-native-firebase/commit/13bc6a75764a17ffa89d31b2523aca89ad875f0d))

# [7.3.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.2.1...@react-native-firebase/app@7.3.0) (2020-06-22)

### Features

- **firestore:** support clearPersistence() & terminate() APIs ([#3591](https://github.com/invertase/react-native-firebase/issues/3591)) ([57ff900](https://github.com/invertase/react-native-firebase/commit/57ff9003b664b94aa6b5b1997138bdb2220dba65))

## [7.2.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.2.0...@react-native-firebase/app@7.2.1) (2020-06-10)

### Bug Fixes

- **android:** generate version for ReactNativeFirebaseAppRegistrar.java ([#3766](https://github.com/invertase/react-native-firebase/issues/3766)) ([1324985](https://github.com/invertase/react-native-firebase/commit/13249857c7303d44b9a2ca92d2604a27e949bad9))

# [7.2.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.1.4...@react-native-firebase/app@7.2.0) (2020-06-03)

### Features

- **app:** add Play Services available utilities ([#3601](https://github.com/invertase/react-native-firebase/issues/3601)) ([0b0f858](https://github.com/invertase/react-native-firebase/commit/0b0f858527b8c0757db7021533f84425f79d0ea5))

## [7.1.4](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.1.3...@react-native-firebase/app@7.1.4) (2020-05-29)

**Note:** Version bump only for package @react-native-firebase/app

## [7.1.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.1.2...@react-native-firebase/app@7.1.3) (2020-05-29)

**Note:** Version bump only for package @react-native-firebase/app

## [7.1.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.1.1...@react-native-firebase/app@7.1.2) (2020-05-29)

**Note:** Version bump only for package @react-native-firebase/app

## [7.1.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.1.0...@react-native-firebase/app@7.1.1) (2020-05-29)

### Bug Fixes

- **android:** remove deprecated usages of `APPLICATION_ID` ([#3711](https://github.com/invertase/react-native-firebase/issues/3711)) ([984d3fc](https://github.com/invertase/react-native-firebase/commit/984d3fc1668221c166ab459d67d1c646d73d165b))

# [7.1.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.0.1...@react-native-firebase/app@7.1.0) (2020-05-22)

### Features

- update native Firebase SDK versions ([#3663](https://github.com/invertase/react-native-firebase/issues/3663)) ([4db9dbc](https://github.com/invertase/react-native-firebase/commit/4db9dbc3ec20bf96de0efad15000f00b41e4a799))

## [7.0.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.0.0...@react-native-firebase/app@7.0.1) (2020-05-13)

**Note:** Version bump only for package @react-native-firebase/app

## [7.0.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/app@7.0.0...@react-native-firebase/app@7.0.0) (2020-05-13)

- feat!: all packages should depend on core (#3613) ([252a423](https://github.com/invertase/react-native-firebase/commit/252a4239e98a0f2a55c4afcd2d82e4d5f97e65e9)), closes [#3613](https://github.com/invertase/react-native-firebase/issues/3613)

### Features

- **ios:** podspecs now utilize CoreOnly instead of Core ([#3575](https://github.com/invertase/react-native-firebase/issues/3575)) ([35285f1](https://github.com/invertase/react-native-firebase/commit/35285f1655b16d05e6630fc556f95cccfb707ee4))

### BREAKING CHANGES

- breaking change to mark new internal versioning requirements.
