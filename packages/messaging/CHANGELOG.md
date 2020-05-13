# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [7.0.0](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/compare/@react-native-firebase/messaging@6.7.1...@react-native-firebase/messaging@7.0.0) (2020-05-13)


### Bug Fixes

* **messaging:** onNotificationOpenedApp callable return type ([#3641](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3641)) ([cd5cb23](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/cd5cb23d6353f617b5af350169e929c88f90aafb))
* onTokenChange method causing app to crash ([#3552](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3552)) ([1d7cd28](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/1d7cd28f85d09d35805b59896809ca93aa436285))


### Features

* **ios:** podspecs now utilize CoreOnly instead of Core ([#3575](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3575)) ([35285f1](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/35285f1655b16d05e6630fc556f95cccfb707ee4))
* **messaging:** support loc keys on notification payloads ([#3579](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3579)) ([9b294b3](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/9b294b3e161d604aa3c8900355c7b638974ea4ae))


* feat!: all packages should depend on core (#3613) ([252a423](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/252a4239e98a0f2a55c4afcd2d82e4d5f97e65e9)), closes [#3613](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3613)


### BREAKING CHANGES

* breaking change to mark new internal versioning requirements.





## [6.7.1](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/compare/@react-native-firebase/messaging@6.7.0...@react-native-firebase/messaging@6.7.1) (2020-04-22)

**Note:** Version bump only for package @react-native-firebase/messaging





# 6.7.0 (2020-04-22)


### Bug Fixes

* **android,build:** conditionally check `app` dependency, fixes… ([#3215](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3215)) ([b4eaa39](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/b4eaa39ea8022535696d28e6eacb5c3e3ce9578f))
* **android,build:** use correct plugin & BoM versions ([fb763eb](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/fb763ebde216d8c789b08bd0d77c078089776627))
* **messaging:** allow RNFirebaseMessagingHeadlessTask to run in… ([#3311](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3311)) ([3b129dc](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/3b129dcc0061e1cf8ee5e501fc907a8e5b727778))
* **messaging:** fix remote notification tokens ([bd4dc06](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/bd4dc06a05f168344d13d001241c81df1949ba29))
* **messaging:** registerRemoteNotifictions ([ea66c68](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/ea66c683cafe3a19ff84d97231a383afdc99cea7))
* **messaging,ios:** keep original UNUserNotificationCenter dele… ([#3427](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3427)) ([a800cdb](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/a800cdbc81bfaeeaccf602aa62ca29d2fbf68c05)), closes [#3425](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3425) [#3495](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3495)


### Features

* independently version packages ([#3513](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3513)) ([e2c2d64](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/e2c2d64d2266cbdd14d4dcfefa64a08263f0af85))
* **ios:** allow static_framework usage via Podfile global ([#3388](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3388)) ([530f8bb](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/530f8bbb51f89f106854dbf1df5ec80211e2cf8b)), closes [#3253](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3253)
* **messaging:** ios & android messaging updates & fixes ([#3339](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3339)) ([d66a611](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/d66a6118f82005087f53b86571990fc071402153))



# 6.3.0 (2020-02-04)



# 6.2.0 (2019-12-08)



# 6.1.0 (2019-11-26)


### Bug Fixes

* **messaging:** deprecate onTokenRefresh(event => event.token) fixes [#2889](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2889) ([1940d6c](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/1940d6c8fbab64ccf739186cea9633a605237942))
* **messaging:** typo in isRegisteredForRemoteNotifications ([#2645](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2645)) ([f0e614f](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/f0e614f48567645e89e837ee56d3f3d251473b09)), closes [/github.com/invertase/react-native-firebase/blob/master/packages/messaging/ios/RNFBMessaging/RNFBMessagingModule.m#L58](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/L58)
* **messaging,ios:** hasPermission checks authorizationStatus ([#2908](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2908)) ([7cab58d](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/7cab58d87fcba592c697a3441bd77033eb09ab3c))
* **messaging,ios:** wait for remote notification registration status ([8c339d1](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/8c339d10e288ef60e83e38bc4a245c5a251c83ff)), closes [#2657](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2657)


### Features

* **firestore:** array-contains, array-contains-any & in filters ([#2868](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2868)) ([42e034c](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/42e034c4807da54441d2baeab9f57bbf1a137a4a))
* **ios:** upgrade Firebase iOS SDK version to 6.13.0 ([547d0a2](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/547d0a2d74a68808b29063f9b3aa3e1ac38551fc))



## 6.0.4 (2019-11-17)



## 6.0.3 (2019-10-25)



## 6.0.2 (2019-10-18)



## 6.0.1 (2019-10-07)



# 0.1.0 (2019-07-30)





# 6.6.0 (2020-04-22)


### Bug Fixes

* **android,build:** conditionally check `app` dependency, fixes… ([#3215](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3215)) ([b4eaa39](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/b4eaa39ea8022535696d28e6eacb5c3e3ce9578f))
* **android,build:** use correct plugin & BoM versions ([fb763eb](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/fb763ebde216d8c789b08bd0d77c078089776627))
* **messaging:** allow RNFirebaseMessagingHeadlessTask to run in… ([#3311](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3311)) ([3b129dc](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/3b129dcc0061e1cf8ee5e501fc907a8e5b727778))
* **messaging:** fix remote notification tokens ([bd4dc06](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/bd4dc06a05f168344d13d001241c81df1949ba29))
* **messaging:** registerRemoteNotifictions ([ea66c68](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/ea66c683cafe3a19ff84d97231a383afdc99cea7))
* **messaging,ios:** keep original UNUserNotificationCenter dele… ([#3427](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3427)) ([a800cdb](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/a800cdbc81bfaeeaccf602aa62ca29d2fbf68c05)), closes [#3425](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3425) [#3495](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3495)


### Features

* independently version packages ([#3513](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3513)) ([e2c2d64](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/e2c2d64d2266cbdd14d4dcfefa64a08263f0af85))
* **ios:** allow static_framework usage via Podfile global ([#3388](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3388)) ([530f8bb](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/530f8bbb51f89f106854dbf1df5ec80211e2cf8b)), closes [#3253](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3253)
* **messaging:** ios & android messaging updates & fixes ([#3339](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3339)) ([d66a611](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/d66a6118f82005087f53b86571990fc071402153))



# 6.3.0 (2020-02-04)



# 6.2.0 (2019-12-08)



# 6.1.0 (2019-11-26)


### Bug Fixes

* **messaging:** deprecate onTokenRefresh(event => event.token) fixes [#2889](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2889) ([1940d6c](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/1940d6c8fbab64ccf739186cea9633a605237942))
* **messaging:** typo in isRegisteredForRemoteNotifications ([#2645](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2645)) ([f0e614f](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/f0e614f48567645e89e837ee56d3f3d251473b09)), closes [/github.com/invertase/react-native-firebase/blob/master/packages/messaging/ios/RNFBMessaging/RNFBMessagingModule.m#L58](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/L58)
* **messaging,ios:** hasPermission checks authorizationStatus ([#2908](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2908)) ([7cab58d](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/7cab58d87fcba592c697a3441bd77033eb09ab3c))
* **messaging,ios:** wait for remote notification registration status ([8c339d1](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/8c339d10e288ef60e83e38bc4a245c5a251c83ff)), closes [#2657](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2657)


### Features

* **firestore:** array-contains, array-contains-any & in filters ([#2868](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2868)) ([42e034c](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/42e034c4807da54441d2baeab9f57bbf1a137a4a))
* **ios:** upgrade Firebase iOS SDK version to 6.13.0 ([547d0a2](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/547d0a2d74a68808b29063f9b3aa3e1ac38551fc))



## 6.0.4 (2019-11-17)



## 6.0.3 (2019-10-25)



## 6.0.2 (2019-10-18)



## 6.0.1 (2019-10-07)



# 0.1.0 (2019-07-30)





# 6.5.0 (2020-04-22)


### Bug Fixes

* **android,build:** conditionally check `app` dependency, fixes… ([#3215](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3215)) ([b4eaa39](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/b4eaa39ea8022535696d28e6eacb5c3e3ce9578f))
* **android,build:** use correct plugin & BoM versions ([fb763eb](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/fb763ebde216d8c789b08bd0d77c078089776627))
* **messaging:** allow RNFirebaseMessagingHeadlessTask to run in… ([#3311](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3311)) ([3b129dc](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/3b129dcc0061e1cf8ee5e501fc907a8e5b727778))
* **messaging:** fix remote notification tokens ([bd4dc06](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/bd4dc06a05f168344d13d001241c81df1949ba29))
* **messaging:** registerRemoteNotifictions ([ea66c68](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/ea66c683cafe3a19ff84d97231a383afdc99cea7))
* **messaging,ios:** keep original UNUserNotificationCenter dele… ([#3427](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3427)) ([a800cdb](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/a800cdbc81bfaeeaccf602aa62ca29d2fbf68c05)), closes [#3425](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3425) [#3495](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3495)


### Features

* **ios:** allow static_framework usage via Podfile global ([#3388](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3388)) ([530f8bb](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/530f8bbb51f89f106854dbf1df5ec80211e2cf8b)), closes [#3253](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3253)
* **messaging:** ios & android messaging updates & fixes ([#3339](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/3339)) ([d66a611](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/d66a6118f82005087f53b86571990fc071402153))



# 6.3.0 (2020-02-04)



# 6.2.0 (2019-12-08)



# 6.1.0 (2019-11-26)


### Bug Fixes

* **messaging:** deprecate onTokenRefresh(event => event.token) fixes [#2889](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2889) ([1940d6c](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/1940d6c8fbab64ccf739186cea9633a605237942))
* **messaging:** typo in isRegisteredForRemoteNotifications ([#2645](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2645)) ([f0e614f](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/f0e614f48567645e89e837ee56d3f3d251473b09)), closes [/github.com/invertase/react-native-firebase/blob/master/packages/messaging/ios/RNFBMessaging/RNFBMessagingModule.m#L58](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/L58)
* **messaging,ios:** hasPermission checks authorizationStatus ([#2908](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2908)) ([7cab58d](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/7cab58d87fcba592c697a3441bd77033eb09ab3c))
* **messaging,ios:** wait for remote notification registration status ([8c339d1](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/8c339d10e288ef60e83e38bc4a245c5a251c83ff)), closes [#2657](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2657)


### Features

* **firestore:** array-contains, array-contains-any & in filters ([#2868](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/issues/2868)) ([42e034c](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/42e034c4807da54441d2baeab9f57bbf1a137a4a))
* **ios:** upgrade Firebase iOS SDK version to 6.13.0 ([547d0a2](https://github.com/invertase/react-native-firebase/tree/master/packages/messaging/commit/547d0a2d74a68808b29063f9b3aa3e1ac38551fc))



## 6.0.4 (2019-11-17)



## 6.0.3 (2019-10-25)



## 6.0.2 (2019-10-18)



## 6.0.1 (2019-10-07)



# 0.1.0 (2019-07-30)
