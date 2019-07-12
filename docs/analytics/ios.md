---
title: iOS Setup
description: Manually integrate Analytics into your iOS application. 
---

# iOS Manual Linking

## Manual iOS Integration via CocoaPods

> The following steps are only required if your environment does not have access to React Native
auto-linking.

#### Add Analytics Pod

**`ios/Podfile`**:
```ruby{4}
// ..
target 'app' do
  // ..
  pod 'RNFBAnalytics', :path => '../node_modules/@react-native-firebase/analytics/ios'
end
```

## Manual iOS Integration via Frameworks

*TODO*

## Device Identification

If you would like to enable Firebase Analytics to generate automatic audience metrics for iOS (as it does by default in Android), you must link additional iOS libraries, [as documented by the Google Firebase team](https://support.google.com/firebase/answer/6318039). Specifically you need `libAdIdAccess.a` and `AdSupport.framework`.

The way to do this using Cocoapods is to add this to your Podfile (though please use [the most current Pod version](https://cocoapods.org/pods/GoogleIDFASupport) supported by react-native-firebase):

**`ios/Podfile`**:
```ruby{5}
// ..
target 'app' do
  // ..
  pod 'RNFBAnalytics', :path => '../node_modules/@react-native-firebase/analytics/ios'
  pod 'GoogleIDFASupport', '~> 3.14.0'
end
```
