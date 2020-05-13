# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [7.0.0](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/compare/@react-native-firebase/admob@6.7.1...@react-native-firebase/admob@7.0.0) (2020-05-13)


### Bug Fixes

* **types:** fix RequestOptions.location ts type ([#3418](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3418)) ([f0fdbff](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/f0fdbff71967aec0cf72f1fe5c9066ffe5b6d7b7))


### Features

* **ios:** podspecs now utilize CoreOnly instead of Core ([#3575](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3575)) ([35285f1](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/35285f1655b16d05e6630fc556f95cccfb707ee4))


* feat!: all packages should depend on core (#3613) ([252a423](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/252a4239e98a0f2a55c4afcd2d82e4d5f97e65e9)), closes [#3613](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3613)


### BREAKING CHANGES

* breaking change to mark new internal versioning requirements.





## [6.7.1](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/compare/@react-native-firebase/admob@6.7.0...@react-native-firebase/admob@6.7.1) (2020-04-22)

**Note:** Version bump only for package @react-native-firebase/admob





# 6.7.0 (2020-04-22)


### Bug Fixes

* **android,build:** conditionally check `app` dependency, fixes… ([#3215](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3215)) ([b4eaa39](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/b4eaa39ea8022535696d28e6eacb5c3e3ce9578f))
* **android,build:** use correct plugin & BoM versions ([fb763eb](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/fb763ebde216d8c789b08bd0d77c078089776627))


### Features

* independently version packages ([#3513](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3513)) ([e2c2d64](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/e2c2d64d2266cbdd14d4dcfefa64a08263f0af85))
* **ios:** allow static_framework usage via Podfile global ([#3388](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3388)) ([530f8bb](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/530f8bbb51f89f106854dbf1df5ec80211e2cf8b)), closes [#3253](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3253)
* **messaging:** ios & android messaging updates & fixes ([#3339](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3339)) ([d66a611](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/d66a6118f82005087f53b86571990fc071402153))



# 6.3.0 (2020-02-04)


### Bug Fixes

* **admob,android:** null check activity in consent form ([#2985](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2985)) ([b5243cf](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/b5243cf25a130d10160635c23846a20435995cad))



# 6.2.0 (2019-12-08)



# 6.1.0 (2019-11-26)


### Bug Fixes

* **admob:** add null checks for getCurrentActivity() usages ([#2913](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2913)) ([1fb296d](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/1fb296dc3bc2ffcf2db1d09f5f17b0209ff8276a))
* **admob,ios:** use `AdMob` vs `Admob` for Pod name ([#2922](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2922)) ([88a0167](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/88a01672a8e443e87c7e1513cdb0d0594dd47ed9))


### Features

* **firestore:** array-contains, array-contains-any & in filters ([#2868](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2868)) ([42e034c](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/42e034c4807da54441d2baeab9f57bbf1a137a4a))
* **ios:** upgrade Firebase iOS SDK version to 6.13.0 ([547d0a2](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/547d0a2d74a68808b29063f9b3aa3e1ac38551fc))



## 6.0.4 (2019-11-17)



## 6.0.3 (2019-10-25)



## 6.0.2 (2019-10-18)



## 6.0.1 (2019-10-07)





# 6.6.0 (2020-04-22)


### Bug Fixes

* **android,build:** conditionally check `app` dependency, fixes… ([#3215](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3215)) ([b4eaa39](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/b4eaa39ea8022535696d28e6eacb5c3e3ce9578f))
* **android,build:** use correct plugin & BoM versions ([fb763eb](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/fb763ebde216d8c789b08bd0d77c078089776627))


### Features

* independently version packages ([#3513](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3513)) ([e2c2d64](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/e2c2d64d2266cbdd14d4dcfefa64a08263f0af85))
* **ios:** allow static_framework usage via Podfile global ([#3388](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3388)) ([530f8bb](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/530f8bbb51f89f106854dbf1df5ec80211e2cf8b)), closes [#3253](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3253)
* **messaging:** ios & android messaging updates & fixes ([#3339](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3339)) ([d66a611](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/d66a6118f82005087f53b86571990fc071402153))



# 6.3.0 (2020-02-04)


### Bug Fixes

* **admob,android:** null check activity in consent form ([#2985](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2985)) ([b5243cf](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/b5243cf25a130d10160635c23846a20435995cad))



# 6.2.0 (2019-12-08)



# 6.1.0 (2019-11-26)


### Bug Fixes

* **admob:** add null checks for getCurrentActivity() usages ([#2913](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2913)) ([1fb296d](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/1fb296dc3bc2ffcf2db1d09f5f17b0209ff8276a))
* **admob,ios:** use `AdMob` vs `Admob` for Pod name ([#2922](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2922)) ([88a0167](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/88a01672a8e443e87c7e1513cdb0d0594dd47ed9))


### Features

* **firestore:** array-contains, array-contains-any & in filters ([#2868](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2868)) ([42e034c](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/42e034c4807da54441d2baeab9f57bbf1a137a4a))
* **ios:** upgrade Firebase iOS SDK version to 6.13.0 ([547d0a2](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/547d0a2d74a68808b29063f9b3aa3e1ac38551fc))



## 6.0.4 (2019-11-17)



## 6.0.3 (2019-10-25)



## 6.0.2 (2019-10-18)



## 6.0.1 (2019-10-07)





# 6.5.0 (2020-04-22)


### Bug Fixes

* **android,build:** conditionally check `app` dependency, fixes… ([#3215](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3215)) ([b4eaa39](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/b4eaa39ea8022535696d28e6eacb5c3e3ce9578f))
* **android,build:** use correct plugin & BoM versions ([fb763eb](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/fb763ebde216d8c789b08bd0d77c078089776627))


### Features

* **ios:** allow static_framework usage via Podfile global ([#3388](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3388)) ([530f8bb](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/530f8bbb51f89f106854dbf1df5ec80211e2cf8b)), closes [#3253](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3253)
* **messaging:** ios & android messaging updates & fixes ([#3339](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/3339)) ([d66a611](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/d66a6118f82005087f53b86571990fc071402153))



# 6.3.0 (2020-02-04)


### Bug Fixes

* **admob,android:** null check activity in consent form ([#2985](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2985)) ([b5243cf](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/b5243cf25a130d10160635c23846a20435995cad))



# 6.2.0 (2019-12-08)



# 6.1.0 (2019-11-26)


### Bug Fixes

* **admob:** add null checks for getCurrentActivity() usages ([#2913](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2913)) ([1fb296d](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/1fb296dc3bc2ffcf2db1d09f5f17b0209ff8276a))
* **admob,ios:** use `AdMob` vs `Admob` for Pod name ([#2922](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2922)) ([88a0167](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/88a01672a8e443e87c7e1513cdb0d0594dd47ed9))


### Features

* **firestore:** array-contains, array-contains-any & in filters ([#2868](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/issues/2868)) ([42e034c](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/42e034c4807da54441d2baeab9f57bbf1a137a4a))
* **ios:** upgrade Firebase iOS SDK version to 6.13.0 ([547d0a2](https://github.com/invertase/react-native-firebase/tree/master/packages/admob/commit/547d0a2d74a68808b29063f9b3aa3e1ac38551fc))



## 6.0.4 (2019-11-17)



## 6.0.3 (2019-10-25)



## 6.0.2 (2019-10-18)



## 6.0.1 (2019-10-07)
