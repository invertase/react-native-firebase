# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [14.7.0](https://github.com/invertase/react-native-firebase/compare/v14.6.0...v14.7.0) (2022-03-23)

**Note:** Version bump only for package @react-native-firebase/firestore

# [14.6.0](https://github.com/invertase/react-native-firebase/compare/v14.5.1...v14.6.0) (2022-03-23)

**Note:** Version bump only for package @react-native-firebase/firestore

## [14.5.1](https://github.com/invertase/react-native-firebase/compare/v14.5.0...v14.5.1) (2022-03-05)

**Note:** Version bump only for package @react-native-firebase/firestore

# [14.5.0](https://github.com/invertase/react-native-firebase/compare/v14.4.0...v14.5.0) (2022-02-15)

**Note:** Version bump only for package @react-native-firebase/firestore

# [14.4.0](https://github.com/invertase/react-native-firebase/compare/v14.3.3...v14.4.0) (2022-02-13)

**Note:** Version bump only for package @react-native-firebase/firestore

## [14.3.3](https://github.com/invertase/react-native-firebase/compare/v14.3.2...v14.3.3) (2022-02-12)

**Note:** Version bump only for package @react-native-firebase/firestore

## [14.3.2](https://github.com/invertase/react-native-firebase/compare/v14.3.1...v14.3.2) (2022-02-10)

### Bug Fixes

- **app, ios:** use NSInteger not NSInteger\* for prefs ([0148901](https://github.com/invertase/react-native-firebase/commit/01489010c920fc8e367a04f9decb8a8c94c5d8c1))

## [14.3.1](https://github.com/invertase/react-native-firebase/compare/v14.3.0...v14.3.1) (2022-02-07)

**Note:** Version bump only for package @react-native-firebase/firestore

# [14.3.0](https://github.com/invertase/react-native-firebase/compare/v14.2.4...v14.3.0) (2022-01-26)

**Note:** Version bump only for package @react-native-firebase/firestore

## [14.2.4](https://github.com/invertase/react-native-firebase/compare/v14.2.3...v14.2.4) (2022-01-24)

**Note:** Version bump only for package @react-native-firebase/firestore

## [14.2.3](https://github.com/invertase/react-native-firebase/compare/v14.2.2...v14.2.3) (2022-01-20)

**Note:** Version bump only for package @react-native-firebase/firestore

## [14.2.2](https://github.com/invertase/react-native-firebase/compare/v14.2.1...v14.2.2) (2022-01-06)

**Note:** Version bump only for package @react-native-firebase/firestore

## [14.2.1](https://github.com/invertase/react-native-firebase/compare/v14.2.0...v14.2.1) (2021-12-31)

**Note:** Version bump only for package @react-native-firebase/firestore

# [14.2.0](https://github.com/invertase/react-native-firebase/compare/v14.1.0...v14.2.0) (2021-12-31)

**Note:** Version bump only for package @react-native-firebase/firestore

# [14.1.0](https://github.com/invertase/react-native-firebase/compare/v14.0.1...v14.1.0) (2021-12-18)

**Note:** Version bump only for package @react-native-firebase/firestore

## [14.0.1](https://github.com/invertase/react-native-firebase/compare/v14.0.0...v14.0.1) (2021-12-15)

**Note:** Version bump only for package @react-native-firebase/firestore

# [14.0.0](https://github.com/invertase/react-native-firebase/compare/v13.1.1...v14.0.0) (2021-12-14)

- fix(firestore)!: fix Long/Double conversion issues #3004 (#5840) ([910d4e4](https://github.com/invertase/react-native-firebase/commit/910d4e420b62b5bcc67bbb1b77b9485ae2662119)), closes [#3004](https://github.com/invertase/react-native-firebase/issues/3004) [#5840](https://github.com/invertase/react-native-firebase/issues/5840) [#3004](https://github.com/invertase/react-native-firebase/issues/3004)

### BREAKING CHANGES

- Previous versions of firestore here incorrectly saved integers as doubles on iOS, so they did not show up in `where`/`in` queries. You had to save numbers as strings if you wanted `where`/`in` queries to work cross-platform. Number types will now be handled correctly. However, If you have integers saved (incorrectly!) as double (from previous versions) and you use where / in style queries on numbers, then the same document will no longer be found via .where. Mitigation could be to go through your whole DB and load and re-save the integers correctly, or alter queries. Please test your where / in queries that use number types if this affects you.

## [13.1.1](https://github.com/invertase/react-native-firebase/compare/v13.1.0...v13.1.1) (2021-12-14)

### Bug Fixes

- **deps:** AGP7.0.4, firebase-android-sdk 29.0.2, javascript deps ([55d0a36](https://github.com/invertase/react-native-firebase/commit/55d0a36a0addc54e347f26bb8ee88bb38b0fa4a6))
- **firestore, types:** allow FieldValues, Date and Timestamp in doc set and update ([#5901](https://github.com/invertase/react-native-firebase/issues/5901)) ([5f4eadf](https://github.com/invertase/react-native-firebase/commit/5f4eadf94c9f208ba2af2e6061859f2f70955d3a))

# [13.1.0](https://github.com/invertase/react-native-firebase/compare/v13.0.1...v13.1.0) (2021-12-02)

### Features

- **android, emulator:** add firebase.json config element to bypass localhost remap ([#5852](https://github.com/invertase/react-native-firebase/issues/5852)) ([ddf3f5f](https://github.com/invertase/react-native-firebase/commit/ddf3f5f43d2c8547879934c3169d3e01c0db44c0))

## [13.0.1](https://github.com/invertase/react-native-firebase/compare/v13.0.0...v13.0.1) (2021-11-05)

**Note:** Version bump only for package @react-native-firebase/firestore

# [13.0.0](https://github.com/invertase/react-native-firebase/compare/v12.9.3...v13.0.0) (2021-10-31)

### Bug Fixes

- rename default branch to main ([25e1d3d](https://github.com/invertase/react-native-firebase/commit/25e1d3d5a1a8311588938dc9d8fdf71d11cd9963))

## [12.9.3](https://github.com/invertase/react-native-firebase/compare/v12.9.2...v12.9.3) (2021-10-22)

**Note:** Version bump only for package @react-native-firebase/firestore

## [12.9.2](https://github.com/invertase/react-native-firebase/compare/v12.9.1...v12.9.2) (2021-10-17)

**Note:** Version bump only for package @react-native-firebase/firestore

## [12.9.1](https://github.com/invertase/react-native-firebase/compare/v12.9.0...v12.9.1) (2021-10-10)

**Note:** Version bump only for package @react-native-firebase/firestore

# [12.9.0](https://github.com/invertase/react-native-firebase/compare/v12.8.0...v12.9.0) (2021-10-03)

**Note:** Version bump only for package @react-native-firebase/firestore

# [12.8.0](https://github.com/invertase/react-native-firebase/compare/v12.7.5...v12.8.0) (2021-09-14)

**Note:** Version bump only for package @react-native-firebase/firestore

## [12.7.5](https://github.com/invertase/react-native-firebase/compare/v12.7.4...v12.7.5) (2021-09-04)

**Note:** Version bump only for package @react-native-firebase/firestore

## [12.7.4](https://github.com/invertase/react-native-firebase/compare/v12.7.3...v12.7.4) (2021-08-31)

**Note:** Version bump only for package @react-native-firebase/firestore

## [12.7.3](https://github.com/invertase/react-native-firebase/compare/v12.7.2...v12.7.3) (2021-08-24)

**Note:** Version bump only for package @react-native-firebase/firestore

## [12.7.2](https://github.com/invertase/react-native-firebase/compare/v12.7.1...v12.7.2) (2021-08-21)

**Note:** Version bump only for package @react-native-firebase/firestore

## [12.7.1](https://github.com/invertase/react-native-firebase/compare/v12.7.0...v12.7.1) (2021-08-20)

**Note:** Version bump only for package @react-native-firebase/firestore

# [12.7.0](https://github.com/invertase/react-native-firebase/compare/v12.6.1...v12.7.0) (2021-08-19)

### Features

- **firestore, emulator:** implement easier useEmulator API ([f039196](https://github.com/invertase/react-native-firebase/commit/f0391966c34ff845120ac8f45c8a8cc4b4f68885))

## [12.6.1](https://github.com/invertase/react-native-firebase/compare/v12.6.0...v12.6.1) (2021-08-17)

**Note:** Version bump only for package @react-native-firebase/firestore

# [12.6.0](https://github.com/invertase/react-native-firebase/compare/v12.5.0...v12.6.0) (2021-08-16)

**Note:** Version bump only for package @react-native-firebase/firestore

# [12.5.0](https://github.com/invertase/react-native-firebase/compare/v12.4.0...v12.5.0) (2021-08-12)

### Features

- **firestore:** serverTimestampBehavior ([#5556](https://github.com/invertase/react-native-firebase/issues/5556)) ([60fe72e](https://github.com/invertase/react-native-firebase/commit/60fe72ebcc21daf6da5f8478c0a758483b28e5f6))

# [12.4.0](https://github.com/invertase/react-native-firebase/compare/v12.3.0...v12.4.0) (2021-07-29)

**Note:** Version bump only for package @react-native-firebase/firestore

# [12.3.0](https://github.com/invertase/react-native-firebase/compare/v12.2.0...v12.3.0) (2021-07-21)

### Bug Fixes

- **firestore:** accept nested undefined array values ([224383f](https://github.com/invertase/react-native-firebase/commit/224383f4ecdebab67bb91aac2b4a5b85c4931c04)), closes [#5437](https://github.com/invertase/react-native-firebase/issues/5437)

# [12.2.0](https://github.com/invertase/react-native-firebase/compare/v12.1.0...v12.2.0) (2021-07-16)

**Note:** Version bump only for package @react-native-firebase/firestore

# [12.1.0](https://github.com/invertase/react-native-firebase/compare/v12.0.0...v12.1.0) (2021-06-11)

**Note:** Version bump only for package @react-native-firebase/firestore

# [12.0.0](https://github.com/invertase/react-native-firebase/compare/v11.5.0...v12.0.0) (2021-05-19)

### Bug Fixes

- **android:** correct lint issues for various API mis-use ([eb8d893](https://github.com/invertase/react-native-firebase/commit/eb8d89306fd569d7ef64298a99e970c653b79178)), closes [#3917](https://github.com/invertase/react-native-firebase/issues/3917)

- feat(firestore)!: add support for ignoreUndefinedProperties ([756cfa6](https://github.com/invertase/react-native-firebase/commit/756cfa6bea645ac6c18ad25bbae9cac5a3f5e379))

### BREAKING CHANGES

- undefined values throw like firebase-js-sdk now. Use ignoreUndefinedProperties setting 'true' to behave as before

# [11.5.0](https://github.com/invertase/react-native-firebase/compare/v11.4.1...v11.5.0) (2021-05-12)

### Bug Fixes

- **firestore:** Incorrect error message for GeoPoint latitude out of range ([f9909fa](https://github.com/invertase/react-native-firebase/commit/f9909fae3a1b197c3cfc784913ad719f92f48bfc))

## [11.4.1](https://github.com/invertase/react-native-firebase/compare/v11.4.0...v11.4.1) (2021-04-29)

**Note:** Version bump only for package @react-native-firebase/firestore

# [11.4.0](https://github.com/invertase/react-native-firebase/compare/v11.3.3...v11.4.0) (2021-04-29)

**Note:** Version bump only for package @react-native-firebase/firestore

## [11.3.3](https://github.com/invertase/react-native-firebase/compare/v11.3.2...v11.3.3) (2021-04-24)

**Note:** Version bump only for package @react-native-firebase/firestore

## [11.3.2](https://github.com/invertase/react-native-firebase/compare/v11.3.1...v11.3.2) (2021-04-19)

### Bug Fixes

- **all, android:** purge jcenter() from android build ([2c6a6a8](https://github.com/invertase/react-native-firebase/commit/2c6a6a82ec363fd948ea880fd397acb886c97453))

## [11.3.1](https://github.com/invertase/react-native-firebase/compare/v11.3.0...v11.3.1) (2021-04-18)

**Note:** Version bump only for package @react-native-firebase/firestore

# [11.3.0](https://github.com/invertase/react-native-firebase/compare/v11.2.0...v11.3.0) (2021-04-16)

### Performance Improvements

- increase task throughput in Android using thread pool executor ([#4981](https://github.com/invertase/react-native-firebase/issues/4981)) ([0e4e331](https://github.com/invertase/react-native-firebase/commit/0e4e3312315c020ecd760f8d3fea4f0347d2276b))

# [11.2.0](https://github.com/invertase/react-native-firebase/compare/v11.1.2...v11.2.0) (2021-03-26)

**Note:** Version bump only for package @react-native-firebase/firestore

## [11.1.2](https://github.com/invertase/react-native-firebase/compare/v11.1.1...v11.1.2) (2021-03-17)

**Note:** Version bump only for package @react-native-firebase/firestore

## [11.1.1](https://github.com/invertase/react-native-firebase/compare/v11.1.0...v11.1.1) (2021-03-16)

**Note:** Version bump only for package @react-native-firebase/firestore

# [11.1.0](https://github.com/invertase/react-native-firebase/compare/v11.0.0...v11.1.0) (2021-03-13)

**Note:** Version bump only for package @react-native-firebase/firestore

# [11.0.0](https://github.com/invertase/react-native-firebase/compare/v10.8.1...v11.0.0) (2021-03-03)

### Bug Fixes

- **firestore, types:** make all Settings properties optional ([#4965](https://github.com/invertase/react-native-firebase/issues/4965)) ([f501fff](https://github.com/invertase/react-native-firebase/commit/f501fffbfc1baabe7fc7ed8185ad0c5be069134d))

## [10.8.1](https://github.com/invertase/react-native-firebase/compare/v10.8.0...v10.8.1) (2021-02-22)

**Note:** Version bump only for package @react-native-firebase/firestore

# [10.8.0](https://github.com/invertase/react-native-firebase/compare/v10.7.0...v10.8.0) (2021-02-13)

**Note:** Version bump only for package @react-native-firebase/firestore

# [10.7.0](https://github.com/invertase/react-native-firebase/compare/v10.6.4...v10.7.0) (2021-02-09)

**Note:** Version bump only for package @react-native-firebase/firestore

## [10.6.4](https://github.com/invertase/react-native-firebase/compare/v10.6.3...v10.6.4) (2021-02-05)

**Note:** Version bump only for package @react-native-firebase/firestore

## [10.6.3](https://github.com/invertase/react-native-firebase/compare/v10.6.2...v10.6.3) (2021-02-05)

**Note:** Version bump only for package @react-native-firebase/firestore

## [10.6.1](https://github.com/invertase/react-native-firebase/compare/v10.6.0...v10.6.1) (2021-02-04)

**Note:** Version bump only for package @react-native-firebase/firestore

# [10.6.0](https://github.com/invertase/react-native-firebase/compare/v10.5.1...v10.6.0) (2021-02-04)

### Bug Fixes

- **emulator:** add notice on localhost URL remapping for android ([73869e1](https://github.com/invertase/react-native-firebase/commit/73869e1c8ed97eb95008214097b9498bfb05e4ea)), closes [#4810](https://github.com/invertase/react-native-firebase/issues/4810)

## [10.5.1](https://github.com/invertase/react-native-firebase/compare/v10.5.0...v10.5.1) (2021-01-19)

**Note:** Version bump only for package @react-native-firebase/firestore

## [10.4.1](https://github.com/invertase/react-native-firebase/compare/v10.4.0...v10.4.1) (2021-01-08)

**Note:** Version bump only for package @react-native-firebase/firestore

# [10.4.0](https://github.com/invertase/react-native-firebase/compare/v10.3.1...v10.4.0) (2020-12-30)

### Bug Fixes

- **ios:** bump ios min deployment to ios10 - remnant from [#4471](https://github.com/invertase/react-native-firebase/issues/4471) ([4a57578](https://github.com/invertase/react-native-firebase/commit/4a5757827789141600625eebe5e13c976ddb7402))

## [10.3.1](https://github.com/invertase/react-native-firebase/compare/v10.3.0...v10.3.1) (2020-12-18)

**Note:** Version bump only for package @react-native-firebase/firestore

# [10.3.0](https://github.com/invertase/react-native-firebase/compare/v10.2.0...v10.3.0) (2020-12-18)

**Note:** Version bump only for package @react-native-firebase/firestore

# [10.2.0](https://github.com/invertase/react-native-firebase/compare/v10.1.1...v10.2.0) (2020-12-11)

### Features

- firebase-ios-sdk 7.2.0 / firebase-android-sdk 26.1.1 ([#4648](https://github.com/invertase/react-native-firebase/issues/4648)) ([a158a74](https://github.com/invertase/react-native-firebase/commit/a158a74dee0dd6774c725ff1213453f8dfdcb8f5))

## [10.1.1](https://github.com/invertase/react-native-firebase/compare/v10.1.0...v10.1.1) (2020-12-02)

**Note:** Version bump only for package @react-native-firebase/firestore

# [10.1.0](https://github.com/invertase/react-native-firebase/compare/v10.0.0...v10.1.0) (2020-11-26)

**Note:** Version bump only for package @react-native-firebase/firestore

# [10.0.0](https://github.com/invertase/react-native-firebase/compare/fc8c4c0622f8e6814879d0306f66012df5b83cd8...v10.0.0) (2020-11-17)

### BREAKING CHANGES

- breaking change to mark new internal versioning requirements.

## [7.10.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.10.2...@react-native-firebase/firestore@7.10.3) (2020-11-11)

### Bug Fixes

- **firestore:** add missing MIN_SECONDS constant to FirestoreTimestamp ([#4531](https://github.com/invertase/react-native-firebase/issues/4531)) ([11127c1](https://github.com/invertase/react-native-firebase/commit/11127c177b217f3ddfca250664667a20918df65c))

## [7.10.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.10.1...@react-native-firebase/firestore@7.10.2) (2020-11-10)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.10.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.10.0...@react-native-firebase/firestore@7.10.1) (2020-11-10)

**Note:** Version bump only for package @react-native-firebase/firestore

# [7.10.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.9.1...@react-native-firebase/firestore@7.10.0) (2020-11-10)

### Bug Fixes

- **firestore:** add test case for orderby before where query ([#4459](https://github.com/invertase/react-native-firebase/issues/4459)) ([fdf978a](https://github.com/invertase/react-native-firebase/commit/fdf978aed8044f1ba010a9213a4f81cb9b397df7))

### Features

- **firestore:** add toJSON() and valueOf() to FirestoreTimestamp ([#4439](https://github.com/invertase/react-native-firebase/issues/4439)) ([aca6992](https://github.com/invertase/react-native-firebase/commit/aca6992edfca7537629131b1f223981452cd95fb)), closes [/github.com/firebase/firebase-js-sdk/blob/7c1c7f182b59e0fc7d175f53e5e2360cdee0ccab/packages/firestore/src/api/timestamp.ts#L162-L182](https://github.com/invertase/react-native-firebase/issues/L162-L182)

## [7.9.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.9.0...@react-native-firebase/firestore@7.9.1) (2020-10-30)

**Note:** Version bump only for package @react-native-firebase/firestore

# [7.9.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.8.7...@react-native-firebase/firestore@7.9.0) (2020-10-30)

### Features

- **firestore:** query operators: 'not-in' & '!=' ([#4474](https://github.com/invertase/react-native-firebase/issues/4474)) ([9e68faf](https://github.com/invertase/react-native-firebase/commit/9e68faf0310bd5f9c3347cad3dd5b80c9c0582e1))

## [7.8.7](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.8.6...@react-native-firebase/firestore@7.8.7) (2020-10-16)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.8.6](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.8.5...@react-native-firebase/firestore@7.8.6) (2020-09-30)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.8.5](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.8.4...@react-native-firebase/firestore@7.8.5) (2020-09-30)

### Bug Fixes

- **types:** enable TypeScript libCheck & resolve type conflicts ([#4306](https://github.com/invertase/react-native-firebase/issues/4306)) ([aa8ee8b](https://github.com/invertase/react-native-firebase/commit/aa8ee8b7e83443d2c1664993800e15faf4b59b0e))

## [7.8.4](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.8.3...@react-native-firebase/firestore@7.8.4) (2020-09-30)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.8.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.8.2...@react-native-firebase/firestore@7.8.3) (2020-09-17)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.8.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.8.1...@react-native-firebase/firestore@7.8.2) (2020-09-17)

### Bug Fixes

- **ios, podspec:** depend on React-Core instead of React ([#4275](https://github.com/invertase/react-native-firebase/issues/4275)) ([fd1a2be](https://github.com/invertase/react-native-firebase/commit/fd1a2be6b6ab1dec89e5dce1fc237435c3e1d510))

## [7.8.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.8.0...@react-native-firebase/firestore@7.8.1) (2020-09-11)

**Note:** Version bump only for package @react-native-firebase/firestore

# [7.8.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.7.0...@react-native-firebase/firestore@7.8.0) (2020-09-04)

### Features

- **firestore, types:** support Generic Types ([#3810](https://github.com/invertase/react-native-firebase/issues/3810)) ([f81e08e](https://github.com/invertase/react-native-firebase/commit/f81e08ee2c1dcfebf8f82eebd4e1883313d582e2))

# [7.7.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.6.2...@react-native-firebase/firestore@7.7.0) (2020-08-30)

### Features

- **firestore:** support waitForPendingWrites() API ([#4176](https://github.com/invertase/react-native-firebase/issues/4176)) ([6a4b45e](https://github.com/invertase/react-native-firebase/commit/6a4b45e441344a8c645552cfdef8c8bd88e56ca2))

## [7.6.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.6.1...@react-native-firebase/firestore@7.6.2) (2020-08-28)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.6.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.6.0...@react-native-firebase/firestore@7.6.1) (2020-08-26)

**Note:** Version bump only for package @react-native-firebase/firestore

# [7.6.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.5.3...@react-native-firebase/firestore@7.6.0) (2020-08-26)

### Features

- bump firebase sdk versions, add GoogleApi dep, use Android API29 ([#4122](https://github.com/invertase/react-native-firebase/issues/4122)) ([728f418](https://github.com/invertase/react-native-firebase/commit/728f41863832d21230c6eb1f55385284fef03c09))

## [7.5.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.5.2...@react-native-firebase/firestore@7.5.3) (2020-08-15)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.5.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.5.1...@react-native-firebase/firestore@7.5.2) (2020-08-15)

### Bug Fixes

- making auth and firestore observable compatible ([#4078](https://github.com/invertase/react-native-firebase/issues/4078)) ([d8410df](https://github.com/invertase/react-native-firebase/commit/d8410dfdae345f60ed7ea21fbe7f6af7632127e3))

## [7.5.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.5.0...@react-native-firebase/firestore@7.5.1) (2020-08-03)

**Note:** Version bump only for package @react-native-firebase/firestore

# [7.5.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.4.3...@react-native-firebase/firestore@7.5.0) (2020-08-03)

### Features

- use latest android & ios Firebase SDKs version ([#3956](https://github.com/invertase/react-native-firebase/issues/3956)) ([e7b4bb3](https://github.com/invertase/react-native-firebase/commit/e7b4bb31b05985c044b1f01625a43e364bb653ef))

## [7.4.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.4.2...@react-native-firebase/firestore@7.4.3) (2020-07-09)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.4.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.4.1...@react-native-firebase/firestore@7.4.2) (2020-07-09)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.4.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.4.0...@react-native-firebase/firestore@7.4.1) (2020-07-07)

**Note:** Version bump only for package @react-native-firebase/firestore

# [7.4.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.3.0...@react-native-firebase/firestore@7.4.0) (2020-07-07)

### Features

- **android,ios:** upgrade native SDK versions ([#3881](https://github.com/invertase/react-native-firebase/issues/3881)) ([6cb68a8](https://github.com/invertase/react-native-firebase/commit/6cb68a8ea808392fac3a28bdb1a76049c7b52e86))

# [7.3.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.2.4...@react-native-firebase/firestore@7.3.0) (2020-07-06)

### Features

- **firestore, android:** allow FirestoreSerializer native use ([#3888](https://github.com/invertase/react-native-firebase/issues/3888)) ([68daf94](https://github.com/invertase/react-native-firebase/commit/68daf945c4dacca954eb8592b94b992ca82d0ffb))

## [7.2.4](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.2.3...@react-native-firebase/firestore@7.2.4) (2020-07-05)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.2.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.2.2...@react-native-firebase/firestore@7.2.3) (2020-06-30)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.2.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.2.1...@react-native-firebase/firestore@7.2.2) (2020-06-26)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.2.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.2.0...@react-native-firebase/firestore@7.2.1) (2020-06-22)

**Note:** Version bump only for package @react-native-firebase/firestore

# [7.2.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.1.7...@react-native-firebase/firestore@7.2.0) (2020-06-22)

### Bug Fixes

- **android:** fixed IllegalMonitorStateException crashed issue ([#3800](https://github.com/invertase/react-native-firebase/issues/3800)) ([76f6cf9](https://github.com/invertase/react-native-firebase/commit/76f6cf9770df049c2ae38a0b0f894b606f2de4df))

### Features

- **firestore:** support clearPersistence() & terminate() APIs ([#3591](https://github.com/invertase/react-native-firebase/issues/3591)) ([57ff900](https://github.com/invertase/react-native-firebase/commit/57ff9003b664b94aa6b5b1997138bdb2220dba65))
- **firestore:** support limitToLast query filter ([#3702](https://github.com/invertase/react-native-firebase/issues/3702)) ([dc7f921](https://github.com/invertase/react-native-firebase/commit/dc7f9213c0c1196d1d5de4e1fb92f9d791280313))

## [7.1.7](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.1.6...@react-native-firebase/firestore@7.1.7) (2020-06-10)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.1.6](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.1.5...@react-native-firebase/firestore@7.1.6) (2020-06-10)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.1.5](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.1.4...@react-native-firebase/firestore@7.1.5) (2020-06-03)

### Bug Fixes

- **firestore:** update isEqual API to check collection path equality ([#3738](https://github.com/invertase/react-native-firebase/issues/3738)) ([405e040](https://github.com/invertase/react-native-firebase/commit/405e04009c1550dc6897b207ae3a63ad274c6de5))

## [7.1.4](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.1.3...@react-native-firebase/firestore@7.1.4) (2020-06-03)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.1.3](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.1.2...@react-native-firebase/firestore@7.1.3) (2020-06-03)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.1.2](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.1.1...@react-native-firebase/firestore@7.1.2) (2020-05-29)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.1.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.1.0...@react-native-firebase/firestore@7.1.1) (2020-05-29)

**Note:** Version bump only for package @react-native-firebase/firestore

# [7.1.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.0.1...@react-native-firebase/firestore@7.1.0) (2020-05-22)

### Features

- update native Firebase SDK versions ([#3663](https://github.com/invertase/react-native-firebase/issues/3663)) ([4db9dbc](https://github.com/invertase/react-native-firebase/commit/4db9dbc3ec20bf96de0efad15000f00b41e4a799))

## [7.0.1](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.0.0...@react-native-firebase/firestore@7.0.1) (2020-05-13)

**Note:** Version bump only for package @react-native-firebase/firestore

## [7.0.0](https://github.com/invertase/react-native-firebase/compare/@react-native-firebase/firestore@7.0.0...@react-native-firebase/firestore@7.0.0) (2020-05-13)

- feat!: all packages should depend on core (#3613) ([252a423](https://github.com/invertase/react-native-firebase/commit/252a4239e98a0f2a55c4afcd2d82e4d5f97e65e9)), closes [#3613](https://github.com/invertase/react-native-firebase/issues/3613)

### Bug Fixes

- **firestore, ios:** transaction atomicity failure fix ([#3599](https://github.com/invertase/react-native-firebase/issues/3599)) ([b261f51](https://github.com/invertase/react-native-firebase/commit/b261f518b3736bf6dab45666059662f02e7c6626))

### Features

- **ios:** podspecs now utilize CoreOnly instead of Core ([#3575](https://github.com/invertase/react-native-firebase/issues/3575)) ([35285f1](https://github.com/invertase/react-native-firebase/commit/35285f1655b16d05e6630fc556f95cccfb707ee4))

### BREAKING CHANGES

- breaking change to mark new internal versioning requirements.
