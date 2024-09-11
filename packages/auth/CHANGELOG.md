# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [20.5.0](https://github.com/invertase/react-native-firebase/compare/v20.4.0...v20.5.0) (2024-09-11)

**Note:** Version bump only for package @react-native-firebase/auth

## [20.4.0](https://github.com/invertase/react-native-firebase/compare/v20.3.0...v20.4.0) (2024-08-13)

**Note:** Version bump only for package @react-native-firebase/auth

## [20.3.0](https://github.com/invertase/react-native-firebase/compare/v20.2.1...v20.3.0) (2024-07-19)

### Features

- **auth,other:** allow optional enabling of Auth session persistence via async storage ([d1ea703](https://github.com/invertase/react-native-firebase/commit/d1ea70319ae95484112a9c09b2d5489810e79c80))

## [20.2.1](https://github.com/invertase/react-native-firebase/compare/v20.2.0...v20.2.1) (2024-07-17)

**Note:** Version bump only for package @react-native-firebase/auth

## [20.2.0](https://github.com/invertase/react-native-firebase/compare/v20.1.0...v20.2.0) (2024-07-15)

### Features

- **other:** Add Auth support ([#7878](https://github.com/invertase/react-native-firebase/issues/7878)) ([54befe7](https://github.com/invertase/react-native-firebase/commit/54befe776353f07eeab9b044d6261eeb76f1f238))

## [20.1.0](https://github.com/invertase/react-native-firebase/compare/v20.0.0...v20.1.0) (2024-06-04)

**Note:** Version bump only for package @react-native-firebase/auth

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

### Features

- **app, android:** android-sdk 33.0.0 - needs minSdk 21+ (23+ for auth) ([f29fecb](https://github.com/invertase/react-native-firebase/commit/f29fecbe72c27e60f8fec1cee6fa879b788d27b3))

## [19.3.0](https://github.com/invertase/react-native-firebase/compare/v19.2.2...v19.3.0) (2024-05-20)

### Features

- include phoneNumber from PhoneMultiFactorInfo ([5acdfb3](https://github.com/invertase/react-native-firebase/commit/5acdfb306279560a9fdd31a35c80f3edca4d0d59))

### Bug Fixes

- **auth, android:** change error code for invalid multi-factor session to match iOS WIP needs test ([0f15f2d](https://github.com/invertase/react-native-firebase/commit/0f15f2d36cfec807c42b91b53289fa699ffe4f66))
- **auth, android:** return credential for signin if phone auth has link collision ([#7793](https://github.com/invertase/react-native-firebase/issues/7793)) ([f8916e2](https://github.com/invertase/react-native-firebase/commit/f8916e25371d43db2bd8c22c7f35e8064edc6806))
- **auth, ios:** reject multi-factor API call if session not found ([3d61e32](https://github.com/invertase/react-native-firebase/commit/3d61e32394d83fae5d136d21ecbea71590a2adb7))

## [19.2.2](https://github.com/invertase/react-native-firebase/compare/v19.2.1...v19.2.2) (2024-04-13)

**Note:** Version bump only for package @react-native-firebase/auth

## [19.2.1](https://github.com/invertase/react-native-firebase/compare/v19.2.0...v19.2.1) (2024-04-12)

### Bug Fixes

- **auth, android:** Pass firebaseAuth into OAuthProvider.newBuilder(...) ([#7677](https://github.com/invertase/react-native-firebase/issues/7677)) ([21a9454](https://github.com/invertase/react-native-firebase/commit/21a945496cb422ab1a0ff0a6e412ffdda0e75e95))
- **auth, ios:** deprecate MultifactorInfo.enrollmentDate should be `enrollmentTime` ([#7653](https://github.com/invertase/react-native-firebase/issues/7653)) ([d9987da](https://github.com/invertase/react-native-firebase/commit/d9987dae0245b62a0ca705e3fd61ffc7a2c31097)), closes [/github.com/invertase/react-native-firebase/blob/main/packages/auth/android/src/main/java/io/invertase/firebase/auth/ReactNativeFirebaseAuthModule.java#L2500](https://github.com/invertase//github.com/invertase/react-native-firebase/blob/main/packages/auth/android/src/main/java/io/invertase/firebase/auth/ReactNativeFirebaseAuthModule.java/issues/L2500) [/github.com/invertase/react-native-firebase/blob/main/packages/auth/lib/index.d.ts#L483](https://github.com/invertase//github.com/invertase/react-native-firebase/blob/main/packages/auth/lib/index.d.ts/issues/L483) [#7565](https://github.com/invertase/react-native-firebase/issues/7565)
- **auth:** deprecate MultiFactorUser.enrolledFactor should be plural `enrolledFactors` ([#7652](https://github.com/invertase/react-native-firebase/issues/7652)) ([1ae7481](https://github.com/invertase/react-native-firebase/commit/1ae74816e4d70b129d831e4adf14794d4c69c372)), closes [/github.com/invertase/react-native-firebase/blob/main/packages/auth/lib/index.d.ts#L568](https://github.com/invertase//github.com/invertase/react-native-firebase/blob/main/packages/auth/lib/index.d.ts/issues/L568) [/github.com/invertase/react-native-firebase/blob/main/packages/auth/android/src/main/java/io/invertase/firebase/auth/ReactNativeFirebaseAuthModule.java#L2476](https://github.com/invertase//github.com/invertase/react-native-firebase/blob/main/packages/auth/android/src/main/java/io/invertase/firebase/auth/ReactNativeFirebaseAuthModule.java/issues/L2476) [/github.com/invertase/react-native-firebase/blob/main/packages/auth/ios/RNFBAuth/RNFBAuthModule.m#L1681](https://github.com/invertase//github.com/invertase/react-native-firebase/blob/main/packages/auth/ios/RNFBAuth/RNFBAuthModule.m/issues/L1681) [/github.com/firebase/firebase-js-sdk/blob/master/packages/auth/src/mfa/mfa_user.ts#L34](https://github.com/invertase//github.com/firebase/firebase-js-sdk/blob/master/packages/auth/src/mfa/mfa_user.ts/issues/L34)

## [19.2.0](https://github.com/invertase/react-native-firebase/compare/v19.1.2...v19.2.0) (2024-04-10)

**Note:** Version bump only for package @react-native-firebase/auth

## [19.1.2](https://github.com/invertase/react-native-firebase/compare/v19.1.1...v19.1.2) (2024-04-03)

**Note:** Version bump only for package @react-native-firebase/auth

## [19.1.1](https://github.com/invertase/react-native-firebase/compare/v19.1.0...v19.1.1) (2024-03-26)

**Note:** Version bump only for package @react-native-firebase/auth

## [19.1.0](https://github.com/invertase/react-native-firebase/compare/v19.0.1...v19.1.0) (2024-03-23)

**Note:** Version bump only for package @react-native-firebase/auth

## [19.0.1](https://github.com/invertase/react-native-firebase/compare/v19.0.0...v19.0.1) (2024-03-07)

**Note:** Version bump only for package @react-native-firebase/auth

## [19.0.0](https://github.com/invertase/react-native-firebase/compare/v18.9.0...v19.0.0) (2024-02-26)

### ⚠ BREAKING CHANGES

- **auth, android:** multifactor error messages were auth/unknown before on android
  Now they will correctly come through as auth/invalid-verification-code
  If you were relying on the previous auth/unknown codes you
  will need to update your error handling code

### Bug Fixes

- **auth, android:** correct error messages for finalizeMultiFactorEnrollment ([b0be508](https://github.com/invertase/react-native-firebase/commit/b0be508e3336fc5577795791b727f23e1a9bbbca))

## [18.9.0](https://github.com/invertase/react-native-firebase/compare/v18.8.0...v18.9.0) (2024-02-21)

### Bug Fixes

- **auth:** use correct app instance (vs always default) in multifactor and phone auth ([#7564](https://github.com/invertase/react-native-firebase/issues/7564)) ([ff32fd3](https://github.com/invertase/react-native-firebase/commit/ff32fd37b39557e9a55fce016cbf986348436b92))

## [18.8.0](https://github.com/invertase/react-native-firebase/compare/v18.7.3...v18.8.0) (2024-01-25)

### Features

- **auth, authDomain:** implement FirebaseOptions.authDomain on Auth ([a1f4710](https://github.com/invertase/react-native-firebase/commit/a1f471029352b7597d7e83a8c1ea06145768cf89))

### Bug Fixes

- **auth, ios:** factorId nil check ([#7541](https://github.com/invertase/react-native-firebase/issues/7541)) ([b1cee9a](https://github.com/invertase/react-native-firebase/commit/b1cee9a899e963d5fc5d0f0af056214dd676cd5a))

## [18.7.3](https://github.com/invertase/react-native-firebase/compare/v18.7.2...v18.7.3) (2023-12-13)

**Note:** Version bump only for package @react-native-firebase/auth

## [18.7.2](https://github.com/invertase/react-native-firebase/compare/v18.7.1...v18.7.2) (2023-12-08)

**Note:** Version bump only for package @react-native-firebase/auth

## [18.7.1](https://github.com/invertase/react-native-firebase/compare/v18.7.0...v18.7.1) (2023-11-29)

**Note:** Version bump only for package @react-native-firebase/auth

## [18.7.0](https://github.com/invertase/react-native-firebase/compare/v18.6.2...v18.7.0) (2023-11-28)

### Features

- **auth, oauth:** support native oauth providers ([#7443](https://github.com/invertase/react-native-firebase/issues/7443)) ([8461691](https://github.com/invertase/react-native-firebase/commit/8461691914386e3711bc52fa4198f7bb7b62baff))

## [18.6.2](https://github.com/invertase/react-native-firebase/compare/v18.6.1...v18.6.2) (2023-11-23)

### Bug Fixes

- adopt firebase-ios-sdk 10.18.0 / firebase-android-sdk 32.6.0 ([6a8b25b](https://github.com/invertase/react-native-firebase/commit/6a8b25bc1ed22860d1cef8fa3507ca5df3a28420))

## [18.6.1](https://github.com/invertase/react-native-firebase/compare/v18.6.0...v18.6.1) (2023-11-01)

**Note:** Version bump only for package @react-native-firebase/auth

## [18.6.0](https://github.com/invertase/react-native-firebase/compare/v18.5.0...v18.6.0) (2023-10-26)

**Note:** Version bump only for package @react-native-firebase/auth

## [18.5.0](https://github.com/invertase/react-native-firebase/compare/v18.4.0...v18.5.0) (2023-09-22)

### Features

- **auth:** Expose modular API that matches the Firebase web JS SDK v9 API ([e3a93bc](https://github.com/invertase/react-native-firebase/commit/e3a93bcd478ee48829d14e3016cafcd22edbd4d4))

## [18.4.0](https://github.com/invertase/react-native-firebase/compare/v18.3.2...v18.4.0) (2023-09-11)

**Note:** Version bump only for package @react-native-firebase/auth

## [18.3.2](https://github.com/invertase/react-native-firebase/compare/v18.3.1...v18.3.2) (2023-09-02)

**Note:** Version bump only for package @react-native-firebase/auth

## [18.3.1](https://github.com/invertase/react-native-firebase/compare/v18.3.0...v18.3.1) (2023-08-23)

### Bug Fixes

- **auth, android:** avoid crash on react-native < 0.63 ([3fee0d6](https://github.com/invertase/react-native-firebase/commit/3fee0d6da587f56911669307e35558f55107c88e))

## [18.3.0](https://github.com/invertase/react-native-firebase/compare/v18.2.0...v18.3.0) (2023-07-19)

### Features

- **auth, revokeToken:** sign in with apple revokeToken API ([#7239](https://github.com/invertase/react-native-firebase/issues/7239)) ([2b9dc73](https://github.com/invertase/react-native-firebase/commit/2b9dc738259b200d47c79cc028becf691cb528d3))

## [18.2.0](https://github.com/invertase/react-native-firebase/compare/v18.1.0...v18.2.0) (2023-07-13)

**Note:** Version bump only for package @react-native-firebase/auth

## [18.1.0](https://github.com/invertase/react-native-firebase/compare/v18.0.0...v18.1.0) (2023-06-22)

**Note:** Version bump only for package @react-native-firebase/auth

## [18.0.0](https://github.com/invertase/react-native-firebase/compare/v17.5.0...v18.0.0) (2023-06-05)

### ⚠ BREAKING CHANGES

- **app, sdks:** firebase-ios-sdk 10.8.0 and higher require Xcode 13.3+,
  which transitively requires macOS 12.0+. You must update your CI build environments
  to meet these minimums as well as your development environments - if you have older
  hardware that still works but cannot be upgraded normally, you may like:
  https://dortania.github.io/OpenCore-Legacy-Patcher/

### Features

- **app, sdks:** ios-sdk 10.8.0 requires Xcode 13.3+; android-sdk 31.5.0 ([86dc4d5](https://github.com/invertase/react-native-firebase/commit/86dc4d5d08a4cc7c788b057b5411ccdeb413e13e))
- **auth, android:** add forceRecaptchaFlowForTesting API ([#7148](https://github.com/invertase/react-native-firebase/issues/7148)) ([95d014c](https://github.com/invertase/react-native-firebase/commit/95d014cd6b8cc5715c585fee34715587a6694057))

## [17.5.0](https://github.com/invertase/react-native-firebase/compare/v17.4.3...v17.5.0) (2023-05-11)

**Note:** Version bump only for package @react-native-firebase/auth

### [17.4.3](https://github.com/invertase/react-native-firebase/compare/v17.4.2...v17.4.3) (2023-04-26)

### Bug Fixes

- **expo:** update dependencies of config plugins ([3e81143](https://github.com/invertase/react-native-firebase/commit/3e81143e67028f70c20530b8e1083b2a904f96f4))

### [17.4.2](https://github.com/invertase/react-native-firebase/compare/v17.4.1...v17.4.2) (2023-04-05)

**Note:** Version bump only for package @react-native-firebase/auth

### [17.4.1](https://github.com/invertase/react-native-firebase/compare/v17.4.0...v17.4.1) (2023-04-01)

**Note:** Version bump only for package @react-native-firebase/auth

## [17.4.0](https://github.com/invertase/react-native-firebase/compare/v17.3.2...v17.4.0) (2023-03-25)

**Note:** Version bump only for package @react-native-firebase/auth

### [17.3.2](https://github.com/invertase/react-native-firebase/compare/v17.3.1...v17.3.2) (2023-03-05)

### Bug Fixes

- **auth, types:** add `OIDCProvider` to typescript declaration ([#6936](https://github.com/invertase/react-native-firebase/issues/6936)) ([00185a3](https://github.com/invertase/react-native-firebase/commit/00185a37bc554f9bcb6feb6434d6c9c75ed51a3a))

### [17.3.1](https://github.com/invertase/react-native-firebase/compare/v17.3.0...v17.3.1) (2023-02-23)

**Note:** Version bump only for package @react-native-firebase/auth

## [17.3.0](https://github.com/invertase/react-native-firebase/compare/v17.2.0...v17.3.0) (2023-02-15)

**Note:** Version bump only for package @react-native-firebase/auth

## [17.2.0](https://github.com/invertase/react-native-firebase/compare/v17.1.0...v17.2.0) (2023-02-15)

**Note:** Version bump only for package @react-native-firebase/auth

## [17.1.0](https://github.com/invertase/react-native-firebase/compare/v17.0.0...v17.1.0) (2023-02-09)

**Note:** Version bump only for package @react-native-firebase/auth

## [17.0.0](https://github.com/invertase/react-native-firebase/compare/v16.7.0...v17.0.0) (2023-02-02)

**Note:** Version bump only for package @react-native-firebase/auth

## [16.7.0](https://github.com/invertase/react-native-firebase/compare/v16.6.0...v16.7.0) (2023-01-28)

**Note:** Version bump only for package @react-native-firebase/auth

## [16.6.0](https://github.com/invertase/react-native-firebase/compare/v16.5.2...v16.6.0) (2023-01-27)

### Features

- **auth:** Add support for OpenID Connect provider ([#6574](https://github.com/invertase/react-native-firebase/issues/6574)) ([469bf00](https://github.com/invertase/react-native-firebase/commit/469bf004c8d4ccf3da46215e7ca7562a6739265d))

### [16.5.2](https://github.com/invertase/react-native-firebase/compare/v16.5.1...v16.5.2) (2023-01-23)

### Bug Fixes

- **auth, android:** use a safe copy of auth provider info to avoid crash ([2a90136](https://github.com/invertase/react-native-firebase/commit/2a90136cce0db6ca0f253003643f8bd856fd46a0)), closes [#6798](https://github.com/invertase/react-native-firebase/issues/6798)

### [16.5.1](https://github.com/invertase/react-native-firebase/compare/v16.5.0...v16.5.1) (2023-01-20)

**Note:** Version bump only for package @react-native-firebase/auth

## [16.5.0](https://github.com/invertase/react-native-firebase/compare/v16.4.6...v16.5.0) (2022-12-16)

**Note:** Version bump only for package @react-native-firebase/auth

### [16.4.6](https://github.com/invertase/react-native-firebase/compare/v16.4.5...v16.4.6) (2022-11-18)

**Note:** Version bump only for package @react-native-firebase/auth

### [16.4.5](https://github.com/invertase/react-native-firebase/compare/v16.4.4...v16.4.5) (2022-11-16)

**Note:** Version bump only for package @react-native-firebase/auth

### [16.4.4](https://github.com/invertase/react-native-firebase/compare/v16.4.3...v16.4.4) (2022-11-14)

### Bug Fixes

- **auth, multifactor:** put multiFactor and getMultiFactorResolver on auth() ([357094e](https://github.com/invertase/react-native-firebase/commit/357094e4b7504165081ffda0c4105569480f5b79))

### [16.4.3](https://github.com/invertase/react-native-firebase/compare/v16.4.2...v16.4.3) (2022-11-06)

### Bug Fixes

- **auth, types:** augment multi-factor auth types ([5f183c4](https://github.com/invertase/react-native-firebase/commit/5f183c45301c0a5727a45688e69d0944c04e102a))

### [16.4.2](https://github.com/invertase/react-native-firebase/compare/v16.4.1...v16.4.2) (2022-11-04)

**Note:** Version bump only for package @react-native-firebase/auth

### [16.4.1](https://github.com/invertase/react-native-firebase/compare/v16.4.0...v16.4.1) (2022-11-02)

**Note:** Version bump only for package @react-native-firebase/auth

## [16.4.0](https://github.com/invertase/react-native-firebase/compare/v16.3.1...v16.4.0) (2022-10-30)

### Features

- **auth:** Add Expo support for phone auth ([#6645](https://github.com/invertase/react-native-firebase/issues/6645)) ([97a4ea5](https://github.com/invertase/react-native-firebase/commit/97a4ea573dd0795b157e73299e705dbd7bb7e3d4))

### [16.3.1](https://github.com/invertase/react-native-firebase/compare/v16.3.0...v16.3.1) (2022-10-28)

**Note:** Version bump only for package @react-native-firebase/auth

## [16.3.0](https://github.com/invertase/react-native-firebase/compare/v16.2.0...v16.3.0) (2022-10-26)

### Features

- **auth:** Add multi-factor support for the sign-in flow ([#6593](https://github.com/invertase/react-native-firebase/issues/6593)) ([3c64bf5](https://github.com/invertase/react-native-firebase/commit/3c64bf5987eec73c8cc5d3f9246c4c0185eb7718))

## [16.2.0](https://github.com/invertase/react-native-firebase/compare/v16.1.1...v16.2.0) (2022-10-23)

**Note:** Version bump only for package @react-native-firebase/auth

### [16.1.1](https://github.com/invertase/react-native-firebase/compare/v16.1.0...v16.1.1) (2022-10-21)

**Note:** Version bump only for package @react-native-firebase/auth

## [16.1.0](https://github.com/invertase/react-native-firebase/compare/v16.0.0...v16.1.0) (2022-10-20)

### Bug Fixes

- **auth, emulator:** guard against double useEmulator calls ([13402d5](https://github.com/invertase/react-native-firebase/commit/13402d5a7804f9a68d09903a2616e25ab95cb67a))

## [16.0.0](https://github.com/invertase/react-native-firebase/compare/v15.7.1...v16.0.0) (2022-10-19)

**Note:** Version bump only for package @react-native-firebase/auth

## [15.7.1](https://github.com/invertase/react-native-firebase/compare/v15.7.0...v15.7.1) (2022-10-19)

**Note:** Version bump only for package @react-native-firebase/auth

# [15.7.0](https://github.com/invertase/react-native-firebase/compare/v15.6.0...v15.7.0) (2022-10-01)

**Note:** Version bump only for package @react-native-firebase/auth

# [15.6.0](https://github.com/invertase/react-native-firebase/compare/v15.5.0...v15.6.0) (2022-09-17)

### Bug Fixes

- **auth, types:** verifyPasswordResetCode returns Promise<string> with email address ([#6537](https://github.com/invertase/react-native-firebase/issues/6537)) ([6f67c2c](https://github.com/invertase/react-native-firebase/commit/6f67c2c33bb9fa8b6c343aa9b3b7ca1dff34f2db))

# [15.5.0](https://github.com/invertase/react-native-firebase/compare/v15.4.0...v15.5.0) (2022-09-16)

**Note:** Version bump only for package @react-native-firebase/auth

# [15.4.0](https://github.com/invertase/react-native-firebase/compare/v15.3.0...v15.4.0) (2022-08-27)

**Note:** Version bump only for package @react-native-firebase/auth

# [15.3.0](https://github.com/invertase/react-native-firebase/compare/v15.2.0...v15.3.0) (2022-08-07)

**Note:** Version bump only for package @react-native-firebase/auth

# [15.2.0](https://github.com/invertase/react-native-firebase/compare/v15.1.1...v15.2.0) (2022-07-21)

**Note:** Version bump only for package @react-native-firebase/auth

## [15.1.1](https://github.com/invertase/react-native-firebase/compare/v15.1.0...v15.1.1) (2022-06-28)

**Note:** Version bump only for package @react-native-firebase/auth

# [15.1.0](https://github.com/invertase/react-native-firebase/compare/v15.0.0...v15.1.0) (2022-06-28)

**Note:** Version bump only for package @react-native-firebase/auth

# [15.0.0](https://github.com/invertase/react-native-firebase/compare/v14.11.1...v15.0.0) (2022-06-20)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.11.1](https://github.com/invertase/react-native-firebase/compare/v14.11.0...v14.11.1) (2022-06-17)

**Note:** Version bump only for package @react-native-firebase/auth

# [14.11.0](https://github.com/invertase/react-native-firebase/compare/v14.10.1...v14.11.0) (2022-05-27)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.10.1](https://github.com/invertase/react-native-firebase/compare/v14.10.0...v14.10.1) (2022-05-26)

**Note:** Version bump only for package @react-native-firebase/auth

# [14.10.0](https://github.com/invertase/react-native-firebase/compare/v14.9.4...v14.10.0) (2022-05-26)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.9.4](https://github.com/invertase/react-native-firebase/compare/v14.9.3...v14.9.4) (2022-05-14)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.9.3](https://github.com/invertase/react-native-firebase/compare/v14.9.2...v14.9.3) (2022-05-10)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.9.2](https://github.com/invertase/react-native-firebase/compare/v14.9.1...v14.9.2) (2022-05-10)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.9.1](https://github.com/invertase/react-native-firebase/compare/v14.9.0...v14.9.1) (2022-04-28)

**Note:** Version bump only for package @react-native-firebase/auth

# [14.9.0](https://github.com/invertase/react-native-firebase/compare/v14.8.1...v14.9.0) (2022-04-27)

### Features

- **firestore:** named query and data bundle APIs ([#6199](https://github.com/invertase/react-native-firebase/issues/6199)) ([96591e0](https://github.com/invertase/react-native-firebase/commit/96591e0dac957383c503e94fbf7bf0379d5569f2))

## [14.8.1](https://github.com/invertase/react-native-firebase/compare/v14.8.0...v14.8.1) (2022-04-25)

**Note:** Version bump only for package @react-native-firebase/auth

# [14.8.0](https://github.com/invertase/react-native-firebase/compare/v14.7.0...v14.8.0) (2022-04-19)

**Note:** Version bump only for package @react-native-firebase/auth

# [14.7.0](https://github.com/invertase/react-native-firebase/compare/v14.6.0...v14.7.0) (2022-03-23)

**Note:** Version bump only for package @react-native-firebase/auth

# [14.6.0](https://github.com/invertase/react-native-firebase/compare/v14.5.1...v14.6.0) (2022-03-23)

### Bug Fixes

- **auth:** allow emulator hostnames to contain hyphens ([#6141](https://github.com/invertase/react-native-firebase/issues/6141)) ([98eb1ce](https://github.com/invertase/react-native-firebase/commit/98eb1ce3663bb0c0c507f7e8129ad094a53898b5))

## [14.5.1](https://github.com/invertase/react-native-firebase/compare/v14.5.0...v14.5.1) (2022-03-05)

**Note:** Version bump only for package @react-native-firebase/auth

# [14.5.0](https://github.com/invertase/react-native-firebase/compare/v14.4.0...v14.5.0) (2022-02-15)

### Features

- **auth, ios:** Add support for Facebook Limited Login ([#6073](https://github.com/invertase/react-native-firebase/issues/6073)) ([f681cc5](https://github.com/invertase/react-native-firebase/commit/f681cc5a5b493033faef1f6ea64d9f5a40e6d9d4))

# [14.4.0](https://github.com/invertase/react-native-firebase/compare/v14.3.3...v14.4.0) (2022-02-13)

### Features

- **auth, android:** implement disable app verification feature on android ([#6069](https://github.com/invertase/react-native-firebase/issues/6069)) ([48c7842](https://github.com/invertase/react-native-firebase/commit/48c7842124f901aeda991da3122016fd3fb42e03))

## [14.3.3](https://github.com/invertase/react-native-firebase/compare/v14.3.2...v14.3.3) (2022-02-12)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.3.2](https://github.com/invertase/react-native-firebase/compare/v14.3.1...v14.3.2) (2022-02-10)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.3.1](https://github.com/invertase/react-native-firebase/compare/v14.3.0...v14.3.1) (2022-02-07)

**Note:** Version bump only for package @react-native-firebase/auth

# [14.3.0](https://github.com/invertase/react-native-firebase/compare/v14.2.4...v14.3.0) (2022-01-26)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.2.4](https://github.com/invertase/react-native-firebase/compare/v14.2.3...v14.2.4) (2022-01-24)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.2.3](https://github.com/invertase/react-native-firebase/compare/v14.2.2...v14.2.3) (2022-01-20)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.2.2](https://github.com/invertase/react-native-firebase/compare/v14.2.1...v14.2.2) (2022-01-06)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.2.1](https://github.com/invertase/react-native-firebase/compare/v14.2.0...v14.2.1) (2021-12-31)

**Note:** Version bump only for package @react-native-firebase/auth

# [14.2.0](https://github.com/invertase/react-native-firebase/compare/v14.1.0...v14.2.0) (2021-12-31)

**Note:** Version bump only for package @react-native-firebase/auth

# [14.1.0](https://github.com/invertase/react-native-firebase/compare/v14.0.1...v14.1.0) (2021-12-18)

**Note:** Version bump only for package @react-native-firebase/auth

## [14.0.1](https://github.com/invertase/react-native-firebase/compare/v14.0.0...v14.0.1) (2021-12-15)

### Bug Fixes

- **auth, phone:** call verifyPhoneNumber callbacks correctly ([7c082be](https://github.com/invertase/react-native-firebase/commit/7c082bedd58a868ddcd44c1d2b6d1900e43b012c))

# [14.0.0](https://github.com/invertase/react-native-firebase/compare/v13.1.1...v14.0.0) (2021-12-14)

**Note:** Version bump only for package @react-native-firebase/auth

## [13.1.1](https://github.com/invertase/react-native-firebase/compare/v13.1.0...v13.1.1) (2021-12-14)

### Bug Fixes

- **deps:** AGP7.0.4, firebase-android-sdk 29.0.2, javascript deps ([55d0a36](https://github.com/invertase/react-native-firebase/commit/55d0a36a0addc54e347f26bb8ee88bb38b0fa4a6))

# [13.1.0](https://github.com/invertase/react-native-firebase/compare/v13.0.1...v13.1.0) (2021-12-02)

### Features

- **android, emulator:** add firebase.json config element to bypass localhost remap ([#5852](https://github.com/invertase/react-native-firebase/issues/5852)) ([ddf3f5f](https://github.com/invertase/react-native-firebase/commit/ddf3f5f43d2c8547879934c3169d3e01c0db44c0))

## [13.0.1](https://github.com/invertase/react-native-firebase/compare/v13.0.0...v13.0.1) (2021-11-05)

**Note:** Version bump only for package @react-native-firebase/auth

# [13.0.0](https://github.com/invertase/react-native-firebase/compare/v12.9.3...v13.0.0) (2021-10-31)

### Bug Fixes

- rename default branch to main ([25e1d3d](https://github.com/invertase/react-native-firebase/commit/25e1d3d5a1a8311588938dc9d8fdf71d11cd9963))

## [12.9.3](https://github.com/invertase/react-native-firebase/compare/v12.9.2...v12.9.3) (2021-10-22)

**Note:** Version bump only for package @react-native-firebase/auth

## [12.9.2](https://github.com/invertase/react-native-firebase/compare/v12.9.1...v12.9.2) (2021-10-17)

**Note:** Version bump only for package @react-native-firebase/auth

## [12.9.1](https://github.com/invertase/react-native-firebase/compare/v12.9.0...v12.9.1) (2021-10-10)

**Note:** Version bump only for package @react-native-firebase/auth

# [12.9.0](https://github.com/invertase/react-native-firebase/compare/v12.8.0...v12.9.0) (2021-10-03)

**Note:** Version bump only for package @react-native-firebase/auth

# [12.8.0](https://github.com/invertase/react-native-firebase/compare/v12.7.5...v12.8.0) (2021-09-14)

**Note:** Version bump only for package @react-native-firebase/auth

## [12.7.5](https://github.com/invertase/react-native-firebase/compare/v12.7.4...v12.7.5) (2021-09-04)

### Bug Fixes

- **auth, android:** linkWithCredential will not attempt to upgrade from anon user (matches iOS) ([#5694](https://github.com/invertase/react-native-firebase/issues/5694)) ([7cd1716](https://github.com/invertase/react-native-firebase/commit/7cd1716c0adef0f390b34409e737ac14da8120a8)), closes [#4487](https://github.com/invertase/react-native-firebase/issues/4487) [#4552](https://github.com/invertase/react-native-firebase/issues/4552)

## [12.7.4](https://github.com/invertase/react-native-firebase/compare/v12.7.3...v12.7.4) (2021-08-31)

**Note:** Version bump only for package @react-native-firebase/auth

## [12.7.3](https://github.com/invertase/react-native-firebase/compare/v12.7.2...v12.7.3) (2021-08-24)

**Note:** Version bump only for package @react-native-firebase/auth

## [12.7.2](https://github.com/invertase/react-native-firebase/compare/v12.7.1...v12.7.2) (2021-08-21)

**Note:** Version bump only for package @react-native-firebase/auth

## [12.7.1](https://github.com/invertase/react-native-firebase/compare/v12.7.0...v12.7.1) (2021-08-20)

**Note:** Version bump only for package @react-native-firebase/auth

# [12.7.0](https://github.com/invertase/react-native-firebase/compare/v12.6.1...v12.7.0) (2021-08-19)

**Note:** Version bump only for package @react-native-firebase/auth

## [12.6.1](https://github.com/invertase/react-native-firebase/compare/v12.6.0...v12.6.1) (2021-08-17)

**Note:** Version bump only for package @react-native-firebase/auth

# [12.6.0](https://github.com/invertase/react-native-firebase/compare/v12.5.0...v12.6.0) (2021-08-16)

**Note:** Version bump only for package @react-native-firebase/auth

# [12.5.0](https://github.com/invertase/react-native-firebase/compare/v12.4.0...v12.5.0) (2021-08-12)

**Note:** Version bump only for package @react-native-firebase/auth

# [12.4.0](https://github.com/invertase/react-native-firebase/compare/v12.3.0...v12.4.0) (2021-07-29)

**Note:** Version bump only for package @react-native-firebase/auth

# [12.3.0](https://github.com/invertase/react-native-firebase/compare/v12.2.0...v12.3.0) (2021-07-21)

**Note:** Version bump only for package @react-native-firebase/auth

# [12.2.0](https://github.com/invertase/react-native-firebase/compare/v12.1.0...v12.2.0) (2021-07-16)

**Note:** Version bump only for package @react-native-firebase/auth

# [12.1.0](https://github.com/invertase/react-native-firebase/compare/v12.0.0...v12.1.0) (2021-06-11)

### Bug Fixes

- **auth, android:** remove browser dependency, upstream includes now ([3fef777](https://github.com/invertase/react-native-firebase/commit/3fef777f1e08c2dacfb21f4ef2c27b71e8b973f4)), closes [#4744](https://github.com/invertase/react-native-firebase/issues/4744)

# [12.0.0](https://github.com/invertase/react-native-firebase/compare/v11.5.0...v12.0.0) (2021-05-19)

### Bug Fixes

- **android:** correct lint issues for various API mis-use ([eb8d893](https://github.com/invertase/react-native-firebase/commit/eb8d89306fd569d7ef64298a99e970c653b79178)), closes [#3917](https://github.com/invertase/react-native-firebase/issues/3917)

# [11.5.0](https://github.com/invertase/react-native-firebase/compare/v11.4.1...v11.5.0) (2021-05-12)

**Note:** Version bump only for package @react-native-firebase/auth

## [11.4.1](https://github.com/invertase/react-native-firebase/compare/v11.4.0...v11.4.1) (2021-04-29)

**Note:** Version bump only for package @react-native-firebase/auth

# [11.4.0](https://github.com/invertase/react-native-firebase/compare/v11.3.3...v11.4.0) (2021-04-29)

**Note:** Version bump only for package @react-native-firebase/auth

## [11.3.3](https://github.com/invertase/react-native-firebase/compare/v11.3.2...v11.3.3) (2021-04-24)

**Note:** Version bump only for package @react-native-firebase/auth

## [11.3.2](https://github.com/invertase/react-native-firebase/compare/v11.3.1...v11.3.2) (2021-04-19)

### Bug Fixes

- **all, android:** purge jcenter() from android build ([2c6a6a8](https://github.com/invertase/react-native-firebase/commit/2c6a6a82ec363fd948ea880fd397acb886c97453))

## [11.3.1](https://github.com/invertase/react-native-firebase/compare/v11.3.0...v11.3.1) (2021-04-18)

**Note:** Version bump only for package @react-native-firebase/auth

# [11.3.0](https://github.com/invertase/react-native-firebase/compare/v11.2.0...v11.3.0) (2021-04-16)

**Note:** Version bump only for package @react-native-firebase/auth

# [11.2.0](https://github.com/invertase/react-native-firebase/compare/v11.1.2...v11.2.0) (2021-03-26)

**Note:** Version bump only for package @react-native-firebase/auth

## [11.1.2](https://github.com/invertase/react-native-firebase/compare/v11.1.1...v11.1.2) (2021-03-17)

### Bug Fixes

- **listeners:** port Emitter.once to analogous addListener/remove API ([5eb2f59](https://github.com/invertase/react-native-firebase/commit/5eb2f599e93ccecd91c800018959f9dc370f1e24))

## [11.1.1](https://github.com/invertase/react-native-firebase/compare/v11.1.0...v11.1.1) (2021-03-16)

**Note:** Version bump only for package @react-native-firebase/auth

# [11.1.0](https://github.com/invertase/react-native-firebase/compare/v11.0.0...v11.1.0) (2021-03-13)

### Bug Fixes

- **auth, ios:** fix compile error in setTenantId code ([311427e](https://github.com/invertase/react-native-firebase/commit/311427e026e892d2d24aca43967ce36e2fb8d834))
- **auth, useUserAccessGroup:** document auth/keychain-error, add test coverage ([60ec5f9](https://github.com/invertase/react-native-firebase/commit/60ec5f9f7261cf4f14feccc6e36813389e3a901f)), closes [#5007](https://github.com/invertase/react-native-firebase/issues/5007)

### Features

- **auth, multi-tenant:** add multi-tenant (tenantID) support ([935dbc3](https://github.com/invertase/react-native-firebase/commit/935dbc30515425949b4c9053da0db7f76b7a318f))
- **auth, multi-tenant:** expose user.tenantId in javascript ([4f6d426](https://github.com/invertase/react-native-firebase/commit/4f6d426302da7cb527e4fd377b6d5d1144284a51))

# [11.0.0](https://github.com/invertase/react-native-firebase/compare/v10.8.1...v11.0.0) (2021-03-03)

**Note:** Version bump only for package @react-native-firebase/auth

## [10.8.1](https://github.com/invertase/react-native-firebase/compare/v10.8.0...v10.8.1) (2021-02-22)

**Note:** Version bump only for package @react-native-firebase/auth

# [10.8.0](https://github.com/invertase/react-native-firebase/compare/v10.7.0...v10.8.0) (2021-02-13)

**Note:** Version bump only for package @react-native-firebase/auth

# [10.7.0](https://github.com/invertase/react-native-firebase/compare/v10.6.4...v10.7.0) (2021-02-09)

### Bug Fixes

- **auth, android:** do not timezone offset when getting UTC timestamp ([#4886](https://github.com/invertase/react-native-firebase/issues/4886)) ([85d6801](https://github.com/invertase/react-native-firebase/commit/85d6801ecbe9b3922225c55ca3628675ad848764))

## [10.6.4](https://github.com/invertase/react-native-firebase/compare/v10.6.3...v10.6.4) (2021-02-05)

### Bug Fixes

- **auth, android:** add browser dependency as crash workaround ([f0b4d07](https://github.com/invertase/react-native-firebase/commit/f0b4d0739184711544f2fc0b04af9204b6202877)), closes [#4744](https://github.com/invertase/react-native-firebase/issues/4744)

## [10.6.3](https://github.com/invertase/react-native-firebase/compare/v10.6.2...v10.6.3) (2021-02-05)

**Note:** Version bump only for package @react-native-firebase/auth

## [10.6.1](https://github.com/invertase/react-native-firebase/compare/v10.6.0...v10.6.1) (2021-02-04)

**Note:** Version bump only for package @react-native-firebase/auth

# [10.6.0](https://github.com/invertase/react-native-firebase/compare/v10.5.1...v10.6.0) (2021-02-04)

### Bug Fixes

- **emulator:** add notice on localhost URL remapping for android ([73869e1](https://github.com/invertase/react-native-firebase/commit/73869e1c8ed97eb95008214097b9498bfb05e4ea)), closes [#4810](https://github.com/invertase/react-native-firebase/issues/4810)

## [10.5.1](https://github.com/invertase/react-native-firebase/compare/v10.5.0...v10.5.1) (2021-01-19)

**Note:** Version bump only for package @react-native-firebase/auth

## [10.4.1](https://github.com/invertase/react-native-firebase/compare/v10.4.0...v10.4.1) (2021-01-08)

**Note:** Version bump only for package @react-native-firebase/auth

# [10.4.0](https://github.com/invertase/react-native-firebase/compare/v10.3.1...v10.4.0) (2020-12-30)

**Note:** Version bump only for package @react-native-firebase/auth

## [10.3.1](https://github.com/invertase/react-native-firebase/compare/v10.3.0...v10.3.1) (2020-12-18)

**Note:** Version bump only for package @react-native-firebase/auth

# [10.3.0](https://github.com/invertase/react-native-firebase/compare/v10.2.0...v10.3.0) (2020-12-18)

**Note:** Version bump only for package @react-native-firebase/auth

# [10.2.0](https://github.com/invertase/react-native-firebase/compare/v10.1.1...v10.2.0) (2020-12-11)

### Features

- firebase-ios-sdk 7.2.0 / firebase-android-sdk 26.1.1 ([#4648](https://github.com/invertase/react-native-firebase/issues/4648)) ([a158a74](https://github.com/invertase/react-native-firebase/commit/a158a74dee0dd6774c725ff1213453f8dfdcb8f5))

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
