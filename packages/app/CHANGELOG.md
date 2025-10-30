# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [23.5.0](https://github.com/invertase/react-native-firebase/compare/v23.4.1...v23.5.0) (2025-10-30)

### Bug Fixes

- **ios:** use 'note' for info messages in Xcode scripts ([f2f1e5e](https://github.com/invertase/react-native-firebase/commit/f2f1e5e396b2e71675e85701bc89ac916431db30))

## [23.4.1](https://github.com/invertase/react-native-firebase/compare/v23.4.0...v23.4.1) (2025-10-14)

### Bug Fixes

- **app:** adopt firebase-js-sdk 12.3.0 ([4fecb30](https://github.com/invertase/react-native-firebase/commit/4fecb304be7f223959d4aba0a0e8b7e550983024))
- **app:** SDK updates: js 12.4.0, ios 12.4.0, android 34.4.0 ([b7d5f63](https://github.com/invertase/react-native-firebase/commit/b7d5f6319a591751b31a39d904fd4256803ae85e))

## [23.4.0](https://github.com/invertase/react-native-firebase/compare/v23.3.1...v23.4.0) (2025-09-24)

### Bug Fixes

- firebase-ios-sdk 12.3.0 / firebase-android-sdk 34.3.0 ([123e773](https://github.com/invertase/react-native-firebase/commit/123e77372bbf173c60cc35f1fb5c8dbde4d2cdcf))

## [23.3.1](https://github.com/invertase/react-native-firebase/compare/v23.3.0...v23.3.1) (2025-09-08)

### Bug Fixes

- **app-distribution, android:** use correct app-distribution gradle version 5.1.1 ([25fddad](https://github.com/invertase/react-native-firebase/commit/25fddad1ac540e5e8b006aae286a4e4603198617))

## [23.3.0](https://github.com/invertase/react-native-firebase/compare/v23.2.2...v23.3.0) (2025-09-04)

**Note:** Version bump only for package @react-native-firebase/app

## [23.2.2](https://github.com/invertase/react-native-firebase/compare/v23.2.1...v23.2.2) (2025-09-03)

**Note:** Version bump only for package @react-native-firebase/app

## [23.2.1](https://github.com/invertase/react-native-firebase/compare/v23.2.0...v23.2.1) (2025-09-01)

### Bug Fixes

- **android:** adopt firebase-android-sdk 34.2.0 ([#8680](https://github.com/invertase/react-native-firebase/issues/8680)) ([c680840](https://github.com/invertase/react-native-firebase/commit/c680840709b4c3f648d2269a025cd1ff7ce2ff50))
- **app, ios:** adopt firebase-ios-sdk 12.2.0 ([#8681](https://github.com/invertase/react-native-firebase/issues/8681)) ([1fde0cf](https://github.com/invertase/react-native-firebase/commit/1fde0cfd1cb148397703758bf2622423ad845dbf))
- **app:** adopt firebase-js-sdk 12.2.1 ([#8682](https://github.com/invertase/react-native-firebase/issues/8682)) ([f3d3985](https://github.com/invertase/react-native-firebase/commit/f3d3985a18a97b55c4c284330f5c06536c2d9730))

## [23.2.0](https://github.com/invertase/react-native-firebase/compare/v23.1.2...v23.2.0) (2025-08-29)

### Features

- **other:** implement TOTP auth for Other platform ([3fbc43a](https://github.com/invertase/react-native-firebase/commit/3fbc43a1f1ccf768c5f76a962a59d1850f73ba5a))

## [23.1.2](https://github.com/invertase/react-native-firebase/compare/v23.1.1...v23.1.2) (2025-08-25)

**Note:** Version bump only for package @react-native-firebase/app

## [23.1.1](https://github.com/invertase/react-native-firebase/compare/v23.1.0...v23.1.1) (2025-08-22)

### Bug Fixes

- validate listenerOrObserver callbacks in auth, app-check, remote-config ([06dcae4](https://github.com/invertase/react-native-firebase/commit/06dcae44e29f18e7716727479fd6e6d048336d91))

## [23.1.0](https://github.com/invertase/react-native-firebase/compare/v23.0.1...v23.1.0) (2025-08-19)

### Features

- **ai:** create `ai` package, `vertexai` wraps around it ([#8555](https://github.com/invertase/react-native-firebase/issues/8555)) ([50c9e0d](https://github.com/invertase/react-native-firebase/commit/50c9e0d8a361b575c6cbf86f028165906d819162))

### Bug Fixes

- **app, ios:** fail build with error if firebase.json has syntax errors ([5c752e7](https://github.com/invertase/react-native-firebase/commit/5c752e710e39f0aad40182706a934e5979727fa1))
- **app:** adopt firebase-js-sdk 12.1.0 ([115a55c](https://github.com/invertase/react-native-firebase/commit/115a55ce85c1a4db8f8b92f4e30c86776499f6ea))

## [23.0.1](https://github.com/invertase/react-native-firebase/compare/v23.0.0...v23.0.1) (2025-08-12)

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 34.1.0 ([b9af1d3](https://github.com/invertase/react-native-firebase/commit/b9af1d3d24a4fa77587eb1a9f7a5d784750a58bb))

## [23.0.0](https://github.com/invertase/react-native-firebase/compare/v22.4.0...v23.0.0) (2025-08-07)

### ⚠ BREAKING CHANGES

- new minimums: iOS 15+, Xcode 16.2+
- requires node v20+ and ES2020+
- android minSdk now must be 23+ (was 21)
- **dynamic-links:** remove Dynamic Links from React Native Firebase (#8631)

### Features

- bump Firebase android SDK to `34.0.0` ([#8627](https://github.com/invertase/react-native-firebase/issues/8627)) ([e9ef5ec](https://github.com/invertase/react-native-firebase/commit/e9ef5ec9742f28ec1d621a401f82125acff0f1cf))
- bump firebase-ios-sdk to `12.0.0` ([e3d6d22](https://github.com/invertase/react-native-firebase/commit/e3d6d222f0a83f6a3f6ea6975401e4b03cc4421a))
- bump firebase-js-sdk to `12.0.0` ([ab0529e](https://github.com/invertase/react-native-firebase/commit/ab0529ef5cfc1382688ee220aeb46eba4dcf9761))

### Bug Fixes

- **app, ios:** adopt firebase-ios-sdk 12.1.0 ([8be970c](https://github.com/invertase/react-native-firebase/commit/8be970c86fff5ad8d046ccba442f54bec3ecaf41))
- **dynamic-links:** remove Dynamic Links from React Native Firebase ([#8631](https://github.com/invertase/react-native-firebase/issues/8631)) ([fe4550f](https://github.com/invertase/react-native-firebase/commit/fe4550f362548dcb66359044715e22222a413f97))

## [22.4.0](https://github.com/invertase/react-native-firebase/compare/v22.3.0...v22.4.0) (2025-07-10)

**Note:** Version bump only for package @react-native-firebase/app

## [22.3.0](https://github.com/invertase/react-native-firebase/compare/v22.2.1...v22.3.0) (2025-07-08)

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 33.16.0 ([7221dc4](https://github.com/invertase/react-native-firebase/commit/7221dc4602963d50eddccfc315ffbf458d9e9b29))
- **app, ios:** adopt firebase-ios-sdk 11.15.0 ([28471dc](https://github.com/invertase/react-native-firebase/commit/28471dcc4948851106bc3be2e614dd59c358c403)), closes [/firebase.google.com/support/faq#analytics-odm2](https://github.com/invertase//firebase.google.com/support/faq/issues/analytics-odm2)
- **app:** firebase-js-sdk bump 11.3.1 > 11.10.0 ([29ea831](https://github.com/invertase/react-native-firebase/commit/29ea8310beed3eb0598bda55aacc29c100c7f770))

## [22.2.1](https://github.com/invertase/react-native-firebase/compare/v22.2.0...v22.2.1) (2025-06-10)

### Bug Fixes

- **app:** firebase-android-sdk 33.14.0 / firebase-ios-sdk 11.13.0 ([9b6ce6e](https://github.com/invertase/react-native-firebase/commit/9b6ce6e87e7cff4ef35746e7e5e7cfbe055b3a8e))

## [22.2.0](https://github.com/invertase/react-native-firebase/compare/v22.1.0...v22.2.0) (2025-05-12)

**Note:** Version bump only for package @react-native-firebase/app

## [22.1.0](https://github.com/invertase/react-native-firebase/compare/v22.0.0...v22.1.0) (2025-04-30)

### Bug Fixes

- **app, expo:** add config plugin support for Expo SDK 53 ([#8495](https://github.com/invertase/react-native-firebase/issues/8495)) ([7617611](https://github.com/invertase/react-native-firebase/commit/7617611fb7ba903d7a15b44bc34c930a354a863c))
- **app, expo:** update config plugin to match Expo 53.0.1 AppDelegate ([#8500](https://github.com/invertase/react-native-firebase/issues/8500)) ([3d3c4ec](https://github.com/invertase/react-native-firebase/commit/3d3c4ece9f9a9de76e36f4f35611fca5ed208abc))
- **app:** provide modular-like APIs for RNFB-specific json/meta/preferences methods ([9bb5365](https://github.com/invertase/react-native-firebase/commit/9bb536523869a21a26bd46756d0f42ee2ff34321))
- **app:** toString() does not exist in modular API, use .name property ([2a99366](https://github.com/invertase/react-native-firebase/commit/2a99366ae56a36a6d4b3bdb7beca6137c4040e59))

## [22.0.0](https://github.com/invertase/react-native-firebase/compare/v21.14.0...v22.0.0) (2025-04-25)

### ⚠ BREAKING CHANGES

- **app, sdks:** firebase-ios-sdk 11.12.0 requires Xcode 16.2+

### Features

- **app, sdks:** firebase-ios-sdk 11.12.0 / firebase-android-sdk 33.13.0 ([c63d843](https://github.com/invertase/react-native-firebase/commit/c63d8435b678742cfdd98f4d1d8895134cb9cf09))

### Bug Fixes

- **analytics:** Type defs ([#8363](https://github.com/invertase/react-native-firebase/issues/8363)) ([74efc84](https://github.com/invertase/react-native-firebase/commit/74efc848e3ecda47b5c7cdf79e5e72370cd10b7d))
- **android:** use `=` assignment vs deprecated space-assignment ([39c2ecb](https://github.com/invertase/react-native-firebase/commit/39c2ecb0069a8a5a65b04fb7f86ccecf83273868))
- enable provenance signing during publish ([4535f0d](https://github.com/invertase/react-native-firebase/commit/4535f0d5756c89aeb8f8e772348c71d8176348be))

## [21.14.0](https://github.com/invertase/react-native-firebase/compare/v21.13.0...v21.14.0) (2025-04-14)

### Features

- **messaging, android:** notification delegation APIs, firebase.json feature toggle ([c0c5054](https://github.com/invertase/react-native-firebase/commit/c0c505432e95c85fa6621b548b24e755e2894c37))
- **messaging, android:** support BigQuery export setting in firebase.json ([fa0e967](https://github.com/invertase/react-native-firebase/commit/fa0e967f9a06719c159a4980749f80c5ff2e2c39))

### Bug Fixes

- **app, expo:** update iOS AppDelegate for SDK 53 support ([a3d82c7](https://github.com/invertase/react-native-firebase/commit/a3d82c73e746fe3d2ac4513b15696ced98ecf2ca))
- **app:** annotate initializeApp return as a promise ([#8366](https://github.com/invertase/react-native-firebase/issues/8366)) ([5189c32](https://github.com/invertase/react-native-firebase/commit/5189c328e2643cdaf9c96059ce139b34c7651466))
- **app:** firebase-ios-sdk 11.11.0 / firebase-android-sdk 33.12.0 ([1bfd3eb](https://github.com/invertase/react-native-firebase/commit/1bfd3eb5558296deff7a368a607163019b1d4d11))

## [21.13.0](https://github.com/invertase/react-native-firebase/compare/v21.12.3...v21.13.0) (2025-03-31)

**Note:** Version bump only for package @react-native-firebase/app

## [21.12.3](https://github.com/invertase/react-native-firebase/compare/v21.12.2...v21.12.3) (2025-03-26)

**Note:** Version bump only for package @react-native-firebase/app

## [21.12.2](https://github.com/invertase/react-native-firebase/compare/v21.12.1...v21.12.2) (2025-03-23)

**Note:** Version bump only for package @react-native-firebase/app

## [21.12.1](https://github.com/invertase/react-native-firebase/compare/v21.12.0...v21.12.1) (2025-03-22)

### Bug Fixes

- **android:** adopt firebase-android-sdk 33.11.0 ([8271231](https://github.com/invertase/react-native-firebase/commit/82712317f9df94f5b5d2d9610f2029c3df0ed96b))
- **app, sdks:** firebase-ios-sdk 11.9.0 / firebase-android-sdk 33.10.0 ([df24ed6](https://github.com/invertase/react-native-firebase/commit/df24ed63e5434c84dc167f23287446647457e8e5))
- **app:** App type def fix ([#8365](https://github.com/invertase/react-native-firebase/issues/8365)) ([068a924](https://github.com/invertase/react-native-firebase/commit/068a92496f54e30cd17187c849163dbafd9e8c5b))
- **ios:** adopt firebase-ios-sdk 11.10.0 ([ffc7b4c](https://github.com/invertase/react-native-firebase/commit/ffc7b4c7d603dcb27b730f82c523c91b4a5882a8))

## [21.12.0](https://github.com/invertase/react-native-firebase/compare/v21.11.0...v21.12.0) (2025-03-03)

### Features

- vertexAI package support ([#8236](https://github.com/invertase/react-native-firebase/issues/8236)) ([a1d1361](https://github.com/invertase/react-native-firebase/commit/a1d13610f443a96a7195b3f769f77d9676c0e577))

## [21.11.0](https://github.com/invertase/react-native-firebase/compare/v21.10.1...v21.11.0) (2025-02-20)

**Note:** Version bump only for package @react-native-firebase/app

## [21.10.1](https://github.com/invertase/react-native-firebase/compare/v21.10.0...v21.10.1) (2025-02-18)

### Performance Improvements

- only create deprecation message if we will use it ([70c57f4](https://github.com/invertase/react-native-firebase/commit/70c57f44597a04885f5b112c25b5251d94192615))

## [21.10.0](https://github.com/invertase/react-native-firebase/compare/v21.9.0...v21.10.0) (2025-02-11)

**Note:** Version bump only for package @react-native-firebase/app

## [21.9.0](https://github.com/invertase/react-native-firebase/compare/v21.8.0...v21.9.0) (2025-02-11)

### Features

- **app, expo:** support rn77 AppDelegate.swift in config plugin ([#8324](https://github.com/invertase/react-native-firebase/issues/8324)) ([6a7867c](https://github.com/invertase/react-native-firebase/commit/6a7867c9366b851a6de62cc37b7834090caad98b))

### Bug Fixes

- firebase-ios-sdk 11.8.0 / firebase-android-sdk 33.9.0 ([67aba08](https://github.com/invertase/react-native-firebase/commit/67aba08c00aa46b72fcb1353bd428fa552b6686a))

## [21.8.0](https://github.com/invertase/react-native-firebase/compare/v21.7.4...v21.8.0) (2025-02-10)

### Bug Fixes

- do not ship unit tests in released packages ([e71dadf](https://github.com/invertase/react-native-firebase/commit/e71dadfc1c0cad2e89c94100913af31ddf7d9c91))

## [21.7.4](https://github.com/invertase/react-native-firebase/compare/v21.7.3...v21.7.4) (2025-02-08)

**Note:** Version bump only for package @react-native-firebase/app

## [21.7.3](https://github.com/invertase/react-native-firebase/compare/v21.7.2...v21.7.3) (2025-02-08)

### Bug Fixes

- use same deprecation message everywhere, correct tests for new message ([684081b](https://github.com/invertase/react-native-firebase/commit/684081b7bdc17bc314fce827972dca5b1a58e01b))

## [21.7.2](https://github.com/invertase/react-native-firebase/compare/v21.7.1...v21.7.2) (2025-02-05)

### Bug Fixes

- **android, auth:** adopt play-services-auth 21.3.0 ([5506164](https://github.com/invertase/react-native-firebase/commit/55061640f55312b1df2315df6d0fa053c19d25e5)), closes [/developers.google.com/android/guides/releases#december_09_2024](https://github.com/invertase//developers.google.com/android/guides/releases/issues/december_09_2024)
- **app, android:** adopt firebase-android-sdk 33.8.0 ([14f3dd5](https://github.com/invertase/react-native-firebase/commit/14f3dd51d466d04fa92416d44035bf10194bfbee))

## [21.7.1](https://github.com/invertase/react-native-firebase/compare/v21.7.0...v21.7.1) (2025-01-20)

**Note:** Version bump only for package @react-native-firebase/app

## [21.7.0](https://github.com/invertase/react-native-firebase/compare/v21.6.2...v21.7.0) (2025-01-16)

### Features

- **app-distribution:** add Android app distribution plugin and configuration ([9b5c405](https://github.com/invertase/react-native-firebase/commit/9b5c405b2933c84daad561117a3eebacc65cbb7e))

### Bug Fixes

- adopt firebase-ios-sdk 11.7.0 / firebase-android-sdk 33.7.0 ([9da251d](https://github.com/invertase/react-native-firebase/commit/9da251d081a71ec03e5e909627002598456657a2))

## [21.6.2](https://github.com/invertase/react-native-firebase/compare/v21.6.1...v21.6.2) (2025-01-02)

**Note:** Version bump only for package @react-native-firebase/app

## [21.6.1](https://github.com/invertase/react-native-firebase/compare/v21.6.0...v21.6.1) (2024-11-25)

### Bug Fixes

- **android, app:** fix hot-reload on react-native <= 0.73 ([81e5fc2](https://github.com/invertase/react-native-firebase/commit/81e5fc2b6c89fdb4aa5f0f5aa95e1e90dae5f2e4))

## [21.6.0](https://github.com/invertase/react-native-firebase/compare/v21.5.0...v21.6.0) (2024-11-20)

### Features

- **ios, sdk:** allow FIREBASE_SDK_VERSION override ([8cbe59f](https://github.com/invertase/react-native-firebase/commit/8cbe59fbf771df6ba932832c9d4fd17bf500ea91))

### Bug Fixes

- **analytics:** update superstruct dependency / forward-port to new API ([#8153](https://github.com/invertase/react-native-firebase/issues/8153)) ([6db1fb4](https://github.com/invertase/react-native-firebase/commit/6db1fb471e62e2c7e434719f2616c76349f345be))

## [21.5.0](https://github.com/invertase/react-native-firebase/compare/v21.4.1...v21.5.0) (2024-11-16)

### Bug Fixes

- **android:** forward-port to non-deprecated data collection API ([2c87eeb](https://github.com/invertase/react-native-firebase/commit/2c87eeb3f0e8053ab02d4f6cce047ad61a6310fa))
- **android:** rn74 forward-port onCatalystInstanceDestroy -> invalidate ([83696ea](https://github.com/invertase/react-native-firebase/commit/83696ea4c944b2be0b8fd9f2fc1db212800cbcf8))

## [21.4.1](https://github.com/invertase/react-native-firebase/compare/v21.4.0...v21.4.1) (2024-11-13)

### Bug Fixes

- **app, ios:** adopt firebase-ios-sdk 11.5.0 ([c387357](https://github.com/invertase/react-native-firebase/commit/c387357ac8be7a2186aa1872a3d41e370d4ce5e3))

### Reverts

- Revert "fix(ios, sdk): constrain transitive dependencies more tightly" ([1ff247c](https://github.com/invertase/react-native-firebase/commit/1ff247cd73804efbd52eb9490f68087685de814c))

## [21.4.0](https://github.com/invertase/react-native-firebase/compare/v21.3.0...v21.4.0) (2024-11-07)

### Features

- Add initial tvOS support to some firebase packages ([ca51b51](https://github.com/invertase/react-native-firebase/commit/ca51b51f86edb9a5e293b463491fad40e4189e53))

### Bug Fixes

- **app, tvOS:** tvOS minimum target upstream is 13.0, aligning here ([3fa3f07](https://github.com/invertase/react-native-firebase/commit/3fa3f07f00f0444fff3eb864afce3882e855ac41))

## [21.3.0](https://github.com/invertase/react-native-firebase/compare/v21.2.0...v21.3.0) (2024-10-31)

### Bug Fixes

- **app, sdk:** firebase-android-sdk 33.5.1 ([6c08f13](https://github.com/invertase/react-native-firebase/commit/6c08f13407f9aea6af176d485d919c892449cc16))
- **app:** add misconfiguration warning for missing native module ([b038dbc](https://github.com/invertase/react-native-firebase/commit/b038dbc669b7f1c679c388e3ef749168df89954f))

## [21.2.0](https://github.com/invertase/react-native-firebase/compare/v21.1.1...v21.2.0) (2024-10-22)

### Features

- **ios, sdk:** adopt firebase-ios-sdk 11.4.0 ([4430ee7](https://github.com/invertase/react-native-firebase/commit/4430ee7b1d7b7d0dfa36dc44e0cc0e56266086c9))

## [21.1.1](https://github.com/invertase/react-native-firebase/compare/v21.1.0...v21.1.1) (2024-10-22)

### Bug Fixes

- **ios, sdk:** constrain transitive dependencies more tightly ([d03ab42](https://github.com/invertase/react-native-firebase/commit/d03ab42a163a17268bac344ccd135dc18849e1be))

## [21.1.0](https://github.com/invertase/react-native-firebase/compare/v21.0.0...v21.1.0) (2024-10-21)

### Bug Fixes

- **app, sdk:** adopt ios-sdk 11.3.0 / android-sdk 33.4.0 ([6e7cc0a](https://github.com/invertase/react-native-firebase/commit/6e7cc0a675775f583089fb9c70d0e35a5f7d1d1f))

## [21.0.0](https://github.com/invertase/react-native-firebase/compare/v20.5.0...v21.0.0) (2024-09-26)

### ⚠ BREAKING CHANGES

- Update Firebase iOS SDK version to v11

### Features

- Update Firebase iOS SDK version to v11 ([8bad077](https://github.com/invertase/react-native-firebase/commit/8bad0774a8f1a201d19cf8b4a914bfaf7a30c6c7))

### Bug Fixes

- **android, sdk:** adopt firebase-android-sdk 33.3.0 ([37bfd72](https://github.com/invertase/react-native-firebase/commit/37bfd7287dabefbb991a146090b73b7755126f04))

## [20.5.0](https://github.com/invertase/react-native-firebase/compare/v20.4.0...v20.5.0) (2024-09-11)

**Note:** Version bump only for package @react-native-firebase/app

## [20.4.0](https://github.com/invertase/react-native-firebase/compare/v20.3.0...v20.4.0) (2024-08-13)

### Features

- **firestore:** support for second database ([#7949](https://github.com/invertase/react-native-firebase/issues/7949)) ([eec08a0](https://github.com/invertase/react-native-firebase/commit/eec08a06f41dd96d13778fbed2afcaaac238fca4))

## [20.3.0](https://github.com/invertase/react-native-firebase/compare/v20.2.1...v20.3.0) (2024-07-19)

### Bug Fixes

- **other:** add api for persistence via Async Storage ([030eea9](https://github.com/invertase/react-native-firebase/commit/030eea91f297a4014ab86cfb141ae938f200c5e5))

## [20.2.1](https://github.com/invertase/react-native-firebase/compare/v20.2.0...v20.2.1) (2024-07-17)

**Note:** Version bump only for package @react-native-firebase/app

## [20.2.0](https://github.com/invertase/react-native-firebase/compare/v20.1.0...v20.2.0) (2024-07-15)

### Features

- **other:** Add analytics support ([#7899](https://github.com/invertase/react-native-firebase/issues/7899)) ([cbdf9ec](https://github.com/invertase/react-native-firebase/commit/cbdf9ec78452a73751d1afeca428842898f63134))
- **Other:** add App Check support ([#7905](https://github.com/invertase/react-native-firebase/issues/7905)) ([753b16e](https://github.com/invertase/react-native-firebase/commit/753b16e1a06f949c679fb75053c319394dd5ecfe))
- **other:** add App/Core support ([1b2e247](https://github.com/invertase/react-native-firebase/commit/1b2e2473d526c3356ab8619b226943446fd49452))
- **other:** Add Auth support ([#7878](https://github.com/invertase/react-native-firebase/issues/7878)) ([54befe7](https://github.com/invertase/react-native-firebase/commit/54befe776353f07eeab9b044d6261eeb76f1f238))
- **other:** Add Database support ([#7887](https://github.com/invertase/react-native-firebase/issues/7887)) ([fbb773a](https://github.com/invertase/react-native-firebase/commit/fbb773a87c167bdc92265fe261aeb777d4660cd7))
- **other:** Add Firestore support ([#7882](https://github.com/invertase/react-native-firebase/issues/7882)) ([0ebd1dd](https://github.com/invertase/react-native-firebase/commit/0ebd1ddd221c50dde489bce30ad5ed64037d8439))
- **Other:** Add Remote Config support ([#7895](https://github.com/invertase/react-native-firebase/issues/7895)) ([a41e556](https://github.com/invertase/react-native-firebase/commit/a41e5568869320fb91afc01403ed402e5312e15c))
- **other:** Add Storage support ([#7888](https://github.com/invertase/react-native-firebase/issues/7888)) ([9b8dda7](https://github.com/invertase/react-native-firebase/commit/9b8dda704a01243039624bfcc7614021e6c3a527))

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 31.1.1 ([dba1beb](https://github.com/invertase/react-native-firebase/commit/dba1beba97d88d1110e0838b6287fd4907cfa8a7))
- **app, android:** adopt firebase-android-sdk 33.1.2 ([0dfa2af](https://github.com/invertase/react-native-firebase/commit/0dfa2af484cfd12a282490cb82726b29859e30bf))
- **app, ios:** firebase-ios-sdk 10.28.0 ([91c626d](https://github.com/invertase/react-native-firebase/commit/91c626d0d32435a6305696fb4084553341d99ca9))
- **ios:** adopt firebase-ios-sdk 10.29.0 ([1b19cc6](https://github.com/invertase/react-native-firebase/commit/1b19cc697f21ac1e21ab3a7a399c1ef90711800b))

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

## [19.3.0](https://github.com/invertase/react-native-firebase/compare/v19.2.2...v19.3.0) (2024-05-20)

### Bug Fixes

- **app:** react-native 0.74 bridgeless mode compatibility ([#7688](https://github.com/invertase/react-native-firebase/issues/7688)) ([a6805bc](https://github.com/invertase/react-native-firebase/commit/a6805bc1e6894aadf3167b7958fd52644bfe90ca))

## [19.2.2](https://github.com/invertase/react-native-firebase/compare/v19.2.1...v19.2.2) (2024-04-13)

### Bug Fixes

- **app, android:** bump firebase-android-sdk to 32.8.1 ([ae24918](https://github.com/invertase/react-native-firebase/commit/ae24918ff124020b120f2bd12e24db4b6b5f54b4))

## [19.2.1](https://github.com/invertase/react-native-firebase/compare/v19.2.0...v19.2.1) (2024-04-12)

**Note:** Version bump only for package @react-native-firebase/app

## [19.2.0](https://github.com/invertase/react-native-firebase/compare/v19.1.2...v19.2.0) (2024-04-10)

### Features

- **app, ios:** firebase-ios-sdk 10.24.0 with signed frameworks ([6624b1c](https://github.com/invertase/react-native-firebase/commit/6624b1cc3d18eecefcc03453ba52c148aabd49d0))

## [19.1.2](https://github.com/invertase/react-native-firebase/compare/v19.1.1...v19.1.2) (2024-04-03)

### Bug Fixes

- **app, ios:** adopt firebase-ios-sdk 10.23.1 ([dc05178](https://github.com/invertase/react-native-firebase/commit/dc051788e60e4926f26b03992c7a82f7a38cb556))

## [19.1.1](https://github.com/invertase/react-native-firebase/compare/v19.1.0...v19.1.1) (2024-03-26)

### Bug Fixes

- **app, android:** bump google play-services-auth to 21.0.0 ([85dfa4e](https://github.com/invertase/react-native-firebase/commit/85dfa4e13b7da4358a12cc51e372a423bb63c9c3)), closes [/github.com/firebase/firebase-android-sdk/issues/5768#issuecomment-2020388078](https://github.com/invertase//github.com/firebase/firebase-android-sdk/issues/5768/issues/issuecomment-2020388078)

## [19.1.0](https://github.com/invertase/react-native-firebase/compare/v19.0.1...v19.1.0) (2024-03-23)

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 32.7.4 ([6793b1d](https://github.com/invertase/react-native-firebase/commit/6793b1d395c7112d6571e012c3ad50398784b574))
- **app, android:** adopt firebase-android-sdk 32.8.0 ([450da62](https://github.com/invertase/react-native-firebase/commit/450da6265ab2b54f63675009588f26609c0aa263))
- **app, ios:** adopt firebase-ios-sdk 10.23.0 ([d7fd10e](https://github.com/invertase/react-native-firebase/commit/d7fd10e97268ac08f4960323d5204acd3ecffa07))

## [19.0.1](https://github.com/invertase/react-native-firebase/compare/v19.0.0...v19.0.1) (2024-03-07)

### Bug Fixes

- **app, ios:** adopt firebase-ios-sdk 10.22.0 ([#7668](https://github.com/invertase/react-native-firebase/issues/7668)) ([3fc756b](https://github.com/invertase/react-native-firebase/commit/3fc756b7bf98f6e3acd169dd5cbe4af55dbe9746))

## [19.0.0](https://github.com/invertase/react-native-firebase/compare/v18.9.0...v19.0.0) (2024-02-26)

### ⚠ BREAKING CHANGES

- **app, sdks:** firebase-ios-sdk 10.21.0 requires cocoapods 1.12+
  in order to support the new Apple-mandated privacy manifests. Please
  ensure you are using verson 1.12 or greater of cocoapods

### Bug Fixes

- **app, sdks:** SDK ios 10.21.0 / android / 32.7.2 ([9dc48be](https://github.com/invertase/react-native-firebase/commit/9dc48be52603c71b134dadca16502e8557aca95b))

## [18.9.0](https://github.com/invertase/react-native-firebase/compare/v18.8.0...v18.9.0) (2024-02-21)

### Features

- **analytics:** add setConsent implementation ([#7629](https://github.com/invertase/react-native-firebase/issues/7629)) ([7816985](https://github.com/invertase/react-native-firebase/commit/78169854f16a2715f5d2657ab08f54d5a4b05281))

## [18.8.0](https://github.com/invertase/react-native-firebase/compare/v18.7.3...v18.8.0) (2024-01-25)

### Features

- **auth, authDomain:** implement FirebaseOptions.authDomain on Auth ([a1f4710](https://github.com/invertase/react-native-firebase/commit/a1f471029352b7597d7e83a8c1ea06145768cf89))

### Bug Fixes

- **app:** firebase-ios-sdk 10.20.0 / firebase-android-sdk 32.7.1 ([8d3c3a0](https://github.com/invertase/react-native-firebase/commit/8d3c3a02689d8ec7dd7d705adb941808039cdd50))

## [18.7.3](https://github.com/invertase/react-native-firebase/compare/v18.7.2...v18.7.3) (2023-12-13)

### Bug Fixes

- **sdk, android:** adopt firebase-android-sdk 32.7.0 ([2c13c32](https://github.com/invertase/react-native-firebase/commit/2c13c32290997bcb8b6a9a04cf4f45730eddada1))

## [18.7.2](https://github.com/invertase/react-native-firebase/compare/v18.7.1...v18.7.2) (2023-12-08)

### Bug Fixes

- firebase-ios-sdk 10.19.0 ([a899390](https://github.com/invertase/react-native-firebase/commit/a8993900cbe4c22561c2fe2863899c1d60fbbfd2))

## [18.7.1](https://github.com/invertase/react-native-firebase/compare/v18.7.0...v18.7.1) (2023-11-29)

### Bug Fixes

- **ios): Revert "build(ios:** specify our script phases always run" ([62b44d6](https://github.com/invertase/react-native-firebase/commit/62b44d68d3794e701e173c9f1a97e131844f0406))

## [18.7.0](https://github.com/invertase/react-native-firebase/compare/v18.6.2...v18.7.0) (2023-11-28)

**Note:** Version bump only for package @react-native-firebase/app

## [18.6.2](https://github.com/invertase/react-native-firebase/compare/v18.6.1...v18.6.2) (2023-11-23)

### Bug Fixes

- adopt firebase-ios-sdk 10.18.0 / firebase-android-sdk 32.6.0 ([6a8b25b](https://github.com/invertase/react-native-firebase/commit/6a8b25bc1ed22860d1cef8fa3507ca5df3a28420))

## [18.6.1](https://github.com/invertase/react-native-firebase/compare/v18.6.0...v18.6.1) (2023-11-01)

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 32.5.0 ([9834bfb](https://github.com/invertase/react-native-firebase/commit/9834bfb7feeef4d40d8524f81be5d1f722cae3b8))
- **app, sdk:** adopt firebase-ios-sdk 10.17.0 ([c926af3](https://github.com/invertase/react-native-firebase/commit/c926af334999fb6e462487ac43f07e08f808ac13))

## [18.6.0](https://github.com/invertase/react-native-firebase/compare/v18.5.0...v18.6.0) (2023-10-26)

### Bug Fixes

- **app, sdk:** adopt firebase-android-sdk 32.4.0 ([63f1893](https://github.com/invertase/react-native-firebase/commit/63f1893849578bfab85241bf4458eb845a4d857f))

## [18.5.0](https://github.com/invertase/react-native-firebase/compare/v18.4.0...v18.5.0) (2023-09-22)

### Features

- **ios:** add initiateOnDeviceConversionMeasurementWithPhoneNumber ([80ac07e](https://github.com/invertase/react-native-firebase/commit/80ac07e207bad7f31a4805edb26e350f892fc5bf))

### Bug Fixes

- **app, sdks:** adopt ios sdk 10.15.0 / android sdk 32.3.1 ([acc58da](https://github.com/invertase/react-native-firebase/commit/acc58da42bb471d1973645f2a2feffe180705c19))

## [18.4.0](https://github.com/invertase/react-native-firebase/compare/v18.3.2...v18.4.0) (2023-09-11)

**Note:** Version bump only for package @react-native-firebase/app

## [18.3.2](https://github.com/invertase/react-native-firebase/compare/v18.3.1...v18.3.2) (2023-09-02)

### Bug Fixes

- **app, sdks:** adopt firebase-android-sdk 32.2.3 ([129d6ef](https://github.com/invertase/react-native-firebase/commit/129d6ef1eb1b45be3390687a002bddfe87386fa3))

## [18.3.1](https://github.com/invertase/react-native-firebase/compare/v18.3.0...v18.3.1) (2023-08-23)

### Bug Fixes

- **app, sdks:** adopt android-sdk 32.2.2 / ios-sdk 10.13.0 ([5484c0b](https://github.com/invertase/react-native-firebase/commit/5484c0b69420f888f9a3a59aec8cc59d45f1d2d6))
- **app, sdks:** adopt firebase-ios-sdk 10.14.0 ([89e3bd9](https://github.com/invertase/react-native-firebase/commit/89e3bd9cbf73b1af666afde017cba801d48684e8))

## [18.3.0](https://github.com/invertase/react-native-firebase/compare/v18.2.0...v18.3.0) (2023-07-19)

**Note:** Version bump only for package @react-native-firebase/app

## [18.2.0](https://github.com/invertase/react-native-firebase/compare/v18.1.0...v18.2.0) (2023-07-13)

### Bug Fixes

- **app, ios:** incorporate firebase-ios-sdk 10.12.0 ([#7231](https://github.com/invertase/react-native-firebase/issues/7231)) ([ee66459](https://github.com/invertase/react-native-firebase/commit/ee66459cd214ffb84ce2d4e15eef79d047f075ab))

## [18.1.0](https://github.com/invertase/react-native-firebase/compare/v18.0.0...v18.1.0) (2023-06-22)

### Bug Fixes

- **app, sdk:** adopt firebase-ios-sdk 10.11.0 ([f40cb5b](https://github.com/invertase/react-native-firebase/commit/f40cb5b46276dbd7977dc72f4a8bdf783d282b03))

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

## [17.5.0](https://github.com/invertase/react-native-firebase/compare/v17.4.3...v17.5.0) (2023-05-11)

**Note:** Version bump only for package @react-native-firebase/app

### [17.4.3](https://github.com/invertase/react-native-firebase/compare/v17.4.2...v17.4.3) (2023-04-26)

### Bug Fixes

- **expo:** update dependencies of config plugins ([3e81143](https://github.com/invertase/react-native-firebase/commit/3e81143e67028f70c20530b8e1083b2a904f96f4))

### [17.4.2](https://github.com/invertase/react-native-firebase/compare/v17.4.1...v17.4.2) (2023-04-05)

### Bug Fixes

- **android, auth:** phone auth supports Play Integrity now ([59b0238](https://github.com/invertase/react-native-firebase/commit/59b02382492ee568fc9d4bed933ae1cf8d7efdfb))

### [17.4.1](https://github.com/invertase/react-native-firebase/compare/v17.4.0...v17.4.1) (2023-04-01)

### Bug Fixes

- **crashlytics, android:** use v2.9.2 of crashlytics android plugin ([8460ab6](https://github.com/invertase/react-native-firebase/commit/8460ab6176bb0d287a277853427d94004c30a4d0)), closes [#6983](https://github.com/invertase/react-native-firebase/issues/6983)

## [17.4.0](https://github.com/invertase/react-native-firebase/compare/v17.3.2...v17.4.0) (2023-03-25)

### Bug Fixes

- **android:** bump to firebase-android-sdk 31.3.0 ([500f15a](https://github.com/invertase/react-native-firebase/commit/500f15ab5409686d2b7defde32effce0f2b537d9))
- **ios:** bump firebase-ios-sdk to 10.7.0 ([7103473](https://github.com/invertase/react-native-firebase/commit/7103473e0f0b43e2e994aa7cb9ba553906f9cf46))

### [17.3.2](https://github.com/invertase/react-native-firebase/compare/v17.3.1...v17.3.2) (2023-03-05)

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 31.2.3 ([24fa17e](https://github.com/invertase/react-native-firebase/commit/24fa17e710070b11d2be2851bd3ef9a81185d472))
- **app, ios:** bump firebase-ios-sdk to 10.6.0 ([06a6f69](https://github.com/invertase/react-native-firebase/commit/06a6f6945280f2b22f50f9327c57c8222c80ae8a))
- **expo:** extend expo config plugin regex to match latest version of AppDelegate ([#6957](https://github.com/invertase/react-native-firebase/issues/6957)) ([281deed](https://github.com/invertase/react-native-firebase/commit/281deedb2c23819816d73a864cbc0f6907a7f110))

### [17.3.1](https://github.com/invertase/react-native-firebase/compare/v17.3.0...v17.3.1) (2023-02-23)

### Bug Fixes

- **app, android:** adopt firebase-android-sdk 31.2.2 w/crash fixes ([2d1f2cb](https://github.com/invertase/react-native-firebase/commit/2d1f2cb64d6460a6a73aeea57b4472060801aecb)), closes [#6930](https://github.com/invertase/react-native-firebase/issues/6930)

## [17.3.0](https://github.com/invertase/react-native-firebase/compare/v17.2.0...v17.3.0) (2023-02-15)

**Note:** Version bump only for package @react-native-firebase/app

## [17.2.0](https://github.com/invertase/react-native-firebase/compare/v17.1.0...v17.2.0) (2023-02-15)

### Features

- **app, android:** firebase-android-sdk 31.2.0 ([87156e7](https://github.com/invertase/react-native-firebase/commit/87156e75e16775db14ef8f9bf6b0049b15ee1277))

## [17.1.0](https://github.com/invertase/react-native-firebase/compare/v17.0.0...v17.1.0) (2023-02-09)

### Features

- **app, ios:** firebase-ios-sdk 10.5.0 ([cc80d7c](https://github.com/invertase/react-native-firebase/commit/cc80d7c11f533b292d1f5b681a05a206ddc93e9c))

## [17.0.0](https://github.com/invertase/react-native-firebase/compare/v16.7.0...v17.0.0) (2023-02-02)

### ⚠ BREAKING CHANGES

- **app, ios:** You must have an APNS token before calling getToken to
  get an FCM token on iOS. Previously it was not required. See documentation
  for setAPNSToken if you are using getToken in testing or have disabled
  FCM Swizzling, and use setAPNSToken to set a token before using getToken

### Features

- **app, ios:** adopt firebase-ios-sdk 10.4.0 ([1b8df4c](https://github.com/invertase/react-native-firebase/commit/1b8df4c8e55d474c09e301f9c7b58b6128ae6485))

## [16.7.0](https://github.com/invertase/react-native-firebase/compare/v16.6.0...v16.7.0) (2023-01-28)

**Note:** Version bump only for package @react-native-firebase/app

## [16.6.0](https://github.com/invertase/react-native-firebase/compare/v16.5.2...v16.6.0) (2023-01-27)

**Note:** Version bump only for package @react-native-firebase/app

### [16.5.2](https://github.com/invertase/react-native-firebase/compare/v16.5.1...v16.5.2) (2023-01-23)

**Note:** Version bump only for package @react-native-firebase/app

### [16.5.1](https://github.com/invertase/react-native-firebase/compare/v16.5.0...v16.5.1) (2023-01-20)

**Note:** Version bump only for package @react-native-firebase/app

## [16.5.0](https://github.com/invertase/react-native-firebase/compare/v16.4.6...v16.5.0) (2022-12-16)

### Features

- **app:** migrate `app` module to a modular API ([#6694](https://github.com/invertase/react-native-firebase/issues/6694)) ([c285016](https://github.com/invertase/react-native-firebase/commit/c285016618bb79fd3a559d5fdcb983bb2aadaa77))

### Bug Fixes

- **app, sdks:** ios-sdk 10.3.0 / android-sdk 31.1.1 ([00708b6](https://github.com/invertase/react-native-firebase/commit/00708b680cd837ed23d41b27bb76b2895e719f79))

### [16.4.6](https://github.com/invertase/react-native-firebase/compare/v16.4.5...v16.4.6) (2022-11-18)

### Bug Fixes

- **app, android:** firebase-android-sdk 31.1.0 ([af089c0](https://github.com/invertase/react-native-firebase/commit/af089c00496aa55e66ea83e87b8cf54c8144c9fb))

### [16.4.5](https://github.com/invertase/react-native-firebase/compare/v16.4.4...v16.4.5) (2022-11-16)

### Bug Fixes

- **app, ios:** firebase-ios-sdk 10.2.0 ([443f460](https://github.com/invertase/react-native-firebase/commit/443f460279f6c41ce7aaaeec03a19b14135953eb))

### [16.4.4](https://github.com/invertase/react-native-firebase/compare/v16.4.3...v16.4.4) (2022-11-14)

### Bug Fixes

- **crashlytics, android:** firebase-android-sdk 31.0.3 fixes NDK issue ([0d37632](https://github.com/invertase/react-native-firebase/commit/0d376327c8d843285d4ceec11d4af0bc8c16fe42))

### [16.4.3](https://github.com/invertase/react-native-firebase/compare/v16.4.2...v16.4.3) (2022-11-06)

**Note:** Version bump only for package @react-native-firebase/app

### [16.4.2](https://github.com/invertase/react-native-firebase/compare/v16.4.1...v16.4.2) (2022-11-04)

**Note:** Version bump only for package @react-native-firebase/app

### [16.4.1](https://github.com/invertase/react-native-firebase/compare/v16.4.0...v16.4.1) (2022-11-02)

**Note:** Version bump only for package @react-native-firebase/app

## [16.4.0](https://github.com/invertase/react-native-firebase/compare/v16.3.1...v16.4.0) (2022-10-30)

**Note:** Version bump only for package @react-native-firebase/app

### [16.3.1](https://github.com/invertase/react-native-firebase/compare/v16.3.0...v16.3.1) (2022-10-28)

### Bug Fixes

- **app, sdks:** firebase-ios-sdk 10.1.0 / firebase-android-sdk 31.0.2 ([8367c98](https://github.com/invertase/react-native-firebase/commit/8367c9858b8d6e2a0d689d1adcc5c88c6dc377fa))

## [16.3.0](https://github.com/invertase/react-native-firebase/compare/v16.2.0...v16.3.0) (2022-10-26)

### Features

- **auth:** Add multi-factor support for the sign-in flow ([#6593](https://github.com/invertase/react-native-firebase/issues/6593)) ([3c64bf5](https://github.com/invertase/react-native-firebase/commit/3c64bf5987eec73c8cc5d3f9246c4c0185eb7718))

## [16.2.0](https://github.com/invertase/react-native-firebase/compare/v16.1.1...v16.2.0) (2022-10-23)

**Note:** Version bump only for package @react-native-firebase/app

### [16.1.1](https://github.com/invertase/react-native-firebase/compare/v16.1.0...v16.1.1) (2022-10-21)

### Bug Fixes

- **app, android:** use firebase-android-sdk 31.0.1 ([89eb33f](https://github.com/invertase/react-native-firebase/commit/89eb33fb49b843afcb3c33480d4c6d28c5eb6e12))

## [16.1.0](https://github.com/invertase/react-native-firebase/compare/v16.0.0...v16.1.0) (2022-10-20)

**Note:** Version bump only for package @react-native-firebase/app

## [16.0.0](https://github.com/invertase/react-native-firebase/compare/v15.7.1...v16.0.0) (2022-10-19)

### ⚠ BREAKING CHANGES

- fix release version change type resolution

### release

- fix release version change type resolution ([6fcb946](https://github.com/invertase/react-native-firebase/commit/6fcb946f7e7bbc3e7ad6605d48ce3d11f1184c70))

## [15.7.1](https://github.com/invertase/react-native-firebase/compare/v15.7.0...v15.7.1) (2022-10-19)

**Note:** Inadvertent breaking change. iOS minimum deploy target bumped to 11, macOS to 10.13

# [15.7.0](https://github.com/invertase/react-native-firebase/compare/v15.6.0...v15.7.0) (2022-10-01)

**Note:** Version bump only for package @react-native-firebase/app

# [15.6.0](https://github.com/invertase/react-native-firebase/compare/v15.5.0...v15.6.0) (2022-09-17)

### Bug Fixes

- **app, ios:** correctly handle firebase.json if it has UTF-8 ([4e3ac01](https://github.com/invertase/react-native-firebase/commit/4e3ac01c94389299dffc53e6d8480760f8b18033))

# [15.5.0](https://github.com/invertase/react-native-firebase/compare/v15.4.0...v15.5.0) (2022-09-16)

### Bug Fixes

- **expo, ios:** expo plugin added import multiple times ([f10891a](https://github.com/invertase/react-native-firebase/commit/f10891a6d8079766374ceb7790a824d90306946a))

### Features

- **android:** firebase-android-sdk 30.5.0 ([abe7620](https://github.com/invertase/react-native-firebase/commit/abe7620c35cd91bd105d64fa64777868a3482435))
- **ios:** bump firebase-ios-sdk to 9.6.0 ([0ad70a9](https://github.com/invertase/react-native-firebase/commit/0ad70a90e01ac37c3129a170ebff47738e551a18))

# [15.4.0](https://github.com/invertase/react-native-firebase/compare/v15.3.0...v15.4.0) (2022-08-27)

### Bug Fixes

- **app, android:** bump to firebase-android-sdk 30.3.2 ([ee394fe](https://github.com/invertase/react-native-firebase/commit/ee394fe1221fcb8effa4c87716d99c3f1d556d13))

### Features

- **app, ios:** bump firebase-ios-sdk to 9.5.0 ([feac7f8](https://github.com/invertase/react-native-firebase/commit/feac7f8c8b85c3cf87a34dc9a75ddb7b7b9c034b))

# [15.3.0](https://github.com/invertase/react-native-firebase/compare/v15.2.0...v15.3.0) (2022-08-07)

### Bug Fixes

- **app, sdk:** firebase-android-sdk 30.3.1 / firebase-ios-sdk 9.4.0 ([1fd7fc8](https://github.com/invertase/react-native-firebase/commit/1fd7fc837a31bad179ccf5d463c80f578d7cbd15)), closes [#6327](https://github.com/invertase/react-native-firebase/issues/6327)

# [15.2.0](https://github.com/invertase/react-native-firebase/compare/v15.1.1...v15.2.0) (2022-07-21)

### Features

- **ios, messaging:** Allow notifications in foreground on iOS, configure in firebase.json ([#6407](https://github.com/invertase/react-native-firebase/issues/6407)) ([71dee2b](https://github.com/invertase/react-native-firebase/commit/71dee2bac7a2ea58e51605a249cab7f1ac5fa7d7))
- **sdks:** firebase-ios-sdk 9.3.0 / firebase-android-sdk 30.3.0 ([e03dcd1](https://github.com/invertase/react-native-firebase/commit/e03dcd19a530e178022aaebd3266e31e037c9550))

## [15.1.1](https://github.com/invertase/react-native-firebase/compare/v15.1.0...v15.1.1) (2022-06-28)

**Note:** Version bump only for package @react-native-firebase/app

# [15.1.0](https://github.com/invertase/react-native-firebase/compare/v15.0.0...v15.1.0) (2022-06-28)

### Features

- **analytics, ios:** implement firebase.json toggle to override default SKAdNewtork registration ([5da99bd](https://github.com/invertase/react-native-firebase/commit/5da99bde9f58a5d660ab9c59c61bf91db01cd962))
- **android, sdk:** use firebase-android-sdk 30.2.0 ([66e6fb0](https://github.com/invertase/react-native-firebase/commit/66e6fb0885c4f2885aeec140a9c0655a5eedd8df))
- **ios, sdk:** update to firebase-ios-sdk 9.2.0 ([7affa79](https://github.com/invertase/react-native-firebase/commit/7affa7989c64012bd6fc89fcc0ecf988e7f4e92a))

# [15.0.0](https://github.com/invertase/react-native-firebase/compare/v14.11.1...v15.0.0) (2022-06-20)

**Note:** Version bump only for package @react-native-firebase/app

## [14.11.1](https://github.com/invertase/react-native-firebase/compare/v14.11.0...v14.11.1) (2022-06-17)

### Bug Fixes

- **android:** specify that android services are not exported ([39e0444](https://github.com/invertase/react-native-firebase/commit/39e0444841e423175d325751ea6667dc8f8a6d54)), closes [/github.com/firebase/firebase-android-sdk/blob/ad135d8c3c1243b4c673e17bc032ee1052fb2a22/firebase-common/src/main/AndroidManifest.xml#L10-L12](https://github.com//github.com/firebase/firebase-android-sdk/blob/ad135d8c3c1243b4c673e17bc032ee1052fb2a22/firebase-common/src/main/AndroidManifest.xml/issues/L10-L12)

# [14.11.0](https://github.com/invertase/react-native-firebase/compare/v14.10.1...v14.11.0) (2022-05-27)

### Features

- **android, sdk:** firebase-android-sdk 30.1.0 ([b0462d4](https://github.com/invertase/react-native-firebase/commit/b0462d4d34d1518a50daeca09288bf4aa0e0f695))

## [14.10.1](https://github.com/invertase/react-native-firebase/compare/v14.10.0...v14.10.1) (2022-05-26)

### Bug Fixes

- **android, sdk:** bump firebase-android-sdk to 30.0.2 ([ad6f928](https://github.com/invertase/react-native-firebase/commit/ad6f928c888ac3b0264211d471874f15aea6b6d9))

# [14.10.0](https://github.com/invertase/react-native-firebase/compare/v14.9.4...v14.10.0) (2022-05-26)

**Note:** Version bump only for package @react-native-firebase/app

## [14.9.4](https://github.com/invertase/react-native-firebase/compare/v14.9.3...v14.9.4) (2022-05-14)

### Bug Fixes

- **android:** firebase-android-sdk 30.0.1 ([c5e6b41](https://github.com/invertase/react-native-firebase/commit/c5e6b41eaec0d7238665495caf3e0f9572427e1e)), closes [#6158](https://github.com/invertase/react-native-firebase/issues/6158)

## [14.9.3](https://github.com/invertase/react-native-firebase/compare/v14.9.2...v14.9.3) (2022-05-10)

**Note:** Version bump only for package @react-native-firebase/app

## [14.9.2](https://github.com/invertase/react-native-firebase/compare/v14.9.1...v14.9.2) (2022-05-10)

### Bug Fixes

- **ios, app:** macOS 12.3 removed python, use python3 ([1f609d3](https://github.com/invertase/react-native-firebase/commit/1f609d379117532d014bc44735827d38d79a36e9)), closes [#6226](https://github.com/invertase/react-native-firebase/issues/6226) [#6203](https://github.com/invertase/react-native-firebase/issues/6203)

## [14.9.1](https://github.com/invertase/react-native-firebase/compare/v14.9.0...v14.9.1) (2022-04-28)

### Bug Fixes

- **ios, expo:** add Expo plugin objcpp / Expo 45 compatibility ([#6223](https://github.com/invertase/react-native-firebase/issues/6223)) ([9de82d3](https://github.com/invertase/react-native-firebase/commit/9de82d356862d7dc359d90b4cd1643724de3a862))

# [14.9.0](https://github.com/invertase/react-native-firebase/compare/v14.8.1...v14.9.0) (2022-04-27)

**Note:** Version bump only for package @react-native-firebase/app

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

- **ios, expo:** use modern import style, required by Expo 44+ ([4060827](https://github.com/invertase/react-native-firebase/commit/4060827c318db8dcc2791bfe6635902a9c4e33bb))

### Features

- **sdks:** firebase-ios-sdk 8.13.0 ([95da53e](https://github.com/invertase/react-native-firebase/commit/95da53ef6cdd1b67ade4a53dbd8164bd906b9d53))

## [14.5.1](https://github.com/invertase/react-native-firebase/compare/v14.5.0...v14.5.1) (2022-03-05)

**Note:** Version bump only for package @react-native-firebase/app

# [14.5.0](https://github.com/invertase/react-native-firebase/compare/v14.4.0...v14.5.0) (2022-02-15)

**Note:** Version bump only for package @react-native-firebase/app

# [14.4.0](https://github.com/invertase/react-native-firebase/compare/v14.3.3...v14.4.0) (2022-02-13)

**Note:** Version bump only for package @react-native-firebase/app

## [14.3.3](https://github.com/invertase/react-native-firebase/compare/v14.3.2...v14.3.3) (2022-02-12)

### Bug Fixes

- **android, sdk:** bump firebase-android-sdk to 29.1.0 ([292c424](https://github.com/invertase/react-native-firebase/commit/292c4240bb6220beddbbdb0db7e6700ddd41a24f))

## [14.3.2](https://github.com/invertase/react-native-firebase/compare/v14.3.1...v14.3.2) (2022-02-10)

### Bug Fixes

- **app, ios:** use NSInteger not NSInteger\* for prefs ([0148901](https://github.com/invertase/react-native-firebase/commit/01489010c920fc8e367a04f9decb8a8c94c5d8c1))
- **ios, sdk:** bump to firebase-ios-sdk 8.12.1 ([da6cf01](https://github.com/invertase/react-native-firebase/commit/da6cf013815c5f8f43e4c03e721f3c270a5834e2))

## [14.3.1](https://github.com/invertase/react-native-firebase/compare/v14.3.0...v14.3.1) (2022-02-07)

### Bug Fixes

- **app:** specify hyphenated package name in import advice ([5e898ec](https://github.com/invertase/react-native-firebase/commit/5e898ecb49bb73999c7ea5172f8f17753a71a90a)), closes [#6009](https://github.com/invertase/react-native-firebase/issues/6009)

# [14.3.0](https://github.com/invertase/react-native-firebase/compare/v14.2.4...v14.3.0) (2022-01-26)

**Note:** Version bump only for package @react-native-firebase/app

## [14.2.4](https://github.com/invertase/react-native-firebase/compare/v14.2.3...v14.2.4) (2022-01-24)

### Bug Fixes

- **android, sdk:** bump firebase-android-sdk + versions in docs ([8bda4be](https://github.com/invertase/react-native-firebase/commit/8bda4be52bd4b19b2d330c8f95d132d7a5b5885a))

## [14.2.3](https://github.com/invertase/react-native-firebase/compare/v14.2.2...v14.2.3) (2022-01-20)

### Bug Fixes

- **ios, sdk:** bump firebase-ios-sdk to 8.11.0 ([40322e2](https://github.com/invertase/react-native-firebase/commit/40322e2d97719d4e32146beb30ad561ea86ea3e8))

## [14.2.2](https://github.com/invertase/react-native-firebase/compare/v14.2.1...v14.2.2) (2022-01-06)

### Bug Fixes

- **app, android:** minSdk should be 19 to match firebase-android-sdk ([#5984](https://github.com/invertase/react-native-firebase/issues/5984)) ([8015779](https://github.com/invertase/react-native-firebase/commit/8015779035835e03746754a1f28b16bd83407376))

## [14.2.1](https://github.com/invertase/react-native-firebase/compare/v14.2.0...v14.2.1) (2021-12-31)

**Note:** Version bump only for package @react-native-firebase/app

# [14.2.0](https://github.com/invertase/react-native-firebase/compare/v14.1.0...v14.2.0) (2021-12-31)

**Note:** Version bump only for package @react-native-firebase/app

# [14.1.0](https://github.com/invertase/react-native-firebase/compare/v14.0.1...v14.1.0) (2021-12-18)

### Bug Fixes

- **app, android:** firebase-android-sdk 29.0.3 to fix underlying NPE in 29.0.2 ([#5946](https://github.com/invertase/react-native-firebase/issues/5946)) ([051f4a6](https://github.com/invertase/react-native-firebase/commit/051f4a66d64db42f1c615580e185eaf00660fbc1))

### Features

- **analytics, config:** expose automatic screenview reporting toggle ([#5948](https://github.com/invertase/react-native-firebase/issues/5948)) ([8836c01](https://github.com/invertase/react-native-firebase/commit/8836c01dcfa2f478f973a1a54253509c3368d963))

## [14.0.1](https://github.com/invertase/react-native-firebase/compare/v14.0.0...v14.0.1) (2021-12-15)

### Bug Fixes

- **app, expo:** Update AppDelegate config plugin for Expo SDK 44 ([#5940](https://github.com/invertase/react-native-firebase/issues/5940)) ([185756d](https://github.com/invertase/react-native-firebase/commit/185756df6de238aa8a018007cf6b2fa810cb6055))

# [14.0.0](https://github.com/invertase/react-native-firebase/compare/v13.1.1...v14.0.0) (2021-12-14)

**Note:** Version bump only for package @react-native-firebase/app

## [13.1.1](https://github.com/invertase/react-native-firebase/compare/v13.1.0...v13.1.1) (2021-12-14)

### Bug Fixes

- **deps:** AGP7.0.4, firebase-android-sdk 29.0.2, javascript deps ([55d0a36](https://github.com/invertase/react-native-firebase/commit/55d0a36a0addc54e347f26bb8ee88bb38b0fa4a6))

# [13.1.0](https://github.com/invertase/react-native-firebase/compare/v13.0.1...v13.1.0) (2021-12-02)

### Features

- **android, emulator:** add firebase.json config element to bypass localhost remap ([#5852](https://github.com/invertase/react-native-firebase/issues/5852)) ([ddf3f5f](https://github.com/invertase/react-native-firebase/commit/ddf3f5f43d2c8547879934c3169d3e01c0db44c0))
- **sdks:** firebase-ios-sdk 8.10.0 / firebase-android-sdk 29.0.1 ([f6949c9](https://github.com/invertase/react-native-firebase/commit/f6949c9f3669df6d8b3f78bbee97bee2f36b7df3))

## [13.0.1](https://github.com/invertase/react-native-firebase/compare/v13.0.0...v13.0.1) (2021-11-05)

### Bug Fixes

- **ios, sdks:** bump firebase-ios-sdk to 8.9.1 ([4871131](https://github.com/invertase/react-native-firebase/commit/4871131c3587e138398719ef5537731ee4fbe90a))

# [13.0.0](https://github.com/invertase/react-native-firebase/compare/v12.9.3...v13.0.0) (2021-10-31)

### Bug Fixes

- rename default branch to main ([25e1d3d](https://github.com/invertase/react-native-firebase/commit/25e1d3d5a1a8311588938dc9d8fdf71d11cd9963))

- feat(sdks, android)!: firebase-android-sdk v29 / minSdkVersion API19 / target+compile API31 (#5825) ([f60afe1](https://github.com/invertase/react-native-firebase/commit/f60afe158b2dc823bd7169e36c3e428470576c7e)), closes [#5825](https://github.com/invertase/react-native-firebase/issues/5825)

### Features

- **ios, sdks:** bump firebase-ios-sdk to 8.9.0 ([bb9ba50](https://github.com/invertase/react-native-firebase/commit/bb9ba50ff4df82980943c0a76069d432e5371ed6))

### BREAKING CHANGES

- firebase-android-sdk 29 requires android/build.gradle minSdkVersion 19 (as required in react-native 0.64+)

## [12.9.3](https://github.com/invertase/react-native-firebase/compare/v12.9.2...v12.9.3) (2021-10-22)

### Bug Fixes

- **app, ios-config:** use fully-specified path for /usr/bin/head ([5baaf13](https://github.com/invertase/react-native-firebase/commit/5baaf136ce291b0ec703a9ecd3e5e907a37c3040)), closes [#5801](https://github.com/invertase/react-native-firebase/issues/5801)

## [12.9.2](https://github.com/invertase/react-native-firebase/compare/v12.9.1...v12.9.2) (2021-10-17)

### Bug Fixes

- **app, expo:** update iOS `AppDelegate` plugin to work with Expo SDK 43 ([#5796](https://github.com/invertase/react-native-firebase/issues/5796)) ([d67c3b9](https://github.com/invertase/react-native-firebase/commit/d67c3b906d1bb6d858269efba8b597891faf8772))

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

- **app, ios:** correct path to 'Info.plist' for ios build dependency ([#5677](https://github.com/invertase/react-native-firebase/issues/5677)) ([ea6920c](https://github.com/invertase/react-native-firebase/commit/ea6920c3e900d76cce254a8da1704f50f3f2bc9a)), closes [#5152](https://github.com/invertase/react-native-firebase/issues/5152) [#5153](https://github.com/invertase/react-native-firebase/issues/5153)

## [12.7.4](https://github.com/invertase/react-native-firebase/compare/v12.7.3...v12.7.4) (2021-08-31)

**Note:** Version bump only for package @react-native-firebase/app

## [12.7.3](https://github.com/invertase/react-native-firebase/compare/v12.7.2...v12.7.3) (2021-08-24)

**Note:** Version bump only for package @react-native-firebase/app

## [12.7.2](https://github.com/invertase/react-native-firebase/compare/v12.7.1...v12.7.2) (2021-08-21)

**Note:** Version bump only for package @react-native-firebase/app

## [12.7.1](https://github.com/invertase/react-native-firebase/compare/v12.7.0...v12.7.1) (2021-08-20)

### Bug Fixes

- **app, android:** react-native 0.65 compatibility ([262452d](https://github.com/invertase/react-native-firebase/commit/262452d69c2dadd79475235fca42c12b18b2e208))

# [12.7.0](https://github.com/invertase/react-native-firebase/compare/v12.6.1...v12.7.0) (2021-08-19)

### Features

- **app-distribution:** Implement Firebase App Distribution module ([8fa1263](https://github.com/invertase/react-native-firebase/commit/8fa1263bc657b7d1d0630bc193097cb5d4aa631a))
- **app, config:** implement setLogLevel API ([cac7be3](https://github.com/invertase/react-native-firebase/commit/cac7be33ca70b37103ba8635ed64e755e0728c9d))
- **app, ios:** adopt firebase-ios-sdk 8.6.0 ([22d79f1](https://github.com/invertase/react-native-firebase/commit/22d79f136363f2ba67e9a0920c69a71fdffdb444))
- **installations:** implement Firebase Installations module ([3ef3410](https://github.com/invertase/react-native-firebase/commit/3ef3410e265515c8fd3653728727a0048ffdbd87))

## [12.6.1](https://github.com/invertase/react-native-firebase/compare/v12.6.0...v12.6.1) (2021-08-17)

**Note:** Version bump only for package @react-native-firebase/app

# [12.6.0](https://github.com/invertase/react-native-firebase/compare/v12.5.0...v12.6.0) (2021-08-16)

### Bug Fixes

- **app-check, ios:** allow token auto refresh config in firebase.json ([b9670c1](https://github.com/invertase/react-native-firebase/commit/b9670c1194e5460fbfcc0d90b462062eaed8538b))
- **app, android:** put app init provider / registrar in correct manifest ([8408160](https://github.com/invertase/react-native-firebase/commit/8408160d93be7f9a29f4aea9df3799aafdf6f69e))
- **app, expo:** node 12 compatibility with `fs.promises` in ios plugin ([#5591](https://github.com/invertase/react-native-firebase/issues/5591)) ([97f9090](https://github.com/invertase/react-native-firebase/commit/97f90900ec9b983bdd2cf640fcda5c3435aa1abe))
- **in-app-messaging, config:** implement in_app_messaging_auto_collection_enabled firebase.json setting ([9d11ce9](https://github.com/invertase/react-native-firebase/commit/9d11ce93b81fe7818cb264bac1b36c60daac3463))
- **sdks, android:** firebase-android-sdk 28.3.1, google-services plugin 4.3.10 ([4562cd8](https://github.com/invertase/react-native-firebase/commit/4562cd8ccb70c3f964e9c038d2eca6eb87bcba60))

### Features

- **analytics, config:** expose all the native data collection toggles ([f5eaffb](https://github.com/invertase/react-native-firebase/commit/f5eaffbfaf7e165b205692dd5b1b16e87b09d5a2))
- **app, config:** implement app_data_collection_default_enabled firebase.json key ([1e47d45](https://github.com/invertase/react-native-firebase/commit/1e47d455aa3a99b4ad6e08caf491be3df63a7f55))
- **perf, config:** expose perf module deactivate toggle ([4e25bf6](https://github.com/invertase/react-native-firebase/commit/4e25bf63237f42b98ae5cd2ef424408299992c03))

# [12.5.0](https://github.com/invertase/react-native-firebase/compare/v12.4.0...v12.5.0) (2021-08-12)

### Bug Fixes

- **app, expo:** Use `fs/promises` in Node 12 compatible way ([#5585](https://github.com/invertase/react-native-firebase/issues/5585)) ([64f569a](https://github.com/invertase/react-native-firebase/commit/64f569acd2cea284baa305451df9533f138539e7))
- **expo:** do not publish plugin tests and sources ([#5565](https://github.com/invertase/react-native-firebase/issues/5565)) ([6b5dca5](https://github.com/invertase/react-native-firebase/commit/6b5dca500ea413ee68acf8abc74e579f4298cbad))

### Features

- **app-check:** implement AppCheck module ([8cd4fa3](https://github.com/invertase/react-native-firebase/commit/8cd4fa33d8df8fc72f2484665423986d12fc65fa))
- **ios, sdks:** bump firebase-ios-sdk to 8.5.0 ([d4b2015](https://github.com/invertase/react-native-firebase/commit/d4b2015f8def4759b95072cd4bca86eda0443c54))

# [12.4.0](https://github.com/invertase/react-native-firebase/compare/v12.3.0...v12.4.0) (2021-07-29)

### Features

- **sdks, android:** use firebase-android-sdk 28.3.0, play-services-auth 19.2.0 ([#5555](https://github.com/invertase/react-native-firebase/issues/5555)) ([edcd4e2](https://github.com/invertase/react-native-firebase/commit/edcd4e2244ffcf4734648b402d5714e41c4d3539))
- Add Expo config plugin ([#5480](https://github.com/invertase/react-native-firebase/issues/5480)) ([832057c](https://github.com/invertase/react-native-firebase/commit/832057cfbdf1778ad2141a1ad4466d2e8c24b8ce))

# [12.3.0](https://github.com/invertase/react-native-firebase/compare/v12.2.0...v12.3.0) (2021-07-21)

### Features

- **ios:** bump firebase-ios-sdk dependency to 8.4.0 ([7a75cb9](https://github.com/invertase/react-native-firebase/commit/7a75cb94eb0ee2196895dd9216ef566b059d4822))

# [12.2.0](https://github.com/invertase/react-native-firebase/compare/v12.1.0...v12.2.0) (2021-07-16)

### Features

- firebase-ios-sdk 8.3.0 / firebase-android-sdk 28.2.1 ([c73ea10](https://github.com/invertase/react-native-firebase/commit/c73ea103b1ae8b6171d8719b752459cecb9a9359))
- **app, sdks:** use firebase-ios-sdk 8.2.0 / firebase-android-sdk 28.2.0 ([0d26af9](https://github.com/invertase/react-native-firebase/commit/0d26af9638b15eb2220d12127b3626c899818ade))

# [12.1.0](https://github.com/invertase/react-native-firebase/compare/v12.0.0...v12.1.0) (2021-06-11)

### Features

- **app:** bump SDKs: firebase-android-sdk 28.1.0 / firebase-ios-sdk 8.1.1 ([d64e2e5](https://github.com/invertase/react-native-firebase/commit/d64e2e562051a3c3da39da32582ea835b2c7d928))

# [12.0.0](https://github.com/invertase/react-native-firebase/compare/v11.5.0...v12.0.0) (2021-05-19)

### Features

- **sdks:** firebase-ios-sdk 8.0.0 / firebase-android-sdk 28.0.1 ([d97587b](https://github.com/invertase/react-native-firebase/commit/d97587b33aa4c092a0d34291e24491ca66f9bcaa))
- **storage, emulator:** implement storage emulator ([1d3e946](https://github.com/invertase/react-native-firebase/commit/1d3e946a4131a9ceaf3e82aab7f1759ef5aa2cb4))

- chore(storage, android)!: remove EXTERNAL_STORAGE permissions for Android 10/11 compat ([69b6f88](https://github.com/invertase/react-native-firebase/commit/69b6f88f078facb07001a6fa8da04812c73077fb))

### Bug Fixes

- **android:** correct lint issues for various API mis-use ([eb8d893](https://github.com/invertase/react-native-firebase/commit/eb8d89306fd569d7ef64298a99e970c653b79178)), closes [#3917](https://github.com/invertase/react-native-firebase/issues/3917)

### BREAKING CHANGES

- if you need READ_EXTERNAL_STORAGE/WRITE_EXTERNAL_STORAGE permission add them in your app AndroidManifest.xml

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

**Note:** You _may_ need to re-download your firebase config files (android json / ios plist) to handle changes in the underlying SDKs as they migrate from instance id to installations. A symptom would be `NativeFirebaseError: [messaging/unknown] FIS_AUTH_ERROR`. [Upstream reference doc](https://github.com/firebase/firebase-android-sdk/blob/main/firebase-installations/REQUIRED_FIREBASE_OPTIONS_ANDROID.md#what-do-i-need-to-do) / [Related issue #4466](https://github.com/invertase/react-native-firebase/issues/4466)

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
