# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [11.5.0](https://github.com/invertase/react-native-firebase/compare/v11.4.1...v11.5.0) (2021-05-12)

### Bug Fixes

- **app, json-schema:** admob_delay_app_measurement_init type is boolean ([#5297](https://github.com/invertase/react-native-firebase/issues/5297)) ([d931b48](https://github.com/invertase/react-native-firebase/commit/d931b48f9e2a5caca47d354e26eaca2bd210dc8f)), closes [#5295](https://github.com/invertase/react-native-firebase/issues/5295)

## [11.4.1](https://github.com/invertase/react-native-firebase/compare/v11.4.0...v11.4.1) (2021-04-29)

**Note:** Version bump only for package @react-native-firebase/app

# [11.4.0](https://github.com/invertase/react-native-firebase/compare/v11.3.3...v11.4.0) (2021-04-29)

### Release Status

This release was partial, npmjs.com rejected some of the monorepo packages while releasing 11.4.0. 11.4.1 to follow with no changes from 11.4.0.

### Bug Fixes

- **app, android:** correct TaskExecutor shutdown error ([a7729a5](https://github.com/invertase/react-native-firebase/commit/a7729a5dfac1f70b3a442452a99da9977d89d9e3)), closes [#5225](https://github.com/invertase/react-native-firebase/issues/5225)

### Features

- **app, android:** support list of Activities to ignore when detecting AppState ([#5235](https://github.com/invertase/react-native-firebase/issues/5235)) ([50a384f](https://github.com/invertase/react-native-firebase/commit/50a384f2a2ba61d078521e89594f4e576f1e1f46))
- **app, firebase-ios-sdk:** move to version 7.11.0 ([f25d25d](https://github.com/invertase/react-native-firebase/commit/f25d25d36d2df204f58f69700509a1ccb23784a9))

## [11.3.3](https://github.com/invertase/react-native-firebase/compare/v11.3.2...v11.3.3) (2021-04-24)

### Bug Fixes

- **app, android:** avoid API24-only APIs, fix Android < 7 crash from 11.3.0 ([#5206](https://github.com/invertase/react-native-firebase/issues/5206)) ([49c15f8](https://github.com/invertase/react-native-firebase/commit/49c15f81c9cb51fef5cf6f8140d13f12911670eb))

## [11.3.2](https://github.com/invertase/react-native-firebase/compare/v11.3.1...v11.3.2) (2021-04-19)

### Bug Fixes

- **all, android:** purge jcenter() from android build ([2c6a6a8](https://github.com/invertase/react-native-firebase/commit/2c6a6a82ec363fd948ea880fd397acb886c97453))

## [11.3.1](https://github.com/invertase/react-native-firebase/compare/v11.3.0...v11.3.1) (2021-04-18)

**Note:** Version bump only for package @react-native-firebase/app

# [11.3.0](https://github.com/invertase/react-native-firebase/compare/v11.2.0...v11.3.0) (2021-04-16)

### Bug Fixes

- **android, utils:** fix rare crash getting documents directory ([#5118](https://github.com/invertase/react-native-firebase/issues/5118)) ([f0a2957](https://github.com/invertase/react-native-firebase/commit/f0a29573e748035468f13f9c03c6cf3b9148dafe))
- **app, ios:** formally note cocoapods v1.10+ requirement in podspec ([3c90c59](https://github.com/invertase/react-native-firebase/commit/3c90c5931e9777eda1614ae1f443c6de79540f01))
- **app, ios-plist:** make sure Info.plist exists before processing ([245149c](https://github.com/invertase/react-native-firebase/commit/245149c635aeb9a02528a00f0a4451644e1fdf3a)), closes [#5152](https://github.com/invertase/react-native-firebase/issues/5152)
- **app, secondary:** reject if initializeApp fails on iOS ([d76eba3](https://github.com/invertase/react-native-firebase/commit/d76eba3a4d1c6ffddf6c38ae59c0b529dde106e9)), closes [#5134](https://github.com/invertase/react-native-firebase/issues/5134)

### Features

- **crashlytics:** add configuration to exception handler chaining behavior ([4c640ff](https://github.com/invertase/react-native-firebase/commit/4c640ff52e1fb692bddcbeb76a2ff2a302e56334))
- **ios, sdks:** bump firebase-ios-sdk to 7.10.0 ([d2838ff](https://github.com/invertase/react-native-firebase/commit/d2838ffeda34816219539fd1ac0c651b232e8a46))

### Performance Improvements

- increase task throughput in Android using thread pool executor ([#4981](https://github.com/invertase/react-native-firebase/issues/4981)) ([0e4e331](https://github.com/invertase/react-native-firebase/commit/0e4e3312315c020ecd760f8d3fea4f0347d2276b))

# [11.2.0](https://github.com/invertase/react-native-firebase/compare/v11.1.2...v11.2.0) (2021-03-26)

### Features

- **sdks:** firebase-ios-sdk 7.9.0 / firebase-android-sdk 26.8.0 ([324f8ff](https://github.com/invertase/react-native-firebase/commit/324f8ffa0baf759c000efa1f4a024e527eddf8d7))

## [11.1.2](https://github.com/invertase/react-native-firebase/compare/v11.1.1...v11.1.2) (2021-03-17)

**Note:** Version bump only for package @react-native-firebase/app

## [11.1.1](https://github.com/invertase/react-native-firebase/compare/v11.1.0...v11.1.1) (2021-03-16)

### Bug Fixes

- **app, firebase-ios-sdk:** bump to firebase-ios-sdk v7.8.1 for analytics fix ([8cd1d6e](https://github.com/invertase/react-native-firebase/commit/8cd1d6e77e124a0d21c64d146bfe62e351a754c7))

# [11.1.0](https://github.com/invertase/react-native-firebase/compare/v11.0.0...v11.1.0) (2021-03-13)

### Bug Fixes

- **app, android:** fixes possible crash on first launch ([#4990](https://github.com/invertase/react-native-firebase/issues/4990)) ([06eebad](https://github.com/invertase/react-native-firebase/commit/06eebada2c74c57504d8cc1cdfa446ee77d48fce)), closes [#4979](https://github.com/invertase/react-native-firebase/issues/4979)
- **app, types:** initializeApp returns Promise<FirebaseApp> ([f3b955c](https://github.com/invertase/react-native-firebase/commit/f3b955c0f4ea5e50920499c917576f587f149f93))

### Features

- **app, sdks:** firebase-ios-sdk v7.8.0 / firebase-android-sdk v26.7.0 ([d2b0074](https://github.com/invertase/react-native-firebase/commit/d2b0074b36254743ce980a23e3e61771b79be52a))

# [11.0.0](https://github.com/invertase/react-native-firebase/compare/v10.8.1...v11.0.0) (2021-03-03)

### Bug Fixes

- **app, ios:** failing to resolve ios sdk from package.json is an error ([29d797d](https://github.com/invertase/react-native-firebase/commit/29d797dd7f7201104547961a7db702bfff635b57))

### Features

- **android, sdk:** update firebase-android-sdk to 26.6.0 ([5786641](https://github.com/invertase/react-native-firebase/commit/5786641ea68dc4c0c1899a12b0a56491cff3b894)), closes [/firebase.google.com/support/release-notes/android#bom_v26-6-0](https://github.com/invertase/react-native-firebase/issues/bom_v26-6-0)
- **ios, sdk:** bump firebase-ios-sdk to v7.7.0 ([bc893ab](https://github.com/invertase/react-native-firebase/commit/bc893ab8f44193a58ca6a119838d0464dc6081ba))

## [10.8.1](https://github.com/invertase/react-native-firebase/compare/v10.8.0...v10.8.1) (2021-02-22)

**Note:** Version bump only for package @react-native-firebase/app

# [10.8.0](https://github.com/invertase/react-native-firebase/compare/v10.7.0...v10.8.0) (2021-02-13)

### Features

- **app, android-sdk:** 26.5.0 (requires gradle v5.6.4+ / android gradle plugin v3.4.2+) ([1132f16](https://github.com/invertase/react-native-firebase/commit/1132f1629dd6b2d0ff9fdb00e47e075773a1dc60))

# [10.7.0](https://github.com/invertase/react-native-firebase/compare/v10.6.4...v10.7.0) (2021-02-09)

### Bug Fixes

- **auth, android:** do not timezone offset when getting UTC timestamp ([#4886](https://github.com/invertase/react-native-firebase/issues/4886)) ([85d6801](https://github.com/invertase/react-native-firebase/commit/85d6801ecbe9b3922225c55ca3628675ad848764))

### Features

- **ios, sdk:** bump firebase-ios-sdk from 7.5.0 to 7.6.0 ([2e283f7](https://github.com/invertase/react-native-firebase/commit/2e283f72322e612a0c82b1d116f3ecfa58904ea9)), closes [/firebase.google.com/support/release-notes/ios#7](https://github.com/invertase/react-native-firebase/issues/7)

## [10.6.4](https://github.com/invertase/react-native-firebase/compare/v10.6.3...v10.6.4) (2021-02-05)

**Note:** Version bump only for package @react-native-firebase/app

## [10.6.3](https://github.com/invertase/react-native-firebase/compare/v10.6.2...v10.6.3) (2021-02-05)

**Note:** Version bump only for package @react-native-firebase/app

## [10.6.2](https://github.com/invertase/react-native-firebase/compare/v10.6.1...v10.6.2) (2021-02-05)

**Note:** Version bump only for package @react-native-firebase/app

## [10.6.1](https://github.com/invertase/react-native-firebase/compare/v10.6.0...v10.6.1) (2021-02-04)

**Note:** Version bump only for package @react-native-firebase/app

# [10.6.0](https://github.com/invertase/react-native-firebase/compare/v10.5.1...v10.6.0) (2021-02-04)

### Features

- **app:** firebase-ios-sdk 7.4.0 -> 7.5.0, firebase-android-sdk 26.3.0 -> 26.4.0 ([9c4ada8](https://github.com/invertase/react-native-firebase/commit/9c4ada893c8c49afc454d1fe6084ba2572f2a25f))
- **perf:** support "perf_auto_collection_enabled" flag in firebase.json ([#4870](https://github.com/invertase/react-native-firebase/issues/4870)) ([e54bf49](https://github.com/invertase/react-native-firebase/commit/e54bf49ec880b309f8ffc244d3bb0da74a5d4ddd))

# [10.5.0](https://github.com/invertase/react-native-firebase/compare/v10.4.1...v10.5.0) (2021-01-18)

### Bug Fixes

- **app, android:** require default firebase.json boolean key ([#4791](https://github.com/invertase/react-native-firebase/issues/4791)) ([483d9d3](https://github.com/invertase/react-native-firebase/commit/483d9d3655844e4c40cb42f3b0da865ada971515))

### Features

- **app, sdks:** firebase-ios-sdk 7.4.0 / firebase-android-sdk 26.3.0 ([#4792](https://github.com/invertase/react-native-firebase/issues/4792)) ([f915c82](https://github.com/invertase/react-native-firebase/commit/f915c823d6765b21096ea3b7e52f22bb71630bec))

# [10.4.0](https://github.com/invertase/react-native-firebase/compare/v10.3.1...v10.4.0) (2020-12-30)

### Bug Fixes

- **ios:** bump ios min deployment to ios10 - remnant from [#4471](https://github.com/invertase/react-native-firebase/issues/4471) ([4a57578](https://github.com/invertase/react-native-firebase/commit/4a5757827789141600625eebe5e13c976ddb7402))

### Features

- **analytics:** add support for analytics_auto_collection_enabled in firebase.json ([#4730](https://github.com/invertase/react-native-firebase/issues/4730)) ([9a24ecd](https://github.com/invertase/react-native-firebase/commit/9a24ecd2826bfa8ab30657287432ccaeff8b7c7c))

# [10.3.0](https://github.com/invertase/react-native-firebase/compare/v10.2.0...v10.3.0) (2020-12-18)

### Features

- **app:** bump firebase-android-sdk / firebase-ios-sdk versions ([cd5a451](https://github.com/invertase/react-native-firebase/commit/cd5a451cece27204a657780ebdbcf7fa909f5100))

# [10.2.0](https://github.com/invertase/react-native-firebase/compare/v10.1.1...v10.2.0) (2020-12-11)

### Features

- firebase-ios-sdk 7.2.0 / firebase-android-sdk 26.1.1 ([#4648](https://github.com/invertase/react-native-firebase/issues/4648)) ([a158a74](https://github.com/invertase/react-native-firebase/commit/a158a74dee0dd6774c725ff1213453f8dfdcb8f5))

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

- BREAKING forward-port to firebase-android-sdk v26 / firebase-ios-sdk v7 ([70974d4](https://github.com/invertase/react-native-firebase/commit/70974d41f857a0f7fc09cb5235856d3748b30117)), **CHECK UNDERLYING SDK NOTES FOR FURTHER BREAKING CHANGE INFORMATION:** https://firebase.google.com/support/release-notes/android#bom_v26-0-0 / https://firebase.google.com/support/release-notes/ios#version_700_-_october_26_2020

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
