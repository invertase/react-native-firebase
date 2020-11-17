# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [10.0.0](https://github.com/invertase/react-native-firebase/compare/v6.4.0...v10.0.0) (2020-11-17)


* docs(remote-config)!: update docs to be explicit about new behavior (#4169) ([02527a0](https://github.com/invertase/react-native-firebase/commit/02527a06b8ee4d2b68e8ece739ac8d60e46b371c)), closes [#4169](https://github.com/invertase/react-native-firebase/issues/4169)
* refactor(auth)!: setLanguageCode no longer a setter (#3922) ([400cfb4](https://github.com/invertase/react-native-firebase/commit/400cfb4007984bb0fa944ec75005bb6bd2f0231b)), closes [#3922](https://github.com/invertase/react-native-firebase/issues/3922)
* feat(crashlytics)!: upgrade to new Firebase Crashlytics SDK (#3580) ([cad58e1](https://github.com/invertase/react-native-firebase/commit/cad58e178b43dea461e17fa4a0a3fecd507ba68a)), closes [#3580](https://github.com/invertase/react-native-firebase/issues/3580)
* fix!(auth): confirm code returns User instead of UserCredential (#3684) ([71a1120](https://github.com/invertase/react-native-firebase/commit/71a1120337acd73d2483103f2acd560e8e99a335)), closes [#3684](https://github.com/invertase/react-native-firebase/issues/3684)
* feat!: all packages should depend on core (#3613) ([252a423](https://github.com/invertase/react-native-firebase/commit/252a4239e98a0f2a55c4afcd2d82e4d5f97e65e9)), closes [#3613](https://github.com/invertase/react-native-firebase/issues/3613)


### BREAKING

* remove deprecated analytics methods ([18f5b0f](https://github.com/invertase/react-native-firebase/commit/18f5b0f7e65a3bddc92d3d23e31efb42a518ec12))


### Bug Fixes

* **analytics:** added a validation for length in analytics().logEvent(name, params) ([#4522](https://github.com/invertase/react-native-firebase/issues/4522)) ([107b07d](https://github.com/invertase/react-native-firebase/commit/107b07dc15f1199e08384f0ad5bbbff44f738056))
* **analytics:** BREAKING drop deprecated setMinimumSessionDuration API ([a675cd7](https://github.com/invertase/react-native-firebase/commit/a675cd7f7cf808e6a6d10cc174eeff3007ceac58))
* **android:** fixed IllegalMonitorStateException crashed issue ([#3800](https://github.com/invertase/react-native-firebase/issues/3800)) ([76f6cf9](https://github.com/invertase/react-native-firebase/commit/76f6cf9770df049c2ae38a0b0f894b606f2de4df))
* **android:** generate version for ReactNativeFirebaseAppRegistrar.java ([#3766](https://github.com/invertase/react-native-firebase/issues/3766)) ([1324985](https://github.com/invertase/react-native-firebase/commit/13249857c7303d44b9a2ca92d2604a27e949bad9))
* **android:** remove deprecated usages of `APPLICATION_ID` ([#3711](https://github.com/invertase/react-native-firebase/issues/3711)) ([984d3fc](https://github.com/invertase/react-native-firebase/commit/984d3fc1668221c166ab459d67d1c646d73d165b))
* **android, timezones:** timezone offset already millis, do not adjust it ([#4055](https://github.com/invertase/react-native-firebase/issues/4055)) ([8b0e189](https://github.com/invertase/react-native-firebase/commit/8b0e1893b8dc20abcf8c3a09a512c2e8ff6707b1)), closes [#4053](https://github.com/invertase/react-native-firebase/issues/4053)
* **android,iid:** workaround IID version missing in BOM w/concrete version ([377f342](https://github.com/invertase/react-native-firebase/commit/377f34247798216d7ce8fee23ea541c2a908bcb2))
* **app, ios:** avoid photo API not present on Catalyst ([#4328](https://github.com/invertase/react-native-firebase/issues/4328)) ([86f1f63](https://github.com/invertase/react-native-firebase/commit/86f1f633c06c7f054ff55b802482f36be61580f8))
* **app,ios:** build fails when targeting Mac (Project Catalyst) ([13bc6a7](https://github.com/invertase/react-native-firebase/commit/13bc6a75764a17ffa89d31b2523aca89ad875f0d))
* **auth:** use correct code on network exception ([#3655](https://github.com/invertase/react-native-firebase/issues/3655)) ([8bcf5c9](https://github.com/invertase/react-native-firebase/commit/8bcf5c945db5614835630b6d0cf4951c4a5b2a2d)), closes [#3654](https://github.com/invertase/react-native-firebase/issues/3654)
* **auth, android:** fixed user collision handling with apple sign-in ([#4487](https://github.com/invertase/react-native-firebase/issues/4487)) ([6a8f8ad](https://github.com/invertase/react-native-firebase/commit/6a8f8ad9b05d9510948206cc9837547cab124c63))
* **auth, android:** gracefully handle exception creating PhoneCredential ([8ead604](https://github.com/invertase/react-native-firebase/commit/8ead60431c2aae4193ed79eb10dc3b43480c5d77))
* **auth, android:** handle failure to upgrade anonymous user ([41fad36](https://github.com/invertase/react-native-firebase/commit/41fad3629437059a5e81d29f82c79589286aaea2)), closes [#4487](https://github.com/invertase/react-native-firebase/issues/4487)
* **auth, types:** allow null in photo and name for profile update ([#4179](https://github.com/invertase/react-native-firebase/issues/4179)) ([b4436ea](https://github.com/invertase/react-native-firebase/commit/b4436ea26212f3f5b7d3bdb47ab1891c31ebe59e))
* **auth,android:** too-many-requests code now correctly returned ([#3795](https://github.com/invertase/react-native-firebase/issues/3795)) ([c799472](https://github.com/invertase/react-native-firebase/commit/c7994720b14114ac70540744794d8b645e2209e0))
* **core:** timezone offset issues in utils ([cb6a1d4](https://github.com/invertase/react-native-firebase/commit/cb6a1d41cc8e89fba8a8f81d50cea1c65e7e49ef))
* **crashlytics, ios:** explicitly set collection opt in/out ([#4236](https://github.com/invertase/react-native-firebase/issues/4236)) ([cda4c10](https://github.com/invertase/react-native-firebase/commit/cda4c1012737eab8b64e8f8593b623771f5b2734))
* **crashlytics, ios:** generate uncatchable crash for iOS crash testing ([#4426](https://github.com/invertase/react-native-firebase/issues/4426)) ([2dcaad5](https://github.com/invertase/react-native-firebase/commit/2dcaad59c27b90b1f2b3ef6b31e46d3eac8a5e2e))
* **database:** `.` is a valid character in ref path ([#4177](https://github.com/invertase/react-native-firebase/issues/4177)) ([a0d01b5](https://github.com/invertase/react-native-firebase/commit/a0d01b5c37f3be9b3091aff6eff7f101be201958))
* **database:** correctly handle invalid keys as a reference ([#4100](https://github.com/invertase/react-native-firebase/issues/4100)) ([4df5f87](https://github.com/invertase/react-native-firebase/commit/4df5f87db51b169acbe17b4d7eb7e8fed59b8a66))
* **database, types:** updated .once type defs ([#3842](https://github.com/invertase/react-native-firebase/issues/3842)) ([c9728f0](https://github.com/invertase/react-native-firebase/commit/c9728f065242985039c86097677100a61357e1d2))
* **docs:** prevent trailing slash removal from links to root ([#4365](https://github.com/invertase/react-native-firebase/issues/4365)) ([0a80692](https://github.com/invertase/react-native-firebase/commit/0a80692359e7c0d08fc66def05a70c7167e7c8ca))
* **dynamic-links,ios:** resolveLink() does not always resolve ([#3870](https://github.com/invertase/react-native-firebase/issues/3870)) ([f10658e](https://github.com/invertase/react-native-firebase/commit/f10658e11aaae9a5b1b2566c05a0a62c46a00522))
* **e2e:** add retry to gem/yarn/npm/pod network commands ([#4147](https://github.com/invertase/react-native-firebase/issues/4147)) ([59705ea](https://github.com/invertase/react-native-firebase/commit/59705eaf8c53aced82b914cc03c4e8417d6ce8d1))
* **firestore:**  update isEqual API to check collection path equality ([#3738](https://github.com/invertase/react-native-firebase/issues/3738)) ([405e040](https://github.com/invertase/react-native-firebase/commit/405e04009c1550dc6897b207ae3a63ad274c6de5))
* **firestore:** add missing MIN_SECONDS constant to FirestoreTimestamp ([#4531](https://github.com/invertase/react-native-firebase/issues/4531)) ([11127c1](https://github.com/invertase/react-native-firebase/commit/11127c177b217f3ddfca250664667a20918df65c))
* **firestore:** add test case for orderby before where query ([#4459](https://github.com/invertase/react-native-firebase/issues/4459)) ([fdf978a](https://github.com/invertase/react-native-firebase/commit/fdf978aed8044f1ba010a9213a4f81cb9b397df7))
* **firestore, ios:** transaction atomicity failure fix ([#3599](https://github.com/invertase/react-native-firebase/issues/3599)) ([b261f51](https://github.com/invertase/react-native-firebase/commit/b261f518b3736bf6dab45666059662f02e7c6626))
* **iid:** RNFBid requires dep on instanceID ([#3804](https://github.com/invertase/react-native-firebase/issues/3804)) ([31cd364](https://github.com/invertase/react-native-firebase/commit/31cd36493e268a631fd8519a0fea3bb2979092d4))
* **ios:** handle nil messaging token ([#3790](https://github.com/invertase/react-native-firebase/issues/3790)) ([b2ffe11](https://github.com/invertase/react-native-firebase/commit/b2ffe115874c422414d58038d5d01e1b411c5a6c))
* **ios:** potential race condition fix ([#3484](https://github.com/invertase/react-native-firebase/issues/3484)) ([ca34cef](https://github.com/invertase/react-native-firebase/commit/ca34cef160cd0e632bec6d60e10b45c8efd568c8))
* **ios, analytics:** remove now-optional analytics dependencies ([#4131](https://github.com/invertase/react-native-firebase/issues/4131)) ([fdb5e9f](https://github.com/invertase/react-native-firebase/commit/fdb5e9f5786822343b11d3257d9f466a9d593fa4))
* **ios, auth:** move to non-deprecated upstream APIs ([1f2a109](https://github.com/invertase/react-native-firebase/commit/1f2a109d4e04bc10a5a0b93b3bebe78ec9be313b))
* **ios, crashlytics:** allow Crashlytics inclusion w/o Analytics ([#4134](https://github.com/invertase/react-native-firebase/issues/4134)) ([e023b71](https://github.com/invertase/react-native-firebase/commit/e023b71486d6834ba175e91ee5809af36a03588d))
* **ios, crashlytics:** use new recommended manual crash style ([#4111](https://github.com/invertase/react-native-firebase/issues/4111)) ([6b136c3](https://github.com/invertase/react-native-firebase/commit/6b136c3972eb25ad37b4d6230e1d6e139c094f86))
* **ios, crashlytics:** use NSInternalInconsistencyException to crash w/o redbox ([#4126](https://github.com/invertase/react-native-firebase/issues/4126)) ([2cbab5c](https://github.com/invertase/react-native-firebase/commit/2cbab5cf91f4e8542c30a237637d071c14bbcde5))
* **ios, dynamic-links:** add dep to AppDelegateSwizzler for links in isolation ([#4138](https://github.com/invertase/react-native-firebase/issues/4138)) ([0b43c4f](https://github.com/invertase/react-native-firebase/commit/0b43c4f22be4793695825e52d34e9043f5e47ced))
* **ios, messaging:** register background handler task for FCM events ([#4180](https://github.com/invertase/react-native-firebase/issues/4180)) ([cf706c6](https://github.com/invertase/react-native-firebase/commit/cf706c683dd1d23860f15df636cc345cb6f3b60a))
* **ios, messaging:** remove UNNotificationServiceExtension / use local target extension ([#4226](https://github.com/invertase/react-native-firebase/issues/4226)) ([1be2a39](https://github.com/invertase/react-native-firebase/commit/1be2a3915ad4e5062779e86e7c9b78c970ca9c64))
* **ios, podspec:** depend on React-Core instead of React ([#4275](https://github.com/invertase/react-native-firebase/issues/4275)) ([fd1a2be](https://github.com/invertase/react-native-firebase/commit/fd1a2be6b6ab1dec89e5dce1fc237435c3e1d510))
* **messaging:** added missing `from` property in Remote Message type ([#4030](https://github.com/invertase/react-native-firebase/issues/4030)) ([ce39abf](https://github.com/invertase/react-native-firebase/commit/ce39abf9c0affe00ea13e2ad1580ac42bbb54a30))
* **messaging:** BREAKING drop iOS FCM direct channel + upstream send APIs ([22ede33](https://github.com/invertase/react-native-firebase/commit/22ede3303d640364782a14a6813a5b8efc9e459e))
* **messaging:** initialize app props method to fix isHeadless property ([#4082](https://github.com/invertase/react-native-firebase/issues/4082)) ([2bdebb1](https://github.com/invertase/react-native-firebase/commit/2bdebb1d3d82915d0aa9a49431d26658721a2f86))
* **messaging:** onNotificationOpenedApp callable return type ([#3641](https://github.com/invertase/react-native-firebase/issues/3641)) ([cd5cb23](https://github.com/invertase/react-native-firebase/commit/cd5cb23d6353f617b5af350169e929c88f90aafb))
* **messaging, ios:** call original delegate when intercepting willPresentNotification ([#4088](https://github.com/invertase/react-native-firebase/issues/4088)) ([62ee961](https://github.com/invertase/react-native-firebase/commit/62ee961d6ebffe529bdfa938443e1f25a0201e0e))
* **messaging,ios:** crash receiving notification with image ([#3701](https://github.com/invertase/react-native-firebase/issues/3701)) ([f889646](https://github.com/invertase/react-native-firebase/commit/f889646d2ecbede9f06fde67a63e877f14df8ced)), closes [#3447](https://github.com/invertase/react-native-firebase/issues/3447) [#3616](https://github.com/invertase/react-native-firebase/issues/3616) [#3447](https://github.com/invertase/react-native-firebase/issues/3447)
* **messaging,ios:** fix build error ([#4119](https://github.com/invertase/react-native-firebase/issues/4119)) ([06fcd84](https://github.com/invertase/react-native-firebase/commit/06fcd84c9b3968a0f4d408c2db7bafe4323591ac))
* **messaging,ios:** keep original UNUserNotificationCenter dele… ([#3427](https://github.com/invertase/react-native-firebase/issues/3427)) ([a800cdb](https://github.com/invertase/react-native-firebase/commit/a800cdbc81bfaeeaccf602aa62ca29d2fbf68c05)), closes [#3425](https://github.com/invertase/react-native-firebase/issues/3425) [#3495](https://github.com/invertase/react-native-firebase/issues/3495)
* **ml-vision:** convert options to correct type ([#3694](https://github.com/invertase/react-native-firebase/issues/3694)) ([b462be5](https://github.com/invertase/react-native-firebase/commit/b462be542a41a4e37a201146642f1b9fd4c6a74f))
* **perf:** fix for [#3736](https://github.com/invertase/react-native-firebase/issues/3736) ([#3978](https://github.com/invertase/react-native-firebase/issues/3978)) ([4308810](https://github.com/invertase/react-native-firebase/commit/430881032b0f60d68c8464205c2d1ebb17894641))
* **publish:** never auto-cancel publish workflow ([#4330](https://github.com/invertase/react-native-firebase/issues/4330)) ([61df91f](https://github.com/invertase/react-native-firebase/commit/61df91f2b09fc1e73a7479b3ea7b510dd002b660)), closes [#4283](https://github.com/invertase/react-native-firebase/issues/4283)
* **remote-config:** BREAKING drop deprecated APIs ([86b6086](https://github.com/invertase/react-native-firebase/commit/86b6086da9fe535e0cd0f4ddbb3152b0275e3904))
* **remote-config:** error calling getValue() before fetch ([#4068](https://github.com/invertase/react-native-firebase/issues/4068)) ([8619d72](https://github.com/invertase/react-native-firebase/commit/8619d7223172c08bea3807e8141d246e51aeec90))
* **remote-config:** fetch/activate boolean ([#4157](https://github.com/invertase/react-native-firebase/issues/4157)) ([9058dca](https://github.com/invertase/react-native-firebase/commit/9058dca0f66f7dead8c11831c0819528a868e3ae))
* **storage:** bug when getting the root ref of a bucket ([#3455](https://github.com/invertase/react-native-firebase/issues/3455)) ([02132ce](https://github.com/invertase/react-native-firebase/commit/02132ce322b0f1d06b11ddc7f66ab919ab2c1b1f))
* **storage:** Changed refFromUrl regex to exclude appspot.com ([#3775](https://github.com/invertase/react-native-firebase/issues/3775)) ([c6f4699](https://github.com/invertase/react-native-firebase/commit/c6f46996191126513e02f3d20efa78d166c4db0a))
* correct androidResolutionForPlayServices API ([afcd794](https://github.com/invertase/react-native-firebase/commit/afcd79479baf6e371719eb1b14e5d7619e4b7ad6)), closes [#3864](https://github.com/invertase/react-native-firebase/issues/3864)
* making auth and firestore observable compatible ([#4078](https://github.com/invertase/react-native-firebase/issues/4078)) ([d8410df](https://github.com/invertase/react-native-firebase/commit/d8410dfdae345f60ed7ea21fbe7f6af7632127e3))
* onTokenChange method causing app to crash ([#3552](https://github.com/invertase/react-native-firebase/issues/3552)) ([1d7cd28](https://github.com/invertase/react-native-firebase/commit/1d7cd28f85d09d35805b59896809ca93aa436285))
* peer dependency versions ([35edafa](https://github.com/invertase/react-native-firebase/commit/35edafa437fe610d1beaefbac34d1f5c55a50926))
* undelivered background data message ios ([#4144](https://github.com/invertase/react-native-firebase/issues/4144)) ([415dba4](https://github.com/invertase/react-native-firebase/commit/415dba496ddf0551019e1bcfea4080809c300980))
* **Storage:** AL (asset library) methodology deprecated since iOS 8  ([#4054](https://github.com/invertase/react-native-firebase/issues/4054)) ([bf3b252](https://github.com/invertase/react-native-firebase/commit/bf3b25220cde1ae8d5fdbabc217fe20957dbdf8e))
* **tests, emulator:** centralize startup, correct CWD ([79c1f80](https://github.com/invertase/react-native-firebase/commit/79c1f801965f74f9fc0233c96f05db103e9f8e84))
* **types:** add sentTime to FirebaseMessagingTypes.RemoteMessage ([#3885](https://github.com/invertase/react-native-firebase/issues/3885)) ([0b87a15](https://github.com/invertase/react-native-firebase/commit/0b87a15de04bbde065a4fd76ce8ab7a5c04f5b13))
* **types:** enable TypeScript libCheck & resolve type conflicts ([#4306](https://github.com/invertase/react-native-firebase/issues/4306)) ([aa8ee8b](https://github.com/invertase/react-native-firebase/commit/aa8ee8b7e83443d2c1664993800e15faf4b59b0e))
* **types:** fix RequestOptions.location ts type ([#3418](https://github.com/invertase/react-native-firebase/issues/3418)) ([f0fdbff](https://github.com/invertase/react-native-firebase/commit/f0fdbff71967aec0cf72f1fe5c9066ffe5b6d7b7))
* **website:** correct path for reference docs edit button ([#4149](https://github.com/invertase/react-native-firebase/issues/4149)) ([76b9159](https://github.com/invertase/react-native-firebase/commit/76b9159eb3a15a6c539de88fd6af2410febb9861))


### Features

* BREAKING forward-port to firebase-android-sdk v26 / firebase-ios-sdk v7 ([70974d4](https://github.com/invertase/react-native-firebase/commit/70974d41f857a0f7fc09cb5235856d3748b30117)), closes [/firebase.google.com/support/release-notes/android#2020-10-27](https://github.com//firebase.google.com/support/release-notes/android/issues/2020-10-27) [/firebase.google.com/support/release-notes/ios#version_700_-_october_26_2020](https://github.com//firebase.google.com/support/release-notes/ios/issues/version_700_-_october_26_2020)
* bump firebase sdk versions, add GoogleApi dep, use Android API29 ([#4122](https://github.com/invertase/react-native-firebase/issues/4122)) ([728f418](https://github.com/invertase/react-native-firebase/commit/728f41863832d21230c6eb1f55385284fef03c09))
* disable direct channels API on iOS, fixes [#3674](https://github.com/invertase/react-native-firebase/issues/3674) ([#3733](https://github.com/invertase/react-native-firebase/issues/3733)) ([8c9f4f5](https://github.com/invertase/react-native-firebase/commit/8c9f4f5e31bac6bfe95d75e1b088df59e51113e9))
* **messaging,android:** save notification payload for messages that arrive in the foreground ([#3896](https://github.com/invertase/react-native-firebase/issues/3896)) ([ff768fc](https://github.com/invertase/react-native-firebase/commit/ff768fce54b2185a67958ea7d253a18ba40404b8))
* independently version packages ([#3513](https://github.com/invertase/react-native-firebase/issues/3513)) ([e2c2d64](https://github.com/invertase/react-native-firebase/commit/e2c2d64d2266cbdd14d4dcfefa64a08263f0af85))
* **admob:** implement support for Server Side Verification ([#4083](https://github.com/invertase/react-native-firebase/issues/4083)) ([51dbbc3](https://github.com/invertase/react-native-firebase/commit/51dbbc3385bd9a180e691e9974121f5c40fd051c))
* **analytics:** add 'logScreenView' API and deprecate `setCurrentScreen` API. ([#4145](https://github.com/invertase/react-native-firebase/issues/4145)) ([81c4e3b](https://github.com/invertase/react-native-firebase/commit/81c4e3b7d2ce956ed6a2cc2f40a323ec5379d6a1))
* **analytics:** add & deprecate pre-defined analytics events ([#3385](https://github.com/invertase/react-native-firebase/issues/3385)) ([6c53f47](https://github.com/invertase/react-native-firebase/commit/6c53f479d9d86f686d52f258ed51b5dc6a8ef25a))
* **android:** don't call ad of AdmobBanner multiple times ([#3488](https://github.com/invertase/react-native-firebase/issues/3488)) ([8c8d448](https://github.com/invertase/react-native-firebase/commit/8c8d448a3e9d4c96fd015d74e859081218af67c8))
* **android,ios:** upgrade native SDK versions ([#3881](https://github.com/invertase/react-native-firebase/issues/3881)) ([6cb68a8](https://github.com/invertase/react-native-firebase/commit/6cb68a8ea808392fac3a28bdb1a76049c7b52e86))
* **app:** add Play Services available utilities ([#3601](https://github.com/invertase/react-native-firebase/issues/3601)) ([0b0f858](https://github.com/invertase/react-native-firebase/commit/0b0f858527b8c0757db7021533f84425f79d0ea5))
* **app, ios:** bump firebase-ios-sdk to 7.1.0 from 7.0.0 ([#4533](https://github.com/invertase/react-native-firebase/issues/4533)) ([a1e90ae](https://github.com/invertase/react-native-firebase/commit/a1e90aef20f85f9f95a37c63867389e638f3fab7))
* **auth:** Access to FIRAuthErrorUserInfoUpdatedCredentialKey with Apple Sign In ([#4359](https://github.com/invertase/react-native-firebase/issues/4359)) ([5851bd0](https://github.com/invertase/react-native-firebase/commit/5851bd0a92e4b6b9cda4eed8dd1dd06a45e5826b))
* **auth:** verifyBeforeUpdateEmail API ([#3862](https://github.com/invertase/react-native-firebase/issues/3862)) ([aaff624](https://github.com/invertase/react-native-firebase/commit/aaff62402544d8783007b6b47b8406019cc48c84))
* **auth, android:** apple sign in support in android ([#4188](https://github.com/invertase/react-native-firebase/issues/4188)) ([c6e77a8](https://github.com/invertase/react-native-firebase/commit/c6e77a8c34c632eba119dc30a320675a142dabce))
* **auth, emulator:** add useEmulator javascript code + jest tests ([532adb5](https://github.com/invertase/react-native-firebase/commit/532adb569413e8a5e5077d5f47582a0a300b3045))
* **auth, emulator:** implement native useEmulator calls ([81369a0](https://github.com/invertase/react-native-firebase/commit/81369a089e3ffc5be53d7651fa5a9dacf5bfa7b6))
* **crashlytics:** add new APIs `checkForUnsentReports`, `deleteUnsentReports`,`didCrashOnPreviousExecution`,`sendUnsentReports` ([#4009](https://github.com/invertase/react-native-firebase/issues/4009)) ([52eeed3](https://github.com/invertase/react-native-firebase/commit/52eeed31b3436b0f90767298dcc515b0897ba942))
* **crashlytics, ios:** put input files when pod install. ([#4520](https://github.com/invertase/react-native-firebase/issues/4520)) ([f2161fd](https://github.com/invertase/react-native-firebase/commit/f2161fddbab68e01c0b0653201be492def43df3b))
* **database:** add support for ServerValue.increment ([#3561](https://github.com/invertase/react-native-firebase/issues/3561)) ([759d67e](https://github.com/invertase/react-native-firebase/commit/759d67e6fbb7e05cd2fc7d532284e91ab428ca6d))
* **dynamic-links:** API to directly resolve dynamic link ([#3814](https://github.com/invertase/react-native-firebase/issues/3814)) ([c43e8f7](https://github.com/invertase/react-native-firebase/commit/c43e8f7ec7dd8ee50b1f6330428b590de3893df8))
* **firestore:** add toJSON() and valueOf() to FirestoreTimestamp ([#4439](https://github.com/invertase/react-native-firebase/issues/4439)) ([aca6992](https://github.com/invertase/react-native-firebase/commit/aca6992edfca7537629131b1f223981452cd95fb)), closes [/github.com/firebase/firebase-js-sdk/blob/7c1c7f182b59e0fc7d175f53e5e2360cdee0ccab/packages/firestore/src/api/timestamp.ts#L162-L182](https://github.com//github.com/firebase/firebase-js-sdk/blob/7c1c7f182b59e0fc7d175f53e5e2360cdee0ccab/packages/firestore/src/api/timestamp.ts/issues/L162-L182)
* **firestore:** query operators: 'not-in' & '!=' ([#4474](https://github.com/invertase/react-native-firebase/issues/4474)) ([9e68faf](https://github.com/invertase/react-native-firebase/commit/9e68faf0310bd5f9c3347cad3dd5b80c9c0582e1))
* **firestore:** support clearPersistence() & terminate() APIs ([#3591](https://github.com/invertase/react-native-firebase/issues/3591)) ([57ff900](https://github.com/invertase/react-native-firebase/commit/57ff9003b664b94aa6b5b1997138bdb2220dba65))
* **firestore:** support limitToLast query filter ([#3702](https://github.com/invertase/react-native-firebase/issues/3702)) ([dc7f921](https://github.com/invertase/react-native-firebase/commit/dc7f9213c0c1196d1d5de4e1fb92f9d791280313))
* **firestore:** support waitForPendingWrites() API ([#4176](https://github.com/invertase/react-native-firebase/issues/4176)) ([6a4b45e](https://github.com/invertase/react-native-firebase/commit/6a4b45e441344a8c645552cfdef8c8bd88e56ca2))
* **firestore, android:** allow FirestoreSerializer native use ([#3888](https://github.com/invertase/react-native-firebase/issues/3888)) ([68daf94](https://github.com/invertase/react-native-firebase/commit/68daf945c4dacca954eb8592b94b992ca82d0ffb))
* **firestore, types:** support Generic Types ([#3810](https://github.com/invertase/react-native-firebase/issues/3810)) ([f81e08e](https://github.com/invertase/react-native-firebase/commit/f81e08ee2c1dcfebf8f82eebd4e1883313d582e2))
* **functions:** support function timeout ([#3534](https://github.com/invertase/react-native-firebase/issues/3534)) ([50c0f12](https://github.com/invertase/react-native-firebase/commit/50c0f12ef059bad92bbb81027fded131d1dc0dad))
* **inappmessaging:** add support for triggering custom events ([#4201](https://github.com/invertase/react-native-firebase/issues/4201)) ([fe8cbc1](https://github.com/invertase/react-native-firebase/commit/fe8cbc1648b7b991673811e11a5e87808c43c85e))
* **ios:** podspecs now utilize CoreOnly instead of Core ([#3575](https://github.com/invertase/react-native-firebase/issues/3575)) ([35285f1](https://github.com/invertase/react-native-firebase/commit/35285f1655b16d05e6630fc556f95cccfb707ee4))
* **ios, messaging:** add getIsHeadless method to access iOS launch state ([#4304](https://github.com/invertase/react-native-firebase/issues/4304)) ([8a4e9a5](https://github.com/invertase/react-native-firebase/commit/8a4e9a5259fd89885f3f5e825328899476e9e3ee))
* **messaging:** allow messaging services to hook into FCM ([#4087](https://github.com/invertase/react-native-firebase/issues/4087)) ([bff8f9f](https://github.com/invertase/react-native-firebase/commit/bff8f9fba8dd46a5cea71461fc7a2c4f0fddb48e))
* **messaging:** Call original delegate when intercepting notification response on iOS ([b17df84](https://github.com/invertase/react-native-firebase/commit/b17df846d291cd6f507680f6415e78392c32b0b0))
* **messaging:** support loc keys on notification payloads ([#3579](https://github.com/invertase/react-native-firebase/issues/3579)) ([9b294b3](https://github.com/invertase/react-native-firebase/commit/9b294b3e161d604aa3c8900355c7b638974ea4ae))
* **messaging, ios:** add notification extension for ios notification images ([#4085](https://github.com/invertase/react-native-firebase/issues/4085)) ([32ab205](https://github.com/invertase/react-native-firebase/commit/32ab2054c0f8c8db4b6127f4ba1f50c9064e83d9))
* open source website ([#4114](https://github.com/invertase/react-native-firebase/issues/4114)) ([aaebe42](https://github.com/invertase/react-native-firebase/commit/aaebe42e4b5e73097be8ab869b2c3d913f60dc7a))
* **template:** update RFNB version ([5fec546](https://github.com/invertase/react-native-firebase/commit/5fec546bb8ecf599e06460d1744f16716fed188e))
* support critical alert permissions ([#3852](https://github.com/invertase/react-native-firebase/issues/3852)) ([c8f7c31](https://github.com/invertase/react-native-firebase/commit/c8f7c3180250dd491ef57ddc0b66f7e491319c35))
* update native Firebase SDK versions ([#3663](https://github.com/invertase/react-native-firebase/issues/3663)) ([4db9dbc](https://github.com/invertase/react-native-firebase/commit/4db9dbc3ec20bf96de0efad15000f00b41e4a799))
* update RFNB version ([8f007fa](https://github.com/invertase/react-native-firebase/commit/8f007fa97aa8025520098a234118a15293eb1c55))
* use latest android & ios Firebase SDKs version ([#3956](https://github.com/invertase/react-native-firebase/issues/3956)) ([e7b4bb3](https://github.com/invertase/react-native-firebase/commit/e7b4bb31b05985c044b1f01625a43e364bb653ef))


### BREAKING CHANGES

* switch to setScreenView, logPurchase, logViewPromotion, logRefund as needed
* alter ML imports, check iOS linking, remove old API as noted
* **remote-config:** drop defaultConfig, settings, isDeveloperModeEnabled, minimumFetchInterval, setLogLevel
* **analytics:** there is no replacement for the setMinimumSessionDuration API
* **messaging:** Upstream send should be done with cloud functions. FCM Direct channel has no replacement.
*     fetchAndActivate
        Previous behaviour returned a boolean indicating if config values were activated
        New behaviour returns a boolean indicating if any config values were fetched remotely.

    activate
        Previous behaviour returned a boolean indicating if config values were activated
        New behaviour returns a boolean indicating if any local config values were activated.
* use setLanguageCode(), not direct property access, to set language code now
* This is a breaking change to remove the use of the Fabric SDKs.

Co-authored-by: David Buchan-Swanson <david.buchanswanson@gmail.com>
Co-authored-by: Mike Diarmid <mike.diarmid@gmail.com>
[publish]
* `confirm(verificationCode)` now correctly returns an instance of `UserCredentials` instead of `User`. You can access `User` from the `.user` property on the `UserCredentials` instance.
* breaking change to mark new internal versioning requirements.
