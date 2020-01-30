---
title: iOS Setup
description: Manually integrate AdMob into your iOS application.
---

# iOS Manual Installation

> The following steps are only required if you are using React Native <= 0.59 or need to manually integrate the library.

## CocoaPods Installation

### Add the RNFBAdMob Pod

Add the `RNFBAdMob` Pod to your projects `/ios/Podfile`:

```ruby{3}
target 'app' do
  ...
  pod 'RNFBAdMob', :path => '../node_modules/@react-native-firebase/admob'
end
```

### Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBAdMob` Pod to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```
