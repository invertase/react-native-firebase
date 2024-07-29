# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [20.3.0](https://github.com/invertase/react-native-firebase/compare/v20.2.1...v20.3.0) (2024-07-19)

### Features

- **auth,other:** allow optional enabling of Auth session persistence via async storage ([d1ea703](https://github.com/invertase/react-native-firebase/commit/d1ea70319ae95484112a9c09b2d5489810e79c80))

### Bug Fixes

- **analytics,other:** persist analytics client id where possible ([94a8198](https://github.com/invertase/react-native-firebase/commit/94a8198e9d4f5a689bcc9ec879e5d4bec83acd66))
- **other:** add api for persistence via Async Storage ([030eea9](https://github.com/invertase/react-native-firebase/commit/030eea91f297a4014ab86cfb141ae938f200c5e5))

## [20.2.1](https://github.com/invertase/react-native-firebase/compare/v20.2.0...v20.2.1) (2024-07-17)

### Bug Fixes

- **firestore:** Filter typing. `Filter.or` & `Filter.and` can accept each other ([#7904](https://github.com/invertase/react-native-firebase/issues/7904)) ([f6c12ec](https://github.com/invertase/react-native-firebase/commit/f6c12ec208f15c4a8dd2132810fcfe914b675251))
- **storage:** ensure emulator is used for different storage buckets ([#7892](https://github.com/invertase/react-native-firebase/issues/7892)) ([3fa3f11](https://github.com/invertase/react-native-firebase/commit/3fa3f110b357ef0dbe2cc0fc12e982edc913b588))

## [20.2.0](https://github.com/invertase/react-native-firebase/compare/v20.1.0...v20.2.0) (2024-07-15)

### Features

Version 20.2.0 introduces support for 'other' platforms, see [documentation for more details](https://rnfirebase.io/platforms):

- **other:** Add Analytics support ([#7899](https://github.com/invertase/react-native-firebase/issues/7899)) ([cbdf9ec](https://github.com/invertase/react-native-firebase/commit/cbdf9ec78452a73751d1afeca428842898f63134))
- **other:** add App Check support ([#7905](https://github.com/invertase/react-native-firebase/issues/7905)) ([753b16e](https://github.com/invertase/react-native-firebase/commit/753b16e1a06f949c679fb75053c319394dd5ecfe))
- **other:** add App/Core support ([1b2e247](https://github.com/invertase/react-native-firebase/commit/1b2e2473d526c3356ab8619b226943446fd49452))
- **other:** Add Auth support ([#7878](https://github.com/invertase/react-native-firebase/issues/7878)) ([54befe7](https://github.com/invertase/react-native-firebase/commit/54befe776353f07eeab9b044d6261eeb76f1f238))
- **other:** Add Database support ([#7887](https://github.com/invertase/react-native-firebase/issues/7887)) ([fbb773a](https://github.com/invertase/react-native-firebase/commit/fbb773a87c167bdc92265fe261aeb777d4660cd7))
- **other:** Add Firestore support ([#7882](https://github.com/invertase/react-native-firebase/issues/7882)) ([0ebd1dd](https://github.com/invertase/react-native-firebase/commit/0ebd1ddd221c50dde489bce30ad5ed64037d8439))
- **other:** add Functions support ([a752075](https://github.com/invertase/react-native-firebase/commit/a7520755fdb858f8c93576c54cef16520ff4f3e8))
- **other:** Add Remote Config support ([#7895](https://github.com/invertase/react-native-firebase/issues/7895)) ([a41e556](https://github.com/invertase/react-native-firebase/commit/a41e5568869320fb91afc01403ed402e5312e15c))
- **other:** Add Storage support ([#7888](https://github.com/invertase/react-native-firebase/issues/7888)) ([9b8dda7](https://github.com/invertase/react-native-firebase/commit/9b8dda704a01243039624bfcc7614021e6c3a527))

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 31.1.1 ([dba1beb](https://github.com/invertase/react-native-firebase/commit/dba1beba97d88d1110e0838b6287fd4907cfa8a7))
- **app, android:** adopt firebase-android-sdk 33.1.2 ([0dfa2af](https://github.com/invertase/react-native-firebase/commit/0dfa2af484cfd12a282490cb82726b29859e30bf))
- **app, ios:** firebase-ios-sdk 10.28.0 ([91c626d](https://github.com/invertase/react-native-firebase/commit/91c626d0d32435a6305696fb4084553341d99ca9))
- **crashlytics, ios:** init w/componentsToRegister vs configureWithApp ([ca07cad](https://github.com/invertase/react-native-firebase/commit/ca07cadd592487102b035a24b55f593f065ef4a5))
- **database:** set priority on child snapshot if available ([#7897](https://github.com/invertase/react-native-firebase/issues/7897)) ([9028ae4](https://github.com/invertase/react-native-firebase/commit/9028ae4785eb17239ae2ab49d343a39c01a349e7))
- **firestore:** expose modular `Filter` and it's proper types ([#7884](https://github.com/invertase/react-native-firebase/issues/7884)) ([272efe5](https://github.com/invertase/react-native-firebase/commit/272efe56acdd46b8c994789f751d2c097cb8d025))
- **firestore:** remove exception throw on inequality queries on different fields ([da24246](https://github.com/invertase/react-native-firebase/commit/da242466d80609f61420feb56d72ad2ee20b2410))
- **functions:** properly pass the custom URL or region to constructor ([#7886](https://github.com/invertase/react-native-firebase/issues/7886)) ([ffaac4f](https://github.com/invertase/react-native-firebase/commit/ffaac4f3d4f4b7849c4ef3af9c81227b94e4759f))
- **ios:** adopt firebase-ios-sdk 10.29.0 ([1b19cc6](https://github.com/invertase/react-native-firebase/commit/1b19cc697f21ac1e21ab3a7a399c1ef90711800b))

### Reverts

- **ci:** conventional-changelog-cli version bump ([67780f7](https://github.com/invertase/react-native-firebase/commit/67780f7c70c813951fd9dc9d96b0eaa0510a4804))

## [20.1.0](https://github.com/invertase/react-native-firebase/compare/v20.0.0...v20.1.0) (2024-06-04)

### Features

- **app:** ios sdk 10.27.0 / android sdk 33.1.0 ([b6158d6](https://github.com/invertase/react-native-firebase/commit/b6158d6ff355ea9156b6f3c3b062c74aaf0d240e))

## [20.0.0](https://github.com/invertase/react-native-firebase/compare/v19.3.0...v20.0.0) (2024-05-20)

### ⚠ BREAKING CHANGES

- **app, android:** - requires minSdk 21+ in general, 23+ for auth module

* requires compileSdk 34+
* app-distribution gradle plugin requires
  - gradle 7.3+
  - android gradle plugin 7+
  - google services plugin 4.3.2+
* crashlytics plugin requires
  - gradle 8+
  - android gradle plugin 8.1+
  - google services plugin 4.4.1+

- **app, ios:** firebase-ios-sdk 10.25.0 requires minimum Xcode 15.2+

This transitively requires macOS Ventura 13.5+ - for old hardware
you may investigate OCLP (OpenCore Legacy Patcher) to update macOS
to current versions and access newer Xcode versions

### Features

- **app, android:** android-sdk 33.0.0 - needs minSdk 21+ (23+ for auth) ([f29fecb](https://github.com/invertase/react-native-firebase/commit/f29fecbe72c27e60f8fec1cee6fa879b788d27b3))
- **app, ios:** adopt firebase-ios-sdk 10.25.0 requires Xcode 15.2+ ([73f3c23](https://github.com/invertase/react-native-firebase/commit/73f3c2397d2f56ed5a139d2a8b8a13930c86aabc))

### Bug Fixes

- **firestore, android:** remove usage of Guava library ([d6f62a3](https://github.com/invertase/react-native-firebase/commit/d6f62a3b374e321a86d97cd2765cc91b1f006e29))

## [19.3.0](https://github.com/invertase/react-native-firebase/compare/v19.2.2...v19.3.0) (2024-05-20)

### Features

- **analytics:** allow custom event parameters for begin_checkout and purchase events ([#7760](https://github.com/invertase/react-native-firebase/issues/7760)) ([424b9d9](https://github.com/invertase/react-native-firebase/commit/424b9d9c15921268ba3cc96a3e154fe2ee18c345))
- **firestore:** export and test types for the modular API ([ad40ea2](https://github.com/invertase/react-native-firebase/commit/ad40ea2eb828a59451a619059bb4bef96277e23f))
- **firestore:** implement the getDoc modular api ([e90782b](https://github.com/invertase/react-native-firebase/commit/e90782b00702878204dd93d3a04c09c620cdf163))
- **functions:** typescript definitions for httpsCallable and httpsCallableFromUrl ([#7762](https://github.com/invertase/react-native-firebase/issues/7762)) ([3446ca3](https://github.com/invertase/react-native-firebase/commit/3446ca346e417fc6b499d1508a4a32e45c063986))
- **functions:** typescript definitions for modular functions API ([#7777](https://github.com/invertase/react-native-firebase/issues/7777)) ([e724a46](https://github.com/invertase/react-native-firebase/commit/e724a467eba19f53573dc1518342391ffd4c2bcc))
- include phoneNumber from PhoneMultiFactorInfo ([5acdfb3](https://github.com/invertase/react-native-firebase/commit/5acdfb306279560a9fdd31a35c80f3edca4d0d59))

### Bug Fixes

- **app:** react-native 0.74 bridgeless mode compatibility ([#7688](https://github.com/invertase/react-native-firebase/issues/7688)) ([a6805bc](https://github.com/invertase/react-native-firebase/commit/a6805bc1e6894aadf3167b7958fd52644bfe90ca))
- **auth, android:** change error code for invalid multi-factor session to match iOS WIP needs test ([0f15f2d](https://github.com/invertase/react-native-firebase/commit/0f15f2d36cfec807c42b91b53289fa699ffe4f66))
- **auth, android:** return credential for signin if phone auth has link collision ([#7793](https://github.com/invertase/react-native-firebase/issues/7793)) ([f8916e2](https://github.com/invertase/react-native-firebase/commit/f8916e25371d43db2bd8c22c7f35e8064edc6806))
- **auth, ios:** reject multi-factor API call if session not found ([3d61e32](https://github.com/invertase/react-native-firebase/commit/3d61e32394d83fae5d136d21ecbea71590a2adb7))
- **ci:** allow yarn lockfile modification in CI for patch generation ([94979f5](https://github.com/invertase/react-native-firebase/commit/94979f5c3ed2a4437313cdcf5ad40a0c9eb37423))
- **ci:** fix executable bits on ios_config script during patchset generation ([0c1c4ae](https://github.com/invertase/react-native-firebase/commit/0c1c4aec15a6695610d4a043240f483f01f18952))
- **ci:** use modern yarn syntax to add packages during patchset generation ([cfd6f19](https://github.com/invertase/react-native-firebase/commit/cfd6f1960955f730593ee57c743ccd7f2874299c))
- **firestore:** fix types for the `where` api in modular queries ([d874e15](https://github.com/invertase/react-native-firebase/commit/d874e15145086f59bba11fee4f23a8d9cc50cc68))
- **messaging, ios:** register for notifications on permission grant ([ccd78b9](https://github.com/invertase/react-native-firebase/commit/ccd78b9cf5d6961f5252e582ede785932599d25d)), closes [#7272](https://github.com/invertase/react-native-firebase/issues/7272)
- **messaging, ios:** reject notification registration after 10 seconds ([1f86483](https://github.com/invertase/react-native-firebase/commit/1f8648329ce812644f4bbd0f0caadcfe6a0bbddf)), closes [#7272](https://github.com/invertase/react-native-firebase/issues/7272)

## [19.2.2](https://github.com/invertase/react-native-firebase/compare/v19.2.1...v19.2.2) (2024-04-13)

### Bug Fixes

- **app, android:** bump firebase-android-sdk to 32.8.1 ([ae24918](https://github.com/invertase/react-native-firebase/commit/ae24918ff124020b120f2bd12e24db4b6b5f54b4))

## [19.2.1](https://github.com/invertase/react-native-firebase/compare/v19.2.0...v19.2.1) (2024-04-12)

### Bug Fixes

- **auth, android:** Pass firebaseAuth into OAuthProvider.newBuilder(...) ([#7677](https://github.com/invertase/react-native-firebase/issues/7677)) ([21a9454](https://github.com/invertase/react-native-firebase/commit/21a945496cb422ab1a0ff0a6e412ffdda0e75e95))
- **auth, ios:** deprecate MultifactorInfo.enrollmentDate should be `enrollmentTime` ([#7653](https://github.com/invertase/react-native-firebase/issues/7653)) ([d9987da](https://github.com/invertase/react-native-firebase/commit/d9987dae0245b62a0ca705e3fd61ffc7a2c31097)), closes [/github.com/invertase/react-native-firebase/blob/main/packages/auth/android/src/main/java/io/invertase/firebase/auth/ReactNativeFirebaseAuthModule.java#L2500](https://github.com/invertase//github.com/invertase/react-native-firebase/blob/main/packages/auth/android/src/main/java/io/invertase/firebase/auth/ReactNativeFirebaseAuthModule.java/issues/L2500) [/github.com/invertase/react-native-firebase/blob/main/packages/auth/lib/index.d.ts#L483](https://github.com/invertase//github.com/invertase/react-native-firebase/blob/main/packages/auth/lib/index.d.ts/issues/L483) [#7565](https://github.com/invertase/react-native-firebase/issues/7565)
- **auth:** deprecate MultiFactorUser.enrolledFactor should be plural `enrolledFactors` ([#7652](https://github.com/invertase/react-native-firebase/issues/7652)) ([1ae7481](https://github.com/invertase/react-native-firebase/commit/1ae74816e4d70b129d831e4adf14794d4c69c372)), closes [/github.com/invertase/react-native-firebase/blob/main/packages/auth/lib/index.d.ts#L568](https://github.com/invertase//github.com/invertase/react-native-firebase/blob/main/packages/auth/lib/index.d.ts/issues/L568) [/github.com/invertase/react-native-firebase/blob/main/packages/auth/android/src/main/java/io/invertase/firebase/auth/ReactNativeFirebaseAuthModule.java#L2476](https://github.com/invertase//github.com/invertase/react-native-firebase/blob/main/packages/auth/android/src/main/java/io/invertase/firebase/auth/ReactNativeFirebaseAuthModule.java/issues/L2476) [/github.com/invertase/react-native-firebase/blob/main/packages/auth/ios/RNFBAuth/RNFBAuthModule.m#L1681](https://github.com/invertase//github.com/invertase/react-native-firebase/blob/main/packages/auth/ios/RNFBAuth/RNFBAuthModule.m/issues/L1681) [/github.com/firebase/firebase-js-sdk/blob/master/packages/auth/src/mfa/mfa_user.ts#L34](https://github.com/invertase//github.com/firebase/firebase-js-sdk/blob/master/packages/auth/src/mfa/mfa_user.ts/issues/L34)

## [19.2.0](https://github.com/invertase/react-native-firebase/compare/v19.1.2...v19.2.0) (2024-04-10)

### Features

- **app, ios:** firebase-ios-sdk 10.24.0 with signed frameworks ([6624b1c](https://github.com/invertase/react-native-firebase/commit/6624b1cc3d18eecefcc03453ba52c148aabd49d0))

## [19.1.2](https://github.com/invertase/react-native-firebase/compare/v19.1.1...v19.1.2) (2024-04-03)

### Bug Fixes

- **app, ios:** adopt firebase-ios-sdk 10.23.1 ([dc05178](https://github.com/invertase/react-native-firebase/commit/dc051788e60e4926f26b03992c7a82f7a38cb556))
- **deps, ios:** FirebaseCoreExtension is not always versioned ([cb7ed0e](https://github.com/invertase/react-native-firebase/commit/cb7ed0eb15758a4324d2ce785513a48bfe54fe1e))

## [19.1.1](https://github.com/invertase/react-native-firebase/compare/v19.1.0...v19.1.1) (2024-03-26)

### Bug Fixes

- **app-check, expo:** ensure config plugin is built before using ([#7704](https://github.com/invertase/react-native-firebase/issues/7704)) ([873130c](https://github.com/invertase/react-native-firebase/commit/873130c11595690924cf60feb08b64b3b9421042))
- **app, android:** bump google play-services-auth to 21.0.0 ([85dfa4e](https://github.com/invertase/react-native-firebase/commit/85dfa4e13b7da4358a12cc51e372a423bb63c9c3)), closes https://github.com/firebase/firebase-android-sdk/issues/5768#issuecomment-2020388078

## [19.1.0](https://github.com/invertase/react-native-firebase/compare/v19.0.1...v19.1.0) (2024-03-23)

### Features

- **app-check, expo:** add config plugin for iOS module initialization ([#7662](https://github.com/invertase/react-native-firebase/issues/7662)) ([c6e813e](https://github.com/invertase/react-native-firebase/commit/c6e813e1d73b464e48525b16b447a808b15ae2b3))

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 32.7.4 ([6793b1d](https://github.com/invertase/react-native-firebase/commit/6793b1d395c7112d6571e012c3ad50398784b574))
- **app, android:** adopt firebase-android-sdk 32.8.0 ([450da62](https://github.com/invertase/react-native-firebase/commit/450da6265ab2b54f63675009588f26609c0aa263))
- **app, ios:** adopt firebase-ios-sdk 10.23.0 ([d7fd10e](https://github.com/invertase/react-native-firebase/commit/d7fd10e97268ac08f4960323d5204acd3ecffa07))

## [19.0.1](https://github.com/invertase/react-native-firebase/compare/v19.0.0...v19.0.1) (2024-03-07)

### Bug Fixes

- **app, ios:** adopt firebase-ios-sdk 10.22.0 ([#7668](https://github.com/invertase/react-native-firebase/issues/7668)) ([3fc756b](https://github.com/invertase/react-native-firebase/commit/3fc756b7bf98f6e3acd169dd5cbe4af55dbe9746))

## [19.0.0](https://github.com/invertase/react-native-firebase/compare/v18.9.0...v19.0.0) (2024-02-26)

### ⚠ BREAKING CHANGES

- **auth, android:** multifactor error messages were auth/unknown before on android
  Now they will correctly come through as auth/invalid-verification-code
  If you were relying on the previous auth/unknown codes you
  will need to update your error handling code
- **app, sdks:** firebase-ios-sdk 10.21.0 requires cocoapods 1.12+
  in order to support the new Apple-mandated privacy manifests. Please
  ensure you are using verson 1.12 or greater of cocoapods

### Features

- **analytics, ios:** add Podfile toggle to optionally link AdSupport ([e4db9bb](https://github.com/invertase/react-native-firebase/commit/e4db9bbf0266de658ae3991568f5e04f1fcf7fc7))

### Bug Fixes

- **app, sdks:** SDK ios 10.21.0 / android / 32.7.2 ([9dc48be](https://github.com/invertase/react-native-firebase/commit/9dc48be52603c71b134dadca16502e8557aca95b))
- **auth, android:** correct error messages for finalizeMultiFactorEnrollment ([b0be508](https://github.com/invertase/react-native-firebase/commit/b0be508e3336fc5577795791b727f23e1a9bbbca))

## [18.9.0](https://github.com/invertase/react-native-firebase/compare/v18.8.0...v18.9.0) (2024-02-21)

### Features

- **analytics:** add setConsent implementation ([#7629](https://github.com/invertase/react-native-firebase/issues/7629)) ([7816985](https://github.com/invertase/react-native-firebase/commit/78169854f16a2715f5d2657ab08f54d5a4b05281))

### Bug Fixes

- **auth:** use correct app instance (vs always default) in multifactor and phone auth ([#7564](https://github.com/invertase/react-native-firebase/issues/7564)) ([ff32fd3](https://github.com/invertase/react-native-firebase/commit/ff32fd37b39557e9a55fce016cbf986348436b92))
- **firestore, types:** Add string type to `DocumentSnapshot.get` ([#7593](https://github.com/invertase/react-native-firebase/issues/7593)) ([d5b66ca](https://github.com/invertase/react-native-firebase/commit/d5b66ca94fe133a14058c1052ec767f1e4a1ee8a))
- **messaging, ios:** resolve getAPNSToken promise in all cases ([b30eee1](https://github.com/invertase/react-native-firebase/commit/b30eee1b97b4290474c00607342befda55272075)), closes [#7272](https://github.com/invertase/react-native-firebase/issues/7272)

## [18.8.0](https://github.com/invertase/react-native-firebase/compare/v18.7.3...v18.8.0) (2024-01-25)

### Features

- **auth, authDomain:** implement FirebaseOptions.authDomain on Auth ([a1f4710](https://github.com/invertase/react-native-firebase/commit/a1f471029352b7597d7e83a8c1ea06145768cf89))

### Bug Fixes

- **app:** firebase-ios-sdk 10.20.0 / firebase-android-sdk 32.7.1 ([8d3c3a0](https://github.com/invertase/react-native-firebase/commit/8d3c3a02689d8ec7dd7d705adb941808039cdd50))
- **auth, ios:** factorId nil check ([#7541](https://github.com/invertase/react-native-firebase/issues/7541)) ([b1cee9a](https://github.com/invertase/react-native-firebase/commit/b1cee9a899e963d5fc5d0f0af056214dd676cd5a))
- **firestore, types:** string is also correct type for orderBy ([#7570](https://github.com/invertase/react-native-firebase/issues/7570)) ([1ea166a](https://github.com/invertase/react-native-firebase/commit/1ea166aa1f06d9c332eab150cd2049a3cdd6c472))
- **firestore:** increase amount of maximum disjunctions in firebase ([#7543](https://github.com/invertase/react-native-firebase/issues/7543)) ([c576f87](https://github.com/invertase/react-native-firebase/commit/c576f875bcf1e1de338f107796d64e2b1805b831))

## [18.7.3](https://github.com/invertase/react-native-firebase/compare/v18.7.2...v18.7.3) (2023-12-13)

### Bug Fixes

- **sdk, android:** adopt firebase-android-sdk 32.7.0 ([2c13c32](https://github.com/invertase/react-native-firebase/commit/2c13c32290997bcb8b6a9a04cf4f45730eddada1))

## [18.7.2](https://github.com/invertase/react-native-firebase/compare/v18.7.1...v18.7.2) (2023-12-08)

### Bug Fixes

- **database:** react-native 0.73 compatibility ([788cc22](https://github.com/invertase/react-native-firebase/commit/788cc228b7ab34af371bf0c537bbc2033a789b1a))
- firebase-ios-sdk 10.19.0 ([a899390](https://github.com/invertase/react-native-firebase/commit/a8993900cbe4c22561c2fe2863899c1d60fbbfd2))

## [18.7.1](https://github.com/invertase/react-native-firebase/compare/v18.7.0...v18.7.1) (2023-11-29)

### Bug Fixes

- **ios): Revert "build(ios:** specify our script phases always run" ([62b44d6](https://github.com/invertase/react-native-firebase/commit/62b44d68d3794e701e173c9f1a97e131844f0406))

## [18.7.0](https://github.com/invertase/react-native-firebase/compare/v18.6.2...v18.7.0) (2023-11-28)

### Features

- **app-check:** implement getLimitedUseToken / Replay Protection ([#7424](https://github.com/invertase/react-native-firebase/issues/7424)) ([c6cd505](https://github.com/invertase/react-native-firebase/commit/c6cd50501a09855fe7253873549eabe869a24978))
- **auth, oauth:** support native oauth providers ([#7443](https://github.com/invertase/react-native-firebase/issues/7443)) ([8461691](https://github.com/invertase/react-native-firebase/commit/8461691914386e3711bc52fa4198f7bb7b62baff))
- **messaging:** Adding support for Firebase Messaging via Expo config plugin. ([#7369](https://github.com/invertase/react-native-firebase/issues/7369)) ([34152ed](https://github.com/invertase/react-native-firebase/commit/34152edd189bc899e85cb4ceee92d44f1175a422))

## [18.6.2](https://github.com/invertase/react-native-firebase/compare/v18.6.1...v18.6.2) (2023-11-23)

### Bug Fixes

- adopt firebase-ios-sdk 10.18.0 / firebase-android-sdk 32.6.0 ([6a8b25b](https://github.com/invertase/react-native-firebase/commit/6a8b25bc1ed22860d1cef8fa3507ca5df3a28420))

### Performance Improvements

- **ci:** no need to list simulators ([08e40ec](https://github.com/invertase/react-native-firebase/commit/08e40ec87015fed0efa3c2a5c08d1759f3b43fae))
- **ci:** unload diagnosticsd to speed up macOS runner ([124619e](https://github.com/invertase/react-native-firebase/commit/124619ef6ee0f5bb1160d1cb9ef0d61bc7568998))

## [18.6.1](https://github.com/invertase/react-native-firebase/compare/v18.6.0...v18.6.1) (2023-11-01)

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 32.5.0 ([9834bfb](https://github.com/invertase/react-native-firebase/commit/9834bfb7feeef4d40d8524f81be5d1f722cae3b8))
- **app, sdk:** adopt firebase-ios-sdk 10.17.0 ([c926af3](https://github.com/invertase/react-native-firebase/commit/c926af334999fb6e462487ac43f07e08f808ac13))
- **windows:** cleanup windows dev regression ([b85f5a4](https://github.com/invertase/react-native-firebase/commit/b85f5a46c199353908715309fb239c4eab633cc6))

## [18.6.0](https://github.com/invertase/react-native-firebase/compare/v18.5.0...v18.6.0) (2023-10-26)

### Features

- **ml:** add modular API ([2d8ac14](https://github.com/invertase/react-native-firebase/commit/2d8ac144a14e79ce1846ecab077f8d7b69d11f05))

### Bug Fixes

- **android:** required compatibility for Gradle 8 in android modules ([b52d0ce](https://github.com/invertase/react-native-firebase/commit/b52d0ce6723c077190618641ce0f33ced9fd4090))
- **app, sdk:** adopt firebase-android-sdk 32.4.0 ([63f1893](https://github.com/invertase/react-native-firebase/commit/63f1893849578bfab85241bf4458eb845a4d857f))

## [18.5.0](https://github.com/invertase/react-native-firebase/compare/v18.4.0...v18.5.0) (2023-09-22)

### Features

- **auth:** Expose modular API that matches the Firebase web JS SDK v9 API ([e3a93bc](https://github.com/invertase/react-native-firebase/commit/e3a93bcd478ee48829d14e3016cafcd22edbd4d4))
- **database:** Firebase V9 modular API ([#7136](https://github.com/invertase/react-native-firebase/issues/7136)) ([21531f2](https://github.com/invertase/react-native-firebase/commit/21531f26438cc34e4b86f17d58102263a73f2747))
- **firestore:** V9 modular APIs ([#7235](https://github.com/invertase/react-native-firebase/issues/7235)) ([29d81c4](https://github.com/invertase/react-native-firebase/commit/29d81c4d8023f5c0d9c883a8b73b94ad393c8d44))
- **ios:** add initiateOnDeviceConversionMeasurementWithPhoneNumber ([80ac07e](https://github.com/invertase/react-native-firebase/commit/80ac07e207bad7f31a4805edb26e350f892fc5bf))

### Bug Fixes

- **app, sdks:** adopt ios sdk 10.15.0 / android sdk 32.3.1 ([acc58da](https://github.com/invertase/react-native-firebase/commit/acc58da42bb471d1973645f2a2feffe180705c19))
- **messaging:** RemoteMessage.data may be JSON-serializable object as well as string ([#7316](https://github.com/invertase/react-native-firebase/issues/7316)) ([7945a24](https://github.com/invertase/react-native-firebase/commit/7945a2485a4a93fa40c509e518da23317a82b489))
- **storage, ios:** remove '443' port from iOS download URLs ([5c687a8](https://github.com/invertase/react-native-firebase/commit/5c687a82dc8272a0d62c2b63cc0206ae6ef99d2f))

## [18.4.0](https://github.com/invertase/react-native-firebase/compare/v18.3.2...v18.4.0) (2023-09-11)

### Features

- **analytics:** Add types to modular package ([#7109](https://github.com/invertase/react-native-firebase/issues/7109)) ([b6f64bf](https://github.com/invertase/react-native-firebase/commit/b6f64bf8813ceedd220d3e16eec850e4cbc9d53b))
- **app-check, android:** Implement app check token change listener ([#7309](https://github.com/invertase/react-native-firebase/issues/7309)) ([adebe40](https://github.com/invertase/react-native-firebase/commit/adebe40883adc539bf84134d407be677084a5b47))
- **app-distribution:** Firebase V9 modular API ([#7307](https://github.com/invertase/react-native-firebase/issues/7307)) ([309fec4](https://github.com/invertase/react-native-firebase/commit/309fec4989b6736e171ebfc4d77df57e7c83a3a9))
- **crashlytics:** Firbase web modular V9 API ([#7283](https://github.com/invertase/react-native-firebase/issues/7283)) ([57f7327](https://github.com/invertase/react-native-firebase/commit/57f7327da4b405dace6b040e8a942d5f107f3603))
- **dynamic-links:** Firebase web V9 modular APIs ([#7296](https://github.com/invertase/react-native-firebase/issues/7296)) ([573a4ee](https://github.com/invertase/react-native-firebase/commit/573a4eee742c2c9b8e255c1a4b02a8e5ecea0eb2))
- **in-app-messaging:** Firebase V9 modular APIs ([#7306](https://github.com/invertase/react-native-firebase/issues/7306)) ([0149480](https://github.com/invertase/react-native-firebase/commit/0149480df3ec267c8b317d9034ff2a297bf2ce23))

### Bug Fixes

- **storage, android:** honor android_bypass_emulator_url_remap flag ([#7326](https://github.com/invertase/react-native-firebase/issues/7326)) ([794e081](https://github.com/invertase/react-native-firebase/commit/794e081134ca23d94174b9d4acd9bca7c403e8ad))

## [18.3.2](https://github.com/invertase/react-native-firebase/compare/v18.3.1...v18.3.2) (2023-09-02)

### Bug Fixes

- **app, sdks:** adopt firebase-android-sdk 32.2.3 ([129d6ef](https://github.com/invertase/react-native-firebase/commit/129d6ef1eb1b45be3390687a002bddfe87386fa3))

## [18.3.1](https://github.com/invertase/react-native-firebase/compare/v18.3.0...v18.3.1) (2023-08-23)

### Bug Fixes

- **app, sdks:** adopt android-sdk 32.2.2 / ios-sdk 10.13.0 ([5484c0b](https://github.com/invertase/react-native-firebase/commit/5484c0b69420f888f9a3a59aec8cc59d45f1d2d6))
- **app, sdks:** adopt firebase-ios-sdk 10.14.0 ([89e3bd9](https://github.com/invertase/react-native-firebase/commit/89e3bd9cbf73b1af666afde017cba801d48684e8))
- **auth, android:** avoid crash on react-native < 0.63 ([3fee0d6](https://github.com/invertase/react-native-firebase/commit/3fee0d6da587f56911669307e35558f55107c88e))

## [18.3.0](https://github.com/invertase/react-native-firebase/compare/v18.2.0...v18.3.0) (2023-07-19)

### Features

- **auth, revokeToken:** sign in with apple revokeToken API ([#7239](https://github.com/invertase/react-native-firebase/issues/7239)) ([2b9dc73](https://github.com/invertase/react-native-firebase/commit/2b9dc738259b200d47c79cc028becf691cb528d3))

## [18.2.0](https://github.com/invertase/react-native-firebase/compare/v18.1.0...v18.2.0) (2023-07-13)

### Features

- **analytics, ios:** implement setSessionTimeoutDuration for ios ([b3ce13f](https://github.com/invertase/react-native-firebase/commit/b3ce13ff5f7922e4a253aa58377e5c3c436e74f0))
- **analytics:** implement getSessionId ([566470c](https://github.com/invertase/react-native-firebase/commit/566470cfc0e919a46c0a119835187257bf046df7))

### Bug Fixes

- **app, ios:** incorporate firebase-ios-sdk 10.12.0 ([#7231](https://github.com/invertase/react-native-firebase/issues/7231)) ([ee66459](https://github.com/invertase/react-native-firebase/commit/ee66459cd214ffb84ce2d4e15eef79d047f075ab))

## [18.1.0](https://github.com/invertase/react-native-firebase/compare/v18.0.0...v18.1.0) (2023-06-22)

### Features

- **installations:** Firebase JS SDK V9 modular API ([#7095](https://github.com/invertase/react-native-firebase/issues/7095)) ([08cb0c2](https://github.com/invertase/react-native-firebase/commit/08cb0c2a14ed1513ece59bae0598d169118521c3))
- **remote-config:** realtime config updates ([9ded619](https://github.com/invertase/react-native-firebase/commit/9ded619e81c1523d7fa0cdbda8fc94929450a967))

### Bug Fixes

- **app, sdk:** adopt firebase-ios-sdk 10.11.0 ([f40cb5b](https://github.com/invertase/react-native-firebase/commit/f40cb5b46276dbd7977dc72f4a8bdf783d282b03))
- **remote-config, ios:** workaround firebase-ios-sdk[#11458](https://github.com/invertase/react-native-firebase/issues/11458) until SDK v10.12.0 ([8c75849](https://github.com/invertase/react-native-firebase/commit/8c758496c2fadc506805f81d1619ebce21a413df))

## [18.0.0](https://github.com/invertase/react-native-firebase/compare/v17.5.0...v18.0.0) (2023-06-05)

### ⚠ BREAKING CHANGES

- **app, sdk:** this version of the underlying firebase-ios-sdk has
  a minimum Xcode requirement of 14.1 which transitively implies a macOS
  minimum version of 12.5
- **app, sdk:** the "safetyNet" provider for App Check has been removed
  from the underlying firebase-android-sdk and we have removed it here. You
  should upgrade to the "playIntegrity" provider for App Check
- **app, sdks:** firebase-ios-sdk 10.8.0 and higher require Xcode 13.3+,
  which transitively requires macOS 12.0+. You must update your CI build environments
  to meet these minimums as well as your development environments - if you have older
  hardware that still works but cannot be upgraded normally, you may like:
  https://dortania.github.io/OpenCore-Legacy-Patcher/

### Features

- **app, sdk:** android-sdk v32 - app-check safetyNet provider is removed ([a0e76ec](https://github.com/invertase/react-native-firebase/commit/a0e76ecab65c69a19055a84bc19c069482b1bc88))
- **app, sdk:** ios-sdk 10.10.0, requires Xcode 14.1+ / macOS 12.5+ ([3122918](https://github.com/invertase/react-native-firebase/commit/3122918c19c27696caf51f30caafdcaa76807db8))
- **app, sdks:** ios-sdk 10.8.0 requires Xcode 13.3+; android-sdk 31.5.0 ([86dc4d5](https://github.com/invertase/react-native-firebase/commit/86dc4d5d08a4cc7c788b057b5411ccdeb413e13e))
- **auth, android:** add forceRecaptchaFlowForTesting API ([#7148](https://github.com/invertase/react-native-firebase/issues/7148)) ([95d014c](https://github.com/invertase/react-native-firebase/commit/95d014cd6b8cc5715c585fee34715587a6694057))

### Bug Fixes

- **firestore, types:** add types for Filter constraints on Queries ([#7124](https://github.com/invertase/react-native-firebase/issues/7124)) ([0785d27](https://github.com/invertase/react-native-firebase/commit/0785d276669b9c875951d4527e8884c9014e48fe))
- **firestore:** Allow queries with combined in and array-contains-any ([#7142](https://github.com/invertase/react-native-firebase/issues/7142)) ([8da6951](https://github.com/invertase/react-native-firebase/commit/8da69519b3dd516a67976a490434f8f9c12a426e))

## [17.5.0](https://github.com/invertase/react-native-firebase/compare/v17.4.3...v17.5.0) (2023-05-11)

### Features

- **firestore:** Firestore `Filter` instance. Use `Filter`, `Filter.or()` & `Filter.and()` in Firestore queries. ([#7045](https://github.com/invertase/react-native-firebase/issues/7045)) ([f7ec3d1](https://github.com/invertase/react-native-firebase/commit/f7ec3d1970f4fa8cc9752bb3cd8f1550b2a457c5))

### Bug Fixes

- **app-check, types:** ReactNativeFirebaseAppCheckProvider.configure returns void not Promise<void> ([f53dc2d](https://github.com/invertase/react-native-firebase/commit/f53dc2de546b608c9108ce351ac47b97295a7f63))

### [17.4.3](https://github.com/invertase/react-native-firebase/compare/v17.4.2...v17.4.3) (2023-04-26)

### Bug Fixes

- **expo:** update dependencies of config plugins ([3e81143](https://github.com/invertase/react-native-firebase/commit/3e81143e67028f70c20530b8e1083b2a904f96f4))

### [17.4.2](https://github.com/invertase/react-native-firebase/compare/v17.4.1...v17.4.2) (2023-04-05)

### Bug Fixes

- **android, auth:** phone auth supports Play Integrity now ([59b0238](https://github.com/invertase/react-native-firebase/commit/59b02382492ee568fc9d4bed933ae1cf8d7efdfb))

### [17.4.1](https://github.com/invertase/react-native-firebase/compare/v17.4.0...v17.4.1) (2023-04-01)

### Bug Fixes

- **app-check, ios:** Xcode 14.3 compat bugfix ([c4bb807](https://github.com/invertase/react-native-firebase/commit/c4bb807bad5beeef1a2d353d417209b776668e83)), closes [#7014](https://github.com/invertase/react-native-firebase/issues/7014)
- **crashlytics, android:** use v2.9.2 of crashlytics android plugin ([8460ab6](https://github.com/invertase/react-native-firebase/commit/8460ab6176bb0d287a277853427d94004c30a4d0)), closes [#6983](https://github.com/invertase/react-native-firebase/issues/6983)

## [17.4.0](https://github.com/invertase/react-native-firebase/compare/v17.3.2...v17.4.0) (2023-03-25)

### Features

- **storage:** Firebase JS SDK v9 modular API ([#6958](https://github.com/invertase/react-native-firebase/issues/6958)) ([02df92e](https://github.com/invertase/react-native-firebase/commit/02df92e8d76a60e7cfaa80d65d98f4c905a89937))

### Bug Fixes

- **android:** bump to firebase-android-sdk 31.3.0 ([500f15a](https://github.com/invertase/react-native-firebase/commit/500f15ab5409686d2b7defde32effce0f2b537d9))
- **app-distribution, android:** update the gradle plugin to match BoM 31.2.3 release ([ebfb413](https://github.com/invertase/react-native-firebase/commit/ebfb413670d189f77384e05000e13e48abac4516))
- **ios:** bump firebase-ios-sdk to 10.7.0 ([7103473](https://github.com/invertase/react-native-firebase/commit/7103473e0f0b43e2e994aa7cb9ba553906f9cf46))

### [17.3.2](https://github.com/invertase/react-native-firebase/compare/v17.3.1...v17.3.2) (2023-03-05)

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 31.2.3 ([24fa17e](https://github.com/invertase/react-native-firebase/commit/24fa17e710070b11d2be2851bd3ef9a81185d472))
- **app, ios:** bump firebase-ios-sdk to 10.6.0 ([06a6f69](https://github.com/invertase/react-native-firebase/commit/06a6f6945280f2b22f50f9327c57c8222c80ae8a))
- **auth, types:** add `OIDCProvider` to typescript declaration ([#6936](https://github.com/invertase/react-native-firebase/issues/6936)) ([00185a3](https://github.com/invertase/react-native-firebase/commit/00185a37bc554f9bcb6feb6434d6c9c75ed51a3a))
- **expo:** extend expo config plugin regex to match latest version of AppDelegate ([#6957](https://github.com/invertase/react-native-firebase/issues/6957)) ([281deed](https://github.com/invertase/react-native-firebase/commit/281deedb2c23819816d73a864cbc0f6907a7f110))

### [17.3.1](https://github.com/invertase/react-native-firebase/compare/v17.3.0...v17.3.1) (2023-02-23)

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 31.2.2 w/crash fixes ([2d1f2cb](https://github.com/invertase/react-native-firebase/commit/2d1f2cb64d6460a6a73aeea57b4472060801aecb)), closes [#6930](https://github.com/invertase/react-native-firebase/issues/6930)

## [17.3.0](https://github.com/invertase/react-native-firebase/compare/v17.2.0...v17.3.0) (2023-02-15)

### Features

- **analytics:** Expose modular API that matches the Firebase web JS SDK v9 API ([#6816](https://github.com/invertase/react-native-firebase/issues/6816)) ([a42551a](https://github.com/invertase/react-native-firebase/commit/a42551aadb98ba6fdd18dde627b436e667d0a014))
- **app-check:** Expose modular API that matches the Firebase web JS SDK v9 API ([#6912](https://github.com/invertase/react-native-firebase/issues/6912)) ([bf02676](https://github.com/invertase/react-native-firebase/commit/bf0267609251a5b8e4245c300678fe7d7ea53d92))

### Bug Fixes

- **app-check, types:** Correct ReactNativeFirebaseAppCheckProvider options type ([#6911](https://github.com/invertase/react-native-firebase/issues/6911)) ([5d7241b](https://github.com/invertase/react-native-firebase/commit/5d7241b124dc283852efb4c549f6888005101ecd))

## [17.2.0](https://github.com/invertase/react-native-firebase/compare/v17.1.0...v17.2.0) (2023-02-15)

### Features

- **app, android:** firebase-android-sdk 31.2.0 ([87156e7](https://github.com/invertase/react-native-firebase/commit/87156e75e16775db14ef8f9bf6b0049b15ee1277))

### Bug Fixes

- **app-check, ios:** debugToken in config on iOS works now ([04615e5](https://github.com/invertase/react-native-firebase/commit/04615e5568af549fb79d8b1ed59dbbce29ddb5f9))
- **app-check, types:** add `newReactNativeFirebaseAppCheckProvider` function type ([9f5f231](https://github.com/invertase/react-native-firebase/commit/9f5f231e06ebe3f75e553b898eef173395954ae8))
- **app-check:** better validation of configuration ([df60d83](https://github.com/invertase/react-native-firebase/commit/df60d834c897e55c7c62b4850be12a2a396ac21f))

## [17.1.0](https://github.com/invertase/react-native-firebase/compare/v17.0.0...v17.1.0) (2023-02-09)

### Features

- **app, ios:** firebase-ios-sdk 10.5.0 ([cc80d7c](https://github.com/invertase/react-native-firebase/commit/cc80d7c11f533b292d1f5b681a05a206ddc93e9c))
- **perf:** Expose modular API that matches the Firebase web JS SDK v9 API ([#6771](https://github.com/invertase/react-native-firebase/issues/6771)) ([4e170ea](https://github.com/invertase/react-native-firebase/commit/4e170ead24035cd0154b153dcf1e8d69d6ab7ac9))
- **remote-config:** Expose modular API that matches the Firebase web JS SDK v9 API ([#6868](https://github.com/invertase/react-native-firebase/issues/6868)) ([e1504aa](https://github.com/invertase/react-native-firebase/commit/e1504aabd6ffba5c7d4b85c46ed44e12e0b9f916))

### Bug Fixes

- **remote-config:** incorrect if condition & doc update ([#6892](https://github.com/invertase/react-native-firebase/issues/6892)) ([1a1488c](https://github.com/invertase/react-native-firebase/commit/1a1488ced6aac8e6886cfd73033757a97e6e1abd))

## [17.0.0](https://github.com/invertase/react-native-firebase/compare/v16.7.0...v17.0.0) (2023-02-02)

### ⚠ BREAKING CHANGES

- **app, ios:** You must have an APNS token before calling getToken to
  get an FCM token on iOS. Previously it was not required. See documentation
  for setAPNSToken if you are using getToken in testing or have disabled
  FCM Swizzling, and use setAPNSToken to set a token before using getToken

### Features

- **app-check:** add custom factory/provider; supports all providers ([ee7df85](https://github.com/invertase/react-native-firebase/commit/ee7df855ec0a573df5aa2e26261adf9c292aa7d5))
- **app, ios:** adopt firebase-ios-sdk 10.4.0 ([1b8df4c](https://github.com/invertase/react-native-firebase/commit/1b8df4c8e55d474c09e301f9c7b58b6128ae6485))
- **messaging, ios:** new setAPNSToken API / getToken works on M1 Simulator ([8d75b36](https://github.com/invertase/react-native-firebase/commit/8d75b36f485af07ecfa653192ca56f761d0cc5b7))

## [16.7.0](https://github.com/invertase/react-native-firebase/compare/v16.6.0...v16.7.0) (2023-01-28)

### Features

- **perf:** add custom screen rendering traces for android ([#6588](https://github.com/invertase/react-native-firebase/issues/6588)) ([9f2498d](https://github.com/invertase/react-native-firebase/commit/9f2498d29ee3780cba5a7a69fde8f7c370ad723b))

## [16.6.0](https://github.com/invertase/react-native-firebase/compare/v16.5.2...v16.6.0) (2023-01-27)

### Features

- **auth:** Add support for OpenID Connect provider ([#6574](https://github.com/invertase/react-native-firebase/issues/6574)) ([469bf00](https://github.com/invertase/react-native-firebase/commit/469bf004c8d4ccf3da46215e7ca7562a6739265d))
- **messaging:** Expose modular API that matches the Firebase web JS SDK v9 API ([#6806](https://github.com/invertase/react-native-firebase/issues/6806)) ([da82c10](https://github.com/invertase/react-native-firebase/commit/da82c1036051f0518da0401de24cef24c7ac091f))

### Bug Fixes

- **database, types:** transaction update type is any not object ([#6782](https://github.com/invertase/react-native-firebase/issues/6782)) ([1788a2d](https://github.com/invertase/react-native-firebase/commit/1788a2d10aa61c405958580a767f24e05cb5ccaa))
- **firestore:** support not equals null query ([b93699c](https://github.com/invertase/react-native-firebase/commit/b93699c0258cadfdd6639b64479f1738b5c301b4))

### [16.5.2](https://github.com/invertase/react-native-firebase/compare/v16.5.1...v16.5.2) (2023-01-23)

### Bug Fixes

- **auth, android:** use a safe copy of auth provider info to avoid crash ([2a90136](https://github.com/invertase/react-native-firebase/commit/2a90136cce0db6ca0f253003643f8bd856fd46a0)), closes [#6798](https://github.com/invertase/react-native-firebase/issues/6798)

### [16.5.1](https://github.com/invertase/react-native-firebase/compare/v16.5.0...v16.5.1) (2023-01-20)

### Bug Fixes

- **firestore:** correct handling of nested `FieldPath` in `orderBy` clauses ([#6814](https://github.com/invertase/react-native-firebase/issues/6814)) ([84d7bbe](https://github.com/invertase/react-native-firebase/commit/84d7bbe241241c331b7c540bf089adcf603c199e))

## [16.5.0](https://github.com/invertase/react-native-firebase/compare/v16.4.6...v16.5.0) (2022-12-16)

### Features

- **app:** migrate `app` module to a modular API ([#6694](https://github.com/invertase/react-native-firebase/issues/6694)) ([c285016](https://github.com/invertase/react-native-firebase/commit/c285016618bb79fd3a559d5fdcb983bb2aadaa77))
- **functions:** Expose modular API that matches the Firebase web JS SDK v9 API ([#6764](https://github.com/invertase/react-native-firebase/issues/6764)) ([0b0b2e5](https://github.com/invertase/react-native-firebase/commit/0b0b2e5d5ae8ca34725f0115e48ddb072d94630e))

### Bug Fixes

- **app, sdks:** ios-sdk 10.3.0 / android-sdk 31.1.1 ([00708b6](https://github.com/invertase/react-native-firebase/commit/00708b680cd837ed23d41b27bb76b2895e719f79))
- **functions, modular:** return instance with or without app argument ([e3bd896](https://github.com/invertase/react-native-firebase/commit/e3bd8962f921eead94e32f07f4a71ed31c4a5ae9))

### [16.4.6](https://github.com/invertase/react-native-firebase/compare/v16.4.5...v16.4.6) (2022-11-18)

### Bug Fixes

- **app, android:** firebase-android-sdk 31.1.0 ([af089c0](https://github.com/invertase/react-native-firebase/commit/af089c00496aa55e66ea83e87b8cf54c8144c9fb))

### [16.4.5](https://github.com/invertase/react-native-firebase/compare/v16.4.4...v16.4.5) (2022-11-16)

### Bug Fixes

- **app, ios:** firebase-ios-sdk 10.2.0 ([443f460](https://github.com/invertase/react-native-firebase/commit/443f460279f6c41ce7aaaeec03a19b14135953eb))

### [16.4.4](https://github.com/invertase/react-native-firebase/compare/v16.4.3...v16.4.4) (2022-11-14)

### Bug Fixes

- **auth, multifactor:** put multiFactor and getMultiFactorResolver on auth() ([357094e](https://github.com/invertase/react-native-firebase/commit/357094e4b7504165081ffda0c4105569480f5b79))
- **crashlytics, android:** firebase-android-sdk 31.0.3 fixes NDK issue ([0d37632](https://github.com/invertase/react-native-firebase/commit/0d376327c8d843285d4ceec11d4af0bc8c16fe42))
- **dynamic-links:** expo config plugin conflict with main firebase app plugin ([ab465ec](https://github.com/invertase/react-native-firebase/commit/ab465ec5fa9bea1e1519d9508ad5aee4ece2a032))

### [16.4.3](https://github.com/invertase/react-native-firebase/compare/v16.4.2...v16.4.3) (2022-11-06)

### Bug Fixes

- **auth, types:** augment multi-factor auth types ([5f183c4](https://github.com/invertase/react-native-firebase/commit/5f183c45301c0a5727a45688e69d0944c04e102a))
- **database, android:** revert double-emulator protection ([3857439](https://github.com/invertase/react-native-firebase/commit/38574398ea9f03d016d89caa522b17fda805de9e))
- **firestore, count:** add countFromServer API, delegates to count ([9f73729](https://github.com/invertase/react-native-firebase/commit/9f73729d3ace2af1d1eb78f8b996cfa869e6cfd7)), closes [#6654](https://github.com/invertase/react-native-firebase/issues/6654)

### [16.4.2](https://github.com/invertase/react-native-firebase/compare/v16.4.1...v16.4.2) (2022-11-04)

### Bug Fixes

- **dynamic-links, expo:** add plugin build commands ([#6660](https://github.com/invertase/react-native-firebase/issues/6660)) ([3ec3340](https://github.com/invertase/react-native-firebase/commit/3ec334028780c2d947cfd65bace67bf7553a55a6))

### [16.4.1](https://github.com/invertase/react-native-firebase/compare/v16.4.0...v16.4.1) (2022-11-02)

### Bug Fixes

- **dynamic-links, ios:** expo config plugin automates dynamic-links workaround ([#6650](https://github.com/invertase/react-native-firebase/issues/6650)) ([e558ad7](https://github.com/invertase/react-native-firebase/commit/e558ad78f62101be3549ab1c605654007b54a38f)), closes [#2660](https://github.com/invertase/react-native-firebase/issues/2660)

## [16.4.0](https://github.com/invertase/react-native-firebase/compare/v16.3.1...v16.4.0) (2022-10-30)

### Features

- **auth:** Add Expo support for phone auth ([#6645](https://github.com/invertase/react-native-firebase/issues/6645)) ([97a4ea5](https://github.com/invertase/react-native-firebase/commit/97a4ea573dd0795b157e73299e705dbd7bb7e3d4))

### [16.3.1](https://github.com/invertase/react-native-firebase/compare/v16.3.0...v16.3.1) (2022-10-28)

### Bug Fixes

- **app, sdks:** firebase-ios-sdk 10.1.0 / firebase-android-sdk 31.0.2 ([8367c98](https://github.com/invertase/react-native-firebase/commit/8367c9858b8d6e2a0d689d1adcc5c88c6dc377fa))

## [16.3.0](https://github.com/invertase/react-native-firebase/compare/v16.2.0...v16.3.0) (2022-10-26)

### Features

- **auth:** Add multi-factor support for the sign-in flow ([#6593](https://github.com/invertase/react-native-firebase/issues/6593)) ([3c64bf5](https://github.com/invertase/react-native-firebase/commit/3c64bf5987eec73c8cc5d3f9246c4c0185eb7718))

## [16.2.0](https://github.com/invertase/react-native-firebase/compare/v16.1.1...v16.2.0) (2022-10-23)

### Features

- **functions:** implement getCallableFromUrl(url) ([357ba72](https://github.com/invertase/react-native-firebase/commit/357ba72df8a21289c71f6a2f670299e332e46bba)), closes [#6622](https://github.com/invertase/react-native-firebase/issues/6622)

### [16.1.1](https://github.com/invertase/react-native-firebase/compare/v16.1.0...v16.1.1) (2022-10-21)

### Bug Fixes

- **app, android:** use firebase-android-sdk 31.0.1 ([89eb33f](https://github.com/invertase/react-native-firebase/commit/89eb33fb49b843afcb3c33480d4c6d28c5eb6e12))

## [16.1.0](https://github.com/invertase/react-native-firebase/compare/v16.0.0...v16.1.0) (2022-10-20)

### Features

- **firestore, count:** implement AggregateQuery count() on collections ([bd52301](https://github.com/invertase/react-native-firebase/commit/bd52301ad4ef35eeb4dbdab1bc4926db72d40949))

### Bug Fixes

- **auth, emulator:** guard against double useEmulator calls ([13402d5](https://github.com/invertase/react-native-firebase/commit/13402d5a7804f9a68d09903a2616e25ab95cb67a))
- **database, useEmulator:** drop multiple calls to useEmulator ([5fcfc44](https://github.com/invertase/react-native-firebase/commit/5fcfc4485e6e44225b144bc517017a61ac2ed40d)), closes [#5650](https://github.com/invertase/react-native-firebase/issues/5650)
- **firestore, emulator:** avoid double calls to useEmulator ([4e0d188](https://github.com/invertase/react-native-firebase/commit/4e0d188416f4ae8eb176ef024b5698bc892838d5)), closes [#5723](https://github.com/invertase/react-native-firebase/issues/5723)
- **storage, emulator:** avoid calling useEmulator multiple times ([276630d](https://github.com/invertase/react-native-firebase/commit/276630d4690cb6c3b2b632ec9dd0808ca8013eba)), closes [#5860](https://github.com/invertase/react-native-firebase/issues/5860)

## [16.0.0](https://github.com/invertase/react-native-firebase/compare/v15.7.1...v16.0.0) (2022-10-19)

## Features

- use firebase-ios-adk 10.0.0
- use firease-android-sdk 31.0.0
- implement new [Firestore AggregateQueries](https://firebase.google.com/docs/firestore/solutions/aggregation) and support [new `count()` feature](https://firebase.google.com/docs/firestore/query-data/aggregation-queries)

### ⚠ BREAKING CHANGES

- **increase in minimum iOS target version to 11.0 and macOS version to 10.13**, stay on v15.7.0 if you must support older Apple platforms

### KNOWN ISSUES

- storage getDownloadURL has an upstream issue on iOS + storage emulator; either use Android, or use cloud storage, or stay on v15.7.0 until firebase-ios-sdk 10.1.0+ is released with the fix

### release

- fix release version change type resolution ([6fcb946](https://github.com/invertase/react-native-firebase/commit/6fcb946f7e7bbc3e7ad6605d48ce3d11f1184c70))

## [15.7.1](https://github.com/invertase/react-native-firebase/compare/v15.7.0...v15.7.1) (2022-10-19)

**Note:** This version (15.7.1) was released in error, the contents of this release should have been versioned as 16.0.0 by our release process.

The breaking changes that will be in v16.0.0 here are an **increase in minimum iOS target version to 11.0 and macOS version to 10.13**.

Attempts to install v15.7.1 without apple deployment targets at that level or higher should result in fast-failure during pod install.

If these new apple target deployment minimums are not possible for project, please stay on v15.7.0

v16.0.0 of react-native-firebase will be released shortly.
Sorry for the inconvenience.

# [15.7.0](https://github.com/invertase/react-native-firebase/compare/v15.6.0...v15.7.0) (2022-10-01)

### Features

- **dynamic-links:** support other platform parameters (OFL) ([2c5afba](https://github.com/invertase/react-native-firebase/commit/2c5afba180f9f407904a57b634caceb7a72e944c))

# [15.6.0](https://github.com/invertase/react-native-firebase/compare/v15.5.0...v15.6.0) (2022-09-17)

### Bug Fixes

- **app, ios:** correctly handle firebase.json if it has UTF-8 ([4e3ac01](https://github.com/invertase/react-native-firebase/commit/4e3ac01c94389299dffc53e6d8480760f8b18033))
- **auth, types:** verifyPasswordResetCode returns Promise<string> with email address ([#6537](https://github.com/invertase/react-native-firebase/issues/6537)) ([6f67c2c](https://github.com/invertase/react-native-firebase/commit/6f67c2c33bb9fa8b6c343aa9b3b7ca1dff34f2db))

### Features

- **messaging:** add support for setDeliveryMetricsExportToBigQuery ([#6529](https://github.com/invertase/react-native-firebase/issues/6529)) ([930abd6](https://github.com/invertase/react-native-firebase/commit/930abd6920f70c89bdc70a674ff93f080b3b968d))

# [15.5.0](https://github.com/invertase/react-native-firebase/compare/v15.4.0...v15.5.0) (2022-09-16)

### Bug Fixes

- **database:** support new `EventEmitter.js` logic of RN 0.70.0 ([#6539](https://github.com/invertase/react-native-firebase/issues/6539)) ([3371727](https://github.com/invertase/react-native-firebase/commit/3371727dd23976ce769696c71865460740502d80))
- **expo, ios:** expo plugin added import multiple times ([f10891a](https://github.com/invertase/react-native-firebase/commit/f10891a6d8079766374ceb7790a824d90306946a))

### Features

- **android:** firebase-android-sdk 30.5.0 ([abe7620](https://github.com/invertase/react-native-firebase/commit/abe7620c35cd91bd105d64fa64777868a3482435))
- **ios:** bump firebase-ios-sdk to 9.6.0 ([0ad70a9](https://github.com/invertase/react-native-firebase/commit/0ad70a90e01ac37c3129a170ebff47738e551a18))

# [15.4.0](https://github.com/invertase/react-native-firebase/compare/v15.3.0...v15.4.0) (2022-08-27)

### Bug Fixes

- **app, android:** bump to firebase-android-sdk 30.3.2 ([ee394fe](https://github.com/invertase/react-native-firebase/commit/ee394fe1221fcb8effa4c87716d99c3f1d556d13))
- **messaging, ios:** Support Ephemeral authorization state ([#6478](https://github.com/invertase/react-native-firebase/issues/6478)) ([795b684](https://github.com/invertase/react-native-firebase/commit/795b68472deb0089ac4ddf7270e361a2db1da351))

### Features

- **app, ios:** bump firebase-ios-sdk to 9.5.0 ([feac7f8](https://github.com/invertase/react-native-firebase/commit/feac7f8c8b85c3cf87a34dc9a75ddb7b7b9c034b))

# [15.3.0](https://github.com/invertase/react-native-firebase/compare/v15.2.0...v15.3.0) (2022-08-07)

### Bug Fixes

- **app, sdk:** firebase-android-sdk 30.3.1 / firebase-ios-sdk 9.4.0 ([1fd7fc8](https://github.com/invertase/react-native-firebase/commit/1fd7fc837a31bad179ccf5d463c80f578d7cbd15)), closes [#6327](https://github.com/invertase/react-native-firebase/issues/6327)
- **firestore:** merge option should not always be true if passed ([#6436](https://github.com/invertase/react-native-firebase/issues/6436)) ([85585da](https://github.com/invertase/react-native-firebase/commit/85585da91fc82308a44f52063ffb612d651db7c7))
- **ios, messaging:** depend directly on FirebaseCoreExtension pod ([62ee54b](https://github.com/invertase/react-native-firebase/commit/62ee54b8a7d273430cbebf88af1d8a96fed6a6a6)), closes [#6403](https://github.com/invertase/react-native-firebase/issues/6403) [#6352](https://github.com/invertase/react-native-firebase/issues/6352)
- **messaging, ios:** eliminate auth/messaging notification race ([#6455](https://github.com/invertase/react-native-firebase/issues/6455)) ([7183118](https://github.com/invertase/react-native-firebase/commit/71831188a4d90800cce424a5a3cfb29978391bd3))

### Features

- add GeoPoint toJSON() method ([b062e74](https://github.com/invertase/react-native-firebase/commit/b062e743303c1c98334ff1ce1a82df59e87eebc4))

# [15.2.0](https://github.com/invertase/react-native-firebase/compare/v15.1.1...v15.2.0) (2022-07-21)

### Features

- **ios, messaging:** Allow notifications in foreground on iOS, configure in firebase.json ([#6407](https://github.com/invertase/react-native-firebase/issues/6407)) ([71dee2b](https://github.com/invertase/react-native-firebase/commit/71dee2bac7a2ea58e51605a249cab7f1ac5fa7d7))
- **sdks:** firebase-ios-sdk 9.3.0 / firebase-android-sdk 30.3.0 ([e03dcd1](https://github.com/invertase/react-native-firebase/commit/e03dcd19a530e178022aaebd3266e31e037c9550))

## [15.1.1](https://github.com/invertase/react-native-firebase/compare/v15.1.0...v15.1.1) (2022-06-28)

### Bug Fixes

- **ios, crashlytics:** depend on FirebaseCoreExtension ([#6352](https://github.com/invertase/react-native-firebase/issues/6352)) ([ea0ffe0](https://github.com/invertase/react-native-firebase/commit/ea0ffe06e7c6182bf38b18e9d6ca00c388ec6893)), closes [/github.com/invertase/react-native-firebase/issues/6322#issuecomment-1168902482](https://github.com//github.com/invertase/react-native-firebase/issues/6322/issues/issuecomment-1168902482)

# [15.1.0](https://github.com/invertase/react-native-firebase/compare/v15.0.0...v15.1.0) (2022-06-28)

### Features

- **analytics, ios:** implement firebase.json toggle to override default SKAdNewtork registration ([5da99bd](https://github.com/invertase/react-native-firebase/commit/5da99bde9f58a5d660ab9c59c61bf91db01cd962))
- **analytics, ios:** implement on-device conversion ([a1df996](https://github.com/invertase/react-native-firebase/commit/a1df996b36f2b5eb68c6443c49c5185437573fba)), closes [/firebase.google.com/support/release-notes/ios#analytics_1](https://github.com//firebase.google.com/support/release-notes/ios/issues/analytics_1) [#6321](https://github.com/invertase/react-native-firebase/issues/6321)
- **android, sdk:** use firebase-android-sdk 30.2.0 ([66e6fb0](https://github.com/invertase/react-native-firebase/commit/66e6fb0885c4f2885aeec140a9c0655a5eedd8df))
- **ios, sdk:** update to firebase-ios-sdk 9.2.0 ([7affa79](https://github.com/invertase/react-native-firebase/commit/7affa7989c64012bd6fc89fcc0ecf988e7f4e92a))

# [15.0.0](https://github.com/invertase/react-native-firebase/compare/v14.11.1...v15.0.0) (2022-06-20)

### Bug Fixes

- **crashlytics, ios:** forward port to firebase-ios-sdk v9 header locations ([e5bd716](https://github.com/invertase/react-native-firebase/commit/e5bd7161c0d1142da184e0e676c8756e2ebebf90))
- **storage, ios:** correct storage metadata update / delete ([2dcb079](https://github.com/invertase/react-native-firebase/commit/2dcb0790c1812a33100cceea9dcb407d6a64cb87))
- **storage, ios:** surface underlying reason for unknown errors if possible ([6cd53ea](https://github.com/invertase/react-native-firebase/commit/6cd53eaca16ef52c52a28a7b209a7c8313fef08b))

- test(functions, ios)!: disable custom HttpsError testing ([a56dc9f](https://github.com/invertase/react-native-firebase/commit/a56dc9f5778219df056a38b9cade08f976f4ef24))
- fix(storage, android)!: android now updates customMetadata as a group ([d602436](https://github.com/invertase/react-native-firebase/commit/d602436795bfb78f24bc69c42880133505738c00))

### BREAKING CHANGES

1. ALL iOS: firebase-ios-sdk now requires `use_frameworks!` in your Podfile and Xcode 13.3+. Note that
   use_frameworks is not yet compatible with Hermes, Flipper, React Native New Architecture, or react-native 0.69.0.
   Each of these is being worked on (follow [react-native 0.69 PR](https://github.com/facebook/react-native/pull/34011), [Hermes PR](https://github.com/facebook/react-native/pull/34030)) but for now you need react-native 0.68.2 or below, and you must disable hermes and flipper. **Expo users** should use [expo-build-properties](https://docs.expo.dev/versions/v45.0.0/sdk/build-properties/#pluginconfigtypeios) + Expo SDK45 to turn on use_frameworks in dynamic mode.

2. Storage(customMetadata): android works like web+iOS now: customMetadata if passed in will be
   updated as a single atomic unit, all keys at once. Any key you want to keep in customMetadata
   must be passed in during update; any missing keys will be removed. Set customMetadata to null
   in order to remove customMetadata entirely, omit it during update to leave it unchanged.

3. Functions(custom errors): if your firebase functions return custom HttpsError instances, you must not upgrade yet,
   custom errors suffered a regression in firebase-ios-sdk 9.0.0 and 9.1.0. The next firebase-ios-sdk release
   fixes this regression, at which point you may safely use this release in combination with overriding the [firebase-ios-sdk
   version in your Podfile](https://rnfirebase.io/#ios)

### Checklist

## [14.11.1](https://github.com/invertase/react-native-firebase/compare/v14.11.0...v14.11.1) (2022-06-17)

### Bug Fixes

- **analytics:** allow manual tracking of ad_impression ([931468a](https://github.com/invertase/react-native-firebase/commit/931468ac2380b8a3449456f941caaa7ca8902d5a)), closes [#6307](https://github.com/invertase/react-native-firebase/issues/6307) [#6312](https://github.com/invertase/react-native-firebase/issues/6312)
- **android:** specify that android services are not exported ([39e0444](https://github.com/invertase/react-native-firebase/commit/39e0444841e423175d325751ea6667dc8f8a6d54)), closes [/github.com/firebase/firebase-android-sdk/blob/ad135d8c3c1243b4c673e17bc032ee1052fb2a22/firebase-common/src/main/AndroidManifest.xml#L10-L12](https://github.com//github.com/firebase/firebase-android-sdk/blob/ad135d8c3c1243b4c673e17bc032ee1052fb2a22/firebase-common/src/main/AndroidManifest.xml/issues/L10-L12)

# [14.11.0](https://github.com/invertase/react-native-firebase/compare/v14.10.1...v14.11.0) (2022-05-27)

### Features

- **android, sdk:** firebase-android-sdk 30.1.0 ([b0462d4](https://github.com/invertase/react-native-firebase/commit/b0462d4d34d1518a50daeca09288bf4aa0e0f695))

## [14.10.1](https://github.com/invertase/react-native-firebase/compare/v14.10.0...v14.10.1) (2022-05-26)

### Bug Fixes

- **android, sdk:** bump firebase-android-sdk to 30.0.2 ([ad6f928](https://github.com/invertase/react-native-firebase/commit/ad6f928c888ac3b0264211d471874f15aea6b6d9))

# [14.10.0](https://github.com/invertase/react-native-firebase/compare/v14.9.4...v14.10.0) (2022-05-26)

### Bug Fixes

- **messaging, getToken:** add options for messaging instance ([88e218e](https://github.com/invertase/react-native-firebase/commit/88e218e7c5c9459197e4469c02de9efadcc14568))

### Features

- **dynamic-links, ios:** performDiagnostics API for troubleshooting ([0428460](https://github.com/invertase/react-native-firebase/commit/0428460ebb4a911506849e8cdefe97f5f686e3fd))

## [14.9.4](https://github.com/invertase/react-native-firebase/compare/v14.9.3...v14.9.4) (2022-05-14)

### Bug Fixes

- **android:** firebase-android-sdk 30.0.1 ([c5e6b41](https://github.com/invertase/react-native-firebase/commit/c5e6b41eaec0d7238665495caf3e0f9572427e1e)), closes [#6158](https://github.com/invertase/react-native-firebase/issues/6158)

## [14.9.3](https://github.com/invertase/react-native-firebase/compare/v14.9.2...v14.9.3) (2022-05-10)

### Bug Fixes

- **firestore, android:** temporarily use newer-than-bom firestore ([4e9ff20](https://github.com/invertase/react-native-firebase/commit/4e9ff20285891cdaa8645c5848dfe6511fe637c4)), closes [#6158](https://github.com/invertase/react-native-firebase/issues/6158)

## [14.9.2](https://github.com/invertase/react-native-firebase/compare/v14.9.1...v14.9.2) (2022-05-10)

### Bug Fixes

- **ios, app:** macOS 12.3 removed python, use python3 ([1f609d3](https://github.com/invertase/react-native-firebase/commit/1f609d379117532d014bc44735827d38d79a36e9)), closes [#6226](https://github.com/invertase/react-native-firebase/issues/6226) [#6203](https://github.com/invertase/react-native-firebase/issues/6203)

## [14.9.1](https://github.com/invertase/react-native-firebase/compare/v14.9.0...v14.9.1) (2022-04-28)

### Bug Fixes

- **ios, expo:** add Expo plugin objcpp / Expo 45 compatibility ([#6223](https://github.com/invertase/react-native-firebase/issues/6223)) ([9de82d3](https://github.com/invertase/react-native-firebase/commit/9de82d356862d7dc359d90b4cd1643724de3a862))

# [14.9.0](https://github.com/invertase/react-native-firebase/compare/v14.8.1...v14.9.0) (2022-04-27)

### Features

- **firestore:** named query and data bundle APIs ([#6199](https://github.com/invertase/react-native-firebase/issues/6199)) ([96591e0](https://github.com/invertase/react-native-firebase/commit/96591e0dac957383c503e94fbf7bf0379d5569f2))

## [14.8.1](https://github.com/invertase/react-native-firebase/compare/v14.8.0...v14.8.1) (2022-04-25)

### Bug Fixes

- **app, expo:** Support RN 0.68 Obj-C++ AppDelegate ([#6213](https://github.com/invertase/react-native-firebase/issues/6213)) ([6f2d7e1](https://github.com/invertase/react-native-firebase/commit/6f2d7e1608d04613b77461f9647802aa1058e6cc))

# [14.8.0](https://github.com/invertase/react-native-firebase/compare/v14.7.0...v14.8.0) (2022-04-19)

### Features

- **ios, sdk:** bump firebase-ios-sdk to 8.15.0 ([377b465](https://github.com/invertase/react-native-firebase/commit/377b465bd5ac93d18f5d3792d3c0eb2ef80c8d7e))

# [14.7.0](https://github.com/invertase/react-native-firebase/compare/v14.6.0...v14.7.0) (2022-03-23)

### Features

- **ios, sdk:** bump to firebase-ios-sdk 8.14.0 ([ba1ddb5](https://github.com/invertase/react-native-firebase/commit/ba1ddb5927f12f5f0abe8a4b23b3fd68fa8626bd))

# [14.6.0](https://github.com/invertase/react-native-firebase/compare/v14.5.1...v14.6.0) (2022-03-23)

### Bug Fixes

- **auth:** allow emulator hostnames to contain hyphens ([#6141](https://github.com/invertase/react-native-firebase/issues/6141)) ([98eb1ce](https://github.com/invertase/react-native-firebase/commit/98eb1ce3663bb0c0c507f7e8129ad094a53898b5))
- **ios, expo:** use modern import style, required by Expo 44+ ([4060827](https://github.com/invertase/react-native-firebase/commit/4060827c318db8dcc2791bfe6635902a9c4e33bb))
- **storage, ios:** fix build failure for catalyst compiles ([a6dd0cd](https://github.com/invertase/react-native-firebase/commit/a6dd0cdef3bb66701fec883d163d20f14d384f10))

### Features

- **sdks:** firebase-ios-sdk 8.13.0 ([95da53e](https://github.com/invertase/react-native-firebase/commit/95da53ef6cdd1b67ade4a53dbd8164bd906b9d53))

## [14.5.1](https://github.com/invertase/react-native-firebase/compare/v14.5.0...v14.5.1) (2022-03-05)

### Bug Fixes

- **analytics, ios:** handle RNFirebaseAnalyticsWithoutAdIdSupport == false Podfile case correctly ([#6078](https://github.com/invertase/react-native-firebase/issues/6078)) ([ca82e54](https://github.com/invertase/react-native-firebase/commit/ca82e544255f122478c1de5945138a60118e90d0))

# [14.5.0](https://github.com/invertase/react-native-firebase/compare/v14.4.0...v14.5.0) (2022-02-15)

### Features

- **auth, ios:** Add support for Facebook Limited Login ([#6073](https://github.com/invertase/react-native-firebase/issues/6073)) ([f681cc5](https://github.com/invertase/react-native-firebase/commit/f681cc5a5b493033faef1f6ea64d9f5a40e6d9d4))

# [14.4.0](https://github.com/invertase/react-native-firebase/compare/v14.3.3...v14.4.0) (2022-02-13)

### Features

- **auth, android:** implement disable app verification feature on android ([#6069](https://github.com/invertase/react-native-firebase/issues/6069)) ([48c7842](https://github.com/invertase/react-native-firebase/commit/48c7842124f901aeda991da3122016fd3fb42e03))

## [14.3.3](https://github.com/invertase/react-native-firebase/compare/v14.3.2...v14.3.3) (2022-02-12)

### Bug Fixes

- **android, sdk:** bump firebase-android-sdk to 29.1.0 ([292c424](https://github.com/invertase/react-native-firebase/commit/292c4240bb6220beddbbdb0db7e6700ddd41a24f))

## [14.3.2](https://github.com/invertase/react-native-firebase/compare/v14.3.1...v14.3.2) (2022-02-10)

### Bug Fixes

- **app, ios:** use NSInteger not NSInteger\* for prefs ([0148901](https://github.com/invertase/react-native-firebase/commit/01489010c920fc8e367a04f9decb8a8c94c5d8c1))
- **functions, emulator:** add useEmulator, deprecate useFunctionsEmulator ([83b46e7](https://github.com/invertase/react-native-firebase/commit/83b46e7f51c67602c95806119257588efe090b35))
- **ios, sdk:** bump to firebase-ios-sdk 8.12.1 ([da6cf01](https://github.com/invertase/react-native-firebase/commit/da6cf013815c5f8f43e4c03e721f3c270a5834e2))

## [14.3.1](https://github.com/invertase/react-native-firebase/compare/v14.3.0...v14.3.1) (2022-02-07)

### Bug Fixes

- **app-check, activate:** correctly check activate parameters ([a583494](https://github.com/invertase/react-native-firebase/commit/a583494d645fe74b043b0dedcf5f2e334e020edf)), closes [#5981](https://github.com/invertase/react-native-firebase/issues/5981)
- **app-check, activate:** return Promise(void) on ios not void ([0f23441](https://github.com/invertase/react-native-firebase/commit/0f234413542907cd29fb72ccaf6138ff15844443)), closes [#6052](https://github.com/invertase/react-native-firebase/issues/6052)
- **app:** specify hyphenated package name in import advice ([5e898ec](https://github.com/invertase/react-native-firebase/commit/5e898ecb49bb73999c7ea5172f8f17753a71a90a)), closes [#6009](https://github.com/invertase/react-native-firebase/issues/6009)

# [14.3.0](https://github.com/invertase/react-native-firebase/compare/v14.2.4...v14.3.0) (2022-01-26)

### Bug Fixes

- **messaging:** add missing PRIORITY_MIN value in JS to match TS ([#6033](https://github.com/invertase/react-native-firebase/issues/6033)) ([d34112a](https://github.com/invertase/react-native-firebase/commit/d34112aa91b18d1d105adaf52eb98bb197cffaa6))

### Features

- **app-check:** android debug token argument for app-check ([#6026](https://github.com/invertase/react-native-firebase/issues/6026)) ([6f67503](https://github.com/invertase/react-native-firebase/commit/6f6750309cc6b275772cb9c1bac7e67c2eb7d4ba))

## [14.2.4](https://github.com/invertase/react-native-firebase/compare/v14.2.3...v14.2.4) (2022-01-24)

### Bug Fixes

- **android, sdk:** bump firebase-android-sdk + versions in docs ([8bda4be](https://github.com/invertase/react-native-firebase/commit/8bda4be52bd4b19b2d330c8f95d132d7a5b5885a))

## [14.2.3](https://github.com/invertase/react-native-firebase/compare/v14.2.2...v14.2.3) (2022-01-20)

### Bug Fixes

- **analytics, ios:** Convert NSNull values to nil in order to correctly remove user properties ([dbc79c3](https://github.com/invertase/react-native-firebase/commit/dbc79c31810bf9bea4c3a782432c9b5625ad3d5f)), closes [#4931](https://github.com/invertase/react-native-firebase/issues/4931)
- **ios, sdk:** bump firebase-ios-sdk to 8.11.0 ([40322e2](https://github.com/invertase/react-native-firebase/commit/40322e2d97719d4e32146beb30ad561ea86ea3e8))

## [14.2.2](https://github.com/invertase/react-native-firebase/compare/v14.2.1...v14.2.2) (2022-01-06)

### Bug Fixes

- **app, android:** minSdk should be 19 to match firebase-android-sdk ([#5984](https://github.com/invertase/react-native-firebase/issues/5984)) ([8015779](https://github.com/invertase/react-native-firebase/commit/8015779035835e03746754a1f28b16bd83407376))
- **ios, messaging:** add ios version guard for `UNAuthorizationOptionProvidesAppNotificationSettings` ([#5986](https://github.com/invertase/react-native-firebase/issues/5986)) ([e8922c0](https://github.com/invertase/react-native-firebase/commit/e8922c0a98eb62c52bd25e84a10d30cd93c89db0))
- **ios, messaging:** serialize google.c.sender.id to message.from ([d3621eb](https://github.com/invertase/react-native-firebase/commit/d3621ebee9a081c7f7c11c1d4bf8cf8f43e6182b))

## [14.2.1](https://github.com/invertase/react-native-firebase/compare/v14.2.0...v14.2.1) (2021-12-31)

### Bug Fixes

- **app-check:** getToken returns `{token: string}` not `string` matching firebase-js-sdk ([#5979](https://github.com/invertase/react-native-firebase/issues/5979)) ([6a089f3](https://github.com/invertase/react-native-firebase/commit/6a089f310b0ce6170b1d02fe57a4feb3c114e8c6))

**THIS IS A BREAKING CHANGE FOR APP CHECK RETURN VALUES** Please note that AppCheck is still a beta product thus it does not currently get a semantic versioning guarantee but, handling the change is easy - if you access the token via this API, you will now get an object and need to get the token property from inside it, vs the token coming back directly.

# [14.2.0](https://github.com/invertase/react-native-firebase/compare/v14.1.0...v14.2.0) (2021-12-31)

### Bug Fixes

- **analytics:** correct native types for extend_session parameter ([#5973](https://github.com/invertase/react-native-firebase/issues/5973)) ([23fdf61](https://github.com/invertase/react-native-firebase/commit/23fdf61a613c6cde6d5f3c807a7b13274fa3ab5a))

### Features

- **messaging, ios:** add provideAppNotificationSettings iOS permission / handler ([#5972](https://github.com/invertase/react-native-firebase/issues/5972)) ([59cbe9f](https://github.com/invertase/react-native-firebase/commit/59cbe9f0feab5e70104725c2a764f4b6e3ec161c))

# [14.1.0](https://github.com/invertase/react-native-firebase/compare/v14.0.1...v14.1.0) (2021-12-18)

### Bug Fixes

- **app, android:** firebase-android-sdk 29.0.3 to fix underlying NPE in 29.0.2 ([#5946](https://github.com/invertase/react-native-firebase/issues/5946)) ([051f4a6](https://github.com/invertase/react-native-firebase/commit/051f4a66d64db42f1c615580e185eaf00660fbc1))
- **crashlytics, ios:** alter header import style for Expo SDK 44 compat ([#5947](https://github.com/invertase/react-native-firebase/issues/5947)) ([e45f37c](https://github.com/invertase/react-native-firebase/commit/e45f37cf76eba80f5fd537b6b7806c79f7052a74))

### Features

- **analytics, config:** expose automatic screenview reporting toggle ([#5948](https://github.com/invertase/react-native-firebase/issues/5948)) ([8836c01](https://github.com/invertase/react-native-firebase/commit/8836c01dcfa2f478f973a1a54253509c3368d963))

## [14.0.1](https://github.com/invertase/react-native-firebase/compare/v14.0.0...v14.0.1) (2021-12-15)

### Bug Fixes

- **app, expo:** Update AppDelegate config plugin for Expo SDK 44 ([#5940](https://github.com/invertase/react-native-firebase/issues/5940)) ([185756d](https://github.com/invertase/react-native-firebase/commit/185756df6de238aa8a018007cf6b2fa810cb6055))
- **auth, phone:** call verifyPhoneNumber callbacks correctly ([7c082be](https://github.com/invertase/react-native-firebase/commit/7c082bedd58a868ddcd44c1d2b6d1900e43b012c))

# [14.0.0](https://github.com/invertase/react-native-firebase/compare/v13.1.1...v14.0.0) (2021-12-14)

- fix(firestore)!: fix Long/Double conversion issues #3004 (#5840) ([910d4e4](https://github.com/invertase/react-native-firebase/commit/910d4e420b62b5bcc67bbb1b77b9485ae2662119)), closes [#3004](https://github.com/invertase/react-native-firebase/issues/3004) [#5840](https://github.com/invertase/react-native-firebase/issues/5840) [#3004](https://github.com/invertase/react-native-firebase/issues/3004)

### BREAKING CHANGES

- Previous versions of firestore here incorrectly saved integers as doubles on iOS, so they did not show up in `where`/`in` queries. You had to save numbers as strings if you wanted `where`/`in` queries to work cross-platform. Number types will now be handled correctly. However, If you have integers saved (incorrectly!) as double (from previous versions) and you use where / in style queries on numbers, then the same document will no longer be found via .where. Mitigation could be to go through your whole DB and load and re-save the integers correctly, or alter queries. Please test your where / in queries that use number types if this affects you.

## [13.1.1](https://github.com/invertase/react-native-firebase/compare/v13.1.0...v13.1.1) (2021-12-14)

### Bug Fixes

- **deps:** AGP7.0.4, firebase-android-sdk 29.0.2, javascript deps ([55d0a36](https://github.com/invertase/react-native-firebase/commit/55d0a36a0addc54e347f26bb8ee88bb38b0fa4a6))
- **firestore, types:** allow FieldValues, Date and Timestamp in doc set and update ([#5901](https://github.com/invertase/react-native-firebase/issues/5901)) ([5f4eadf](https://github.com/invertase/react-native-firebase/commit/5f4eadf94c9f208ba2af2e6061859f2f70955d3a))
- **messaging, ios:** native.getInitialNotification can be undefined ([#5926](https://github.com/invertase/react-native-firebase/issues/5926)) ([f0318d2](https://github.com/invertase/react-native-firebase/commit/f0318d2465f24369479a92e5501e9e6078445458))

# [13.1.0](https://github.com/invertase/react-native-firebase/compare/v13.0.1...v13.1.0) (2021-12-02)

### Bug Fixes

- **remote-config, getAll:** init with empty config ([232d860](https://github.com/invertase/react-native-firebase/commit/232d860831dd39b728e3a01471ec30e0c2701c5c)), closes [#5854](https://github.com/invertase/react-native-firebase/issues/5854)

### Features

- **android, emulator:** add firebase.json config element to bypass localhost remap ([#5852](https://github.com/invertase/react-native-firebase/issues/5852)) ([ddf3f5f](https://github.com/invertase/react-native-firebase/commit/ddf3f5f43d2c8547879934c3169d3e01c0db44c0))
- **sdks:** firebase-ios-sdk 8.10.0 / firebase-android-sdk 29.0.1 ([f6949c9](https://github.com/invertase/react-native-firebase/commit/f6949c9f3669df6d8b3f78bbee97bee2f36b7df3))

## [13.0.1](https://github.com/invertase/react-native-firebase/compare/v13.0.0...v13.0.1) (2021-11-05)

### Bug Fixes

- **ios, sdks:** bump firebase-ios-sdk to 8.9.1 ([4871131](https://github.com/invertase/react-native-firebase/commit/4871131c3587e138398719ef5537731ee4fbe90a))

# [13.0.0](https://github.com/invertase/react-native-firebase/compare/v12.9.3...v13.0.0) (2021-10-31)

### Bug Fixes

- **analytics:** allow custom event parameters for screen_view events ([#5811](https://github.com/invertase/react-native-firebase/issues/5811)) ([02e888e](https://github.com/invertase/react-native-firebase/commit/02e888e782f2b0243f0324f63018ea8b27a68abc)), closes [#4594](https://github.com/invertase/react-native-firebase/issues/4594)
- **dynamic-links, android:** avoid double-consuming WritableMap ([514e6bd](https://github.com/invertase/react-native-firebase/commit/514e6bd51e7624a6403dda706f4e5b65cee63422)), closes [#5812](https://github.com/invertase/react-native-firebase/issues/5812)
- rename default branch to main ([25e1d3d](https://github.com/invertase/react-native-firebase/commit/25e1d3d5a1a8311588938dc9d8fdf71d11cd9963))

- feat(sdks, android)!: firebase-android-sdk v29 / minSdkVersion API19 / target+compile API31 (#5825) ([f60afe1](https://github.com/invertase/react-native-firebase/commit/f60afe158b2dc823bd7169e36c3e428470576c7e)), closes [#5825](https://github.com/invertase/react-native-firebase/issues/5825)
- fix(analytics)!: add missing reserved event names (#5630) ([2c1958e](https://github.com/invertase/react-native-firebase/commit/2c1958e7eec13afe47d7d46a4bf003258e4c0c26)), closes [#5630](https://github.com/invertase/react-native-firebase/issues/5630)

### Features

- **ios, sdks:** bump firebase-ios-sdk to 8.9.0 ([bb9ba50](https://github.com/invertase/react-native-firebase/commit/bb9ba50ff4df82980943c0a76069d432e5371ed6))

### BREAKING CHANGES

- firebase-android-sdk 29 requires android/build.gradle minSdkVersion 19 (as required in react-native 0.64+)
- some reserved words that were accepted before will throw exceptions now that the list is complete - do not use reserved words for analytics events

## [12.9.3](https://github.com/invertase/react-native-firebase/compare/v12.9.2...v12.9.3) (2021-10-22)

### Bug Fixes

- **app, ios-config:** use fully-specified path for /usr/bin/head ([5baaf13](https://github.com/invertase/react-native-firebase/commit/5baaf136ce291b0ec703a9ecd3e5e907a37c3040)), closes [#5801](https://github.com/invertase/react-native-firebase/issues/5801)

## [12.9.2](https://github.com/invertase/react-native-firebase/compare/v12.9.1...v12.9.2) (2021-10-17)

### Bug Fixes

- **app, expo:** update iOS `AppDelegate` plugin to work with Expo SDK 43 ([#5796](https://github.com/invertase/react-native-firebase/issues/5796)) ([d67c3b9](https://github.com/invertase/react-native-firebase/commit/d67c3b906d1bb6d858269efba8b597891faf8772))
- **release:** use https for npm registry url ([6fdca25](https://github.com/invertase/react-native-firebase/commit/6fdca258a2b1849ad92c2a0c3669b37c705ab4e3))

## [12.9.1](https://github.com/invertase/react-native-firebase/compare/v12.9.0...v12.9.1) (2021-10-10)

### Bug Fixes

- **app, sdks:** bump firebase-android-sdk to 28.4.2 ([e33c0ac](https://github.com/invertase/react-native-firebase/commit/e33c0ac2603c4f99e627c93456081ea693a8f0c6))

# [12.9.0](https://github.com/invertase/react-native-firebase/compare/v12.8.0...v12.9.0) (2021-10-03)

### Bug Fixes

- **ios, app:** minimum cocoapods version is 1.10.2, not just 1.10.0 ([914e447](https://github.com/invertase/react-native-firebase/commit/914e447173356ee861858b766020899bd33438d5))

### Features

- **sdk:** bump firebase-ios-sdk to 8.8.0 ([c56bdb3](https://github.com/invertase/react-native-firebase/commit/c56bdb3171e998efa1b7860519a06a5fb3515ac2))

# [12.8.0](https://github.com/invertase/react-native-firebase/compare/v12.7.5...v12.8.0) (2021-09-14)

### Features

- **sdk:** firebase-ios-sdk to 8.7.0 / firebase-android-sdk 28.4.1 ([ee79ab3](https://github.com/invertase/react-native-firebase/commit/ee79ab334335767e0b1603190ad0ceda890e0c10))

## [12.7.5](https://github.com/invertase/react-native-firebase/compare/v12.7.4...v12.7.5) (2021-09-04)

### Bug Fixes

- **analytics:** allow more than 25 event parameters ([5dde564](https://github.com/invertase/react-native-firebase/commit/5dde56414caf3b79a5b6c4b1c61485789d7b564b))
- **app, ios:** correct path to 'Info.plist' for ios build dependency ([#5677](https://github.com/invertase/react-native-firebase/issues/5677)) ([ea6920c](https://github.com/invertase/react-native-firebase/commit/ea6920c3e900d76cce254a8da1704f50f3f2bc9a)), closes [#5152](https://github.com/invertase/react-native-firebase/issues/5152) [#5153](https://github.com/invertase/react-native-firebase/issues/5153)
- **auth, android:** linkWithCredential will not attempt to upgrade from anon user (matches iOS) ([#5694](https://github.com/invertase/react-native-firebase/issues/5694)) ([7cd1716](https://github.com/invertase/react-native-firebase/commit/7cd1716c0adef0f390b34409e737ac14da8120a8)), closes [#4487](https://github.com/invertase/react-native-firebase/issues/4487) [#4552](https://github.com/invertase/react-native-firebase/issues/4552)

## [12.7.4](https://github.com/invertase/react-native-firebase/compare/v12.7.3...v12.7.4) (2021-08-31)

### Bug Fixes

- **app-distribution, ios:** avoid crash when releaseNotes is nil ([#5667](https://github.com/invertase/react-native-firebase/issues/5667)) ([41c0107](https://github.com/invertase/react-native-firebase/commit/41c0107dfcefb6989de08d534e5a8099482a420a))
- **app-distribution, ios:** correct downloadURL usage for JS serialization ([#5668](https://github.com/invertase/react-native-firebase/issues/5668)) ([66d991c](https://github.com/invertase/react-native-firebase/commit/66d991ca4bb034d6a6a56028668be6eb002d4345))
- **dynamic-links, android:** check for null currentIntent in getInitialLink to avoid crash ([#5662](https://github.com/invertase/react-native-firebase/issues/5662)) ([415c200](https://github.com/invertase/react-native-firebase/commit/415c200f0d0b0b9f7c6f8fffcb62d79b0973ba6f))

## [12.7.3](https://github.com/invertase/react-native-firebase/compare/v12.7.2...v12.7.3) (2021-08-24)

### Bug Fixes

- **messaging, ios): revert "fix(messaging, ios:** only call onMessage handler if message is data-only or undelivered" ([#5641](https://github.com/invertase/react-native-firebase/issues/5641)) ([f2162b7](https://github.com/invertase/react-native-firebase/commit/f2162b74e06b9f1163937e4cfd3671012c5e902d))

## [12.7.2](https://github.com/invertase/react-native-firebase/compare/v12.7.1...v12.7.2) (2021-08-21)

### Bug Fixes

- **app-check, ios:** use RNFBAppCheck everywhere vs RNFBAppcheck ([2545349](https://github.com/invertase/react-native-firebase/commit/2545349177aac2fe99418c76ecd5901b5719b819))
- **app-distribution, android:** export methods so module loads ([bc0ae4f](https://github.com/invertase/react-native-firebase/commit/bc0ae4f307d1e6e60bfdf871f85dd3fc796ad8c8))

## [12.7.1](https://github.com/invertase/react-native-firebase/compare/v12.7.0...v12.7.1) (2021-08-20)

### Bug Fixes

- **app, android:** react-native 0.65 compatibility ([262452d](https://github.com/invertase/react-native-firebase/commit/262452d69c2dadd79475235fca42c12b18b2e208))

# [12.7.0](https://github.com/invertase/react-native-firebase/compare/v12.6.1...v12.7.0) (2021-08-19)

### Bug Fixes

- **app-check, android:** include all referenced dependencies correctly ([af336a3](https://github.com/invertase/react-native-firebase/commit/af336a3310d2653fe70879cd0729fba3469b15de))
- **app-check:** getToken(false) fix, listener unsubscribe is a function ([8b42e20](https://github.com/invertase/react-native-firebase/commit/8b42e20a334b2fd934267be1b81bfab0fd8192cb))
- **installations, types:** fixup installations module types ([781a303](https://github.com/invertase/react-native-firebase/commit/781a30306dd6c704facd08df396dc5a36c369af7))
- onMessage to only trigger for data-only or undelivered messages ([a31643b](https://github.com/invertase/react-native-firebase/commit/a31643ba1712cafc2af4291dc3b5f1a61a7373ad))

### Features

- **app-distribution:** Implement Firebase App Distribution module ([8fa1263](https://github.com/invertase/react-native-firebase/commit/8fa1263bc657b7d1d0630bc193097cb5d4aa631a))
- **app, config:** implement setLogLevel API ([cac7be3](https://github.com/invertase/react-native-firebase/commit/cac7be33ca70b37103ba8635ed64e755e0728c9d))
- **app, ios:** adopt firebase-ios-sdk 8.6.0 ([22d79f1](https://github.com/invertase/react-native-firebase/commit/22d79f136363f2ba67e9a0920c69a71fdffdb444))
- **firestore, emulator:** implement easier useEmulator API ([f039196](https://github.com/invertase/react-native-firebase/commit/f0391966c34ff845120ac8f45c8a8cc4b4f68885))
- **installations:** implement Firebase Installations module ([3ef3410](https://github.com/invertase/react-native-firebase/commit/3ef3410e265515c8fd3653728727a0048ffdbd87))

## [12.6.1](https://github.com/invertase/react-native-firebase/compare/v12.6.0...v12.6.1) (2021-08-17)

### Bug Fixes

- **crashlytics, config:** handle new app_data_collection_default_enabled key ([81aa17f](https://github.com/invertase/react-native-firebase/commit/81aa17f1b60a6171329d9a2f250226010dfc081e))

# [12.6.0](https://github.com/invertase/react-native-firebase/compare/v12.5.0...v12.6.0) (2021-08-16)

### Bug Fixes

- **app-check, ios:** allow token auto refresh config in firebase.json ([b9670c1](https://github.com/invertase/react-native-firebase/commit/b9670c1194e5460fbfcc0d90b462062eaed8538b))
- **app, android:** put app init provider / registrar in correct manifest ([8408160](https://github.com/invertase/react-native-firebase/commit/8408160d93be7f9a29f4aea9df3799aafdf6f69e))
- **app, expo:** node 12 compatibility with `fs.promises` in ios plugin ([#5591](https://github.com/invertase/react-native-firebase/issues/5591)) ([97f9090](https://github.com/invertase/react-native-firebase/commit/97f90900ec9b983bdd2cf640fcda5c3435aa1abe))
- **in-app-messaging, config:** implement in_app_messaging_auto_collection_enabled firebase.json setting ([9d11ce9](https://github.com/invertase/react-native-firebase/commit/9d11ce93b81fe7818cb264bac1b36c60daac3463))
- **messaging, ios:** return after resolving to avoid useless work ([491436f](https://github.com/invertase/react-native-firebase/commit/491436fe31cc4c0b8fafc3af91a62d581bc495a0))
- **sdks, android:** firebase-android-sdk 28.3.1, google-services plugin 4.3.10 ([4562cd8](https://github.com/invertase/react-native-firebase/commit/4562cd8ccb70c3f964e9c038d2eca6eb87bcba60))

### Features

- **analytics, config:** expose all the native data collection toggles ([f5eaffb](https://github.com/invertase/react-native-firebase/commit/f5eaffbfaf7e165b205692dd5b1b16e87b09d5a2))
- **app, config:** implement app_data_collection_default_enabled firebase.json key ([1e47d45](https://github.com/invertase/react-native-firebase/commit/1e47d455aa3a99b4ad6e08caf491be3df63a7f55))
- **dynamic-links:** add support for utmParameters ([#5593](https://github.com/invertase/react-native-firebase/issues/5593)) ([3002caf](https://github.com/invertase/react-native-firebase/commit/3002caf4672e1df039a089b9109e444f8d8caf00))
- **perf, config:** expose perf module deactivate toggle ([4e25bf6](https://github.com/invertase/react-native-firebase/commit/4e25bf63237f42b98ae5cd2ef424408299992c03))

# [12.5.0](https://github.com/invertase/react-native-firebase/compare/v12.4.0...v12.5.0) (2021-08-12)

### Bug Fixes

- **app, expo:** Use `fs/promises` in Node 12 compatible way ([#5585](https://github.com/invertase/react-native-firebase/issues/5585)) ([64f569a](https://github.com/invertase/react-native-firebase/commit/64f569acd2cea284baa305451df9533f138539e7))
- **database, android:** remove System.err statement from useEmulator development ([dc84872](https://github.com/invertase/react-native-firebase/commit/dc84872017082e49209376d4c9e675cf5c5572ec))
- **expo:** do not publish plugin tests and sources ([#5565](https://github.com/invertase/react-native-firebase/issues/5565)) ([6b5dca5](https://github.com/invertase/react-native-firebase/commit/6b5dca500ea413ee68acf8abc74e579f4298cbad))

### Features

- **app-check:** implement AppCheck module ([8cd4fa3](https://github.com/invertase/react-native-firebase/commit/8cd4fa33d8df8fc72f2484665423986d12fc65fa))
- **firestore:** serverTimestampBehavior ([#5556](https://github.com/invertase/react-native-firebase/issues/5556)) ([60fe72e](https://github.com/invertase/react-native-firebase/commit/60fe72ebcc21daf6da5f8478c0a758483b28e5f6))
- **ios, sdks:** bump firebase-ios-sdk to 8.5.0 ([d4b2015](https://github.com/invertase/react-native-firebase/commit/d4b2015f8def4759b95072cd4bca86eda0443c54))

# [12.4.0](https://github.com/invertase/react-native-firebase/compare/v12.3.0...v12.4.0) (2021-07-29)

### Features

- **sdks, android:** use firebase-android-sdk 28.3.0, play-services-auth 19.2.0 ([#5555](https://github.com/invertase/react-native-firebase/issues/5555)) ([edcd4e2](https://github.com/invertase/react-native-firebase/commit/edcd4e2244ffcf4734648b402d5714e41c4d3539))
- Add Expo config plugin ([#5480](https://github.com/invertase/react-native-firebase/issues/5480)) ([832057c](https://github.com/invertase/react-native-firebase/commit/832057cfbdf1778ad2141a1ad4466d2e8c24b8ce))

### Performance Improvements

- **messaging, ios:** Improve time to delivery of background messages on iOS ([#5547](https://github.com/invertase/react-native-firebase/issues/5547)) ([f4168b1](https://github.com/invertase/react-native-firebase/commit/f4168b154d6194cbc87e03d91787e59c8d97ea10))

# [12.3.0](https://github.com/invertase/react-native-firebase/compare/v12.2.0...v12.3.0) (2021-07-21)

### Bug Fixes

- **firestore:** accept nested undefined array values ([224383f](https://github.com/invertase/react-native-firebase/commit/224383f4ecdebab67bb91aac2b4a5b85c4931c04)), closes [#5437](https://github.com/invertase/react-native-firebase/issues/5437)

### Features

- **ios:** bump firebase-ios-sdk dependency to 8.4.0 ([7a75cb9](https://github.com/invertase/react-native-firebase/commit/7a75cb94eb0ee2196895dd9216ef566b059d4822))

# [12.2.0](https://github.com/invertase/react-native-firebase/compare/v12.1.0...v12.2.0) (2021-07-16)

### Bug Fixes

- **database:** call cancellation callback when using ref.on ([#5371](https://github.com/invertase/react-native-firebase/issues/5371)) ([26b59db](https://github.com/invertase/react-native-firebase/commit/26b59dbe06bedc64ed83923ecf132b47fe0eb05b))
- **messaging:** Refactor code to avoid bugs ([5039759](https://github.com/invertase/react-native-firebase/commit/503975909383582d8850470455eeef8f18194ba8))
- **storage, ios:** dont enumerate on dictionary being mutated ([#5455](https://github.com/invertase/react-native-firebase/issues/5455)) ([daaa72d](https://github.com/invertase/react-native-firebase/commit/daaa72d82df6b9e5e2c1247c10792d4b12683541))

### Features

- firebase-ios-sdk 8.3.0 / firebase-android-sdk 28.2.1 ([c73ea10](https://github.com/invertase/react-native-firebase/commit/c73ea103b1ae8b6171d8719b752459cecb9a9359))
- **app, sdks:** use firebase-ios-sdk 8.2.0 / firebase-android-sdk 28.2.0 ([0d26af9](https://github.com/invertase/react-native-firebase/commit/0d26af9638b15eb2220d12127b3626c899818ade))
- **crashlytics:** add helper methods for log and setCustomKey ([06d515c](https://github.com/invertase/react-native-firebase/commit/06d515cad533c76328e324f0e950a814881aab0d))

# [12.1.0](https://github.com/invertase/react-native-firebase/compare/v12.0.0...v12.1.0) (2021-06-11)

### Bug Fixes

- **auth, android:** remove browser dependency, upstream includes now ([3fef777](https://github.com/invertase/react-native-firebase/commit/3fef777f1e08c2dacfb21f4ef2c27b71e8b973f4)), closes [#4744](https://github.com/invertase/react-native-firebase/issues/4744)

### Features

- **app:** bump SDKs: firebase-android-sdk 28.1.0 / firebase-ios-sdk 8.1.1 ([d64e2e5](https://github.com/invertase/react-native-firebase/commit/d64e2e562051a3c3da39da32582ea835b2c7d928))

# [12.0.0](https://github.com/invertase/react-native-firebase/compare/v11.5.0...v12.0.0) (2021-05-19)

### Features

- **database:** add database.useEmulator() ([0632ca5](https://github.com/invertase/react-native-firebase/commit/0632ca596336b2b5738734ae614f6c50a5f6f577))
- **sdks:** firebase-ios-sdk 8.0.0 / firebase-android-sdk 28.0.1 ([d97587b](https://github.com/invertase/react-native-firebase/commit/d97587b33aa4c092a0d34291e24491ca66f9bcaa))
- **storage, emulator:** implement storage emulator ([1d3e946](https://github.com/invertase/react-native-firebase/commit/1d3e946a4131a9ceaf3e82aab7f1759ef5aa2cb4))
- **storage, md5hash:** allow md5hash to be set on upload ([be1bed8](https://github.com/invertase/react-native-firebase/commit/be1bed847ce4122a7b8ebf1c7f9ba6f2d6460a4c))

- chore(storage, android)!: remove EXTERNAL_STORAGE permissions for Android 10/11 compat ([69b6f88](https://github.com/invertase/react-native-firebase/commit/69b6f88f078facb07001a6fa8da04812c73077fb))
- feat(firestore)!: add support for ignoreUndefinedProperties ([756cfa6](https://github.com/invertase/react-native-firebase/commit/756cfa6bea645ac6c18ad25bbae9cac5a3f5e379))

### Bug Fixes

- **android:** correct lint issues for various API mis-use ([eb8d893](https://github.com/invertase/react-native-firebase/commit/eb8d89306fd569d7ef64298a99e970c653b79178)), closes [#3917](https://github.com/invertase/react-native-firebase/issues/3917)
- **storage, android:** correctly catch native exceptions for Promise.reject ([e938824](https://github.com/invertase/react-native-firebase/commit/e938824746cdd771807b5afebf709a2bfbdac6c7)), closes [#4097](https://github.com/invertase/react-native-firebase/issues/4097)

### BREAKING CHANGES

- Storage: if you need READ_EXTERNAL_STORAGE/WRITE_EXTERNAL_STORAGE permission add them in your app AndroidManifest.xml
- Firestore: undefined values throw like firebase-js-sdk now. Use ignoreUndefinedProperties setting 'true' to behave as before
- AdMob: Removed from upstream SDKs. Stay on v11.5.0 for now if you need AdMob. `@invertase/react-native-admob` package planned with v11.5.0 code
- ML: APIs removed from upstream SDKs. Migrate to cloud function / auth gateway to cloud APIs, as mentioned in links on ML usage document.
- Instance ID: APIs removed from upstream SDKs. Use Messaging's getToken() to get tokens, see [upstream documentation to migrate](https://firebase.google.com/docs/projects/manage-installations#fid-iid) if needed
- Messaging.getToken/deleteToken: scoped token APIs removed from upstream APIs. Remove scopes from API calls. deleteToken() should work on iOS now.

# [11.5.0](https://github.com/invertase/react-native-firebase/compare/v11.4.1...v11.5.0) (2021-05-12)

### Bug Fixes

- **admob:** mark BannerAd callbacks as optional ([9a5a21f](https://github.com/invertase/react-native-firebase/commit/9a5a21f972cd692b0f9049c8de131d6c2950fc82))
- **app, json-schema:** admob_delay_app_measurement_init type is boolean ([#5297](https://github.com/invertase/react-native-firebase/issues/5297)) ([d931b48](https://github.com/invertase/react-native-firebase/commit/d931b48f9e2a5caca47d354e26eaca2bd210dc8f)), closes [#5295](https://github.com/invertase/react-native-firebase/issues/5295)
- **firestore:** Incorrect error message for GeoPoint latitude out of range ([f9909fa](https://github.com/invertase/react-native-firebase/commit/f9909fae3a1b197c3cfc784913ad719f92f48bfc))
- **ios:** admob shows only non-personalized ads ([#5262](https://github.com/invertase/react-native-firebase/issues/5262)) ([0b62d5a](https://github.com/invertase/react-native-firebase/commit/0b62d5ac9a31f4d840c45ea41aeb89a7c2ecbaf3))
- **messaging, android:** avoid using rn61+ symbol ([4637332](https://github.com/invertase/react-native-firebase/commit/4637332bbdb857de650a604a138e2d5dd07be75f)), closes [#5236](https://github.com/invertase/react-native-firebase/issues/5236)

### Features

- **analytics:** Adding default event parameters ([#5246](https://github.com/invertase/react-native-firebase/issues/5246)) ([684bb50](https://github.com/invertase/react-native-firebase/commit/684bb50368cb797ae9fda8fb56df2e2376d59c30))

## [11.4.1](https://github.com/invertase/react-native-firebase/compare/v11.4.0...v11.4.1) (2021-04-29)

**Note:** Version bump only for package react-native-firebase

# [11.4.0](https://github.com/invertase/react-native-firebase/compare/v11.3.3...v11.4.0) (2021-04-29)

### Bug Fixes

- **analytics:** added missing price parameter to the Item structure ([#5232](https://github.com/invertase/react-native-firebase/issues/5232)) ([b972cb6](https://github.com/invertase/react-native-firebase/commit/b972cb6c835288b8bd882f84222f1c3accf1afdc))
- **analytics:** import using package name not relative path ([#5229](https://github.com/invertase/react-native-firebase/issues/5229)) ([99f8d2c](https://github.com/invertase/react-native-firebase/commit/99f8d2c912d9fe63fc6243bc0b5d43b6813a2fe5))
- **app, android:** correct TaskExecutor shutdown error ([a7729a5](https://github.com/invertase/react-native-firebase/commit/a7729a5dfac1f70b3a442452a99da9977d89d9e3)), closes [#5225](https://github.com/invertase/react-native-firebase/issues/5225)
- **database, update:** allow empty objects in ref.update() ([574f691](https://github.com/invertase/react-native-firebase/commit/574f6918d87125d5ba863a6a2cc24f8a78cf0040)), closes [#5218](https://github.com/invertase/react-native-firebase/issues/5218)
- **messaging, android:** repair crash handling remote notifications ([6a30d4b](https://github.com/invertase/react-native-firebase/commit/6a30d4b4798c0ff9f0d5e406d4da5fb47e313069)) **BREAKING WARNING - this accidentally requires minimum react-native 0.61**

### Features

- **analytics, appInstanceId:** implement getAppIntanceId() method for GA4 use ([#5210](https://github.com/invertase/react-native-firebase/issues/5210)) ([a51e97b](https://github.com/invertase/react-native-firebase/commit/a51e97b208e32cca00f36d14187ac6ba5378e3cd))
- **analytics, ATT:** allow use of AnalyticsWithoutAdIdSupport pod ([da6b811](https://github.com/invertase/react-native-firebase/commit/da6b811e15b480ad55c1e804da40387ecfdef3ee))
- **app, android:** support list of Activities to ignore when detecting AppState ([#5235](https://github.com/invertase/react-native-firebase/issues/5235)) ([50a384f](https://github.com/invertase/react-native-firebase/commit/50a384f2a2ba61d078521e89594f4e576f1e1f46))
- **app, firebase-ios-sdk:** move to version 7.11.0 ([f25d25d](https://github.com/invertase/react-native-firebase/commit/f25d25d36d2df204f58f69700509a1ccb23784a9))

### BREAKING - ACCIDENTAL

- **messaging, android:** repair crash handling remote notifications ([6a30d4b](https://github.com/invertase/react-native-firebase/commit/6a30d4b4798c0ff9f0d5e406d4da5fb47e313069)) **BREAKING WARNING - this accidentally requires minimum react-native 0.61 - we may issue a 11.4.x release that reverts but please be careful**

## [11.3.3](https://github.com/invertase/react-native-firebase/compare/v11.3.2...v11.3.3) (2021-04-24)

### Bug Fixes

- **app, android:** avoid API24-only APIs, fix Android < 7 crash from 11.3.0 ([#5206](https://github.com/invertase/react-native-firebase/issues/5206)) ([49c15f8](https://github.com/invertase/react-native-firebase/commit/49c15f81c9cb51fef5cf6f8140d13f12911670eb))

## [11.3.2](https://github.com/invertase/react-native-firebase/compare/v11.3.1...v11.3.2) (2021-04-19)

### Bug Fixes

- **all, android:** purge jcenter() from android build ([2c6a6a8](https://github.com/invertase/react-native-firebase/commit/2c6a6a82ec363fd948ea880fd397acb886c97453))
- **messaging:** Missing notification on restart ([#5181](https://github.com/invertase/react-native-firebase/issues/5181)) ([ea6e138](https://github.com/invertase/react-native-firebase/commit/ea6e138121fff4d4d8d73d9ca1f6b8be8bed79c1))

## [11.3.1](https://github.com/invertase/react-native-firebase/compare/v11.3.0...v11.3.1) (2021-04-18)

### Bug Fixes

- **admob, android:** force admob dependency to compatible v19 ([19fe6df](https://github.com/invertase/react-native-firebase/commit/19fe6df6c17efa6df1770a553891f784cc3ae250))

# [11.3.0](https://github.com/invertase/react-native-firebase/compare/v11.2.0...v11.3.0) (2021-04-16)

### Bug Fixes

- **admob, ios:** bump PersonalizedAdConsent to 1.0.5 ([3df9164](https://github.com/invertase/react-native-firebase/commit/3df9164da536c04e5e7d2bcc3efb9de38ba221f3))
- **android, utils:** fix rare crash getting documents directory ([#5118](https://github.com/invertase/react-native-firebase/issues/5118)) ([f0a2957](https://github.com/invertase/react-native-firebase/commit/f0a29573e748035468f13f9c03c6cf3b9148dafe))
- **app, ios:** formally note cocoapods v1.10+ requirement in podspec ([3c90c59](https://github.com/invertase/react-native-firebase/commit/3c90c5931e9777eda1614ae1f443c6de79540f01))
- **app, ios-plist:** make sure Info.plist exists before processing ([245149c](https://github.com/invertase/react-native-firebase/commit/245149c635aeb9a02528a00f0a4451644e1fdf3a)), closes [#5152](https://github.com/invertase/react-native-firebase/issues/5152)
- **app, secondary:** reject if initializeApp fails on iOS ([d76eba3](https://github.com/invertase/react-native-firebase/commit/d76eba3a4d1c6ffddf6c38ae59c0b529dde106e9)), closes [#5134](https://github.com/invertase/react-native-firebase/issues/5134)
- **crashlytics, debug:** Disable Crashlytics in debug mode by default ([#5117](https://github.com/invertase/react-native-firebase/issues/5117)) ([eeeba2e](https://github.com/invertase/react-native-firebase/commit/eeeba2ed771b72a04dd9b2154c259a8648a21022))
- **crashlytics, ios:** register library with dynamic version string ([90bceb2](https://github.com/invertase/react-native-firebase/commit/90bceb292bfcbdf16517b654376d151c26e5432c))
- **crashlytics, ios:** warn if debugger will break crashlytics ([d6b6d23](https://github.com/invertase/react-native-firebase/commit/d6b6d231d4c4da68219e52fe8bc9e0220f73ef0c))
- **database, types:** harmonize database.on() w/firebase-js-sdk ([6aea33f](https://github.com/invertase/react-native-firebase/commit/6aea33f1d41412363e2bd5d50a920dfc669ed3a7)), closes [#4550](https://github.com/invertase/react-native-firebase/issues/4550)

### Features

- **crashlytics:** add configuration to exception handler chaining behavior ([4c640ff](https://github.com/invertase/react-native-firebase/commit/4c640ff52e1fb692bddcbeb76a2ff2a302e56334))
- **crashlytics:** flag fatal errors for crashlytics and analytics ([c94546d](https://github.com/invertase/react-native-firebase/commit/c94546d8127606dca5bfd09ef92ec32eec333f19))
- **ios, sdks:** bump firebase-ios-sdk to 7.10.0 ([d2838ff](https://github.com/invertase/react-native-firebase/commit/d2838ffeda34816219539fd1ac0c651b232e8a46))

### Performance Improvements

- increase task throughput in Android using thread pool executor ([#4981](https://github.com/invertase/react-native-firebase/issues/4981)) ([0e4e331](https://github.com/invertase/react-native-firebase/commit/0e4e3312315c020ecd760f8d3fea4f0347d2276b))

# [11.2.0](https://github.com/invertase/react-native-firebase/compare/v11.1.2...v11.2.0) (2021-03-26)

### Features

- **sdks:** firebase-ios-sdk 7.9.0 / firebase-android-sdk 26.8.0 ([324f8ff](https://github.com/invertase/react-native-firebase/commit/324f8ffa0baf759c000efa1f4a024e527eddf8d7))

## [11.1.2](https://github.com/invertase/react-native-firebase/compare/v11.1.1...v11.1.2) (2021-03-17)

### Bug Fixes

- **database, types:** harmonize on/once/off types with firebase-js-sdk ([fbc06ca](https://github.com/invertase/react-native-firebase/commit/fbc06cac888e13071c5f87c652aeff40c3b27412)), closes [#5027](https://github.com/invertase/react-native-firebase/issues/5027)
- **listeners:** port Emitter.once to analogous addListener/remove API (required for react-native 0.64) ([5eb2f59](https://github.com/invertase/react-native-firebase/commit/5eb2f599e93ccecd91c800018959f9dc370f1e24))

## [11.1.1](https://github.com/invertase/react-native-firebase/compare/v11.1.0...v11.1.1) (2021-03-16)

### Bug Fixes

- **app, firebase-ios-sdk:** bump to firebase-ios-sdk v7.8.1 for analytics fix ([8cd1d6e](https://github.com/invertase/react-native-firebase/commit/8cd1d6e77e124a0d21c64d146bfe62e351a754c7))

# [11.1.0](https://github.com/invertase/react-native-firebase/compare/v11.0.0...v11.1.0) (2021-03-13)

### Bug Fixes

- **app, android:** fixes possible crash on first launch ([#4990](https://github.com/invertase/react-native-firebase/issues/4990)) ([06eebad](https://github.com/invertase/react-native-firebase/commit/06eebada2c74c57504d8cc1cdfa446ee77d48fce)), closes [#4979](https://github.com/invertase/react-native-firebase/issues/4979)
- **app, types:** initializeApp returns Promise<FirebaseApp> ([f3b955c](https://github.com/invertase/react-native-firebase/commit/f3b955c0f4ea5e50920499c917576f587f149f93))
- **auth, ios:** fix compile error in setTenantId code ([311427e](https://github.com/invertase/react-native-firebase/commit/311427e026e892d2d24aca43967ce36e2fb8d834))
- **auth, useUserAccessGroup:** document auth/keychain-error, add test coverage ([60ec5f9](https://github.com/invertase/react-native-firebase/commit/60ec5f9f7261cf4f14feccc6e36813389e3a901f)), closes [#5007](https://github.com/invertase/react-native-firebase/issues/5007)

### Features

- **app, sdks:** firebase-ios-sdk v7.8.0 / firebase-android-sdk v26.7.0 ([d2b0074](https://github.com/invertase/react-native-firebase/commit/d2b0074b36254743ce980a23e3e61771b79be52a))
- **auth, multi-tenant:** add multi-tenant (tenantID) support ([935dbc3](https://github.com/invertase/react-native-firebase/commit/935dbc30515425949b4c9053da0db7f76b7a318f))
- **auth, multi-tenant:** expose user.tenantId in javascript ([4f6d426](https://github.com/invertase/react-native-firebase/commit/4f6d426302da7cb527e4fd377b6d5d1144284a51))
- **crashlytics, native:** add non-fatal exception logger for 3rd party native code use ([#5015](https://github.com/invertase/react-native-firebase/issues/5015)) ([b3e6810](https://github.com/invertase/react-native-firebase/commit/b3e681079af0bcc00655d079823a7ec6442d8723))

# [11.0.0](https://github.com/invertase/react-native-firebase/compare/v10.8.1...v11.0.0) (2021-03-03)

### Bug Fixes

- **app, ios:** failing to resolve ios sdk from package.json is an error ([29d797d](https://github.com/invertase/react-native-firebase/commit/29d797dd7f7201104547961a7db702bfff635b57))
- **firestore, types:** make all Settings properties optional ([#4965](https://github.com/invertase/react-native-firebase/issues/4965)) ([f501fff](https://github.com/invertase/react-native-firebase/commit/f501fffbfc1baabe7fc7ed8185ad0c5be069134d))
- **tests, ios:** resolve firebase-ios-sdk from app package.json ([680eb37](https://github.com/invertase/react-native-firebase/commit/680eb371da7826eef05c450d47fd12fdcb42fdb7))

### Features

- **android, sdk:** update firebase-android-sdk to 26.6.0 ([5786641](https://github.com/invertase/react-native-firebase/commit/5786641ea68dc4c0c1899a12b0a56491cff3b894)), closes [/firebase.google.com/support/release-notes/android#bom_v26-6-0](https://github.com//firebase.google.com/support/release-notes/android/issues/bom_v26-6-0)
- **functions:** support custom domains BREAKING requires firebase-ios-sdk 7.1.0+ / firebase-android-sdk 26.2.0+ ([#4950](https://github.com/invertase/react-native-firebase/issues/4950)) ([381eae5](https://github.com/invertase/react-native-firebase/commit/381eae51e25096f8527f058b21fc83d227caa69e))
- **ios, sdk:** bump firebase-ios-sdk to v7.7.0 ([bc893ab](https://github.com/invertase/react-native-firebase/commit/bc893ab8f44193a58ca6a119838d0464dc6081ba))

### BREAKING CHANGES

- **functions:** minimum native SDK requirements now firebase-ios-sdk 7.1.0+ / firebase-android-sdk 26.2.0+

## [10.8.1](https://github.com/invertase/react-native-firebase/compare/v10.8.0...v10.8.1) (2021-02-22)

### Bug Fixes

- **admob:** AdEventHandler returns javascript (not native) unsubscribe function ([#4920](https://github.com/invertase/react-native-firebase/issues/4920)) ([bff9dec](https://github.com/invertase/react-native-firebase/commit/bff9decdc820ef5e5d686f96457aa09134cfad55))
- **admob, android:** unity ads require Activity Context ([#4921](https://github.com/invertase/react-native-firebase/issues/4921)) ([23e5998](https://github.com/invertase/react-native-firebase/commit/23e5998457e87cb228e4876a0a75df180d1fcff7))

# [10.8.0](https://github.com/invertase/react-native-firebase/compare/v10.7.0...v10.8.0) (2021-02-13)

### Bug Fixes

- **dynamic-links, dependencies:** analytics is optional ([3e980d4](https://github.com/invertase/react-native-firebase/commit/3e980d4bb5fbaeefc045f2427a9e0cc0b153af6e)), closes [/github.com/invertase/react-native-firebase/pull/4850#issuecomment-776516887](https://github.com//github.com/invertase/react-native-firebase/pull/4850/issues/issuecomment-776516887)
- **dynamic-links, ios:** remove double-reject on resolveLink ([395a723](https://github.com/invertase/react-native-firebase/commit/395a7232b5e09bac3cd442ad0524363e4cd9b406))

### Features

- **app, android-sdk:** 26.5.0 (requires gradle v5.6.4+ / android gradle plugin v3.4.2+) ([1132f16](https://github.com/invertase/react-native-firebase/commit/1132f1629dd6b2d0ff9fdb00e47e075773a1dc60))
- **crashlytics:** add JS exception non-fatal error generation toggle ([#4904](https://github.com/invertase/react-native-firebase/issues/4904)) ([63c35b3](https://github.com/invertase/react-native-firebase/commit/63c35b3d9243a76fd77dedaa9fa83fca7fb802ae))

# [10.7.0](https://github.com/invertase/react-native-firebase/compare/v10.6.4...v10.7.0) (2021-02-09)

### Bug Fixes

- **auth, android:** do not timezone offset when getting UTC timestamp ([#4886](https://github.com/invertase/react-native-firebase/issues/4886)) ([85d6801](https://github.com/invertase/react-native-firebase/commit/85d6801ecbe9b3922225c55ca3628675ad848764))

### Features

- **ios, sdk:** bump firebase-ios-sdk from 7.5.0 to 7.6.0 ([2e283f7](https://github.com/invertase/react-native-firebase/commit/2e283f72322e612a0c82b1d116f3ecfa58904ea9)), closes [/firebase.google.com/support/release-notes/ios#7](https://github.com//firebase.google.com/support/release-notes/ios/issues/7)

## [10.6.4](https://github.com/invertase/react-native-firebase/compare/v10.6.3...v10.6.4) (2021-02-05)

### Bug Fixes

- **auth, android:** add browser dependency as crash workaround ([f0b4d07](https://github.com/invertase/react-native-firebase/commit/f0b4d0739184711544f2fc0b04af9204b6202877)), closes [#4744](https://github.com/invertase/react-native-firebase/issues/4744)
- **ml, android:** remove unnecessary on-device dependencies ([1451073](https://github.com/invertase/react-native-firebase/commit/14510736d7d379eac02cca917676374009ffbf76)), closes [#4750](https://github.com/invertase/react-native-firebase/issues/4750)

## [10.6.3](https://github.com/invertase/react-native-firebase/compare/v10.6.2...v10.6.3) (2021-02-05)

**Note:** Version bump only for package react-native-firebase

## [10.6.2](https://github.com/invertase/react-native-firebase/compare/v10.6.1...v10.6.2) (2021-02-05)

### Bug Fixes

- **admob:** improve defense logic to prevent multiple calls ([#4849](https://github.com/invertase/react-native-firebase/issues/4849)) ([5a71ad7](https://github.com/invertase/react-native-firebase/commit/5a71ad72f74486da253e003741d202af6353b927))

## [10.6.1](https://github.com/invertase/react-native-firebase/compare/v10.6.0...v10.6.1) (2021-02-04)

**Note:** Version bump only for package react-native-firebase

# [10.6.0](https://github.com/invertase/react-native-firebase/compare/v10.5.1...v10.6.0) (2021-02-04)

### Bug Fixes

- **dynamic-links:** dynamic-links requires analytics, add peer dependency ([5c84d46](https://github.com/invertase/react-native-firebase/commit/5c84d460a4563b82d2489447a95379498278cbae)), closes [#4821](https://github.com/invertase/react-native-firebase/issues/4821)
- **dynamic-links, android:** getInitialLink returned more than once, sometimes returned null ([#4735](https://github.com/invertase/react-native-firebase/issues/4735)) ([c68a62c](https://github.com/invertase/react-native-firebase/commit/c68a62c8bb5afd8d9c1f3df635a87d79f9dcefc0))
- **emulator:** add notice on localhost URL remapping for android ([73869e1](https://github.com/invertase/react-native-firebase/commit/73869e1c8ed97eb95008214097b9498bfb05e4ea)), closes [#4810](https://github.com/invertase/react-native-firebase/issues/4810)
- **in-app-messaging:** in-app-messaging requires analytics, add peer dependency ([ea80f54](https://github.com/invertase/react-native-firebase/commit/ea80f548e686e1d695fed7d1f5d5b5cc9217fbf0)), closes [#4821](https://github.com/invertase/react-native-firebase/issues/4821)
- **remote-config:** remote-config requires analytics, add peer dependency ([06c2a18](https://github.com/invertase/react-native-firebase/commit/06c2a187cfab6fe7c359dc80a7841281cab9de55)), closes [#4821](https://github.com/invertase/react-native-firebase/issues/4821)

### Features

- **admob, android:** add adaptive banner support ([#4840](https://github.com/invertase/react-native-firebase/issues/4840)) ([51edf96](https://github.com/invertase/react-native-firebase/commit/51edf96ae9596226cff5e8debda19da1b6c7b165))
- **app:** firebase-ios-sdk 7.4.0 -> 7.5.0, firebase-android-sdk 26.3.0 -> 26.4.0 ([9c4ada8](https://github.com/invertase/react-native-firebase/commit/9c4ada893c8c49afc454d1fe6084ba2572f2a25f))
- **perf:** support "perf_auto_collection_enabled" flag in firebase.json ([#4870](https://github.com/invertase/react-native-firebase/issues/4870)) ([e54bf49](https://github.com/invertase/react-native-firebase/commit/e54bf49ec880b309f8ffc244d3bb0da74a5d4ddd))

## [10.5.1](https://github.com/invertase/react-native-firebase/compare/v10.5.0...v10.5.1) (2021-01-19)

**Note:** Version bump only for package react-native-firebase

# [10.5.0](https://github.com/invertase/react-native-firebase/compare/v10.4.1...v10.5.0) (2021-01-18)

### Bug Fixes

- **app, android:** require default firebase.json boolean key ([#4791](https://github.com/invertase/react-native-firebase/issues/4791)) ([483d9d3](https://github.com/invertase/react-native-firebase/commit/483d9d3655844e4c40cb42f3b0da865ada971515))

### Features

- **app, sdks:** firebase-ios-sdk 7.4.0 / firebase-android-sdk 26.3.0 ([#4792](https://github.com/invertase/react-native-firebase/issues/4792)) ([f915c82](https://github.com/invertase/react-native-firebase/commit/f915c823d6765b21096ea3b7e52f22bb71630bec))

## [10.4.1](https://github.com/invertase/react-native-firebase/compare/v10.4.0...v10.4.1) (2021-01-08)

### Bug Fixes

- **ml, android:** removed unnecessary local face models ([#4753](https://github.com/invertase/react-native-firebase/issues/4753)) ([a750070](https://github.com/invertase/react-native-firebase/commit/a7500700ea514e28b68150d39ffbbfd3ffdb3353))

# [10.4.0](https://github.com/invertase/react-native-firebase/compare/v10.3.1...v10.4.0) (2020-12-30)

### Bug Fixes

- **ios:** bump ios min deployment to ios10 - remnant from [#4471](https://github.com/invertase/react-native-firebase/issues/4471) ([4a57578](https://github.com/invertase/react-native-firebase/commit/4a5757827789141600625eebe5e13c976ddb7402))

### Features

- **analytics:** add support for analytics_auto_collection_enabled in firebase.json ([#4730](https://github.com/invertase/react-native-firebase/issues/4730)) ([9a24ecd](https://github.com/invertase/react-native-firebase/commit/9a24ecd2826bfa8ab30657287432ccaeff8b7c7c))

## [10.3.1](https://github.com/invertase/react-native-firebase/compare/v10.3.0...v10.3.1) (2020-12-18)

### Bug Fixes

- **storage, ios:** resolve listAll promise once and only once on error ([#4688](https://github.com/invertase/react-native-firebase/issues/4688)) ([762bf6f](https://github.com/invertase/react-native-firebase/commit/762bf6f55d809f9bccbac847c92074a2b8c41150)), closes [/github.com/firebase/firebase-ios-sdk/blob/14764b8d60a6ad023d8fa5b7f81d42378d92e6fe/FirebaseStorage/Sources/FIRStorageReference.m#L417](https://github.com//github.com/firebase/firebase-ios-sdk/blob/14764b8d60a6ad023d8fa5b7f81d42378d92e6fe/FirebaseStorage/Sources/FIRStorageReference.m/issues/L417)

# [10.3.0](https://github.com/invertase/react-native-firebase/compare/v10.2.0...v10.3.0) (2020-12-18)

### Bug Fixes

- **admob, ios:** null check interstitialAd on show ([#4670](https://github.com/invertase/react-native-firebase/issues/4670)) ([c3b4cb0](https://github.com/invertase/react-native-firebase/commit/c3b4cb047155e75a0a41e01de45b5b0b98fb724b))
- **dynamic-links, ios:** resolveLink 404 error handling fix ([575083d](https://github.com/invertase/react-native-firebase/commit/575083d19820cc295ecf8a765a71cb99faea5cd3))
- **ios, storage:** handle nil file extension from ios14 M1 emulators ([#4676](https://github.com/invertase/react-native-firebase/issues/4676)) ([e1eb992](https://github.com/invertase/react-native-firebase/commit/e1eb9928ce6d629d75b8e9462a823cace7373767))

### Features

- **app:** bump firebase-android-sdk / firebase-ios-sdk versions ([cd5a451](https://github.com/invertase/react-native-firebase/commit/cd5a451cece27204a657780ebdbcf7fa909f5100))

# [10.2.0](https://github.com/invertase/react-native-firebase/compare/v10.1.1...v10.2.0) (2020-12-11)

### Bug Fixes

- **docs:** correct path to source code ([#4659](https://github.com/invertase/react-native-firebase/issues/4659)) ([b535757](https://github.com/invertase/react-native-firebase/commit/b5357573e97ccc3bfdf6a190713a7df66e462c4b))
- **remote-config, ios:** correct number comparison / fix fetch throttling ([#4664](https://github.com/invertase/react-native-firebase/issues/4664)) ([5a68a8a](https://github.com/invertase/react-native-firebase/commit/5a68a8a2767f65905c32c06145cb3b0b9432c397))

### Features

- firebase-ios-sdk 7.2.0 / firebase-android-sdk 26.1.1 ([#4648](https://github.com/invertase/react-native-firebase/issues/4648)) ([a158a74](https://github.com/invertase/react-native-firebase/commit/a158a74dee0dd6774c725ff1213453f8dfdcb8f5))

## [10.1.1](https://github.com/invertase/react-native-firebase/compare/v10.1.0...v10.1.1) (2020-12-02)

### Bug Fixes

- **messaging:** remote message from messaging store on new intent ([#4634](https://github.com/invertase/react-native-firebase/issues/4634)) ([00b83af](https://github.com/invertase/react-native-firebase/commit/00b83af15ca23d667e4258a1cf3e5b6a830a8f2d))

# [10.1.0](https://github.com/invertase/react-native-firebase/compare/v10.0.0...v10.1.0) (2020-11-26)

### Bug Fixes

- **analytics:** add missing quantity parameter to the Item structure ([#4536](https://github.com/invertase/react-native-firebase/issues/4536)) ([f9935e7](https://github.com/invertase/react-native-firebase/commit/f9935e78f181a5bfb718094487a5368472232b2d))
- **app:** convert NativeFirebaseError.getStackWithMessage to static to fix crash ([#4619](https://github.com/invertase/react-native-firebase/issues/4619)) ([090b0bb](https://github.com/invertase/react-native-firebase/commit/090b0bb509d4b3a71db9b84096d89effd4e2d865))
- **app, android:** remove firebase-core from dependencies ([#4597](https://github.com/invertase/react-native-firebase/issues/4597)) ([22c615c](https://github.com/invertase/react-native-firebase/commit/22c615c39fe17dbf8915ae08c5d46431713495a0))
- **messaging, badge:** use new iOS JSON location for FCM badge information ([#4560](https://github.com/invertase/react-native-firebase/issues/4560)) ([bda2d67](https://github.com/invertase/react-native-firebase/commit/bda2d67ddaf7f12ac3143b564e7e94974e8356db))

### Features

- **admob, ios:** add adaptive banner support ([#4565](https://github.com/invertase/react-native-firebase/issues/4565)) ([ce8ac1a](https://github.com/invertase/react-native-firebase/commit/ce8ac1ac5542f24aeab9df4d7f638c831f12b31a))
- **crashlytics:** add custom message ability to javascript stack traces ([#4609](https://github.com/invertase/react-native-firebase/issues/4609)) ([afaa95d](https://github.com/invertase/react-native-firebase/commit/afaa95dbf4c744cb04042f6236837164edc8bbb8))
- **messaging, android:** make native serializer object + events builder APIs public ([#4618](https://github.com/invertase/react-native-firebase/issues/4618)) ([e54fecc](https://github.com/invertase/react-native-firebase/commit/e54feccea41fdbe4a7b10554b32ce2cef6068c66))

# [10.0.0](https://github.com/invertase/react-native-firebase/compare/fc8c4c0622f8e6814879d0306f66012df5b83cd8...v10.0.0) (2020-11-17)

### BREAKING

- **analytics** remove deprecated analytics methods ([18f5b0f](https://github.com/invertase/react-native-firebase/commit/18f5b0f7e65a3bddc92d3d23e31efb42a518ec12))
- breaking change to mark new internal versioning requirements.

### Bug Fixes

- **auth, android:** fixed user collision handling with apple sign-in ([#4487](https://github.com/invertase/react-native-firebase/issues/4487)) ([6a8f8ad](https://github.com/invertase/react-native-firebase/commit/6a8f8ad9b05d9510948206cc9837547cab124c63))
- **auth, android:** gracefully handle exception creating PhoneCredential ([8ead604](https://github.com/invertase/react-native-firebase/commit/8ead60431c2aae4193ed79eb10dc3b43480c5d77))
- **auth, android:** handle failure to upgrade anonymous user ([41fad36](https://github.com/invertase/react-native-firebase/commit/41fad3629437059a5e81d29f82c79589286aaea2)), closes [#4487](https://github.com/invertase/react-native-firebase/issues/4487)

### Features

- **auth, android:** apple sign in support in android ([#4188](https://github.com/invertase/react-native-firebase/issues/4188)) ([c6e77a8](https://github.com/invertase/react-native-firebase/commit/c6e77a8c34c632eba119dc30a320675a142dabce))
- **auth, emulator:** add useEmulator javascript code + jest tests ([532adb5](https://github.com/invertase/react-native-firebase/commit/532adb569413e8a5e5077d5f47582a0a300b3045))
- **auth, emulator:** implement native useEmulator calls ([81369a0](https://github.com/invertase/react-native-firebase/commit/81369a089e3ffc5be53d7651fa5a9dacf5bfa7b6))
