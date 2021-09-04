# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [12.7.5](https://github.com/invertase/react-native-firebase/compare/v12.7.4...v12.7.5) (2021-09-04)


### Bug Fixes

* **analytics:** allow more than 25 event parameters ([5dde564](https://github.com/invertase/react-native-firebase/commit/5dde56414caf3b79a5b6c4b1c61485789d7b564b))
* **app, ios:** correct path to 'Info.plist' for ios build dependency ([#5677](https://github.com/invertase/react-native-firebase/issues/5677)) ([ea6920c](https://github.com/invertase/react-native-firebase/commit/ea6920c3e900d76cce254a8da1704f50f3f2bc9a)), closes [#5152](https://github.com/invertase/react-native-firebase/issues/5152) [#5153](https://github.com/invertase/react-native-firebase/issues/5153)
* **auth, android:** linkWithCredential will not attempt to upgrade from anon user (matches iOS) ([#5694](https://github.com/invertase/react-native-firebase/issues/5694)) ([7cd1716](https://github.com/invertase/react-native-firebase/commit/7cd1716c0adef0f390b34409e737ac14da8120a8)), closes [#4487](https://github.com/invertase/react-native-firebase/issues/4487) [#4552](https://github.com/invertase/react-native-firebase/issues/4552)





## [12.7.4](https://github.com/invertase/react-native-firebase/compare/v12.7.3...v12.7.4) (2021-08-31)


### Bug Fixes

* **app-distribution, ios:** avoid crash when releaseNotes is nil ([#5667](https://github.com/invertase/react-native-firebase/issues/5667)) ([41c0107](https://github.com/invertase/react-native-firebase/commit/41c0107dfcefb6989de08d534e5a8099482a420a))
* **app-distribution, ios:** correct downloadURL usage for JS serialization ([#5668](https://github.com/invertase/react-native-firebase/issues/5668)) ([66d991c](https://github.com/invertase/react-native-firebase/commit/66d991ca4bb034d6a6a56028668be6eb002d4345))
* **dynamic-links, android:** check for null currentIntent in getInitialLink to avoid crash ([#5662](https://github.com/invertase/react-native-firebase/issues/5662)) ([415c200](https://github.com/invertase/react-native-firebase/commit/415c200f0d0b0b9f7c6f8fffcb62d79b0973ba6f))





## [12.7.3](https://github.com/invertase/react-native-firebase/compare/v12.7.2...v12.7.3) (2021-08-24)


### Bug Fixes

* **messaging, ios): revert "fix(messaging, ios:** only call onMessage handler if message is data-only or undelivered" ([#5641](https://github.com/invertase/react-native-firebase/issues/5641)) ([f2162b7](https://github.com/invertase/react-native-firebase/commit/f2162b74e06b9f1163937e4cfd3671012c5e902d))





## [12.7.2](https://github.com/invertase/react-native-firebase/compare/v12.7.1...v12.7.2) (2021-08-21)


### Bug Fixes

* **app-check, ios:** use RNFBAppCheck everywhere vs RNFBAppcheck ([2545349](https://github.com/invertase/react-native-firebase/commit/2545349177aac2fe99418c76ecd5901b5719b819))
* **app-distribution, android:** export methods so module loads ([bc0ae4f](https://github.com/invertase/react-native-firebase/commit/bc0ae4f307d1e6e60bfdf871f85dd3fc796ad8c8))





## [12.7.1](https://github.com/invertase/react-native-firebase/compare/v12.7.0...v12.7.1) (2021-08-20)


### Bug Fixes

* **app, android:** react-native 0.65 compatibility ([262452d](https://github.com/invertase/react-native-firebase/commit/262452d69c2dadd79475235fca42c12b18b2e208))





# [12.7.0](https://github.com/invertase/react-native-firebase/compare/v12.6.1...v12.7.0) (2021-08-19)


### Bug Fixes

* **app-check, android:** include all referenced dependencies correctly ([af336a3](https://github.com/invertase/react-native-firebase/commit/af336a3310d2653fe70879cd0729fba3469b15de))
* **app-check:** getToken(false) fix, listener unsubscribe is a function ([8b42e20](https://github.com/invertase/react-native-firebase/commit/8b42e20a334b2fd934267be1b81bfab0fd8192cb))
* **installations, types:** fixup installations module types ([781a303](https://github.com/invertase/react-native-firebase/commit/781a30306dd6c704facd08df396dc5a36c369af7))
* onMessage to only trigger for data-only or undelivered messages ([a31643b](https://github.com/invertase/react-native-firebase/commit/a31643ba1712cafc2af4291dc3b5f1a61a7373ad))


### Features

* **app-distribution:** Implement Firebase App Distribution module ([8fa1263](https://github.com/invertase/react-native-firebase/commit/8fa1263bc657b7d1d0630bc193097cb5d4aa631a))
* **app, config:** implement setLogLevel API ([cac7be3](https://github.com/invertase/react-native-firebase/commit/cac7be33ca70b37103ba8635ed64e755e0728c9d))
* **app, ios:** adopt firebase-ios-sdk 8.6.0 ([22d79f1](https://github.com/invertase/react-native-firebase/commit/22d79f136363f2ba67e9a0920c69a71fdffdb444))
* **firestore, emulator:** implement easier useEmulator API ([f039196](https://github.com/invertase/react-native-firebase/commit/f0391966c34ff845120ac8f45c8a8cc4b4f68885))
* **installations:** implement Firebase Installations module ([3ef3410](https://github.com/invertase/react-native-firebase/commit/3ef3410e265515c8fd3653728727a0048ffdbd87))





## [12.6.1](https://github.com/invertase/react-native-firebase/compare/v12.6.0...v12.6.1) (2021-08-17)


### Bug Fixes

* **crashlytics, config:** handle new app_data_collection_default_enabled key ([81aa17f](https://github.com/invertase/react-native-firebase/commit/81aa17f1b60a6171329d9a2f250226010dfc081e))





# [12.6.0](https://github.com/invertase/react-native-firebase/compare/v12.5.0...v12.6.0) (2021-08-16)


### Bug Fixes

* **app-check, ios:** allow token auto refresh config in firebase.json ([b9670c1](https://github.com/invertase/react-native-firebase/commit/b9670c1194e5460fbfcc0d90b462062eaed8538b))
* **app, android:** put app init provider / registrar in correct manifest ([8408160](https://github.com/invertase/react-native-firebase/commit/8408160d93be7f9a29f4aea9df3799aafdf6f69e))
* **app, expo:** node 12 compatibility with `fs.promises` in ios plugin ([#5591](https://github.com/invertase/react-native-firebase/issues/5591)) ([97f9090](https://github.com/invertase/react-native-firebase/commit/97f90900ec9b983bdd2cf640fcda5c3435aa1abe))
* **in-app-messaging, config:** implement in_app_messaging_auto_collection_enabled firebase.json setting ([9d11ce9](https://github.com/invertase/react-native-firebase/commit/9d11ce93b81fe7818cb264bac1b36c60daac3463))
* **messaging, ios:** return after resolving to avoid useless work ([491436f](https://github.com/invertase/react-native-firebase/commit/491436fe31cc4c0b8fafc3af91a62d581bc495a0))
* **sdks, android:** firebase-android-sdk 28.3.1, google-services plugin 4.3.10 ([4562cd8](https://github.com/invertase/react-native-firebase/commit/4562cd8ccb70c3f964e9c038d2eca6eb87bcba60))


### Features

* **analytics, config:** expose all the native data collection toggles ([f5eaffb](https://github.com/invertase/react-native-firebase/commit/f5eaffbfaf7e165b205692dd5b1b16e87b09d5a2))
* **app, config:** implement app_data_collection_default_enabled firebase.json key ([1e47d45](https://github.com/invertase/react-native-firebase/commit/1e47d455aa3a99b4ad6e08caf491be3df63a7f55))
* **dynamic-links:** add support for utmParameters ([#5593](https://github.com/invertase/react-native-firebase/issues/5593)) ([3002caf](https://github.com/invertase/react-native-firebase/commit/3002caf4672e1df039a089b9109e444f8d8caf00))
* **perf, config:** expose perf module deactivate toggle ([4e25bf6](https://github.com/invertase/react-native-firebase/commit/4e25bf63237f42b98ae5cd2ef424408299992c03))





# [12.5.0](https://github.com/invertase/react-native-firebase/compare/v12.4.0...v12.5.0) (2021-08-12)


### Bug Fixes

* **app, expo:** Use `fs/promises` in Node 12 compatible way ([#5585](https://github.com/invertase/react-native-firebase/issues/5585)) ([64f569a](https://github.com/invertase/react-native-firebase/commit/64f569acd2cea284baa305451df9533f138539e7))
* **database, android:** remove System.err statement from useEmulator development ([dc84872](https://github.com/invertase/react-native-firebase/commit/dc84872017082e49209376d4c9e675cf5c5572ec))
* **expo:** do not publish plugin tests and sources ([#5565](https://github.com/invertase/react-native-firebase/issues/5565)) ([6b5dca5](https://github.com/invertase/react-native-firebase/commit/6b5dca500ea413ee68acf8abc74e579f4298cbad))


### Features

* **app-check:** implement AppCheck module ([8cd4fa3](https://github.com/invertase/react-native-firebase/commit/8cd4fa33d8df8fc72f2484665423986d12fc65fa))
* **firestore:** serverTimestampBehavior ([#5556](https://github.com/invertase/react-native-firebase/issues/5556)) ([60fe72e](https://github.com/invertase/react-native-firebase/commit/60fe72ebcc21daf6da5f8478c0a758483b28e5f6))
* **ios, sdks:** bump firebase-ios-sdk to 8.5.0 ([d4b2015](https://github.com/invertase/react-native-firebase/commit/d4b2015f8def4759b95072cd4bca86eda0443c54))





# [12.4.0](https://github.com/invertase/react-native-firebase/compare/v12.3.0...v12.4.0) (2021-07-29)


### Features

* **sdks, android:** use firebase-android-sdk 28.3.0, play-services-auth 19.2.0 ([#5555](https://github.com/invertase/react-native-firebase/issues/5555)) ([edcd4e2](https://github.com/invertase/react-native-firebase/commit/edcd4e2244ffcf4734648b402d5714e41c4d3539))
* Add Expo config plugin ([#5480](https://github.com/invertase/react-native-firebase/issues/5480)) ([832057c](https://github.com/invertase/react-native-firebase/commit/832057cfbdf1778ad2141a1ad4466d2e8c24b8ce))


### Performance Improvements

* **messaging, ios:** Improve time to delivery of background messages on iOS ([#5547](https://github.com/invertase/react-native-firebase/issues/5547)) ([f4168b1](https://github.com/invertase/react-native-firebase/commit/f4168b154d6194cbc87e03d91787e59c8d97ea10))





# [12.3.0](https://github.com/invertase/react-native-firebase/compare/v12.2.0...v12.3.0) (2021-07-21)


### Bug Fixes

* **firestore:** accept nested undefined array values ([224383f](https://github.com/invertase/react-native-firebase/commit/224383f4ecdebab67bb91aac2b4a5b85c4931c04)), closes [#5437](https://github.com/invertase/react-native-firebase/issues/5437)


### Features

* **ios:** bump firebase-ios-sdk dependency to 8.4.0 ([7a75cb9](https://github.com/invertase/react-native-firebase/commit/7a75cb94eb0ee2196895dd9216ef566b059d4822))





# [12.2.0](https://github.com/invertase/react-native-firebase/compare/v12.1.0...v12.2.0) (2021-07-16)


### Bug Fixes

* **database:** call cancellation callback when using ref.on ([#5371](https://github.com/invertase/react-native-firebase/issues/5371)) ([26b59db](https://github.com/invertase/react-native-firebase/commit/26b59dbe06bedc64ed83923ecf132b47fe0eb05b))
* **messaging:** Refactor code to avoid bugs  ([5039759](https://github.com/invertase/react-native-firebase/commit/503975909383582d8850470455eeef8f18194ba8))
* **storage, ios:** dont enumerate on dictionary being mutated ([#5455](https://github.com/invertase/react-native-firebase/issues/5455)) ([daaa72d](https://github.com/invertase/react-native-firebase/commit/daaa72d82df6b9e5e2c1247c10792d4b12683541))


### Features

* firebase-ios-sdk 8.3.0 / firebase-android-sdk 28.2.1 ([c73ea10](https://github.com/invertase/react-native-firebase/commit/c73ea103b1ae8b6171d8719b752459cecb9a9359))
* **app, sdks:** use firebase-ios-sdk 8.2.0 / firebase-android-sdk 28.2.0 ([0d26af9](https://github.com/invertase/react-native-firebase/commit/0d26af9638b15eb2220d12127b3626c899818ade))
* **crashlytics:** add helper methods for log and setCustomKey ([06d515c](https://github.com/invertase/react-native-firebase/commit/06d515cad533c76328e324f0e950a814881aab0d))





# [12.1.0](https://github.com/invertase/react-native-firebase/compare/v12.0.0...v12.1.0) (2021-06-11)


### Bug Fixes

* **auth, android:** remove browser dependency, upstream includes now ([3fef777](https://github.com/invertase/react-native-firebase/commit/3fef777f1e08c2dacfb21f4ef2c27b71e8b973f4)), closes [#4744](https://github.com/invertase/react-native-firebase/issues/4744)


### Features

* **app:** bump SDKs: firebase-android-sdk 28.1.0 / firebase-ios-sdk 8.1.1 ([d64e2e5](https://github.com/invertase/react-native-firebase/commit/d64e2e562051a3c3da39da32582ea835b2c7d928))





# [12.0.0](https://github.com/invertase/react-native-firebase/compare/v11.5.0...v12.0.0) (2021-05-19)


### Features

* **database:** add database.useEmulator() ([0632ca5](https://github.com/invertase/react-native-firebase/commit/0632ca596336b2b5738734ae614f6c50a5f6f577))
* **sdks:** firebase-ios-sdk 8.0.0 / firebase-android-sdk 28.0.1 ([d97587b](https://github.com/invertase/react-native-firebase/commit/d97587b33aa4c092a0d34291e24491ca66f9bcaa))
* **storage, emulator:** implement storage emulator ([1d3e946](https://github.com/invertase/react-native-firebase/commit/1d3e946a4131a9ceaf3e82aab7f1759ef5aa2cb4))
* **storage, md5hash:** allow md5hash to be set on upload ([be1bed8](https://github.com/invertase/react-native-firebase/commit/be1bed847ce4122a7b8ebf1c7f9ba6f2d6460a4c))


* chore(storage, android)!: remove EXTERNAL_STORAGE permissions for Android 10/11 compat ([69b6f88](https://github.com/invertase/react-native-firebase/commit/69b6f88f078facb07001a6fa8da04812c73077fb))
* feat(firestore)!: add support for ignoreUndefinedProperties ([756cfa6](https://github.com/invertase/react-native-firebase/commit/756cfa6bea645ac6c18ad25bbae9cac5a3f5e379))


### Bug Fixes

* **android:** correct lint issues for various API mis-use ([eb8d893](https://github.com/invertase/react-native-firebase/commit/eb8d89306fd569d7ef64298a99e970c653b79178)), closes [#3917](https://github.com/invertase/react-native-firebase/issues/3917)
* **storage, android:** correctly catch native exceptions for Promise.reject ([e938824](https://github.com/invertase/react-native-firebase/commit/e938824746cdd771807b5afebf709a2bfbdac6c7)), closes [#4097](https://github.com/invertase/react-native-firebase/issues/4097)


### BREAKING CHANGES

* Storage: if you need READ_EXTERNAL_STORAGE/WRITE_EXTERNAL_STORAGE permission add them in your app AndroidManifest.xml
* Firestore: undefined values throw like firebase-js-sdk now. Use ignoreUndefinedProperties setting 'true' to behave as before
* AdMob: Removed from upstream SDKs. Stay on v11.5.0 for now if you need AdMob. `@invertase/react-native-admob` package planned with v11.5.0 code
* ML: APIs removed from upstream SDKs. Migrate to cloud function / auth gateway to cloud APIs, as mentioned in links on ML usage document.
* Instance ID: APIs removed from upstream SDKs. Use Messaging's getToken() to get tokens, see [upstream documentation to migrate](https://firebase.google.com/docs/projects/manage-installations#fid-iid) if needed
* Messaging.getToken/deleteToken: scoped token APIs removed from upstream APIs. Remove scopes from API calls. deleteToken() should work on iOS now.




# [11.5.0](https://github.com/invertase/react-native-firebase/compare/v11.4.1...v11.5.0) (2021-05-12)


### Bug Fixes

* **admob:** mark BannerAd callbacks as optional ([9a5a21f](https://github.com/invertase/react-native-firebase/commit/9a5a21f972cd692b0f9049c8de131d6c2950fc82))
* **app, json-schema:** admob_delay_app_measurement_init type is boolean ([#5297](https://github.com/invertase/react-native-firebase/issues/5297)) ([d931b48](https://github.com/invertase/react-native-firebase/commit/d931b48f9e2a5caca47d354e26eaca2bd210dc8f)), closes [#5295](https://github.com/invertase/react-native-firebase/issues/5295)
* **firestore:** Incorrect error message for GeoPoint latitude out of range ([f9909fa](https://github.com/invertase/react-native-firebase/commit/f9909fae3a1b197c3cfc784913ad719f92f48bfc))
* **ios:** admob shows only non-personalized ads ([#5262](https://github.com/invertase/react-native-firebase/issues/5262)) ([0b62d5a](https://github.com/invertase/react-native-firebase/commit/0b62d5ac9a31f4d840c45ea41aeb89a7c2ecbaf3))
* **messaging, android:** avoid using rn61+ symbol ([4637332](https://github.com/invertase/react-native-firebase/commit/4637332bbdb857de650a604a138e2d5dd07be75f)), closes [#5236](https://github.com/invertase/react-native-firebase/issues/5236)


### Features

* **analytics:** Adding default event parameters ([#5246](https://github.com/invertase/react-native-firebase/issues/5246)) ([684bb50](https://github.com/invertase/react-native-firebase/commit/684bb50368cb797ae9fda8fb56df2e2376d59c30))





## [11.4.1](https://github.com/invertase/react-native-firebase/compare/v11.4.0...v11.4.1) (2021-04-29)

**Note:** Version bump only for package react-native-firebase





# [11.4.0](https://github.com/invertase/react-native-firebase/compare/v11.3.3...v11.4.0) (2021-04-29)


### Bug Fixes

* **analytics:** added missing price parameter to the Item structure ([#5232](https://github.com/invertase/react-native-firebase/issues/5232)) ([b972cb6](https://github.com/invertase/react-native-firebase/commit/b972cb6c835288b8bd882f84222f1c3accf1afdc))
* **analytics:** import using package name not relative path ([#5229](https://github.com/invertase/react-native-firebase/issues/5229)) ([99f8d2c](https://github.com/invertase/react-native-firebase/commit/99f8d2c912d9fe63fc6243bc0b5d43b6813a2fe5))
* **app, android:** correct TaskExecutor shutdown error ([a7729a5](https://github.com/invertase/react-native-firebase/commit/a7729a5dfac1f70b3a442452a99da9977d89d9e3)), closes [#5225](https://github.com/invertase/react-native-firebase/issues/5225)
* **database, update:** allow empty objects in ref.update() ([574f691](https://github.com/invertase/react-native-firebase/commit/574f6918d87125d5ba863a6a2cc24f8a78cf0040)), closes [#5218](https://github.com/invertase/react-native-firebase/issues/5218)
* **messaging, android:** repair crash handling remote notifications ([6a30d4b](https://github.com/invertase/react-native-firebase/commit/6a30d4b4798c0ff9f0d5e406d4da5fb47e313069)) **BREAKING WARNING - this accidentally requires minimum react-native 0.61**


### Features

* **analytics, appInstanceId:** implement getAppIntanceId() method for GA4 use ([#5210](https://github.com/invertase/react-native-firebase/issues/5210)) ([a51e97b](https://github.com/invertase/react-native-firebase/commit/a51e97b208e32cca00f36d14187ac6ba5378e3cd))
* **analytics, ATT:** allow use of AnalyticsWithoutAdIdSupport pod ([da6b811](https://github.com/invertase/react-native-firebase/commit/da6b811e15b480ad55c1e804da40387ecfdef3ee))
* **app, android:** support list of Activities to ignore when detecting AppState ([#5235](https://github.com/invertase/react-native-firebase/issues/5235)) ([50a384f](https://github.com/invertase/react-native-firebase/commit/50a384f2a2ba61d078521e89594f4e576f1e1f46))
* **app, firebase-ios-sdk:** move to version 7.11.0 ([f25d25d](https://github.com/invertase/react-native-firebase/commit/f25d25d36d2df204f58f69700509a1ccb23784a9))


### BREAKING - ACCIDENTAL

* **messaging, android:** repair crash handling remote notifications ([6a30d4b](https://github.com/invertase/react-native-firebase/commit/6a30d4b4798c0ff9f0d5e406d4da5fb47e313069)) **BREAKING WARNING - this accidentally requires minimum react-native 0.61 - we may issue a 11.4.x release that reverts but please be careful**



## [11.3.3](https://github.com/invertase/react-native-firebase/compare/v11.3.2...v11.3.3) (2021-04-24)


### Bug Fixes

* **app, android:** avoid API24-only APIs, fix Android < 7 crash from 11.3.0 ([#5206](https://github.com/invertase/react-native-firebase/issues/5206)) ([49c15f8](https://github.com/invertase/react-native-firebase/commit/49c15f81c9cb51fef5cf6f8140d13f12911670eb))





## [11.3.2](https://github.com/invertase/react-native-firebase/compare/v11.3.1...v11.3.2) (2021-04-19)


### Bug Fixes

* **all, android:** purge jcenter() from android build ([2c6a6a8](https://github.com/invertase/react-native-firebase/commit/2c6a6a82ec363fd948ea880fd397acb886c97453))
* **messaging:** Missing notification on restart ([#5181](https://github.com/invertase/react-native-firebase/issues/5181)) ([ea6e138](https://github.com/invertase/react-native-firebase/commit/ea6e138121fff4d4d8d73d9ca1f6b8be8bed79c1))





## [11.3.1](https://github.com/invertase/react-native-firebase/compare/v11.3.0...v11.3.1) (2021-04-18)


### Bug Fixes

* **admob, android:** force admob dependency to compatible v19 ([19fe6df](https://github.com/invertase/react-native-firebase/commit/19fe6df6c17efa6df1770a553891f784cc3ae250))





# [11.3.0](https://github.com/invertase/react-native-firebase/compare/v11.2.0...v11.3.0) (2021-04-16)


### Bug Fixes

* **admob, ios:** bump PersonalizedAdConsent to 1.0.5 ([3df9164](https://github.com/invertase/react-native-firebase/commit/3df9164da536c04e5e7d2bcc3efb9de38ba221f3))
* **android, utils:** fix rare crash getting documents directory ([#5118](https://github.com/invertase/react-native-firebase/issues/5118)) ([f0a2957](https://github.com/invertase/react-native-firebase/commit/f0a29573e748035468f13f9c03c6cf3b9148dafe))
* **app, ios:** formally note cocoapods v1.10+ requirement in podspec ([3c90c59](https://github.com/invertase/react-native-firebase/commit/3c90c5931e9777eda1614ae1f443c6de79540f01))
* **app, ios-plist:** make sure Info.plist exists before processing ([245149c](https://github.com/invertase/react-native-firebase/commit/245149c635aeb9a02528a00f0a4451644e1fdf3a)), closes [#5152](https://github.com/invertase/react-native-firebase/issues/5152)
* **app, secondary:** reject if initializeApp fails on iOS ([d76eba3](https://github.com/invertase/react-native-firebase/commit/d76eba3a4d1c6ffddf6c38ae59c0b529dde106e9)), closes [#5134](https://github.com/invertase/react-native-firebase/issues/5134)
* **crashlytics, debug:** Disable Crashlytics in debug mode by default ([#5117](https://github.com/invertase/react-native-firebase/issues/5117)) ([eeeba2e](https://github.com/invertase/react-native-firebase/commit/eeeba2ed771b72a04dd9b2154c259a8648a21022))
* **crashlytics, ios:** register library with dynamic version string ([90bceb2](https://github.com/invertase/react-native-firebase/commit/90bceb292bfcbdf16517b654376d151c26e5432c))
* **crashlytics, ios:** warn if debugger will break crashlytics ([d6b6d23](https://github.com/invertase/react-native-firebase/commit/d6b6d231d4c4da68219e52fe8bc9e0220f73ef0c))
* **database, types:** harmonize database.on() w/firebase-js-sdk ([6aea33f](https://github.com/invertase/react-native-firebase/commit/6aea33f1d41412363e2bd5d50a920dfc669ed3a7)), closes [#4550](https://github.com/invertase/react-native-firebase/issues/4550)


### Features

* **crashlytics:** add configuration to exception handler chaining behavior ([4c640ff](https://github.com/invertase/react-native-firebase/commit/4c640ff52e1fb692bddcbeb76a2ff2a302e56334))
* **crashlytics:** flag fatal errors for crashlytics and analytics ([c94546d](https://github.com/invertase/react-native-firebase/commit/c94546d8127606dca5bfd09ef92ec32eec333f19))
* **ios, sdks:** bump firebase-ios-sdk to 7.10.0 ([d2838ff](https://github.com/invertase/react-native-firebase/commit/d2838ffeda34816219539fd1ac0c651b232e8a46))


### Performance Improvements

* increase task throughput in Android using thread pool executor ([#4981](https://github.com/invertase/react-native-firebase/issues/4981)) ([0e4e331](https://github.com/invertase/react-native-firebase/commit/0e4e3312315c020ecd760f8d3fea4f0347d2276b))





# [11.2.0](https://github.com/invertase/react-native-firebase/compare/v11.1.2...v11.2.0) (2021-03-26)


### Features

* **sdks:** firebase-ios-sdk 7.9.0 / firebase-android-sdk 26.8.0 ([324f8ff](https://github.com/invertase/react-native-firebase/commit/324f8ffa0baf759c000efa1f4a024e527eddf8d7))





## [11.1.2](https://github.com/invertase/react-native-firebase/compare/v11.1.1...v11.1.2) (2021-03-17)


### Bug Fixes

* **database, types:** harmonize on/once/off types with firebase-js-sdk ([fbc06ca](https://github.com/invertase/react-native-firebase/commit/fbc06cac888e13071c5f87c652aeff40c3b27412)), closes [#5027](https://github.com/invertase/react-native-firebase/issues/5027)
* **listeners:** port Emitter.once to analogous addListener/remove API (required for react-native 0.64) ([5eb2f59](https://github.com/invertase/react-native-firebase/commit/5eb2f599e93ccecd91c800018959f9dc370f1e24))





## [11.1.1](https://github.com/invertase/react-native-firebase/compare/v11.1.0...v11.1.1) (2021-03-16)


### Bug Fixes

* **app, firebase-ios-sdk:** bump to firebase-ios-sdk v7.8.1 for analytics fix ([8cd1d6e](https://github.com/invertase/react-native-firebase/commit/8cd1d6e77e124a0d21c64d146bfe62e351a754c7))





# [11.1.0](https://github.com/invertase/react-native-firebase/compare/v11.0.0...v11.1.0) (2021-03-13)


### Bug Fixes

* **app, android:** fixes possible crash on first launch ([#4990](https://github.com/invertase/react-native-firebase/issues/4990)) ([06eebad](https://github.com/invertase/react-native-firebase/commit/06eebada2c74c57504d8cc1cdfa446ee77d48fce)), closes [#4979](https://github.com/invertase/react-native-firebase/issues/4979)
* **app, types:** initializeApp returns Promise<FirebaseApp> ([f3b955c](https://github.com/invertase/react-native-firebase/commit/f3b955c0f4ea5e50920499c917576f587f149f93))
* **auth, ios:** fix compile error in setTenantId code ([311427e](https://github.com/invertase/react-native-firebase/commit/311427e026e892d2d24aca43967ce36e2fb8d834))
* **auth, useUserAccessGroup:** document auth/keychain-error, add test coverage ([60ec5f9](https://github.com/invertase/react-native-firebase/commit/60ec5f9f7261cf4f14feccc6e36813389e3a901f)), closes [#5007](https://github.com/invertase/react-native-firebase/issues/5007)


### Features

* **app, sdks:** firebase-ios-sdk v7.8.0 / firebase-android-sdk v26.7.0 ([d2b0074](https://github.com/invertase/react-native-firebase/commit/d2b0074b36254743ce980a23e3e61771b79be52a))
* **auth, multi-tenant:** add multi-tenant (tenantID) support ([935dbc3](https://github.com/invertase/react-native-firebase/commit/935dbc30515425949b4c9053da0db7f76b7a318f))
* **auth, multi-tenant:** expose user.tenantId in javascript ([4f6d426](https://github.com/invertase/react-native-firebase/commit/4f6d426302da7cb527e4fd377b6d5d1144284a51))
* **crashlytics, native:** add non-fatal exception logger for 3rd party native code use ([#5015](https://github.com/invertase/react-native-firebase/issues/5015)) ([b3e6810](https://github.com/invertase/react-native-firebase/commit/b3e681079af0bcc00655d079823a7ec6442d8723))





# [11.0.0](https://github.com/invertase/react-native-firebase/compare/v10.8.1...v11.0.0) (2021-03-03)


### Bug Fixes

* **app, ios:** failing to resolve ios sdk from package.json is an error ([29d797d](https://github.com/invertase/react-native-firebase/commit/29d797dd7f7201104547961a7db702bfff635b57))
* **firestore, types:** make all Settings properties optional ([#4965](https://github.com/invertase/react-native-firebase/issues/4965)) ([f501fff](https://github.com/invertase/react-native-firebase/commit/f501fffbfc1baabe7fc7ed8185ad0c5be069134d))
* **tests, ios:** resolve firebase-ios-sdk from app package.json ([680eb37](https://github.com/invertase/react-native-firebase/commit/680eb371da7826eef05c450d47fd12fdcb42fdb7))


### Features

* **android, sdk:** update firebase-android-sdk to 26.6.0 ([5786641](https://github.com/invertase/react-native-firebase/commit/5786641ea68dc4c0c1899a12b0a56491cff3b894)), closes [/firebase.google.com/support/release-notes/android#bom_v26-6-0](https://github.com//firebase.google.com/support/release-notes/android/issues/bom_v26-6-0)
* **functions:** support custom domains BREAKING requires firebase-ios-sdk 7.1.0+ / firebase-android-sdk 26.2.0+ ([#4950](https://github.com/invertase/react-native-firebase/issues/4950)) ([381eae5](https://github.com/invertase/react-native-firebase/commit/381eae51e25096f8527f058b21fc83d227caa69e))
* **ios, sdk:** bump firebase-ios-sdk to v7.7.0 ([bc893ab](https://github.com/invertase/react-native-firebase/commit/bc893ab8f44193a58ca6a119838d0464dc6081ba))


### BREAKING CHANGES

* **functions:** minimum native SDK requirements now firebase-ios-sdk 7.1.0+ / firebase-android-sdk 26.2.0+ 





## [10.8.1](https://github.com/invertase/react-native-firebase/compare/v10.8.0...v10.8.1) (2021-02-22)


### Bug Fixes

* **admob:** AdEventHandler returns javascript (not native) unsubscribe function ([#4920](https://github.com/invertase/react-native-firebase/issues/4920)) ([bff9dec](https://github.com/invertase/react-native-firebase/commit/bff9decdc820ef5e5d686f96457aa09134cfad55))
* **admob, android:** unity ads require Activity Context ([#4921](https://github.com/invertase/react-native-firebase/issues/4921)) ([23e5998](https://github.com/invertase/react-native-firebase/commit/23e5998457e87cb228e4876a0a75df180d1fcff7))





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
