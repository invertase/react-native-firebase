---
title: iOS Setup
description: Manually integrate Cloud Functions into your iOS application.
---

# iOS Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

## CocoaPods Installation

### Add the RNFBFunctions Pod

Add the `RNFBFunctions` Pod to your projects `/ios/Podfile`:

```ruby{3}
target 'app' do
  ...
  pod 'RNFBFunctions', :path => '../node_modules/@react-native-firebase/functions'
end
```

### Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBFunctions` Pod to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```
