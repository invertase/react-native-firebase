---
title: iOS Manual Installation
description: Manually integrate Crashlytics into your iOS application.
---

# iOS Manual Installation

The following steps are only required if your environment does not have access to React Native auto-linking.

## CocoaPods Installation

### Add the RNFBCrashlytics Pod

Add the `RNFBCrashlytics`, `Fabric` & `Crashlytics` Pod to your projects `/ios/Podfile`:

```ruby{3}
target 'app' do
  ...
  pod 'RNFBCrashlytics', :path => '../node_modules/@react-native-firebase/crashlytics'
  pod 'Fabric', '~> 1.10.2'
  pod 'Crashlytics', '~> 3.13.2'
end
```

### Update Pods & rebuild the project

You may need to update your local Pods in order for the Pods to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```

