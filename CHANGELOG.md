# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [10.8.0](https://github.com/invertase/react-native-firebase/compare/v10.7.0...v10.8.0) (2021-02-13)


### Bug Fixes

* **dynamic-links, dependencies:** analytics is optional ([3e980d4](https://github.com/invertase/react-native-firebase/commit/3e980d4bb5fbaeefc045f2427a9e0cc0b153af6e)), closes [/github.com/invertase/react-native-firebase/pull/4850#issuecomment-776516887](https://github.com//github.com/invertase/react-native-firebase/pull/4850/issues/issuecomment-776516887)
* **dynamic-links, ios:** remove double-reject on resolveLink ([395a723](https://github.com/invertase/react-native-firebase/commit/395a7232b5e09bac3cd442ad0524363e4cd9b406))


### Features

* **app, android-sdk:** 26.5.0 (requires gradle v5.6.4+ / android gradle plugin v3.4.2+) ([1132f16](https://github.com/invertase/react-native-firebase/commit/1132f1629dd6b2d0ff9fdb00e47e075773a1dc60))
* **crashlytics:** add JS exception non-fatal error generation toggle ([#4904](https://github.com/invertase/react-native-firebase/issues/4904)) ([63c35b3](https://github.com/invertase/react-native-firebase/commit/63c35b3d9243a76fd77dedaa9fa83fca7fb802ae))





# [10.7.0](https://github.com/invertase/react-native-firebase/compare/v10.6.4...v10.7.0) (2021-02-09)


### Bug Fixes

* **auth, android:** do not timezone offset when getting UTC timestamp ([#4886](https://github.com/invertase/react-native-firebase/issues/4886)) ([85d6801](https://github.com/invertase/react-native-firebase/commit/85d6801ecbe9b3922225c55ca3628675ad848764))


### Features

* **ios, sdk:** bump firebase-ios-sdk from 7.5.0 to 7.6.0 ([2e283f7](https://github.com/invertase/react-native-firebase/commit/2e283f72322e612a0c82b1d116f3ecfa58904ea9)), closes [/firebase.google.com/support/release-notes/ios#7](https://github.com//firebase.google.com/support/release-notes/ios/issues/7)





## [10.6.4](https://github.com/invertase/react-native-firebase/compare/v10.6.3...v10.6.4) (2021-02-05)


### Bug Fixes

* **auth, android:** add browser dependency as crash workaround ([f0b4d07](https://github.com/invertase/react-native-firebase/commit/f0b4d0739184711544f2fc0b04af9204b6202877)), closes [#4744](https://github.com/invertase/react-native-firebase/issues/4744)
* **ml, android:** remove unnecessary on-device dependencies ([1451073](https://github.com/invertase/react-native-firebase/commit/14510736d7d379eac02cca917676374009ffbf76)), closes [#4750](https://github.com/invertase/react-native-firebase/issues/4750)





## [10.6.3](https://github.com/invertase/react-native-firebase/compare/v10.6.2...v10.6.3) (2021-02-05)

**Note:** Version bump only for package react-native-firebase





## [10.6.2](https://github.com/invertase/react-native-firebase/compare/v10.6.1...v10.6.2) (2021-02-05)


### Bug Fixes

* **admob:** improve defense logic to prevent multiple calls ([#4849](https://github.com/invertase/react-native-firebase/issues/4849)) ([5a71ad7](https://github.com/invertase/react-native-firebase/commit/5a71ad72f74486da253e003741d202af6353b927))





## [10.6.1](https://github.com/invertase/react-native-firebase/compare/v10.6.0...v10.6.1) (2021-02-04)

**Note:** Version bump only for package react-native-firebase





# [10.6.0](https://github.com/invertase/react-native-firebase/compare/v10.5.1...v10.6.0) (2021-02-04)


### Bug Fixes

* **dynamic-links:** dynamic-links requires analytics, add peer dependency ([5c84d46](https://github.com/invertase/react-native-firebase/commit/5c84d460a4563b82d2489447a95379498278cbae)), closes [#4821](https://github.com/invertase/react-native-firebase/issues/4821)
* **dynamic-links, android:** getInitialLink returned more than once, sometimes returned null ([#4735](https://github.com/invertase/react-native-firebase/issues/4735)) ([c68a62c](https://github.com/invertase/react-native-firebase/commit/c68a62c8bb5afd8d9c1f3df635a87d79f9dcefc0))
* **emulator:** add notice on localhost URL remapping for android ([73869e1](https://github.com/invertase/react-native-firebase/commit/73869e1c8ed97eb95008214097b9498bfb05e4ea)), closes [#4810](https://github.com/invertase/react-native-firebase/issues/4810)
* **in-app-messaging:** in-app-messaging requires analytics, add peer dependency ([ea80f54](https://github.com/invertase/react-native-firebase/commit/ea80f548e686e1d695fed7d1f5d5b5cc9217fbf0)), closes [#4821](https://github.com/invertase/react-native-firebase/issues/4821)
* **remote-config:** remote-config requires analytics, add peer dependency ([06c2a18](https://github.com/invertase/react-native-firebase/commit/06c2a187cfab6fe7c359dc80a7841281cab9de55)), closes [#4821](https://github.com/invertase/react-native-firebase/issues/4821)


### Features

* **admob, android:** add adaptive banner support  ([#4840](https://github.com/invertase/react-native-firebase/issues/4840)) ([51edf96](https://github.com/invertase/react-native-firebase/commit/51edf96ae9596226cff5e8debda19da1b6c7b165))
* **app:** firebase-ios-sdk 7.4.0 -> 7.5.0, firebase-android-sdk 26.3.0 -> 26.4.0 ([9c4ada8](https://github.com/invertase/react-native-firebase/commit/9c4ada893c8c49afc454d1fe6084ba2572f2a25f))
* **perf:** support "perf_auto_collection_enabled" flag in firebase.json ([#4870](https://github.com/invertase/react-native-firebase/issues/4870)) ([e54bf49](https://github.com/invertase/react-native-firebase/commit/e54bf49ec880b309f8ffc244d3bb0da74a5d4ddd))





## [10.5.1](https://github.com/invertase/react-native-firebase/compare/v10.5.0...v10.5.1) (2021-01-19)

**Note:** Version bump only for package react-native-firebase





# [10.5.0](https://github.com/invertase/react-native-firebase/compare/v10.4.1...v10.5.0) (2021-01-18)


### Bug Fixes

* **app, android:** require default firebase.json boolean key ([#4791](https://github.com/invertase/react-native-firebase/issues/4791)) ([483d9d3](https://github.com/invertase/react-native-firebase/commit/483d9d3655844e4c40cb42f3b0da865ada971515))


### Features

* **app, sdks:** firebase-ios-sdk 7.4.0 / firebase-android-sdk 26.3.0 ([#4792](https://github.com/invertase/react-native-firebase/issues/4792)) ([f915c82](https://github.com/invertase/react-native-firebase/commit/f915c823d6765b21096ea3b7e52f22bb71630bec))





## [10.4.1](https://github.com/invertase/react-native-firebase/compare/v10.4.0...v10.4.1) (2021-01-08)


### Bug Fixes

* **ml, android:** removed unnecessary local face models ([#4753](https://github.com/invertase/react-native-firebase/issues/4753)) ([a750070](https://github.com/invertase/react-native-firebase/commit/a7500700ea514e28b68150d39ffbbfd3ffdb3353))





# [10.4.0](https://github.com/invertase/react-native-firebase/compare/v10.3.1...v10.4.0) (2020-12-30)


### Bug Fixes

* **ios:** bump ios min deployment to ios10 - remnant from [#4471](https://github.com/invertase/react-native-firebase/issues/4471) ([4a57578](https://github.com/invertase/react-native-firebase/commit/4a5757827789141600625eebe5e13c976ddb7402))


### Features

* **analytics:** add support for analytics_auto_collection_enabled in firebase.json ([#4730](https://github.com/invertase/react-native-firebase/issues/4730)) ([9a24ecd](https://github.com/invertase/react-native-firebase/commit/9a24ecd2826bfa8ab30657287432ccaeff8b7c7c))





## [10.3.1](https://github.com/invertase/react-native-firebase/compare/v10.3.0...v10.3.1) (2020-12-18)


### Bug Fixes

* **storage, ios:** resolve listAll promise once and only once on error ([#4688](https://github.com/invertase/react-native-firebase/issues/4688)) ([762bf6f](https://github.com/invertase/react-native-firebase/commit/762bf6f55d809f9bccbac847c92074a2b8c41150)), closes [/github.com/firebase/firebase-ios-sdk/blob/14764b8d60a6ad023d8fa5b7f81d42378d92e6fe/FirebaseStorage/Sources/FIRStorageReference.m#L417](https://github.com//github.com/firebase/firebase-ios-sdk/blob/14764b8d60a6ad023d8fa5b7f81d42378d92e6fe/FirebaseStorage/Sources/FIRStorageReference.m/issues/L417)





# [10.3.0](https://github.com/invertase/react-native-firebase/compare/v10.2.0...v10.3.0) (2020-12-18)


### Bug Fixes

* **admob, ios:** null check interstitialAd on show ([#4670](https://github.com/invertase/react-native-firebase/issues/4670)) ([c3b4cb0](https://github.com/invertase/react-native-firebase/commit/c3b4cb047155e75a0a41e01de45b5b0b98fb724b))
* **dynamic-links, ios:** resolveLink 404 error handling fix ([575083d](https://github.com/invertase/react-native-firebase/commit/575083d19820cc295ecf8a765a71cb99faea5cd3))
* **ios, storage:** handle nil file extension from ios14 M1 emulators ([#4676](https://github.com/invertase/react-native-firebase/issues/4676)) ([e1eb992](https://github.com/invertase/react-native-firebase/commit/e1eb9928ce6d629d75b8e9462a823cace7373767))


### Features

* **app:** bump firebase-android-sdk / firebase-ios-sdk versions ([cd5a451](https://github.com/invertase/react-native-firebase/commit/cd5a451cece27204a657780ebdbcf7fa909f5100))





# [10.2.0](https://github.com/invertase/react-native-firebase/compare/v10.1.1...v10.2.0) (2020-12-11)


### Bug Fixes

* **docs:** correct path to source code ([#4659](https://github.com/invertase/react-native-firebase/issues/4659)) ([b535757](https://github.com/invertase/react-native-firebase/commit/b5357573e97ccc3bfdf6a190713a7df66e462c4b))
* **remote-config, ios:** correct number comparison / fix fetch throttling ([#4664](https://github.com/invertase/react-native-firebase/issues/4664)) ([5a68a8a](https://github.com/invertase/react-native-firebase/commit/5a68a8a2767f65905c32c06145cb3b0b9432c397))


### Features

* firebase-ios-sdk 7.2.0 / firebase-android-sdk 26.1.1 ([#4648](https://github.com/invertase/react-native-firebase/issues/4648)) ([a158a74](https://github.com/invertase/react-native-firebase/commit/a158a74dee0dd6774c725ff1213453f8dfdcb8f5))





## [10.1.1](https://github.com/invertase/react-native-firebase/compare/v10.1.0...v10.1.1) (2020-12-02)


### Bug Fixes

* **messaging:** remote message from messaging store on new intent ([#4634](https://github.com/invertase/react-native-firebase/issues/4634)) ([00b83af](https://github.com/invertase/react-native-firebase/commit/00b83af15ca23d667e4258a1cf3e5b6a830a8f2d))





# [10.1.0](https://github.com/invertase/react-native-firebase/compare/v10.0.0...v10.1.0) (2020-11-26)


### Bug Fixes

* **analytics:** add missing quantity parameter to the Item structure ([#4536](https://github.com/invertase/react-native-firebase/issues/4536)) ([f9935e7](https://github.com/invertase/react-native-firebase/commit/f9935e78f181a5bfb718094487a5368472232b2d))
* **app:** convert NativeFirebaseError.getStackWithMessage to static to fix crash ([#4619](https://github.com/invertase/react-native-firebase/issues/4619)) ([090b0bb](https://github.com/invertase/react-native-firebase/commit/090b0bb509d4b3a71db9b84096d89effd4e2d865))
* **app, android:** remove firebase-core from dependencies ([#4597](https://github.com/invertase/react-native-firebase/issues/4597)) ([22c615c](https://github.com/invertase/react-native-firebase/commit/22c615c39fe17dbf8915ae08c5d46431713495a0))
* **messaging, badge:** use new iOS JSON location for FCM badge information ([#4560](https://github.com/invertase/react-native-firebase/issues/4560)) ([bda2d67](https://github.com/invertase/react-native-firebase/commit/bda2d67ddaf7f12ac3143b564e7e94974e8356db))


### Features

* **admob, ios:** add adaptive banner support ([#4565](https://github.com/invertase/react-native-firebase/issues/4565)) ([ce8ac1a](https://github.com/invertase/react-native-firebase/commit/ce8ac1ac5542f24aeab9df4d7f638c831f12b31a))
* **crashlytics:** add custom message ability to javascript stack traces ([#4609](https://github.com/invertase/react-native-firebase/issues/4609)) ([afaa95d](https://github.com/invertase/react-native-firebase/commit/afaa95dbf4c744cb04042f6236837164edc8bbb8))
* **messaging, android:** make native serializer object + events builder APIs public ([#4618](https://github.com/invertase/react-native-firebase/issues/4618)) ([e54fecc](https://github.com/invertase/react-native-firebase/commit/e54feccea41fdbe4a7b10554b32ce2cef6068c66))





# [10.0.0](https://github.com/invertase/react-native-firebase/compare/fc8c4c0622f8e6814879d0306f66012df5b83cd8...v10.0.0) (2020-11-17)


### BREAKING

* **analytics** remove deprecated analytics methods ([18f5b0f](https://github.com/invertase/react-native-firebase/commit/18f5b0f7e65a3bddc92d3d23e31efb42a518ec12))
* breaking change to mark new internal versioning requirements.



### Bug Fixes

* **auth, android:** fixed user collision handling with apple sign-in ([#4487](https://github.com/invertase/react-native-firebase/issues/4487)) ([6a8f8ad](https://github.com/invertase/react-native-firebase/commit/6a8f8ad9b05d9510948206cc9837547cab124c63))
* **auth, android:** gracefully handle exception creating PhoneCredential ([8ead604](https://github.com/invertase/react-native-firebase/commit/8ead60431c2aae4193ed79eb10dc3b43480c5d77))
* **auth, android:** handle failure to upgrade anonymous user ([41fad36](https://github.com/invertase/react-native-firebase/commit/41fad3629437059a5e81d29f82c79589286aaea2)), closes [#4487](https://github.com/invertase/react-native-firebase/issues/4487)


### Features

* **auth, android:** apple sign in support in android ([#4188](https://github.com/invertase/react-native-firebase/issues/4188)) ([c6e77a8](https://github.com/invertase/react-native-firebase/commit/c6e77a8c34c632eba119dc30a320675a142dabce))
* **auth, emulator:** add useEmulator javascript code + jest tests ([532adb5](https://github.com/invertase/react-native-firebase/commit/532adb569413e8a5e5077d5f47582a0a300b3045))
* **auth, emulator:** implement native useEmulator calls ([81369a0](https://github.com/invertase/react-native-firebase/commit/81369a089e3ffc5be53d7651fa5a9dacf5bfa7b6))
