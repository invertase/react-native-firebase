---
title: iOS Setup
description: Manually integrate Dynamic Links into your iOS application.
---

# iOS Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

## CocoaPods Installation

### Add the RNFBDynamicLinks Pod

Add the `RNFBDynamicLinks` Pod to your projects `/ios/Podfile`:

```ruby{3}
target 'app' do
  ...
  pod 'RNFBDynamicLinks', :path => '../node_modules/@react-native-firebase/dynamic-links/ios'
end
```

### Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBDynamicLinks` Pod to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
react-native run-ios
```
