# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [12.1.0](https://github.com/invertase/react-native-firebase/compare/v12.0.0...v12.1.0) (2021-06-11)


### Features

* **app:** bump SDKs: firebase-android-sdk 28.1.0 / firebase-ios-sdk 8.1.1 ([d64e2e5](https://github.com/invertase/react-native-firebase/commit/d64e2e562051a3c3da39da32582ea835b2c7d928))





# [12.0.0](https://github.com/invertase/react-native-firebase/compare/v11.5.0...v12.0.0) (2021-05-19)


### Bug Fixes

* **android:** correct lint issues for various API mis-use ([eb8d893](https://github.com/invertase/react-native-firebase/commit/eb8d89306fd569d7ef64298a99e970c653b79178)), closes [#3917](https://github.com/invertase/react-native-firebase/issues/3917)


### Features

* **database:** add database.useEmulator() ([0632ca5](https://github.com/invertase/react-native-firebase/commit/0632ca596336b2b5738734ae614f6c50a5f6f577))
* **sdks:** firebase-ios-sdk 8.0.0 / firebase-android-sdk 28.0.1 ([d97587b](https://github.com/invertase/react-native-firebase/commit/d97587b33aa4c092a0d34291e24491ca66f9bcaa))
* **storage, emulator:** implement storage emulator ([1d3e946](https://github.com/invertase/react-native-firebase/commit/1d3e946a4131a9ceaf3e82aab7f1759ef5aa2cb4))





# [11.5.0](https://github.com/invertase/react-native-firebase/compare/v11.4.1...v11.5.0) (2021-05-12)

**Note:** Version bump only for package react-native-firebase-tests





## [11.4.1](https://github.com/invertase/react-native-firebase/compare/v11.4.0...v11.4.1) (2021-04-29)

**Note:** Version bump only for package react-native-firebase-tests





# [11.4.0](https://github.com/invertase/react-native-firebase/compare/v11.3.3...v11.4.0) (2021-04-29)


### Features

* **analytics, ATT:** allow use of AnalyticsWithoutAdIdSupport pod ([da6b811](https://github.com/invertase/react-native-firebase/commit/da6b811e15b480ad55c1e804da40387ecfdef3ee))
* **app, android:** support list of Activities to ignore when detecting AppState ([#5235](https://github.com/invertase/react-native-firebase/issues/5235)) ([50a384f](https://github.com/invertase/react-native-firebase/commit/50a384f2a2ba61d078521e89594f4e576f1e1f46))
* **app, firebase-ios-sdk:** move to version 7.11.0 ([f25d25d](https://github.com/invertase/react-native-firebase/commit/f25d25d36d2df204f58f69700509a1ccb23784a9))





## [11.3.3](https://github.com/invertase/react-native-firebase/compare/v11.3.2...v11.3.3) (2021-04-24)

**Note:** Version bump only for package react-native-firebase-tests





## [11.3.2](https://github.com/invertase/react-native-firebase/compare/v11.3.1...v11.3.2) (2021-04-19)


### Bug Fixes

* **all, android:** purge jcenter() from android build ([2c6a6a8](https://github.com/invertase/react-native-firebase/commit/2c6a6a82ec363fd948ea880fd397acb886c97453))





## [11.3.1](https://github.com/invertase/react-native-firebase/compare/v11.3.0...v11.3.1) (2021-04-18)

**Note:** Version bump only for package react-native-firebase-tests





# [11.3.0](https://github.com/invertase/react-native-firebase/compare/v11.2.0...v11.3.0) (2021-04-16)


### Features

* **crashlytics:** add configuration to exception handler chaining behavior ([4c640ff](https://github.com/invertase/react-native-firebase/commit/4c640ff52e1fb692bddcbeb76a2ff2a302e56334))
* **ios, sdks:** bump firebase-ios-sdk to 7.10.0 ([d2838ff](https://github.com/invertase/react-native-firebase/commit/d2838ffeda34816219539fd1ac0c651b232e8a46))


### Performance Improvements

* increase task throughput in Android using thread pool executor ([#4981](https://github.com/invertase/react-native-firebase/issues/4981)) ([0e4e331](https://github.com/invertase/react-native-firebase/commit/0e4e3312315c020ecd760f8d3fea4f0347d2276b))





# [11.2.0](https://github.com/invertase/react-native-firebase/compare/v11.1.2...v11.2.0) (2021-03-26)


### Features

* **sdks:** firebase-ios-sdk 7.9.0 / firebase-android-sdk 26.8.0 ([324f8ff](https://github.com/invertase/react-native-firebase/commit/324f8ffa0baf759c000efa1f4a024e527eddf8d7))





## [11.1.2](https://github.com/invertase/react-native-firebase/compare/v11.1.1...v11.1.2) (2021-03-17)

**Note:** Version bump only for package react-native-firebase-tests





## [11.1.1](https://github.com/invertase/react-native-firebase/compare/v11.1.0...v11.1.1) (2021-03-16)

**Note:** Version bump only for package react-native-firebase-tests





# [11.1.0](https://github.com/invertase/react-native-firebase/compare/v11.0.0...v11.1.0) (2021-03-13)


### Features

* **app, sdks:** firebase-ios-sdk v7.8.0 / firebase-android-sdk v26.7.0 ([d2b0074](https://github.com/invertase/react-native-firebase/commit/d2b0074b36254743ce980a23e3e61771b79be52a))





# [11.0.0](https://github.com/invertase/react-native-firebase/compare/v10.8.1...v11.0.0) (2021-03-03)


### Bug Fixes

* **tests, ios:** resolve firebase-ios-sdk from app package.json ([680eb37](https://github.com/invertase/react-native-firebase/commit/680eb371da7826eef05c450d47fd12fdcb42fdb7))


### Features

* **android, sdk:** update firebase-android-sdk to 26.6.0 ([5786641](https://github.com/invertase/react-native-firebase/commit/5786641ea68dc4c0c1899a12b0a56491cff3b894)), closes [/firebase.google.com/support/release-notes/android#bom_v26-6-0](https://github.com//firebase.google.com/support/release-notes/android/issues/bom_v26-6-0)
* **ios, sdk:** bump firebase-ios-sdk to v7.7.0 ([bc893ab](https://github.com/invertase/react-native-firebase/commit/bc893ab8f44193a58ca6a119838d0464dc6081ba))





## [10.8.1](https://github.com/invertase/react-native-firebase/compare/v10.8.0...v10.8.1) (2021-02-22)

**Note:** Version bump only for package react-native-firebase-tests





# [10.8.0](https://github.com/invertase/react-native-firebase/compare/v10.7.0...v10.8.0) (2021-02-13)


### Features

* **app, android-sdk:** 26.5.0 (requires gradle v5.6.4+ / android gradle plugin v3.4.2+) ([1132f16](https://github.com/invertase/react-native-firebase/commit/1132f1629dd6b2d0ff9fdb00e47e075773a1dc60))
* **crashlytics:** add JS exception non-fatal error generation toggle ([#4904](https://github.com/invertase/react-native-firebase/issues/4904)) ([63c35b3](https://github.com/invertase/react-native-firebase/commit/63c35b3d9243a76fd77dedaa9fa83fca7fb802ae))





# [10.7.0](https://github.com/invertase/react-native-firebase/compare/v10.6.4...v10.7.0) (2021-02-09)

**Note:** Version bump only for package react-native-firebase-tests





## [10.6.4](https://github.com/invertase/react-native-firebase/compare/v10.6.3...v10.6.4) (2021-02-05)

**Note:** Version bump only for package react-native-firebase-tests





## [10.6.3](https://github.com/invertase/react-native-firebase/compare/v10.6.2...v10.6.3) (2021-02-05)

**Note:** Version bump only for package react-native-firebase-tests





## [10.6.2](https://github.com/invertase/react-native-firebase/compare/v10.6.1...v10.6.2) (2021-02-05)

**Note:** Version bump only for package react-native-firebase-tests





## [10.6.1](https://github.com/invertase/react-native-firebase/compare/v10.6.0...v10.6.1) (2021-02-04)

**Note:** Version bump only for package react-native-firebase-tests





# [10.6.0](https://github.com/invertase/react-native-firebase/compare/v10.5.1...v10.6.0) (2021-02-04)


### Features

* **app:** firebase-ios-sdk 7.4.0 -> 7.5.0, firebase-android-sdk 26.3.0 -> 26.4.0 ([9c4ada8](https://github.com/invertase/react-native-firebase/commit/9c4ada893c8c49afc454d1fe6084ba2572f2a25f))
* **perf:** support "perf_auto_collection_enabled" flag in firebase.json ([#4870](https://github.com/invertase/react-native-firebase/issues/4870)) ([e54bf49](https://github.com/invertase/react-native-firebase/commit/e54bf49ec880b309f8ffc244d3bb0da74a5d4ddd))





## [10.5.1](https://github.com/invertase/react-native-firebase/compare/v10.5.0...v10.5.1) (2021-01-19)

**Note:** Version bump only for package react-native-firebase-tests





# [10.5.0](https://github.com/invertase/react-native-firebase/compare/v10.4.1...v10.5.0) (2021-01-18)


### Features

* **app, sdks:** firebase-ios-sdk 7.4.0 / firebase-android-sdk 26.3.0 ([#4792](https://github.com/invertase/react-native-firebase/issues/4792)) ([f915c82](https://github.com/invertase/react-native-firebase/commit/f915c823d6765b21096ea3b7e52f22bb71630bec))





## [10.4.1](https://github.com/invertase/react-native-firebase/compare/v10.4.0...v10.4.1) (2021-01-08)

**Note:** Version bump only for package react-native-firebase-tests





# [10.4.0](https://github.com/invertase/react-native-firebase/compare/v10.3.1...v10.4.0) (2020-12-30)


### Features

* **analytics:** add support for analytics_auto_collection_enabled in firebase.json ([#4730](https://github.com/invertase/react-native-firebase/issues/4730)) ([9a24ecd](https://github.com/invertase/react-native-firebase/commit/9a24ecd2826bfa8ab30657287432ccaeff8b7c7c))





## [10.3.1](https://github.com/invertase/react-native-firebase/compare/v10.3.0...v10.3.1) (2020-12-18)

**Note:** Version bump only for package react-native-firebase-tests





# [10.3.0](https://github.com/invertase/react-native-firebase/compare/v10.2.0...v10.3.0) (2020-12-18)


### Features

* **app:** bump firebase-android-sdk / firebase-ios-sdk versions ([cd5a451](https://github.com/invertase/react-native-firebase/commit/cd5a451cece27204a657780ebdbcf7fa909f5100))





# [10.2.0](https://github.com/invertase/react-native-firebase/compare/v10.1.1...v10.2.0) (2020-12-11)


### Features

* firebase-ios-sdk 7.2.0 / firebase-android-sdk 26.1.1 ([#4648](https://github.com/invertase/react-native-firebase/issues/4648)) ([a158a74](https://github.com/invertase/react-native-firebase/commit/a158a74dee0dd6774c725ff1213453f8dfdcb8f5))





## [10.1.1](https://github.com/invertase/react-native-firebase/compare/v10.1.0...v10.1.1) (2020-12-02)

**Note:** Version bump only for package react-native-firebase-tests





# [10.1.0](https://github.com/invertase/react-native-firebase/compare/v10.0.0...v10.1.0) (2020-11-26)

**Note:** Version bump only for package react-native-firebase-tests





# [10.0.0](https://github.com/invertase/react-native-firebase/compare/v6.4.0...v10.0.0) (2020-11-17)


* feat(crashlytics)!: upgrade to new Firebase Crashlytics SDK (#3580) ([cad58e1](https://github.com/invertase/react-native-firebase/commit/cad58e178b43dea461e17fa4a0a3fecd507ba68a)), closes [#3580](https://github.com/invertase/react-native-firebase/issues/3580)
* feat!: all packages should depend on core (#3613) ([252a423](https://github.com/invertase/react-native-firebase/commit/252a4239e98a0f2a55c4afcd2d82e4d5f97e65e9)), closes [#3613](https://github.com/invertase/react-native-firebase/issues/3613)


### Bug Fixes

* **firestore:**  update isEqual API to check collection path equality ([#3738](https://github.com/invertase/react-native-firebase/issues/3738)) ([405e040](https://github.com/invertase/react-native-firebase/commit/405e04009c1550dc6897b207ae3a63ad274c6de5))
* **messaging:** initialize app props method to fix isHeadless property ([#4082](https://github.com/invertase/react-native-firebase/issues/4082)) ([2bdebb1](https://github.com/invertase/react-native-firebase/commit/2bdebb1d3d82915d0aa9a49431d26658721a2f86))
* **messaging,ios:** keep original UNUserNotificationCenter dele… ([#3427](https://github.com/invertase/react-native-firebase/issues/3427)) ([a800cdb](https://github.com/invertase/react-native-firebase/commit/a800cdbc81bfaeeaccf602aa62ca29d2fbf68c05)), closes [#3425](https://github.com/invertase/react-native-firebase/issues/3425) [#3495](https://github.com/invertase/react-native-firebase/issues/3495)
* **ml-vision:** convert options to correct type ([#3694](https://github.com/invertase/react-native-firebase/issues/3694)) ([b462be5](https://github.com/invertase/react-native-firebase/commit/b462be542a41a4e37a201146642f1b9fd4c6a74f))
* **storage:** Changed refFromUrl regex to exclude appspot.com ([#3775](https://github.com/invertase/react-native-firebase/issues/3775)) ([c6f4699](https://github.com/invertase/react-native-firebase/commit/c6f46996191126513e02f3d20efa78d166c4db0a))


### Features

* BREAKING forward-port to firebase-android-sdk v26 / firebase-ios-sdk v7 ([70974d4](https://github.com/invertase/react-native-firebase/commit/70974d41f857a0f7fc09cb5235856d3748b30117)), closes [/firebase.google.com/support/release-notes/android#2020-10-27](https://github.com//firebase.google.com/support/release-notes/android/issues/2020-10-27) [/firebase.google.com/support/release-notes/ios#version_700_-_october_26_2020](https://github.com//firebase.google.com/support/release-notes/ios/issues/version_700_-_october_26_2020)
* bump firebase sdk versions, add GoogleApi dep, use Android API29 ([#4122](https://github.com/invertase/react-native-firebase/issues/4122)) ([728f418](https://github.com/invertase/react-native-firebase/commit/728f41863832d21230c6eb1f55385284fef03c09))
* independently version packages ([#3513](https://github.com/invertase/react-native-firebase/issues/3513)) ([e2c2d64](https://github.com/invertase/react-native-firebase/commit/e2c2d64d2266cbdd14d4dcfefa64a08263f0af85))
* update native Firebase SDK versions ([#3663](https://github.com/invertase/react-native-firebase/issues/3663)) ([4db9dbc](https://github.com/invertase/react-native-firebase/commit/4db9dbc3ec20bf96de0efad15000f00b41e4a799))
* use latest android & ios Firebase SDKs version ([#3956](https://github.com/invertase/react-native-firebase/issues/3956)) ([e7b4bb3](https://github.com/invertase/react-native-firebase/commit/e7b4bb31b05985c044b1f01625a43e364bb653ef))
* **app, ios:** bump firebase-ios-sdk to 7.1.0 from 7.0.0 ([#4533](https://github.com/invertase/react-native-firebase/issues/4533)) ([a1e90ae](https://github.com/invertase/react-native-firebase/commit/a1e90aef20f85f9f95a37c63867389e638f3fab7))
* **auth:** verifyBeforeUpdateEmail API ([#3862](https://github.com/invertase/react-native-firebase/issues/3862)) ([aaff624](https://github.com/invertase/react-native-firebase/commit/aaff62402544d8783007b6b47b8406019cc48c84))
* **crashlytics:** add new APIs `checkForUnsentReports`, `deleteUnsentReports`,`didCrashOnPreviousExecution`,`sendUnsentReports` ([#4009](https://github.com/invertase/react-native-firebase/issues/4009)) ([52eeed3](https://github.com/invertase/react-native-firebase/commit/52eeed31b3436b0f90767298dcc515b0897ba942))
* **firestore:** query operators: 'not-in' & '!=' ([#4474](https://github.com/invertase/react-native-firebase/issues/4474)) ([9e68faf](https://github.com/invertase/react-native-firebase/commit/9e68faf0310bd5f9c3347cad3dd5b80c9c0582e1))


### BREAKING CHANGES

* alter ML imports, check iOS linking, remove old API as noted
* This is a breaking change to remove the use of the Fabric SDKs.

Co-authored-by: David Buchan-Swanson <david.buchanswanson@gmail.com>
Co-authored-by: Mike Diarmid <mike.diarmid@gmail.com>
[publish]
* breaking change to mark new internal versioning requirements.





## [9.0.2](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@9.0.1...react-native-firebase-tests@9.0.2) (2020-11-11)

**Note:** Version bump only for package react-native-firebase-tests





## [9.0.1](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@9.0.0...react-native-firebase-tests@9.0.1) (2020-11-10)

**Note:** Version bump only for package react-native-firebase-tests





# [9.0.0](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.5.3...react-native-firebase-tests@9.0.0) (2020-11-10)


### Features

* BREAKING forward-port to firebase-android-sdk v26 / firebase-ios-sdk v7 ([70974d4](https://github.com/invertase/react-native-firebase/commit/70974d41f857a0f7fc09cb5235856d3748b30117)), closes [/firebase.google.com/support/release-notes/android#2020-10-27](https://github.com//firebase.google.com/support/release-notes/android/issues/2020-10-27) [/firebase.google.com/support/release-notes/ios#version_700_-_october_26_2020](https://github.com//firebase.google.com/support/release-notes/ios/issues/version_700_-_october_26_2020)


### BREAKING CHANGES

* alter ML imports, check iOS linking, remove old API as noted





## [8.5.3](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.5.2...react-native-firebase-tests@8.5.3) (2020-11-10)

**Note:** Version bump only for package react-native-firebase-tests





## [8.5.2](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.5.1...react-native-firebase-tests@8.5.2) (2020-11-10)


### Bug Fixes

* **storage:** Changed refFromUrl regex to exclude appspot.com ([#3775](https://github.com/invertase/react-native-firebase/issues/3775)) ([c6f4699](https://github.com/invertase/react-native-firebase/commit/c6f46996191126513e02f3d20efa78d166c4db0a))





## [8.5.1](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.5.0...react-native-firebase-tests@8.5.1) (2020-10-30)

**Note:** Version bump only for package react-native-firebase-tests





# [8.5.0](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.21...react-native-firebase-tests@8.5.0) (2020-10-30)


### Features

* **firestore:** query operators: 'not-in' & '!=' ([#4474](https://github.com/invertase/react-native-firebase/issues/4474)) ([9e68faf](https://github.com/invertase/react-native-firebase/commit/9e68faf0310bd5f9c3347cad3dd5b80c9c0582e1))





## [8.4.21](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.20...react-native-firebase-tests@8.4.21) (2020-10-21)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.20](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.19...react-native-firebase-tests@8.4.20) (2020-10-16)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.19](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.18...react-native-firebase-tests@8.4.19) (2020-10-16)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.18](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.17...react-native-firebase-tests@8.4.18) (2020-10-07)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.17](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.16...react-native-firebase-tests@8.4.17) (2020-10-07)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.16](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.15...react-native-firebase-tests@8.4.16) (2020-09-30)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.15](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.14...react-native-firebase-tests@8.4.15) (2020-09-30)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.14](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.13...react-native-firebase-tests@8.4.14) (2020-09-30)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.13](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.12...react-native-firebase-tests@8.4.13) (2020-09-30)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.12](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.11...react-native-firebase-tests@8.4.12) (2020-09-17)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.11](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.10...react-native-firebase-tests@8.4.11) (2020-09-17)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.10](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.9...react-native-firebase-tests@8.4.10) (2020-09-11)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.9](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.8...react-native-firebase-tests@8.4.9) (2020-09-11)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.8](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.7...react-native-firebase-tests@8.4.8) (2020-09-04)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.7](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.6...react-native-firebase-tests@8.4.7) (2020-09-02)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.6](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.5...react-native-firebase-tests@8.4.6) (2020-08-31)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.5](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.4...react-native-firebase-tests@8.4.5) (2020-08-30)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.4](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.3...react-native-firebase-tests@8.4.4) (2020-08-30)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.3](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.2...react-native-firebase-tests@8.4.3) (2020-08-28)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.2](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.1...react-native-firebase-tests@8.4.2) (2020-08-28)

**Note:** Version bump only for package react-native-firebase-tests





## [8.4.1](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.4.0...react-native-firebase-tests@8.4.1) (2020-08-26)

**Note:** Version bump only for package react-native-firebase-tests





# [8.4.0](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.3.8...react-native-firebase-tests@8.4.0) (2020-08-26)


### Features

* bump firebase sdk versions, add GoogleApi dep, use Android API29 ([#4122](https://github.com/invertase/react-native-firebase/issues/4122)) ([728f418](https://github.com/invertase/react-native-firebase/commit/728f41863832d21230c6eb1f55385284fef03c09))





## [8.3.8](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.3.7...react-native-firebase-tests@8.3.8) (2020-08-26)

**Note:** Version bump only for package react-native-firebase-tests





## [8.3.7](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.3.6...react-native-firebase-tests@8.3.7) (2020-08-25)

**Note:** Version bump only for package react-native-firebase-tests





## [8.3.6](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.3.5...react-native-firebase-tests@8.3.6) (2020-08-25)

**Note:** Version bump only for package react-native-firebase-tests





## [8.3.5](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.3.4...react-native-firebase-tests@8.3.5) (2020-08-24)

**Note:** Version bump only for package react-native-firebase-tests





## [8.3.4](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.3.3...react-native-firebase-tests@8.3.4) (2020-08-21)

**Note:** Version bump only for package react-native-firebase-tests





## [8.3.3](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.3.2...react-native-firebase-tests@8.3.3) (2020-08-20)

**Note:** Version bump only for package react-native-firebase-tests





## [8.3.2](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.3.1...react-native-firebase-tests@8.3.2) (2020-08-15)

**Note:** Version bump only for package react-native-firebase-tests





## [8.3.1](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.3.0...react-native-firebase-tests@8.3.1) (2020-08-15)


### Bug Fixes

* **messaging:** initialize app props method to fix isHeadless property ([#4082](https://github.com/invertase/react-native-firebase/issues/4082)) ([2bdebb1](https://github.com/invertase/react-native-firebase/commit/2bdebb1d3d82915d0aa9a49431d26658721a2f86))





# [8.3.0](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.2.1...react-native-firebase-tests@8.3.0) (2020-08-03)


### Features

* **crashlytics:** add new APIs `checkForUnsentReports`, `deleteUnsentReports`,`didCrashOnPreviousExecution`,`sendUnsentReports` ([#4009](https://github.com/invertase/react-native-firebase/issues/4009)) ([52eeed3](https://github.com/invertase/react-native-firebase/commit/52eeed31b3436b0f90767298dcc515b0897ba942))





## [8.2.1](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.2.0...react-native-firebase-tests@8.2.1) (2020-08-03)

**Note:** Version bump only for package react-native-firebase-tests





# [8.2.0](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.1.1...react-native-firebase-tests@8.2.0) (2020-08-03)


### Features

* use latest android & ios Firebase SDKs version ([#3956](https://github.com/invertase/react-native-firebase/issues/3956)) ([e7b4bb3](https://github.com/invertase/react-native-firebase/commit/e7b4bb31b05985c044b1f01625a43e364bb653ef))





## [8.1.1](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.1.0...react-native-firebase-tests@8.1.1) (2020-07-23)

**Note:** Version bump only for package react-native-firebase-tests





# [8.1.0](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.0.10...react-native-firebase-tests@8.1.0) (2020-07-10)


### Features

* **auth:** verifyBeforeUpdateEmail API ([#3862](https://github.com/invertase/react-native-firebase/issues/3862)) ([aaff624](https://github.com/invertase/react-native-firebase/commit/aaff62402544d8783007b6b47b8406019cc48c84))





## [8.0.10](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.0.9...react-native-firebase-tests@8.0.10) (2020-07-09)

**Note:** Version bump only for package react-native-firebase-tests





## [8.0.9](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.0.8...react-native-firebase-tests@8.0.9) (2020-07-09)

**Note:** Version bump only for package react-native-firebase-tests





## [8.0.8](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.0.7...react-native-firebase-tests@8.0.8) (2020-07-09)

**Note:** Version bump only for package react-native-firebase-tests





## [8.0.7](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.0.6...react-native-firebase-tests@8.0.7) (2020-07-07)

**Note:** Version bump only for package react-native-firebase-tests





## [8.0.6](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.0.5...react-native-firebase-tests@8.0.6) (2020-07-07)

**Note:** Version bump only for package react-native-firebase-tests





## [8.0.5](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.0.4...react-native-firebase-tests@8.0.5) (2020-07-06)

**Note:** Version bump only for package react-native-firebase-tests





## [8.0.4](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.0.3...react-native-firebase-tests@8.0.4) (2020-07-06)

**Note:** Version bump only for package react-native-firebase-tests





## [8.0.3](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.0.2...react-native-firebase-tests@8.0.3) (2020-07-05)

**Note:** Version bump only for package react-native-firebase-tests





## [8.0.2](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.0.1...react-native-firebase-tests@8.0.2) (2020-07-05)

**Note:** Version bump only for package react-native-firebase-tests





## [8.0.1](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@8.0.0...react-native-firebase-tests@8.0.1) (2020-06-30)

**Note:** Version bump only for package react-native-firebase-tests





# [8.0.0](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.23...react-native-firebase-tests@8.0.0) (2020-06-30)


* feat(crashlytics)!: upgrade to new Firebase Crashlytics SDK (#3580) ([cad58e1](https://github.com/invertase/react-native-firebase/commit/cad58e178b43dea461e17fa4a0a3fecd507ba68a)), closes [#3580](https://github.com/invertase/react-native-firebase/issues/3580)


### BREAKING CHANGES

* This is a breaking change to remove the use of the Fabric SDKs.

Co-authored-by: David Buchan-Swanson <david.buchanswanson@gmail.com>
Co-authored-by: Mike Diarmid <mike.diarmid@gmail.com>
[publish]





## [7.1.23](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.22...react-native-firebase-tests@7.1.23) (2020-06-26)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.22](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.21...react-native-firebase-tests@7.1.22) (2020-06-26)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.21](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.20...react-native-firebase-tests@7.1.21) (2020-06-22)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.20](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.19...react-native-firebase-tests@7.1.20) (2020-06-22)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.19](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.18...react-native-firebase-tests@7.1.19) (2020-06-22)


### Bug Fixes

* **ml-vision:** convert options to correct type ([#3694](https://github.com/invertase/react-native-firebase/issues/3694)) ([b462be5](https://github.com/invertase/react-native-firebase/commit/b462be542a41a4e37a201146642f1b9fd4c6a74f))





## [7.1.18](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.17...react-native-firebase-tests@7.1.18) (2020-06-19)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.17](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.16...react-native-firebase-tests@7.1.17) (2020-06-18)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.16](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.15...react-native-firebase-tests@7.1.16) (2020-06-18)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.15](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.14...react-native-firebase-tests@7.1.15) (2020-06-10)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.14](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.13...react-native-firebase-tests@7.1.14) (2020-06-10)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.13](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.12...react-native-firebase-tests@7.1.13) (2020-06-03)


### Bug Fixes

* **firestore:**  update isEqual API to check collection path equality ([#3738](https://github.com/invertase/react-native-firebase/issues/3738)) ([405e040](https://github.com/invertase/react-native-firebase/commit/405e04009c1550dc6897b207ae3a63ad274c6de5))





## [7.1.12](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.11...react-native-firebase-tests@7.1.12) (2020-06-03)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.11](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.10...react-native-firebase-tests@7.1.11) (2020-06-03)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.10](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.9...react-native-firebase-tests@7.1.10) (2020-06-03)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.9](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.8...react-native-firebase-tests@7.1.9) (2020-06-01)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.8](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.7...react-native-firebase-tests@7.1.8) (2020-05-29)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.7](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.6...react-native-firebase-tests@7.1.7) (2020-05-29)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.6](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.5...react-native-firebase-tests@7.1.6) (2020-05-29)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.5](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.4...react-native-firebase-tests@7.1.5) (2020-05-29)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.4](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.3...react-native-firebase-tests@7.1.4) (2020-05-29)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.3](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.2...react-native-firebase-tests@7.1.3) (2020-05-29)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.2](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.1...react-native-firebase-tests@7.1.2) (2020-05-28)

**Note:** Version bump only for package react-native-firebase-tests





## [7.1.1](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.1.0...react-native-firebase-tests@7.1.1) (2020-05-28)

**Note:** Version bump only for package react-native-firebase-tests





# [7.1.0](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.0.2...react-native-firebase-tests@7.1.0) (2020-05-22)


### Features

* update native Firebase SDK versions ([#3663](https://github.com/invertase/react-native-firebase/issues/3663)) ([4db9dbc](https://github.com/invertase/react-native-firebase/commit/4db9dbc3ec20bf96de0efad15000f00b41e4a799))





## [7.0.2](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.0.1...react-native-firebase-tests@7.0.2) (2020-05-15)

**Note:** Version bump only for package react-native-firebase-tests





## [7.0.1](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.0.0...react-native-firebase-tests@7.0.1) (2020-05-13)

**Note:** Version bump only for package react-native-firebase-tests





## [7.0.0](https://github.com/invertase/react-native-firebase/compare/react-native-firebase-tests@7.0.0...react-native-firebase-tests@7.0.0) (2020-05-13)


* feat!: all packages should depend on core (#3613) ([252a423](https://github.com/invertase/react-native-firebase/commit/252a4239e98a0f2a55c4afcd2d82e4d5f97e65e9)), closes [#3613](https://github.com/invertase/react-native-firebase/issues/3613)


### BREAKING CHANGES

* breaking change to mark new internal versioning requirements.
